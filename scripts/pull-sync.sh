#!/usr/bin/env bash
set -euo pipefail

# Pull from GitHub main, copy to local workspace
REPO_BRANCH="main"
WORKDIR="$HOME/.openclaw/workspace"
MIRROR="$WORKDIR/mirror/workspace"
LOGFILE="$WORKDIR/sync.log"
TS=$(date -Iseconds)

log() { echo "[$TS] [pull] $*" >> "$LOGFILE"; }

log "Starting pull-sync"
mkdir -p "$MIRROR"
cd "$WORKDIR"

# 1) Pull latest main
git fetch origin main 2>/dev/null || true
git checkout "$REPO_BRANCH" 2>/dev/null || git checkout -b "$REPO_BRANCH" 2>/dev/null || true
if git pull origin "$REPO_BRANCH" 2>/dev/null; then
  log "Pulled origin/main"
else
  log "Pull failed; continuing"
fi

# 2) Sync from main into mirror, excluding github
rsync -a --delete --exclude 'github/**' "$WORKDIR/" "$MIRROR/" 

# 3) Write status
log "Mirror updated from main to local mirror"
