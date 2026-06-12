---
name: award-re:award
description: Universal entry point for the award-re plugin. Detects project state (new / resume / existing) and routes to the right workflow. Run this first.
argument-hint: ""
---

# award-re — Launch

<context> #$ARGUMENTS </context>

## Plugin paths
Your conversation context contains `AWARD_RE_PLUGIN_ROOT: <absolute path>` injected by the start hook. Whenever this command references `${AWARD_RE_PLUGIN_ROOT}/...`, substitute that path. Read the plugin's `CLAUDE.md` constitution at `${AWARD_RE_PLUGIN_ROOT}/CLAUDE.md` and obey it.

## Step 0 (BLOCKING): detect state from disk
`AWARD_RE_PROJECT_STATE` is a HINT only. Trust the disk:
1. Run via Bash: `test -f .award-re/config.yaml && cat .award-re/config.yaml || echo "NO_CONFIG"`.
2. Branch:
   - **`NO_CONFIG`** → new project. Go to **Onboarding** below.
   - **config with `resume:` block** → returning, active pipeline. Summarize where we stopped (phase, last section from `motion-score.md` if present), then ask via AskUserQuestion whether to continue or jump elsewhere.
   - **config without `resume:`** → returning, no active pipeline. Show config summary (mode, project_type, brand) + the command menu.

> **Skill rule:** "load skill X" = Read `${AWARD_RE_PLUGIN_ROOT}/skills/<name>/SKILL.md` and follow it inline. NEVER use the Skill tool — plugin skills set `disable-model-invocation: true`.

## Onboarding (new project)
Before every AskUserQuestion, end the chat message with an empty spacer line.
1. One-sentence intro: "award-re будує award-сайт нерухомості рівня Vide Infra: спершу стратегія (дослідження + інтерв'ю), потім дизайн за єдиною партитурою, без WebGL."
2. Ask (AskUserQuestion):
   - **Project type:** ЖК (multi-unit) / Вілла-один-обʼєкт / Existing (правки готового).
   - **Mode:** Guided (покроково, ти контролюєш) / Autopilot (сам, питає на ключових розвилках).
3. Scaffold `.award-re/config.yaml` via Bash (heredoc) with: `mode`, `project_type`, `niche: realestate`, `constraints: { webgl: false }`, empty `brand:` block, the canonical `arc:` (hero, manifesto, architecture, lifestyle, nature, location, interiors, trust, units, cta). No `resume:` yet.
3b. Scaffold the FULL `.award-re/` skeleton from `${AWARD_RE_PLUGIN_ROOT}/templates/`:
   copy `FAILURES-LOG.md`, `CLIENT-BACKLOG.md`, `motion-score.md`, `media-plan.md`,
   `ROLLBACK.md` and the `state/` dir into `.award-re/`. These are LAW artifacts
   (constitution A2/A11/H1/H3/H4/G) — every build phase reads/writes them; gates
   refuse to pass while they are missing.
4. Route to the recommended next step:
   - New ЖК/вілла → **strongly recommend `/award-re:discovery`** (strategy MUST come before design — CLAUDE.md §3). Offer to run it now.
   - Existing → ask: review / implement-section / add-feature → route to the matching command.

## Command menu (show when returning, or on request)
| Команда | Що |
|---|---|
| `/award-re:discovery` | ФАЗА 0 — дослідження + Fedoriv-інтерв'ю + позиціонування + бренд + копі → brief.md + brand.md |
| `/award-re:build` | Побудова сайту по канон-арці (читає brief/brand, складає motion-score, будує секції) |
| `/award-re:section` | Зібрати/переробити одну секцію (з варіантами-прототипами) |
| `/award-re:visual-search` | Інтерактивний вибір квартир (available/sold/reserved) |
| `/award-re:audit` | Ревʼю за 50 award-критеріями + perf-guard |
| `/award-re:learn` | Петля навчання: failure-запис · video-bug розбір · video-teardown еталонного сайту |
| `/award-re:help` | Довідка + поточний стан |

Recommend the next logical command based on what exists (no brief → discovery; brief but no build → build; built → audit).
