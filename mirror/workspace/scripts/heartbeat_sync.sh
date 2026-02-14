#!/usr/bin/env bash
set -euo pipefail

REPO_BRANCH="two-way-sync"
WORKDIR="$HOME/.openclaw/workspace"
MIRROR_DIR="$WORKDIR/mirror/workspace"
LOGFILE="$WORKDIR/HEARTBEAT_RUNS.log"
HEARTBEAT_STATUS="$WORKDIR/HEARTBEAT_STATUS.md"
TIMESTAMP=$(date -Iseconds)

log() { echo "[$TIMESTAMP] [heartbeat] $*" >> "$LOGFILE"; }

: > "$LOGFILE" 2>&1

log "Starting heartbeat sync"
mkdir -p "$MIRROR_DIR"
cd "$WORKDIR"

if [ -d "$WORKDIR/.git" ]; then
  git fetch origin "$REPO_BRANCH" || true
  git checkout "$REPO_BRANCH" || true
  git pull --rebase origin "$REPO_BRANCH" || true
else
  log "No git repo at $WORKDIR"
fi

# 2) Mirror: copy workspace into mirror (excluding github)
rsync -a --delete --exclude 'github/**' "$WORKDIR/" "$MIRROR_DIR/" 

# 3) Push via push-sync.sh (bespoke path)
PUSH_CMD="$WORKDIR/scripts/push-sync.sh"
if [ -x "$PUSH_CMD" ]; then
  "$PUSH_CMD" || log "push-sync.sh failed"
else
  log "push-sync.sh not executable"
fi

# 4) Write a concise heartbeat status line
if [ ! -f "$HEARTBEAT_STATUS" ]; then
  echo "# HEARTBEAT_STATUS" > "$HEARTBEAT_STATUS"
fi
printf "Mirror heartbeat at %s; branch=%s" "$TIMESTAMP" "$REPO_BRANCH" >> "$HEARTBEAT_STATUS" 2>&1 || true
log "Heartbeat complete"
