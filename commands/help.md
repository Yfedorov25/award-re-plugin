---
name: award-re:help
description: Show all award-re commands, what they do, and the current project state.
argument-hint: ""
---

# award-re — Help

Present this to the user (read current state first). Read `${AWARD_RE_PLUGIN_ROOT}/CLAUDE.md` for the rules.

## Current state
Run via Bash: `test -f .award-re/config.yaml && cat .award-re/config.yaml || echo "NO_CONFIG"`. Summarize in one line (new / mode + project_type + whether a build is in progress).

## Що це
award-re будує award-winning сайти НЕРУХОМОСТІ рівня студії Vide Infra. Філософія: **стратегія перед дизайном**, **одна мотіон-партитура на весь сайт** (усе повʼязано), **без WebGL**, **варіанти-прототипи** на вибір. Конкуренти впливають лише на сенси, не на візуал.

## Команди
| Команда | Що робить |
|---------|-----------|
| `/award-re:award` | Точка входу — визначає стан і маршрутизує. Запускай першим. |
| `/award-re:discovery` | Стратегія: дослідження ринку/конкурентів (сенси), глибоке Fedoriv-інтерв'ю, позиціонування, бренд, копі → brief.md + brand.md |
| `/award-re:build` | Будує сайт: page-map + канон-арка під ЦА/болі → мотіон-партитура (єдині константи + прийом-на-секцію) → секції за партитурою → perf + 50 критеріїв |
| `/award-re:section` | Одна секція з варіантами-прототипами (показує 2-4 VI-способи, ти обираєш) |
| `/award-re:visual-search` | Вибір квартир: SVG-плити building→floor→unit, статуси available/sold/reserved |
| `/award-re:learn` | Петля навчання: failure-запис того ж дня · video-bug розбір запису юзера · video-teardown еталонного сайту |
| `/award-re:audit` | Ревʼю готового за 50 award-критеріями + perf-guard (no-WebGL, scroll-jank) + узгодженість |
| `/award-re:task` | Кристалізує задачу з чату у `control/tasks/` (єдине джерело правди): заголовок, проєкт, web/mobile, demo-gate. Режим `inbox` — розгрібає чергу Telegram-бота |
| `/award-re:session` | Закріплює мітку цієї сесії (web3/towns/control) — далі inbox розгрібає лише її задачі |
| `/award-re:help` | Ця довідка |

Памʼятати треба лише `/award-re:award` — він веде до решти.

## Принципи (CLAUDE.md)
NO WebGL · стратегія→дизайн · одна партитура наперед · Fedoriv-копі без AI-slop · стек=вибір під задачу · нема даних→блок прихований (не вигадуємо) · Vide Infra = єдиний орієнтир рівня.
