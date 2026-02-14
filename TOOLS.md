# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

---

## MCP-EXA Web-Reference Search

**Location:** `/workspace/skills/mcp_exa_skill/`
**Entry point:** `require('./index.js').main(query, tools)`

### Overview
- Wraps the Exa MCP endpoint for web-reference searches (web_search_exa, get_code_context_exa, crawling_exa, company_research_exa, people_search_exa, etc.)
- Returns structured results: status, summary, hits (parsed), data (raw toolResults), links
- Includes watchdog timer (60s default), header negotiation, single-retry on timeout, and fallback path

### How to invoke
```bash
cd /Users/tinyclaw/.openclaw/workspace/skills/mcp_exa_skill
node -e "require('./index.js').main('<QUERY>', ['<TOOL_1>', '<TOOL_2>']).then(r => console.log(JSON.stringify(r, null, 2))).catch(console.error)"
```

### Templates (copy-paste)

**Simple search:**
- Query: `"<your query here>"`
- Tools: `["web_search_exa"]`

**Deep research with code/context:**
- Query: `"<your query here>"`
- Tools: `["web_search_exa", "get_code_context_exa", "web_search_advanced_exa"]`

### What you get back
- `status`: ok | partial | error | timeout
- `summary`: one-liner of what happened
- `hits[]`: parsed results with `title`, `url`, `author`, `date`, `snippet` per hit
- `data.toolResults`: raw per-tool MCP results (content blocks)
- `links`: high-signal source URLs

### Reading results
- Use `hits[]` for quick citation-ready output (title + url + snippet)
- Use `data.toolResults.<toolName>.result.content` for full raw text blocks
- Exa returns all results as a single text blob with `Title:` / `URL:` / `Text:` boundaries — the parser splits on these

### Logs & tracing
- Logs: `/Users/tinyclaw/.openclaw/workspace/skills/mcp_exa_skill/logs/mcp_exa.log`
- Each run tagged with `RUN:<runId>` for traceability

### Common pitfalls
- 406 Not Acceptable → header negotiation rotates Accept headers automatically
- Timeouts → single retry built in; if still failing, check endpoint status
- `[Object]` in console → use `JSON.stringify(r, null, 2)` to see full output

---

## qmd - Local Markdown Search

**Binary:** `qmd` (installed via `bun install -g https://github.com/tobi/qmd`)
**PATH:** Requires `$HOME/.bun/bin` in PATH
**Skill:** Installed at `/opt/homebrew/lib/node_modules/openclaw/skills/qmd/SKILL.md`

### Collections
- **workspace** — `~/.openclaw/workspace` (`**/*.md`, 10 files indexed)

### Quick Usage
```bash
export PATH="$HOME/.bun/bin:$PATH"
qmd search "query"                    # Fast BM25 keyword search (default)
qmd search "query" -c workspace       # Search specific collection
qmd get "qmd://workspace/file.md"     # Retrieve full document
qmd update                            # Re-index changed files
```

### When to Use
- Searching workspace notes/docs/memory files by keyword
- Finding related content across indexed markdown
- Use `qmd search` (BM25) by default — it's instant
- Vector search (`qmd vsearch`) available but slow on cold start; embeddings not yet built

---

## Memory Store

**Location:** `~/.openclaw/workspace/memory/`
**Long-term:** `~/.openclaw/workspace/MEMORY.md`

- Daily files: `memory/YYYY-MM-DD.md` — raw session logs, decisions, context
- `MEMORY.md` — curated long-term memory (distilled from daily files)
- "Commit to memory" / "Update memory" → write to today's `memory/YYYY-MM-DD.md`
- On-demand recall: `memory_search()` → `memory_get()` (don't load whole files)

## Other Tools

### Cameras
_(not configured yet)_

### SSH
_(not configured yet)_

### TTS
_(not configured yet)_
