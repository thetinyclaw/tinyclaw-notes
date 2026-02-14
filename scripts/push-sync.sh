#!/usr/bin/env bash
set -euo pipefail

# Push local workspace state → mirror → staging branch on GitHub
REPO_BRANCH="staging"
WORKDIR="$HOME/.openclaw/workspace"
MIRROR="$WORKDIR/mirror/workspace"
CONFIG_SRC="$HOME/.openclaw/openclaw.json"
LOGFILE="$WORKDIR/sync.log"
TS=$(date -Iseconds)

log() { echo "[$TS] [push] $*" >> "$LOGFILE"; }

log "Starting push-sync"
mkdir -p "$MIRROR"
cd "$WORKDIR"

# 1) Copy important files into mirror
cp -f "$CONFIG_SRC"          "$MIRROR/openclaw.json"
cp -f "$WORKDIR/AGENTS.md"   "$MIRROR/AGENTS.md"
cp -f "$WORKDIR/HEARTBEAT.md" "$MIRROR/HEARTBEAT.md"
cp -f "$WORKDIR/USER.md"     "$MIRROR/USER.md"
cp -f "$WORKDIR/SOUL.md"     "$MIRROR/SOUL.md"
cp -f "$WORKDIR/IDENTITY.md" "$MIRROR/IDENTITY.md"
cp -f "$WORKDIR/TOOLS.md"    "$MIRROR/TOOLS.md"

# 2) Ensure staging branch exists
git fetch origin 2>/dev/null || true
git checkout "$REPO_BRANCH" 2>/dev/null || git checkout -b "$REPO_BRANCH"

# 3) Stage mirror and push
git add mirror/
if git diff --cached --quiet; then
  log "No changes to push."
  echo "CLEAN"
else
  git commit -m "push-sync: $TS"
  git push origin "$REPO_BRANCH" 2>/dev/null || { log "Push failed"; echo "PUSH_FAIL"; exit 1; }
  log "Pushed to origin/$REPO_BRANCH"
  echo "PUSHED"
fi

log "Push-sync complete"
