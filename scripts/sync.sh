#!/usr/bin/env bash
set -euo pipefail

# === Config ===
REPO_BRANCH="two-way-sync"
WORKDIR="$HOME/.openclaw/workspace"
CONFIG_SRC="$HOME/.openclaw/openclaw.json"
LOGFILE="$WORKDIR/sync.log"
TIMESTAMP=$(date -Iseconds)

# Important files to sync
TRACKED_FILES=(
  "AGENTS.md"
  "HEARTBEAT.md"
  "USER.md"
  "SOUL.md"
  "IDENTITY.md"
  "TOOLS.md"
  "openclaw.json"
)

log() { echo "[$TIMESTAMP] $*" >> "$LOGFILE"; }

log "=== Sync started ==="

cd "$WORKDIR"

# Ensure openclaw.json is fresh
cp -f "$CONFIG_SRC" "$WORKDIR/openclaw.json" 2>/dev/null || log "WARN: could not copy openclaw.json"

# Ensure correct branch
git checkout "$REPO_BRANCH" 2>/dev/null || { log "ERROR: could not checkout $REPO_BRANCH"; exit 1; }

# 1) Pull remote changes (two-way: accept theirs first)
log "Fetching origin/$REPO_BRANCH..."
git fetch origin "$REPO_BRANCH" 2>/dev/null || log "WARN: fetch failed"

MERGE_OUTPUT=$(git pull --rebase origin "$REPO_BRANCH" 2>&1) || true
if echo "$MERGE_OUTPUT" | grep -qi "conflict"; then
  log "CONFLICT detected during pull. Manual resolution needed."
  log "$MERGE_OUTPUT"
  echo "CONFLICT" 
  exit 1
fi
log "Pull complete."

# 2) Stage and push local changes
git add -A
if git diff --cached --quiet; then
  log "No local changes to push."
  echo "CLEAN"
else
  git commit -m "Heartbeat sync: $TIMESTAMP"
  git push origin "$REPO_BRANCH" 2>/dev/null || { log "WARN: push failed"; echo "PUSH_FAIL"; exit 1; }
  log "Pushed local changes."
  echo "PUSHED"
fi

log "=== Sync complete ==="
