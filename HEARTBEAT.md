# HEARTBEAT.md

# Periodic Checks
- [ ] **Context Watchdog:** Every few hours (or if the conversation feels long), check your token usage.
- [ ] **Safety Valve:** If context usage > 70% (Gemini 3 Pro has ~2M limit, so >1.4M), perform a **Project State Dump**:
    1. **Torch:** Update `Torch/PROJECT.md` with current technical status, unsolved bugs, and next steps.
    2. **Flight Tracker:** Ensure `flight-tracker/README.md` is current.
    3. **General:** Save loose ends to `memory/projects.md` or `MEMORY.md`.
    4. **Alert Alec:** "⚠️ Context full. Project states saved. Ready for `/reset`."
