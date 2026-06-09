---
name: award-re:section
description: Build or rebuild ONE section, variant-driven — shows 2-4 proven Vide Infra technique-variants, visualizes them (HTML prototypes for key sections), you pick, it builds to the motion score.
argument-hint: "[section name, e.g. hero | location | gallery]"
---

# award-re — Section (variant-driven)

<context> #$ARGUMENTS </context>

## Plugin paths & rules
Substitute `${AWARD_RE_PLUGIN_ROOT}`. Read & obey `${AWARD_RE_PLUGIN_ROOT}/CLAUDE.md`. Spacer before every AskUserQuestion.

## Pre-read (BLOCKING)
- `.award-re/config.yaml` + `.award-re/motion-score.md` (if it exists — for the project's fixed constants/ease/tokens). If no motion-score yet, derive the constants first via `skills/motion-score/` so this section stays consistent with the rest.
- `${AWARD_RE_PLUGIN_ROOT}/skills/variants-prototyping/SKILL.md` (the variant flow)
- `${AWARD_RE_PLUGIN_ROOT}/skills/re-sections/SKILL.md` + the matching aspect skills (re-color, re-media, motion-engine, re-typography).
- `${AWARD_RE_PLUGIN_ROOT}/skills/teardowns/references/_TECHNIQUE_REGISTRY.md` (the 100% VI technique menu).

## Flow
1. Identify the section (from `$ARGUMENTS` or ask).
2. **Pull 2-4 candidate techniques** for this section's role from `_TECHNIQUE_REGISTRY` (per variants-prototyping). Drop 🔴 WebGL → use their no-WebGL translation.
3. **Visualize** (level by importance): A) variant table (technique / look / cost / VI source) always; B) ASCII mockup via AskUserQuestion preview; C) single-file HTML prototype (per `skills/variants-prototyping/` prototype refs) for hero/visual-search/map/key transitions.
4. **Pick:** Guided → AskUserQuestion; Autopilot → choose by brand+perf+criteria, show chosen + 1 alternative.
5. **Record** the choice in `.award-re/motion-score.md` (+ one line why).
6. **Build** via the section-builder agent, strictly to the chosen variant + project constants.

## Rules
Variants differ by TECHNIQUE, never break motion-score constants (one ease/tokens/scroll). Every variant has a VI source (no invented techniques). No-WebGL. Copy in Fedoriv voice (multiple options → pick). Real client media or correctly-sized placeholder slots.
