// MCP-EXA Skill Logger
// Structured logging with levels, rotation, and dual output (skill log + daily memory)
const fs = require('fs');
const path = require('path');

const SKILL_LOG_DIR  = path.join(__dirname, 'logs');
const MEMORY_DIR     = path.resolve(__dirname, '../../memory');
const MAX_LOG_BYTES  = 512 * 1024; // 512 KB per log file before rotation
const MAX_LOG_FILES  = 5;          // keep up to 5 rotated logs

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };

let currentLevel = LEVELS.info; // default
let currentRunId = null; // per-run identifier

function setLevel(level) {
  if (LEVELS[level] !== undefined) currentLevel = LEVELS[level];
}

function setCurrentRun(runId) {
  currentRunId = runId;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function timestamp() {
  return new Date().toISOString();
}

function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// --- Rotation ---

function rotate(logPath) {
  try {
    const stat = fs.statSync(logPath);
    if (stat.size < MAX_LOG_BYTES) return;
  } catch { return; } // file doesn't exist yet

  // shift existing rotations
  for (let i = MAX_LOG_FILES - 1; i >= 1; i--) {
    const older = `${logPath}.${i}`;
    const newer = i === 1 ? logPath : `${logPath}.${i - 1}`;
    try { fs.renameSync(newer, older); } catch { /* ok */ }
  }
  // logPath is now freed (renamed to .1)
}

// --- Writers ---

function writeSkillLog(line) {
  ensureDir(SKILL_LOG_DIR);
  const logFile = path.join(SKILL_LOG_DIR, 'mcp_exa.log');
  rotate(logFile);
  fs.appendFileSync(logFile, line + '\n');
}

function writeDailyMemory(line) {
  ensureDir(MEMORY_DIR);
  const memFile = path.join(MEMORY_DIR, `${dateStamp()}.md`);
  // Only append important entries (warn+) to daily memory to keep it clean
  fs.appendFileSync(memFile, line + '\n');
}

// --- Helper to format with run id if present ---
function prefixedLine(level, msg, meta) {
  const ts = timestamp();
  let line = `[${ts}] [MCP-EXA] [${level.toUpperCase()}] ${msg}`;
  if (currentRunId) line = line.replace('[MCP-EXA]', `[MCP-EXA][RUN:${currentRunId}]`);
  if (meta) {
    try {
      const serial = typeof meta === 'string' ? meta : JSON.stringify(meta);
      line += ` | ${serial}`;
    } catch { /* skip unserializable meta */ }
  }
  return line;
}

// --- Core log function ---

function _log(level, msg, meta) {
  if (LEVELS[level] === undefined || LEVELS[level] < currentLevel) return;

  const line = prefixedLine(level, msg, meta);

  // Always write to skill log
  writeSkillLog(line);

  // Write warn+ to daily memory for visibility
  if (LEVELS[level] >= LEVELS.warn) {
    writeDailyMemory(`- ${line}`);
  }
}

// --- Public API ---

const logger = {
  setLevel,
  setCurrentRun,

  debug: (msg, meta) => _log('debug', msg, meta),
  info:  (msg, meta) => _log('info',  msg, meta),
  warn:  (msg, meta) => _log('warn',  msg, meta),
  error: (msg, meta) => _log('error', msg, meta),
  fatal: (msg, meta) => _log('fatal', msg, meta),

  // Convenience: structured event log (always info+)
  event(action, detail) {
    _log('info', `EVENT:${action}`, detail);
  },

  // Convenience: execution context (start/end with timing)
  startTimer(label) {
    const start = Date.now();
    _log('info', `TIMER_START: ${label}`);
    return {
      stop: (extra) => {
        const elapsed = Date.now() - start;
        _log('info', `TIMER_END: ${label} (${elapsed}ms)`, extra);
        return elapsed;
      }
    };
  }
};

module.exports = logger;
