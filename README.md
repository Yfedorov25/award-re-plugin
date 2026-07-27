# award-re

Claude Code плагін, що будує **award-winning сайти нерухомості рівня студії Vide Infra** (ERA, AIR, Springs, Silver Pinewood, Ever) — Senior++ з першого пострілу, без ітерацій «джуніор → переробка».

Не «сайт заради сайту»: спершу стратегія (дослідження + інтерв'ю), потім одна мотіон-партитура на весь сайт, потім стейт-машина секцій з гейтами, які фізично не дають зрізати кути. Без WebGL.

## Філософія (конституція в `CLAUDE.md`)
- **Clone Vide Infra** — VI = єдиний орієнтир рівня. Конкуренти клієнта впливають лише на сенси (ЦА/болі/позиціонування), ніколи на візуал.
- **Стратегія перед дизайном** — research + глибоке Fedoriv-інтерв'ю → бренд → копі → і тільки потім дизайн.
- **Граматика, не меню прийомів** — флагманська секція = стек 5-7 шарів (база-медіа → оверлей → текст-хореографія → мікро → шов), зібраний з реєстру 109 T-ID + 22 архетипів. Закони композиції C1-C17: партитура дистанцій камери, обʼєкт=пуант, шви-естафети, page-transition як клас.
- **Стейт-машина секції** — 11 стадій з артефактами у `.award-re/state/`; гейт-хуки блокують запис UI-коду без вибору юзера з живих прототипів і деплой без свіжого verify-звіту.
- **Верифікація без скріншотів** — `scripts/verify.mjs` (playwright DOM-факти: console, overflow, кліпінг, failed requests) + відеозаписи екрану від юзера як фінальний канал правди.
- **Петля навчання** — кожен провал того ж дня стає законом (`/award-re:learn`); відео-тірдауни еталонних сайтів поповнюють граматику.
- **NO WebGL** — усе відтворюється canvas-2D / inline-SVG / CSS. Текст у DOM = SEO.
- **Копірайт Fedoriv** — живі розмовні речення, zero em-dash, bans.yaml, повні секвенції в чаті (ніколи в AskUserQuestion-обривках).

## Команди
| Команда | Що |
|---|---|
| `/award-re:award` | Точка входу — визначає стан і маршрутизує. Запускай першим. |
| `/award-re:discovery` | Стратегія (фаза 0): дослідження, Fedoriv-інтерв'ю, позиціонування, бренд, копі → `brief.md` + `brand.md` |
| `/award-re:build` | Побудова: архітектура → мотіон-партитура (стеки T-ID) → секції стейт-машиною → perf + 50 критеріїв |
| `/award-re:section` | Стейт-машина однієї секції: копі-в-чаті → живі прототипи → вибір → verify → деплой |
| `/award-re:visual-search` | Вибір квартир (available / sold / reserved) |
| `/award-re:audit` | Ревʼю за 50 award-критеріями + perf-guard (no-WebGL, scroll-jank) |
| `/award-re:learn` | Петля навчання: failure-запис · video-bug розбір запису юзера · video-teardown еталонного сайту |
| `/award-re:help` | Довідка + поточний стан |

## Структура
- `commands/` — 8 verb-роутерів (єдине, що бачить користувач).
- `skills/` — бібліотека знань (25 skills): grammar (шари + T-ID-реєстр), teardowns (7 відео-тірдаунів вкл. десктоп+мобайл + 5 живих зондів VI), orchestrator, discovery-strategy, motion-score, variants-prototyping, re-visual-search, re-interactive-map, copywriting (bans.yaml), higgsfield-craft та ін.
- `agents/` — section-builder (ВХІД/БАНИ/DoD), media-director, teardown-anatomist, eval-brain (50 критеріїв, рахує), perf-guard, copy-fedoriv.
- `hooks/` — start-state (інжект шляху/стану + tool-check), section-gates (prototype-gate, design-intent-gate, бан AskUserQuestion-копі), deploy-gate (verify-report обовʼязковий).
- `scripts/` — `verify.mjs` (DOM-факти), `frames.sh` (ffmpeg кадри+контактні листи з .mov юзера).
- `templates/` — FAILURES-LOG, CLIENT-BACKLOG, motion-score, media-plan, design-intent, ROLLBACK, state/.
- `CLAUDE.md` — конституція v1: §0 аксіоми + розділи A-I (~120 законів, кожен виводиться з реального провалу F-01..F-28 або тірдауна).

База знань: ~30 playbooks + 5 архітектурних розборів VI + 7 відео-тірдаунів десктоп+мобайл (~1500 кадрів) + `_REGISTRY_TID.md` (130 T-ID вкл. L6 MOBILE T-M01…T-M16, 22 архетипи) + 50 award-критеріїв. Усе з живих зондів і записів реальних сайтів, нічого не вигадано.

## Встановлення
Додай як локальний плагін у Claude Code (marketplace `.claude-plugin/marketplace.json`). Стек цільового сайту = вибір під задачу (Next/React АБО vanilla+Vite+GSAP). Інструменти: ffmpeg, node, playwright, vercel CLI — start-hook перевіряє наявність і попереджає.

## Стан
**v1.0.0** — повна перебудова після діагнозу v0.2 (10 причин джуніор-результату → 6 стовпів виправлення, див. `REBUILD-PLAN-v1.md`). Етап 7 acceptance пройдено (`ACCEPTANCE-stage7.md`): пайплайн примушує Senior++ на рівні процесу, 3 гейт-хуки реально блокують, двоконтурний аудит (технічний + композиційна лінза /10). Реальний доказ — smarts-agronomichne збудований цим плагіном на ~46-47/50 + композиція 8/10. База знань: 130 T-ID, 7 відео-тірдаунів (десктоп+мобайл), L6 мобільна граматика.
