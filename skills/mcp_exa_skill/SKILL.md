# MCP-EXA Skill Skeleton

Purpose
- Wrap the MCP URL provided: https://mcp.exa.ai/mcp?tools=web_search_exa,web_search_advanced_exa,get_code_context_exa,crawling_exa,company_research_exa,people_search_exa,deep_researcher_start,deep_researcher_check
- Provide strict input validation, watchdog, and safe error handling

Inputs
- query: string
- tools: array<string> (optional)

Workflow (high level)
1) Validate inputs
2) Spawn sub-agent wrapper to MCP URL
3) Start watchdog timer (default 60s, configurable)
4) Collect results, normalize, return structured output
5) On timeout or error: terminate sub-agent, report error, optional single retry
6) Termination policy: force-kill if non-responsive after timeout
7) Logging: log start/progress/end and errors to memory
8) Security: sanitize inputs and avoid leaking tokens/URLs
9) Hooks: integration points for get_code_context_exa, web_search_exa, crawling_exa, company_research_exa, people_search_exa, deep_researcher_start, deep_researcher_check

Implementation Notes
- This scaffold is intentionally minimal. You will fill in concrete function bodies in follow-up steps.
- Structure: exportable module with a main entry function run_mcp_exa(query, tools) -> result

Outcome
- Ready for code population in subsequent steps.