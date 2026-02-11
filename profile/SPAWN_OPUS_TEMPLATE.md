# Spawn Opus Protocol (Signed Template)

Version: 2026-02-11
Purpose: Run a disposable Opus sub-agent for heavy reasoning/coding, with strict scope control.

## Hard Rules

1) **Explicit arm phrase required**: Only spawn if the user message contains:
   `ARM_OPUS: <code>`
   (code is agreed with Alec out-of-band / in-session).

2) **Isolated + disposable**:
   - Tool: `sessions_spawn`
   - Model: `opus` (anthropic/claude-opus-4-5)
   - cleanup: `delete`
   - Hard timeout: set `runTimeoutSeconds` (default 600s unless overridden by Alec)

3) **Least privilege behavior**:
   - No proactive external actions (messaging, browser, cron, config changes).
   - If the task requires any external side-effect, the sub-agent must STOP and ask Alec.

4) **Scope control**:
   - Provide ONLY the minimum necessary context.
   - Prefer referencing specific files/paths and quoting small snippets.
   - Never paste secrets (tokens, passwords, keys).

5) **Audit trail required**:
   - Log spawn request + session id + model + timeout.
   - Capture token usage snapshots (see `memory/spawn-audit.jsonl`).

## Canonical Spawn Message Template

When spawning, send the sub-agent a message in this structure:

- Goal (1–2 sentences)
- Constraints (what NOT to do)
- Inputs (exact files/snippets allowed)
- Output contract (what to return)

Example:

"""
GOAL: Fix <X>.
CONSTRAINTS: Do not run tools or modify files. If you need to, ask.
INPUTS:
- File: path/to/file.ts (relevant sections only)
OUTPUT:
- A patch/diff + brief explanation.
"""
