const { run_mcp_exa } = require('./run_mcp_exa');
const logger = require('./logger');

async function main(query, tools){
  // assign a run id for tracing
  const runId = `run_${Date.now()}_${Math.floor(Math.random()*1000)}`;
  logger.setCurrentRun(runId);
  // optionally, you may set log level here
  logger.info('Starting MCP-EXA run', { query: query.substring(0, 120), tools, runId });
  const res = await run_mcp_exa(query, tools, {});
  logger.info('MCP-EXA run completed', { runId, status: res && res.status ? res.status : 'unknown' });
  return res;
}

module.exports = { main };
