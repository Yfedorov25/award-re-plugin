#!/usr/bin/env bash
# Injects the plugin root path + project state into the conversation context.
# Commands read AWARD_RE_PLUGIN_ROOT to locate skills/references; AWARD_RE_PROJECT_STATE
# is a HINT for routing (commands re-read config.yaml from disk as source of truth).
set -euo pipefail

ROOT="${CLAUDE_PLUGIN_ROOT:-}"
CFG=".award-re/config.yaml"

if [ -f "$CFG" ]; then
  PT="$(grep -E '^project_type:' "$CFG" 2>/dev/null | head -1 | sed 's/^project_type:[[:space:]]*//' || true)"
  if grep -qE '^resume:' "$CFG" 2>/dev/null; then
    STATE="returning:${PT:-unknown}:resume"
  else
    STATE="returning:${PT:-unknown}"
  fi
else
  STATE="new"
fi

echo "AWARD_RE_PLUGIN_ROOT: ${ROOT}"
echo "AWARD_RE_PROJECT_STATE: ${STATE}"
