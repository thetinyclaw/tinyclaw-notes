# HEARTBEAT.md

## Context Watchdog

1. Run `session_status` to check current token/context usage.
2. If context usage is **above 70%**:
   - **Alert Alec** immediately: "⚠️ Context at X% — dumping important work to memory."
   - **Auto-save**: Write a summary of all significant work, decisions, leads, and next steps from this session to `memory/YYYY-MM-DD.md` (today's date). Create the file if it doesn't exist, append if it does.
   - Keep the summary concise but complete — anything needed to resume work in a fresh session.
3. If context usage is **below 70%**: No action needed for this check.

## Periodic Checks

- [ ] **Context Watchdog:** Every heartbeat, check token usage via `session_status`. This is the #1 priority check.
- [ ] **Safety Valve:** Gemini 3 Pro has ~2M token limit. 70% ≈ 1.4M tokens. If exceeded, perform the memory dump described above before context gets dangerously full.
