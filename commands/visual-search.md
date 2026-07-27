---
name: award-re:visual-search
description: Build the interactive apartment selector — SVG plates drill-down (building → floor → unit) with available / sold / reserved statuses, no-WebGL. The conversion core of a ЖК site.
argument-hint: ""
---

# award-re — Visual Search (apartment selector)

<context> #$ARGUMENTS </context>

## Plugin paths & rules
Substitute `${AWARD_RE_PLUGIN_ROOT}`. Read & obey `${AWARD_RE_PLUGIN_ROOT}/CLAUDE.md`. Spacer before every AskUserQuestion.

## Pre-read (BLOCKING)
- `${AWARD_RE_PLUGIN_ROOT}/skills/re-visual-search/SKILL.md` (the full model + per-site variations)
- `${AWARD_RE_PLUGIN_ROOT}/skills/forms-lead-capture/SKILL.md` (unit → lead funnel)
- `.award-re/config.yaml` + `motion-score.md` (constants/ease/tokens) + `brand.md` (status colors).
- `${AWARD_RE_PLUGIN_ROOT}/skills/client-assets/SKILL.md` — confirm we have the SVG plates + unit dataset (else list what to request).

## Required client assets (block if missing — never invent)
- SVG plates: site plan (pick building) + facade-by-floor (pick floor) + each floor plan. 1 `<path data-nr>` per unit (drawn in Figma).
- Unit dataset (JSON/CRM): `{code, building, floor, square, price, rooms, status: available|sold|reserved, planSrc}`.
If absent → tell the user exactly what to provide; do not fabricate.

## Build (per re-visual-search SKILL — recommend the Ever model)
1. Paired `<path data-nr class="unit">` + invisible `.anchor` per unit; `data-nr` = join key.
2. JS joins `data-nr` → status from dataset → modifier class.
3. CSS states (project tokens): available (warm accent on hover) / sold (muted, pointer-events:none) / reserved (muted, clickable, warn-hover) / filtered-out (pale). Transition = project ease.
4. Drill-down: building → floor → unit (router/Barba, per `skills/re-architecture` stack choice). Hover popover: № · м² · ціна.
5. Dual view (Ever): list ↔ plan toggle over one dataset; range filters (square/price/floor) drive both.
6. **Legend** (color key) — mandatory.
7. Unit → favourites/callback funnel (forms-lead-capture).
8. Mobile: list fallback for the plan (per re-responsive). No-WebGL throughout (3D orbit → pre-rendered frames).

## Done
Wire into the site (units-handoff section, second-to-last before CTA). Record in motion-score.md.
