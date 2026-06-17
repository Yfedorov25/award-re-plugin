# 1.2.0 — CONTROL: єдине джерело правди + кристалізація задач (2026-06-17)
Новий крос-проєктний шар `control/` (реєстр об'єктів + задачі + БД лідів/метрик) і
дашборд `apps/control`. Плагін отримує закони й команду, щоб ВСІ агенти ділили цей стан.

**CLAUDE.md — новий розділ J. CONTROL (+5 законів):**
- J1 читай `control/projects.yaml` + активні задачі перед роботою над об'єктом.
- J2 онови `control/tasks/T-*.md` після значущої зміни (стадія + лог).
- J3 `demo-pending → done` ЛИШЕ після рядка `demo-confirm:` (демо з девелопером); агент сам не закриває.
- J4 `platform: mobile` стартує `backlog` («not-started»).
- J5 нова задача з чату → `/award-re:task` (у файл, не «в голові»).

**Нова команда `/award-re:task`** — кристалізує вільний опис у `control/tasks/T-NNNN.md`:
заголовок (Fedoriv, без крапки), auto-проєкт із projects.yaml, web/mobile, demo-gate,
наступний вільний ID. Slack/Telegram-вхід — фаза 2.

**help.md** — додано `/award-re:task` у таблицю команд.

Pipeline стадій web/mobile окремо: `backlog → in-progress → demo-pending → done`.
demo-gate = «готово» лише після підтвердження демо юзером.

# 1.1.0 — LEARN: 22 бойові закони з towns + smarts (2026-06-17)
Перший повний цикл `/award-re:learn` після релізу: towns (27 провалів) + smarts (21)
FAILURES-LOG + memory звірені з конституцією. NEW vs DUPLICATE розмічено, дублі відкинуто,
22 нові закони промотовано (≥2 повтори або ТОП-урок). ТОП-5: night-relight контракт,
прототип=контракт, рендер-vs-реальність, агенти не пінять складні сцени, дозування reveal.

**CLAUDE.md (+22 закони):**
- **G14-G24** (медіа/рендер): G14 ніч≠затемнений день (4-точковий relight); G15 day —
  штучне світло OFF; G16 інвентар обʼєктів замкнено; G17 ніч = i2i з фінального day-кадру;
  G18 анти-диптих; G19 камера за рівнем поверху; G20 рендер i2i з реального PDF-плану
  (PyMuPDF); G21 вікна/отвори верифікуються числами розмірів; G22 axis-anchoring до генерації
  кімнат; G23 планка інтер'єр-рендера A2+; G24 QC-агент поелементна звірка.
- **F12-F13** (чесність): F12 вид з вікна/двір = реальний масштаб ділянки; F13 оточення лише
  з оригінальних рендерів.
- **C17-C25** (композиція/драматургія): C17 затверджений прототип = КОНТРАКТ [ТОП]; C18
  переходи лише з затверджених прототипів; C19 слайс/шов працює на 2 рівнях; C20 не
  розкривати все одразу; C21 формула progressThroughViewport; C22 гігантські цифри-фон = шум;
  C23 flagship МУСИТЬ мати L1-медіа; C24 менше скролу ≠ менше шарів; C25 власний scrim на
  кожен текст, squint на найсвітлішому кадрі.
- **B13** (верифікація): не делегувати агентам складні pin-сцени [ТОП].
- **A12** (пайплайн): перевір public/prototypes/ перед скафолдом.
- **E15** (копі): видиме копі лише через copy-fedoriv агента.

**grammar/_GRAMMAR.md:**
- §3 РЕЄСТР ШВІВ: рядок slice-relay (towns strip-1/2/3 прототипи).
- §7 АНТИ-ПРИЙОМИ — список junior-маркерів.
- §8 NIGHT-RELIGHT КОНТРАКТ — 5-точковий day↔night контракт.

# 1.0.0 — РЕЛІЗ (2026-06-13)
Етап 7 acceptance пройдено (ACCEPTANCE-stage7.md): фейковий бриф ЖК «Лиман» з 4 пастками
трасований через увесь пайплайн — 7/7 evals, всі пастки відбиті законами, 3 гейт-хуки
реально блокують (перевірено на коді). Реальний доказ: smarts-agronomichne збудований
цим плагіном на technical ~46-47/50, composition 8/10, ~90-92% Vide Infra.

Додано після rc1:
- **Мобільна граматика L6** (T-M01…T-M16) — крос-сайтовий синтез 5 моб-тірдаунів; закон
  трансформації desktop→mobile через matchMedia, десктоп 1:1. Закрита системна діра «0 моб T-ID».
- **D_EVER_video** (десктоп 264с + мобайл) — закрита діра №1 реєстру «Ever наживо 0 відео»;
  +5 десктоп T-ID (wordmark-knockout та ін.) +4 моб T-M. Реєстр 109→130 T-ID, 7 відео-тірдаунів.
- Дофікси повноти rc1 (registry canon, live-prototype law, мертві §-номери, perf-guard v1,
  compress-budget.mjs, design-intent template, G12/G13, README/help/marketplace).

# 1.0.0-rc1 — ПОВНА ПЕРЕБУДОВА (2026-06-13)
Етапи 1-5 REBUILD-PLAN-v1 виконані:
- **Граматика**: _REGISTRY_TID.md — 109 T-ID по шарах L1-L5 + 22 архетипи (A-01..A-22),
  кожен з джерелом-тірдауном, вартістю, комбінаціями і no-WebGL перекладом; архетипні
  стеки записані T-ID-ами. Мета-патерн експозиції з 6/6 живих сайтів.
- **Примус**: /section = стейт-машина (state/*.yaml, 11 стадій-артефактів);
  хуки section-gates (prototype-gate: Write у src заблокований без user-choice;
  бан AskUserQuestion-копі) і deploy-gate (без свіжого verify-report деплой
  не їде); scripts/verify.mjs (DOM-факти: рендер/консоль/overflow/clipping,
  desktop+mobile, JSON-звіт) + scripts/frames.sh (розбір відео).
- **Агенти v2**: section-builder з ВХОДОМ/БАНАМИ/DoD/схемою звіту-з-доказами;
  copy-fedoriv факт-контракт + ДНК хедлайнів; eval-brain лічильні критерії
  граматики (шарність/дистанції/шви/стадії); нові media-director і
  teardown-anatomist.
- **Ядра**: bans.yaml (розширюваний бан-лист копі) + read-gate; skill
  higgsfield-craft (доктрина G операційно: 4K, locks, frame-QA, бюджети).
- **Петля навчання**: /award-re:learn (failure same-day · video-bug · video-teardown
  через teardown-anatomist) + правило промоції 2+ повторів у закон конституції.

# 0.3.0-dev — REBUILD Етап 0 (2026-06-12)
## 0.3.0-dev · ingestion #4-6 (2026-06-13)
- D_SPRINGS_video (351 кадр): push-over «доводчики», інтро-мозаїка дистанцій,
  silk-wave, units-картка split «дані|план на папері», галерея-тур з хотспотами.
- D_SILVERPINEWOOD_video (170): курсор-лінза, хромові камені, інфра-карта з
  категоріями, амніті-список іменників, меню з реактивним фото-фоном.
- D_ERA_video (271): frame→fullbleed hero, акти-імперативи, матеріал-як-3D-обʼєкт
  (вирішення F-20), construction-progress з помісячними каруселями+вебкам,
  плаваюче запрошення пікера, ghost-CAPS за каруселлю.
- Граматика: +2 шви, +10 прийомів, +4 архетипи, МЕТА-ПАТЕРН ЕКСПОЗИЦІЇ
  (акт+медіа+факт-абзац; тон акта = ідентичність сайту; бренд-рефрен hero→footer).

## 0.3.0-dev · ingestion #2-3 (2026-06-13)
- D_AIR_video.md (235 кадрів): ЖИВИЙ Vide Infra сайт — повний visual-search дріл
  (floor-plates → драбинка+план → юніт+ізометрія → similar з планами-превʼю),
  кінетика карти = підтвердження нашого F-24 рішення як VI-канону, spread-row
  заголовки, бренд-3D-обʼєкт, color-zone аеро.
- D_11TANJUNG_video.md (81 кадр): rounded-canvas секції, фразова естафета глав,
  кільця-тріо, types-карусель, facilities-акордеон, sound-шар, blur-reveal.
- Граматика: +8 прийомів у шари, +2 архетипи, visual-search/карта архетипи
  деталізовані живою механікою.

## 0.3.0-dev · ingestion #1 (2026-06-13)
- Перший відео-тірдаун: D_SAISEI_video.md (195 кадрів з 2 записів юзера) —
  драматургія + інтеракції + дельти граматики.
- Граматика-стрес-тест ПРОЙДЕНО з 1 розширенням моделі: новий клас швів
  **page-transition** (брендовий ритуал прелоадер=перехід=повернення) + next-handoff;
  нові L3 (scatter→assemble, text-photo interleave, тришарові лейбли), новий L1
  (повноекранний дек), 3 нові архетипи.

- CLAUDE.md → КОНСТИТУЦІЯ v1: ~120 законів у 10 розділах (0 + A-I), кожен з
  першоджерелом (F-01..F-28 + бойові рішення smarts/quadro/nahirna). Старі хард-правила
  v0.2 збережені й влиті в §0.
- 235 wiki-лінків [[…]] у references мігровано на реальні відносні шляхи (агенти
  тепер можуть переходити за зв'язками).
- templates/: обовʼязковий скелет .award-re/ проєкту (FAILURES-LOG, CLIENT-BACKLOG,
  motion-score-факт, media-plan, ROLLBACK, state/) + onboarding scaffold у award.md.
- План перебудови: REBUILD-PLAN-v1.md (6 стовпів, етапи 0-7), CONSTITUTION-v1-draft.md.

# Changelog

## 0.2.0 — Art-direction gate (the Phoenix fix)
First live test (agro-phoenix.vercel.app) produced a "correct but cheap" site: right engine, ease, copy, no-WebGL — but composition 4/10 vs Vide Infra 9 (assets marooned in voids, no full-bleed, text separate from media, centered-column brochure, cream+orange). Postmortem + a full 6-site metric comparison (POSTMORTEM-phoenix.md, COMPARISON-vi-vs-phoenix.md) showed the gap is almost entirely **composition / art-direction**, which the plugin described but never *enforced*.

Added (adapted-and-RE-tuned from the design-engineer plugin's aesthetic layer):
- **skill `re-art-direction`** + references `_ANTISLOP_design.md` (design anti-slop catalog — names Phoenix's exact failures: cream+orange, centering, framed thumbnails, infra-fonts, display-without-cyrillic) and `_COMPOSITION_CRITIQUE.md` (4 lenses + 4 named tests + composition score).
- **design-grounding hook** (`hooks/design-grounding.js`, PreToolUse Write|Edit) — HARD-BLOCKS writing site `.css/.html/.tsx`… until `.award-re/design-intent.md` exists. Forces full-bleed/text-on-media/anti-slop intent per section before any code. Fail-open.
- **build.md** — new mandatory phase 3.5 ART-DIRECTION GATE (writes design-intent.md).
- **eval-brain** — separate COMPOSITION LENS (full-bleed count / text-on-media / pin / asymmetry / hard-bans), <6/10 = P0. (Phoenix passed 45/50 technical but failed composition — this lens catches it.)
- **PB_media** §11.0 — FULL-BLEED as the #1 rule (100vw/100vh default, no media-in-column-box).
- **CLAUDE.md** §5b — art-direction rule + design hard-bans.

## 0.1.0 — Initial
7 commands, 22 skills, 4 agents, 79 reference files. Strategy-first pipeline, motion-score, variants-prototyping, no-WebGL, Fedoriv copy, 50 award criteria. Knowledge distilled from live teardowns of ERA/AIR/Springs/Silver Pinewood/Ever + quadro/nahirna build lessons.
