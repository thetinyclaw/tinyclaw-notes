## Quick Start: MCP-EXA Web-Reference Search

- How to run a quick search in-chat:
  - Query: "<your query here>"
  - Tools: ["web_search_exa"]
  - Expect a structured response with a summary and hits you can cite (titles, URLs, snippets).

- Example you can paste:
  - Query: "William Gibson books"
  - Tools: ["web_search_exa"]

- For deeper research with code context: replace tools with ["web_search_exa","get_code_context_exa","web_search_advanced_exa"]

- Where to look for results:
  - Do512, Wikipedia bibliography, Goodreads, etc. cited in the toolResults payload (content blocks).

- How to read results:
  - Use hits[].title, hits[].url, hits[].snippet for citations.

- Documentation anchor:
  - MCP-EXA skill docs: /Users/tinyclaw/.openclaw/workspace/skills/mcp_exa_skill/SKILL.md
