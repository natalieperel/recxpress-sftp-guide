#!/usr/bin/env bash
# Afternoon engagement-only run (no new post)
# Cron: 0 15 * * 1-5  /path/to/linkedin-mcp/run-engagement.sh >> /var/log/linkedin-mcp.log 2>&1

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_PREFIX="[$(date -u '+%Y-%m-%d %H:%M:%S UTC')]"

echo "$LOG_PREFIX Starting afternoon engagement run"

cd "$REPO_DIR"

if [ -f linkedin-mcp/.env ]; then
  set -a
  # shellcheck disable=SC1091
  source linkedin-mcp/.env
  set +a
fi

claude --print \
  "Run only the engagement section of the LinkedIn automation from CLAUDE.md —
   search hashtags, like and comment on relevant posts, and reply to any
   unanswered follower comments on the company page. Do not create a new post." \
  --no-conversation

echo "$LOG_PREFIX Engagement run complete."
