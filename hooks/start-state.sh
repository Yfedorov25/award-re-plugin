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

# v1: tool-check — чесно кажемо, чого бракує (закон §0 Самодостатність)
MISSING=""
command -v ffmpeg >/dev/null 2>&1 || MISSING="$MISSING ffmpeg"
command -v node >/dev/null 2>&1 || MISSING="$MISSING node"
node -e "require.resolve('playwright')" >/dev/null 2>&1 || ls ./node_modules/playwright >/dev/null 2>&1 || MISSING="$MISSING playwright(verify.mjs)"
command -v vercel >/dev/null 2>&1 || ls ./node_modules/.bin/vercel >/dev/null 2>&1 || ls ../quadro/node_modules/.bin/vercel >/dev/null 2>&1 || MISSING="$MISSING vercel-cli"
[ -n "$MISSING" ] && echo "AWARD_RE_TOOLCHECK: відсутні —$MISSING (Higgsfield MCP перевір у /mcp; sharp ставиться npm-ом за потреби)"
# v1: нагадування про журнал провалів (закон H1)
[ -f .award-re/FAILURES-LOG.md ] && echo "AWARD_RE_FAILURES: прочитай .award-re/FAILURES-LOG.md перед побудовою (закон A11/H1)"
