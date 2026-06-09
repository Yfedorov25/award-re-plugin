# award-re

Claude Code плагін, що будує **award-winning сайти нерухомості рівня студії Vide Infra** (ERA, AIR, Springs, Silver Pinewood, Ever).

Не «сайт заради сайту»: спершу стратегія (дослідження + інтерв'ю), потім одна мотіон-партитура на весь сайт, потім побудова за нею. Без WebGL. З варіантами-прототипами на вибір.

## Філософія
- **Clone Vide Infra** — VI = єдиний орієнтир рівня й прийомів. Конкуренти клієнта впливають лише на сенси (ЦА/болі/позиціонування), ніколи на візуал.
- **Стратегія перед дизайном** — research + глибоке Fedoriv-інтерв'ю → бренд → копі → і тільки потім дизайн.
- **Одна мотіон-партитура наперед** — єдині константи (ease/токени/scroll/reveal) + прийом-на-секцію фіксуються ДО побудови, щоб усе було повʼязано (а не «кожна секція по-своєму»).
- **NO WebGL** — усе відтворюється canvas-2D / inline-SVG / CSS. Текст у DOM = SEO.
- **Варіанти-прототипи** — для кожної ключової секції показуються 2-4 перевірені VI-способи + візуалізація, ти обираєш найкращий.
- **Копірайт Fedoriv** — живі розмовні речення, без AI-slop, zero em-dash.

## Команди
| Команда | Що |
|---|---|
| `/award-re:award` | Точка входу — визначає стан і маршрутизує. Запускай першим. |
| `/award-re:discovery` | Стратегія (фаза 0): дослідження, Fedoriv-інтерв'ю, позиціонування, бренд, копі → `brief.md` + `brand.md` |
| `/award-re:build` | Побудова: архітектура → мотіон-партитура → секції за партитурою → perf + 50 критеріїв |
| `/award-re:section` | Одна секція з варіантами-прототипами |
| `/award-re:visual-search` | Вибір квартир (available / sold / reserved) |
| `/award-re:audit` | Ревʼю за 50 award-критеріями + perf-guard (no-WebGL, scroll-jank) |
| `/award-re:help` | Довідка |

## Структура
- `commands/` — 7 verb-роутерів (єдине, що бачить користувач).
- `skills/` — невидима бібліотека знань (22 skills): orchestrator, discovery-strategy, re-architecture, motion-score, re-visual-search, re-interactive-map, re-color, re-media, perf-doctrine, copywriting, teardowns та ін. Кожен має `references/` з playbooks/teardowns.
- `agents/` — eval-brain (50 критеріїв), perf-guard (no-WebGL/jank), section-builder (будує за партитурою), copy-fedoriv (копі).
- `hooks/` — інжект шляху плагіна + стану проєкту.
- `CLAUDE.md` — конституція (хардові правила).

База знань: ~30 playbooks + 5 повних архітектурних розборів VI + `_TECHNIQUE_REGISTRY` (100% прийомів VI, ~150) + 50 award-критеріїв + copywriting. Усе з живого зонду реальних сайтів, нічого не вигадано.

## Встановлення
Додай як локальний плагін у Claude Code (marketplace `.claude-plugin/marketplace.json`). Стек цільового сайту = вибір під задачу (Next/React АБО vanilla+Barba+Locomotive). Потребує playwright MCP для QA-ревʼю.

## Стан
v0.1.0 — повний флоу (7 команд). Будувалось на досвіді сайтів quadro/nahirna + exhaustive-розборі Vide Infra.
