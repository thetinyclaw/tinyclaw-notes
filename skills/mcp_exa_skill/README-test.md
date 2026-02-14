# MCP-EXA Skill Test Guide

This document provides a minimal end-to-end test plan and commands to exercise the MCP-EXA skill.

Test commands
- Run the test harness:
  - node test_run.js

What to verify
- The test prints a structured result.
- Look into:
  - skills/mcp_exa_skill/logs/mcp_exa.log for per-run RUN:<runId> entries
  - memory/YYYY-MM-DD.md for per-run memory entries

Optional: Add more tests for input validation and timeout behavior.