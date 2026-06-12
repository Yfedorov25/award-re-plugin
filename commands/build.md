---
name: award-re:build
description: Build the site at Vide Infra level. Consumes brief.md + brand.md, plans the page architecture under the audience/pains, fixes ONE motion score for the whole site, then builds each section strictly to that score. No-WebGL.
argument-hint: "[phase N | section-name]"
---

# award-re — Build

<context> #$ARGUMENTS </context>

## Plugin paths & rules
Substitute `${AWARD_RE_PLUGIN_ROOT}`. Read & obey `${AWARD_RE_PLUGIN_ROOT}/CLAUDE.md`. Spacer line before every AskUserQuestion.

## Pre-read (BLOCKING)
- `.award-re/config.yaml` (mode, project_type, brand, arc). Missing → run `/award-re:award` first.
- `.award-re/brief.md` + `.award-re/brand.md`. Missing → strongly recommend `/award-re:discovery` first (strategy before design, CLAUDE.md §3). Offer to run it.
- Read the orchestrator: `${AWARD_RE_PLUGIN_ROOT}/skills/orchestrator/SKILL.md` — it sequences the phases and the access modes. Follow it.

## Phases (orchestrator sequences these; load each skill = Read its SKILL.md inline)
1. **Context diagnosis** — `skills/context-diagnosis/` → type/tier/niche from brief.
2. **Architecture** — `skills/re-architecture/` → page-map (A inventory vs B atmosphere) + canon arc tuned to brief pains/audience. Write `.award-re/site-map.md`.
3. **★ Motion score (director's pass)** — `skills/motion-score/` → fix the SINGLE constants (one project ease, tokens from brand.md, scroll, reveal, media treatment, typography) + lay out the technique-per-section partitura. For key sections invoke `skills/variants-prototyping/` (show 2-4 VI variants, build HTML prototypes via `skills/variants-prototyping/` prototype refs, user picks). Write `.award-re/motion-score.md`. NOTHING is built before this exists (CLAUDE.md §4).
3.5. **★★ ART-DIRECTION GATE (MANDATORY — the Phoenix fix)** — load `skills/re-art-direction/SKILL.md` and BOTH its references (_ANTISLOP_design + _COMPOSITION_CRITIQUE). For EVERY section write its **Design Intent block** (full-bleed? text-on-media? anti-slop check?) into `.award-re/design-intent.md`. The design-grounding hook HARD-BLOCKS writing any site .css/.html/.tsx until this file exists — so this is not skippable (Phoenix was correct-but-cheap because it skipped composition; this gate prevents that). Defaults: full-bleed media, text-on-media on hero+key sections, ≥3 pinned scrollytelling, asymmetry, NO cream+orange / centering-everything / framed-thumbnails / infra-fonts.
4. **Build sections** — for EACH section in the arc, spawn the **section-builder** agent (Agent tool) with: the section's motion-score row + its Design Intent (from §3.5) + the relevant skill refs (re-sections, re-color, re-media, motion-engine, re-typography). It builds STRICTLY to the score + intent, no improvisation, full-bleed by default. visual-search → `skills/re-visual-search/`; location → `skills/re-interactive-map/`; forms/CTA → `skills/forms-lead-capture/`.
5. **Copy** — `skills/copywriting/` applies Fedoriv voice from brand.md to all copy (multiple hero variants → pick). Antislop pass.
6. **SEO/meta** — `skills/seo-meta/` (per-unit URLs, canonical, JSON-LD, text-in-DOM).
7. **Perf + criteria** — spawn **perf-guard** agent (no-WebGL, mix-blend/backdrop/jank) then **eval-brain** agent (50 criteria + consistency: all sections within constants? theme flows? techniques not monotonous?). Fix-loop until clean.
8. **Document** — update `config.yaml` `resume:` block with phase + last section so `/award-re:award` can continue.

## Modes (from config)
- **Autopilot:** run phases end-to-end; pause at the design→build checkpoint and before "expensive" choices; show chosen variants + 1 alternative.
- **Guided:** AskUserQuestion at each section; advisor-style checkpoint at major phase transitions; nothing finalized without approval.
- **Direct:** `$ARGUMENTS` = a section name → build just that one (still reads motion-score for constants).

## Hard rules (recap)
NO WebGL (🔴 techniques → no-WebGL translation). Build strictly to motion-score (no per-section improvisation). Never invent client data → hidden block. Stack = best fit for the task.

## v1 ПРИМУС (поверх фаз вище)
- Кожна секція йде ЧЕРЕЗ стейт-машину `/award-re:section` (state/*.yaml, гейт-хуки):
  копі-в-чаті → прототипи-на-портах → вибір юзера → інтеграція → verify.mjs → деплой-гейт.
- Медіа — ТІЛЬКИ через агента media-director (media-plan.md, доктрина G).
- ПЕРЕД фазами: прочитай FAILURES-LOG проєкту; БУДЬ-ЯКИЙ провал → /award-re:learn failure.
- Фінал build = прод-чек DOM-фактами ВСІХ маршрутів + передача юзеру на запис екрану (I1),
  НЕ «оновити resume».
