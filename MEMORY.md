# MEMORY.md - Long-Term Context

This file tracks active projects, key decisions, and persistent knowledge about Alec's preferences and setup.

## 🛠 Active Projects

### 🎨 Visualizer (Web)
*Procedural audio-reactive art for TV/Ambient display.*
- **Status:** Prototype (Pulse Cube) live. Next: Fractal shaders.
- **Stack:** HTML5, Three.js, Web Audio API.
- **Hardware ("The Hat"):**
  - **Host:** Laptop/Phone (Chrome/Edge).
  - **Display:** TV (via HDMI/Cast).
  - **Input:** Microphone (built-in or external).
- **Location:** `projects/visualizer/`

### 🧠 BrainBytes (Web Journal)
*Sleek, minimalist journaling webapp focused on Topics.*
- **Status:** Working Prototype. Accessible via Cloudflare Tunnel (on port 3005).
- **Stack:** Next.js, Tailwind, SQLite, Drizzle ORM.
- **Key UX Bugs Fixed:** Text visibility in main input and topic search bar.
- **Next UX Fix:** Topic selector should *expand* the page down, not *float* over it.
- **Location:** `BrainBytes/`

### ✈️ Flight Tracker (Python)
*Deal monitor for flights from AUS.*
- **Status:** Active, but requires upgrade.
- **Script Note:** Cron job is currently finding deals but the script seems to be hanging/failing to complete the process fully. **[New Task] Upgrade the tracker to record 'carrier', 'duration', and 'layovers' for international routes.**
- **Stack:** Python script, Amadeus API (assumed), Cron.
- **Hardware ("The Hat"):**
  - **Runner:** OpenClaw/Server (always-on).
  - **API Keys:** Flight data provider.
- **Location:** `flight-tracker/`

### 📊 Sith Lord Plots (Visualization)
*Goal: Plot context usage and other metrics using a black/red theme (SITH Mode).*
- **Status:** Data compiled; blocked on tool availability.
- **Dependencies:**
  1. Image Generation Skill (Midjourney/DALL-E) - requires **`clawhub` CLI installation** on host.
  2. Plotting/Canvas Tool - requires **OpenClaw Node pairing** on host.
- **Key Task:** Alec needs to run `openclaw node pair` and/or install `clawhub` on the Linux server.

### 📈 Plot Organizer Integration
*Integrate plot generator (private repo) with plot organizer to create final PDFs.*
- **Status:** Wrapper script built & debugging config discovery.
- **Approach:** Build a wrapper shell script that orchestrates the workflow:
  1. Unpacks ZIP file (tries unzip → 7z → python)
  2. Auto-discovers test date from folder structure
  3. Finds signal injection config in date directory
  4. Finds impedance-yield config in nested impedance-yield-* folder
  5. Runs signal_injection.py, impedance_yield.py, and process_data.py in sequence
  6. Names final PDF after part ID (ZIP filename)
- **Key Constraint:** Private plot generator repo — no direct access, only CLI commands.
- **Recent Fixes:**
  - 2026-02-11 12:40: Fixed date discovery to find numeric-only dirs (not impedance-yield folders)
  - 2026-02-11 12:40: Fixed signal config search to exclude impedance files
  - 2026-02-11 12:40: Fixed impedance config to search nested folder structure
  - 2026-02-11 13:20: Made impedance analysis optional (skips if config missing, continues with signal + PDF)
- **Location:** Wrapper = `plot-batch-processor.sh`; organizer = `/mnt/c/Users/Amehra/github/plot-organizer`

### 🔥 Torch (Hardware)
*Handheld sensor/haptic device.*
- **Status:** Prototyping/Integration.
- **Stack:** CircuitPython/C++, ESP32-S3.
- **Hardware ("The Hat"):**
  - **MCU:** ESP32-S3.
  - **Sensors:** LTR-303 (Light), STHS34PF80 (Thermal), INA228 (Power).
  - **Haptics:** DRV2605L.
  - **Power:** LiPo + MAX17048 Gauge.
  - **Display:** OLED.
- **Location:** `Torch/`

## 🧠 Preferences & Context

- **User:** Alec (SeaKoala).
- **Timezone:** CST/CDT.
- **Style:** Casual, direct, loves "trippy/fractal" visuals.
- **Interests:** Electronics, Embedded Systems, Packaging Design.
- **Main Local Machine:** Windows system (Silver Dragon / SD)
- **Mac mini:** M4 Mac mini (16GB) used for local models + Whisper experiments.
- **Voice chat (local):** Skill `skills/voice-chat-loop/` provides a macOS mic → chunked recording (ffmpeg/avfoundation) → Whisper transcription loop; uses **1s overlap** between chunks to reduce split-word errors.
- **Important Instruction:** When asked to save files to workspace, always save a pointer to hard memory (MEMORY.md or memory/*.md files) for recall after restarts.

## 📦 "The Hat" (Hardware Allocation)

*Where the physical bits live.*

| Project | Key Hardware | Status |
| :--- | :--- | :--- |
| **Torch** | ESP32-S3, Sensors, OLED | In development |
| **Visualizer** | Laptop/Phone + TV | Use existing |
### 📦 "The Hat" (Hardware Allocation)

*Where the physical bits live.*

| Project | Key Hardware | Status |
| :--- | :--- | :--- |
| **Torch** | ESP32-S3, Sensors, OLED | In development |
| **Visualizer** | Laptop/Phone + TV | Use existing |
| **Flight Tracker** | Server/Cloud | Running on OpenClaw |

---
*Updated: 2026-02-11 14:57 CST (heartbeat context dump)*

## 📦 Session Note (14:45-14:57 CST)
**Context hit 100% again.** Performed project state dump:
- **Plot Organizer:** Cloned repo → `plot-organizer/`. Consolidated `plot-batch-processor.sh` from workspace root + skills folder into GitHub repo only. Updated with improved error handling (removed `set -e`, now continues batch processing on partial failures). Pushed to GitHub.
- **Torch:** PROJECT.md current (last updated 09:37 CST).
- **Flight Tracker:** README.md current (enhanced data recording, fixed timeouts).
- All active projects documented and synced.

## 🔄 Recent Activity (Feb 11)

- **Flight Tracker:** Restored from backup zip (tracker.py, config.json, quick_check.py, README.md)
- **Git:** Pushed updated flight tracker to GitHub (https://github.com/SeaKoala/flight-tracker)
- **Torch:** Created PROJECT.md with current hardware status
- **Context Monitor:** Context usage reached 82% — project state dump initiated

## 🌐 Browser Tool & Google Access

**Problem:** The `openclaw` browser profile runs isolated - no saved Google sessions means login walls on private docs.

**Solution:** Sign into Google once via the browser tool. Session persists in `/data/.openclaw/browser/openclaw/user-data`.

**Credentials:** Stored in `TOOLS.md` → `### Google (thetinyclaw@gmail.com)`

**Full troubleshooting guide:** `memory/2026-02-08.md`

**Key tips:**
- Don't delete `/data/.openclaw/browser/openclaw/user-data` unless you want to wipe sessions
- Alternative: Use `profile="chrome"` with the Browser Relay extension to borrow user's logged-in session
- Google Sheets may require sign-in even for "Anyone with link = Editor" sheets

---

## 🐳 Docker Deployment Notes
- **Problem:** Updating failed due to Node.js 18.19.1 (requires 20+).
- **Fix:** Update OpenClaw Docker image from **`ghcr.io/openclaw/openclaw:latest`** (not `openclaw/openclaw:latest`).
- **Command:** `docker pull ghcr.io/openclaw/openclaw:latest`

## 🦞 Protocol: Spawn Opus (Project Scalpel)

**Trigger:** Alec says "Spawn Opus" OR task requires heavy reasoning/coding (refactoring, complex bugs).
**Action:** Spawn a disposable sub-agent.
- **Tool:** `sessions_spawn`
- **Model:** `anthropic/claude-opus-4-5` (alias: `opus`)
- **Cleanup:** `delete` (Agent dies after reporting)
- **Context:** ISOLATED. Explicitly point sub-agent to ONLY the necessary files. Do not dump global context.
