#!/usr/bin/env node
// award-re Design-Grounding Hook (PreToolUse on Write|Edit|MultiEdit)
// Hard-blocks writing SITE UI files (.css/.html/.tsx/.jsx/.vue/.svelte/.astro/.scss)
// until the art-direction step has produced `.award-re/design-intent.md` in the project.
// This is the gate that forces composition/art-direction (the thing Phoenix skipped:
// it built correct-but-cheap because nothing made it declare full-bleed/text-on-media/
// anti-slop intent first). Fail-OPEN: any error or missing config => allow.
'use strict';
const fs = require('fs');
const path = require('path');

try {
  const cwd = process.cwd();
  // Only active in an award-re project (config exists). Otherwise do nothing.
  if (!fs.existsSync(path.join(cwd, '.award-re', 'config.yaml'))) process.exit(0);

  // Read the tool call from stdin (Claude Code passes JSON on PreToolUse).
  let raw = '';
  try { raw = fs.readFileSync(0, 'utf8'); } catch (_) { process.exit(0); }
  if (!raw.trim()) process.exit(0);
  let input; try { input = JSON.parse(raw); } catch (_) { process.exit(0); }

  const ti = input.tool_input || input.toolInput || {};
  const filePath = ti.file_path || ti.path || '';
  if (!filePath) process.exit(0);

  // UI extensions that count as site visual code (the gate triggers on these).
  const UI_EXT = ['.css', '.scss', '.sass', '.less', '.html', '.tsx', '.jsx', '.vue', '.svelte', '.astro'];
  const ext = path.extname(filePath).toLowerCase();
  if (!UI_EXT.includes(ext)) process.exit(0);

  // Exempt: the plugin's own files, deps, tests, the design-intent doc itself,
  // and prototype scratch (prototypes are throwaway exploration, not the final site).
  const p = filePath.replace(/\\/g, '/');
  const EXEMPT = ['/node_modules/', '/.git/', '/.award-re/', '/award-re-plugin/',
    '/tests/', '/test/', '/__tests__/', '/prototypes/', '/.award/prototypes/'];
  if (EXEMPT.some((e) => p.includes(e))) process.exit(0);

  // The gate: design-intent.md must exist (written by the re-art-direction step).
  const intent = path.join(cwd, '.award-re', 'design-intent.md');
  if (fs.existsSync(intent) && fs.statSync(intent).size > 120) process.exit(0);

  // Block with an instructive message (PreToolUse deny).
  const reason =
    'award-re DESIGN GATE: site UI files are blocked until art-direction is grounded.\n' +
    'Before writing ' + path.basename(filePath) + ', run the re-art-direction skill:\n' +
    '  1) Read skills/re-art-direction/references/_ANTISLOP_design.md + _COMPOSITION_CRITIQUE.md\n' +
    '  2) For EACH section, write the Design Intent block (full-bleed? text-on-media? anti-slop check?)\n' +
    '     into .award-re/design-intent.md\n' +
    'This is the step Phoenix skipped (correct-but-cheap). No full-bleed/text-on-media intent => no code.';
  const out = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  };
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
} catch (_) {
  process.exit(0); // fail-open
}
