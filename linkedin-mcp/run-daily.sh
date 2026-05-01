#!/usr/bin/env bash
# Daily LinkedIn automation — post + engage
# Cron: 0 9 * * 1-5  /path/to/linkedin-mcp/run-daily.sh >> /var/log/linkedin-mcp.log 2>&1

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_PREFIX="[$(date -u '+%Y-%m-%d %H:%M:%S UTC')]"

echo "$LOG_PREFIX Starting daily LinkedIn run"

cd "$REPO_DIR"

# Load .env if present (fallback — prefer credentials in .claude/settings.json)
if [ -f linkedin-mcp/.env ]; then
  set -a
  # shellcheck disable=SC1091
  source linkedin-mcp/.env
  set +a
fi

# Publish any pre-scheduled posts first
echo "$LOG_PREFIX Checking scheduled posts..."
python linkedin-mcp/server.py --publish-due

# Run Claude non-interactively: post + engagement in one shot
echo "$LOG_PREFIX Running Claude automation..."
claude --print \
  "Run the full LinkedIn daily automation as described in CLAUDE.md.
   Today is $(date -u '+%A, %Y-%m-%d').
   Step 1: daily post. Step 2: engagement run (both morning slots)." \
  --no-conversation

echo "$LOG_PREFIX Done."
