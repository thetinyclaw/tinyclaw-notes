// MCP-EXA Skill — core runner with watchdog + real HTTP calls + aggressive header negotiation
const logger = require('./logger');
// Native fetch available in Node 18+

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

function validateInputs(query, tools) {
  if (typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Invalid or empty query');
  }
  if (query.length > 4096) {
    throw new Error('Query too long (max 4096 chars)');
  }
  if (tools && !Array.isArray(tools)) {
    throw new Error('tools must be an array of strings');
  }
  if (tools) {
    for (const t of tools) {
      if (typeof t !== 'string') throw new Error('Each tool must be a string');
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Header negotiation strategies (tried in order, most → least specific)
// ---------------------------------------------------------------------------
const HEADER_STRATEGIES = [
  { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' },
  { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
  { 'Content-Type': 'application/json', 'Accept': 'text/event-stream, application/json' },
  { 'Content-Type': 'application/json', 'Accept': '*/*' },
];

const RETRY_DELAY_MS = 300; // backoff between header attempts

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ---------------------------------------------------------------------------
// Single JSON-RPC tool call against the MCP endpoint
// ---------------------------------------------------------------------------
async function callOneTool(toolName, query) {
  const url = 'https://mcp.exa.ai/mcp';
  const rpcBody = JSON.stringify({
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: { query }
    }
  });

  let lastError = null;

  for (let i = 0; i < HEADER_STRATEGIES.length; i++) {
    const headers = HEADER_STRATEGIES[i];
    logger.info(`[${toolName}] HTTP attempt ${i + 1}/${HEADER_STRATEGIES.length}`, {
      accept: headers['Accept'],
      tool: toolName
    });

    let res;
    try {
      res = await fetch(url, { method: 'POST', headers, body: rpcBody });
    } catch (e) {
      lastError = e;
      logger.warn(`[${toolName}] attempt ${i + 1} network error`, { error: String(e) });
      await sleep(RETRY_DELAY_MS);
      continue;
    }

    // Log status + content-type for every attempt
    const ct = res.headers.get('content-type') || '';
    logger.info(`[${toolName}] attempt ${i + 1} response`, {
      status: res.status,
      contentType: ct
    });

    // 406 → rotate to next strategy
    if (res.status === 406) {
      const errSnippet = await res.text().catch(() => '');
      logger.warn(`[${toolName}] attempt ${i + 1} got 406`, { body: errSnippet.slice(0, 300) });
      lastError = new Error(`MCP HTTP 406: ${errSnippet.slice(0, 300)}`);
      await sleep(RETRY_DELAY_MS);
      continue;
    }

    // 4xx/5xx (not 406) → throw immediately
    if (!res.ok) {
      const errSnippet = await res.text().catch(() => '');
      logger.error(`[${toolName}] attempt ${i + 1} HTTP ${res.status}`, { body: errSnippet.slice(0, 500) });
      throw new Error(`MCP HTTP ${res.status}: ${errSnippet.slice(0, 500)}`);
    }

    // --- Success path: parse response ---
    let parsed;

    if (ct.includes('text/event-stream')) {
      const raw = await res.text();
      logger.info(`[${toolName}] SSE response (${raw.length} bytes)`, { snippet: raw.slice(0, 300) });
      parsed = parseSseResponse(raw);
    } else {
      // Try JSON regardless of content-type header
      const raw = await res.text();
      logger.info(`[${toolName}] raw response (${raw.length} bytes)`, { snippet: raw.slice(0, 300) });
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = { raw };
      }
    }

    // Unwrap JSON-RPC 2.0 envelope
    if (parsed && parsed.jsonrpc === '2.0') {
      if (parsed.error) {
        logger.error(`[${toolName}] JSON-RPC error`, parsed.error);
        throw new Error(`JSON-RPC error ${parsed.error.code}: ${parsed.error.message}`);
      }
      // result.content is an array of content blocks in MCP
      const result = parsed.result;
      logger.info(`[${toolName}] JSON-RPC result received`, { hasResult: !!result });
      return { tool: toolName, result };
    }

    // Non-JSON-RPC response — return as-is
    logger.info(`[${toolName}] non-JSONRPC response, returning raw`);
    return { tool: toolName, result: parsed };
  }

  throw lastError || new Error(`[${toolName}] All ${HEADER_STRATEGIES.length} header strategies exhausted`);
}

// ---------------------------------------------------------------------------
// SSE response parser — extracts JSON payloads from data: lines
// ---------------------------------------------------------------------------
function parseSseResponse(text) {
  const lines = text.split('\n');
  const dataChunks = [];
  for (const line of lines) {
    if (line.startsWith('data:')) {
      const payload = line.slice(5).trim();
      if (payload && payload !== '[DONE]') {
        try { dataChunks.push(JSON.parse(payload)); }
        catch { dataChunks.push(payload); }
      }
    }
  }
  if (dataChunks.length === 1) return dataChunks[0];
  if (dataChunks.length > 1) return { chunks: dataChunks };
  return { raw: text };
}

// ---------------------------------------------------------------------------
// Call ALL requested tools and aggregate results
// ---------------------------------------------------------------------------
async function callAllTools(query, tools) {
  const defaultTools = ['web_search_exa'];
  const toolList = (tools && tools.length > 0) ? tools : defaultTools;

  const toolResults = {};
  const errors = {};

  for (const toolName of toolList) {
    try {
      logger.info(`Calling tool: ${toolName}`);
      const res = await callOneTool(toolName, query);
      toolResults[toolName] = res;
    } catch (e) {
      logger.error(`Tool ${toolName} failed`, { error: String(e) });
      errors[toolName] = String(e);
    }
  }

  return {
    status: Object.keys(errors).length === 0 ? 'ok' : 'partial',
    summary: `Called ${toolList.length} tool(s): ${Object.keys(toolResults).length} succeeded, ${Object.keys(errors).length} failed`,
    data: { query, tools: toolList, toolResults },
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    links: ['https://exa.ai']
  };
}

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------

async function run_mcp_exa(query, tools, options = {}) {
  const timeoutMs = (options.timeoutMs && Number(options.timeoutMs)) || 60000;
  const timer = logger.startTimer('run_mcp_exa');

  logger.info('Run started', { query: query.slice(0, 120), tools, timeoutMs });

  // --- validate ---
  try {
    validateInputs(query, tools);
    logger.debug('Input validation passed');
  } catch (e) {
    logger.error('Input validation failed', { error: e.message });
    timer.stop({ status: 'validation_error' });
    return { status: 'error', error: e.message };
  }

  // --- execute with watchdog ---
  let finished = false;
  let result = null;

  const run = (async () => {
    try {
      logger.info('Calling MCP tools (real HTTP, aggressive negotiation)');
      const res = await callAllTools(query, tools);
      result = { status: 'success', detail: res };
      finished = true;
      return result;
    } catch (e) {
      finished = true;
      result = { status: 'error', error: String(e) };
      logger.error('MCP call threw', { error: String(e) });
      return result;
    }
  })();

  const timeoutP = new Promise((resolve) => {
    setTimeout(() => {
      if (!finished) {
        logger.warn('WATCHDOG: timeout reached — terminating', { timeoutMs });
        finished = true;
        result = { status: 'timeout', error: 'Execution timed out' };
        resolve(result);
      }
    }, timeoutMs);
  });

  const final = await Promise.race([run, timeoutP]);

  // --- single retry on timeout ---
  if (final && final.status === 'timeout' && !options.retried) {
    logger.warn('Retrying once after timeout');
    try {
      options.retried = true;
      const retryRes = await run_mcp_exa(query, tools, options);
      timer.stop({ status: retryRes.status, retried: true });
      return retryRes;
    } catch (e) {
      logger.error('Retry failed', { error: String(e) });
      timer.stop({ status: 'retry_error' });
      return { status: 'error', error: String(e) };
    }
  }

  // --- normalize output ---
  if (final && final.status === 'success') {
    // Attempt to parse hits for easier consumption
    const hits = [];
    const tr = final.detail.data.toolResults || {};
    
    Object.keys(tr).forEach(tName => {
      const res = tr[tName];
      // Check for standard MCP content structure
      if (res && res.result && res.result.content && Array.isArray(res.result.content)) {
        res.result.content.forEach(item => {
          if (item.type === 'text' && item.text) {
            // Exa MCP concatenates multiple results into one big text block.
            // Split on "Title:" boundaries to extract individual results.
            const blocks = item.text.split(/(?=^Title:\s)/m).filter(b => b.trim());
            
            for (const block of blocks) {
              const titleMatch = block.match(/^Title:\s*(.+)$/m);
              const urlMatch = block.match(/^URL:\s*(.+)$/m);
              const authorMatch = block.match(/^Author:\s*(.+)$/m);
              const dateMatch = block.match(/^Published Date:\s*(.+)$/m);
              const textMatch = block.match(/^Text:\s*([\s\S]*)/m);
              
              if (titleMatch && urlMatch) {
                const rawSnippet = textMatch ? textMatch[1].trim() : '';
                // Clean up markdown/link artifacts for a readable snippet
                const cleanSnippet = rawSnippet
                  .replace(/\[!\[.*?\]\]/g, '')       // remove image refs
                  .replace(/\[([^\]]*)\]/g, '$1')     // unwrap markdown links
                  .replace(/\s+/g, ' ')               // collapse whitespace
                  .trim()
                  .slice(0, 200);

                hits.push({
                  tool: tName,
                  title: titleMatch[1].trim(),
                  url: urlMatch[1].trim(),
                  author: authorMatch ? authorMatch[1].trim() : undefined,
                  date: dateMatch ? dateMatch[1].trim() : undefined,
                  snippet: cleanSnippet || undefined,
                });
              }
            }
          }
        });
      }
    });

    const out = {
      status: final.detail.status || 'ok',
      summary: final.detail.summary,
      hits: hits, // New parsed hits field
      data: final.detail.data,
      errors: final.detail.errors,
      links: final.detail.links,
    };
    logger.info('Run completed', { status: out.status, summary: out.summary, hitsFound: hits.length });
    timer.stop({ status: out.status });
    return out;
  }

  const errOut = {
    status: final && final.status ? final.status : 'error',
    error: final && final.error ? final.error : 'Unknown error',
  };
  logger.error('Run finished with error', errOut);
  timer.stop(errOut);
  return errOut;
}

module.exports = { run_mcp_exa };
