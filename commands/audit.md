---
name: award-re:audit
description: Review a built site against the 50 award criteria + performance (no-WebGL, scroll-jank) + consistency (does it read as ONE Vide Infra-level system). Works on this plugin's builds or any existing RE site.
argument-hint: "[url or path | specific area]"
---

# award-re — Audit

<context> #$ARGUMENTS </context>

## Plugin paths & rules
Substitute `${AWARD_RE_PLUGIN_ROOT}`. Read & obey `${AWARD_RE_PLUGIN_ROOT}/CLAUDE.md`.

## Pre-read (BLOCKING)
- `${AWARD_RE_PLUGIN_ROOT}/skills/award-criteria/references/A1_award_criteria.md` (the 50 criteria + junior red flags = eval brain)
- `${AWARD_RE_PLUGIN_ROOT}/skills/perf-doctrine/references/PB_performance.md` (the scroll-perf doctrine)
- `.award-re/motion-score.md` if present (to check the build against its own declared constants).

## What to audit
1. **50 award criteria** — spawn the **eval-brain** agent (Agent tool) with the target (URL/path/diff). It scores each criterion, flags junior red flags, cites evidence.
2. **Performance** — spawn the **perf-guard** agent: NO WebGL present; no mix-blend/backdrop-filter over scroll surfaces; no CSS transition on scroll-driven props; single smoother (no easing stack); idle-gated rAF; LCP/CLS/INP. Measure on PROD, not dev; real Chrome trace > headless (per PB_performance §6).
3. **Consistency (Clone-VI check)** — do ALL sections obey the motion-score constants (one ease/tokens/scroll/reveal)? Does theme flow dark↔light? Are techniques varied (not monotonous, no two heavy interactives back-to-back)? Did competitor visuals leak in (should NOT)?
4. **Strategy fit** — does the site answer the brief's pains/audience, or is it "site for site's sake"?

## Output
A prioritized report: P0 (breaks award level / perf) / P1 / P2, each with file:line or screenshot evidence and a concrete fix. In Guided mode, present findings one cluster at a time; in Autopilot, a single summary. Offer to apply fixes (or route to `/award-re:section` for rebuilds).

## Note
This is the command that's useful RIGHT NOW on the existing Quadro / Nahirna sites — point it at their prod URLs.
