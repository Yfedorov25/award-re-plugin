# 🐳 KICKOFF — сесія S16 треку SPRINGS (офлайн-режим за замовчуванням)

> Повідомлення для АГЕНТА в контейнері. Єгор може вставити як перший промпт.
> Все потрібне — в репо; локальні шляхи /Users/... НЕ існують.

---

Ти продовжуєш **трек SPRINGS** (репліка https://springs.estate новим конвеєром).
Це S16. Гілка: **`claude/springs-pipeline-s15-4dbrbw`** (S15 запушив сюди;
містить весь трек від `springs-pipeline-v0`). Працюй від кореня репо.

## 1. ПЕРШИМ ДІЛОМ — ПРОЧИТАЙ і ПЕРЕВІР
1. `KAI/STATE-springs.md` § ЯК ПОЧАТИ S16 (блокер вгорі), § ПАСТКИ (їх 59 —
   пастка 59 = egress-блокер, критична), § ЗАКОНИ, § ЖУРНАЛ (S15 зверху).
2. `extraction/springs-home/OFFLINE-VERDICT-S15.md` — повний вердикт S15.
3. НЕ чіпай `KAI/STATE.md` (трек AIR) і `library/combos/about-air/**`.

## 2. SETUP (S15 довів — працює)
```
npm i playwright@1.56.0 playwright-core@1.56.0   # package.json уже пінить це
node scripts/serve-skeleton.mjs springs-home --port 8873 &
```
- Pre-installed chromium у контейнері = build **1194**. `npx playwright install`
  ЗАБЛОКОВАНИЙ (cdn.playwright.dev denied) — НЕ ретрай. `1.56.0 == rev 1194 рівно`
  (каретка `^` небезпечна: 1.57=1200). `resolveChromium` фолбек на `import('playwright')`.
- Візуал без браузера: `Read` на PNG (`visual/parity/*-ours.png`, `visual/live/*.png`,
  `*-diff-*.png`); зонди — `page.evaluate` (`__ENGINE__()`, `__ENGINE_UNRESOLVED__`).

## 3. 🔴 РОЗВИЛКА №0 — ПЕРЕВІР LIVE ПЕРШИМ КРОКОМ
```
node -e "fetch('https://springs.estate/',{signal:AbortSignal.timeout(12000)}).then(r=>console.log('LIVE',r.status)).catch(e=>console.log('BLOCKED',e.message))"
curl -sS "$HTTPS_PROXY/__agentproxy/status"   # шукай springs.estate у recentRelayFailures
```
- **ЯКЩО LIVE ДОСТУПНИЙ** (Єгор додав хост в egress-allowlist): йди на **ФОРК B**
  (генералізація движка на нову сторінку springs — макро-ціль треку). Спершу
  свіжий смоук: криві-гейт + `node scripts/springs-visual-diff.mjs springs-home
  --only desktop` (тепер рендер ours працює). Потім вибери 1 нову сторінку,
  заміркуй її в `live-archive` (springs-mirror), додай у SITES, прожени
  spec→skeleton→scene→animation-map→choreo→движок. Альтернатива форку B —
  найтвердіший залишок форку A: s9180 nature-слайдер (3 частини, пастка 58).
- **ЯКЩО BLOCKED** (лишилось як у S15): див. розділ 4 (офлайн-скоуп). Форки
  A/B стоять — БЕЗ live ні піксель, ні нові сторінки рухати НЕ можна (закон 1:
  ручна розвідка заборонена; закон 3: неверифікований фікс не форсувати).

## 4. ОФЛАЙН-СКОУП (якщо live лишається blocked) — тільки H15
БЕЗ live єдина осмислена робота = **H15: оформити springs як багаторазовий
ТЕМПЛЕЙТ** (заявлена мета треку — «база будує темплейти для перевикористання»).
Це реструктуризація ВЖЕ закомічених файлів + доки, live не потрібен:
- винести springs-engine.js + choreo-схему в документований reusable-модуль
  library/ з чіткими точками кастомізації (токени/ease/секції-контракти);
- source.registry_ref на прийоми движка (H17: інтро-морф, ancestor-clip,
  webgl-underlay, splitFix, snap-lerp — кожен з T-ID або "x:<чому поза реєстром>");
- НЕ вигадувати нове, НЕ чіпати числа движка (нема чим верифікувати піксельно).
Дешевий офлайн-смоук на старті (доводить, що нічого не бітрознуло):
```
for s in hero-gallery intro wellness header; do node scripts/curve-compare.mjs springs-home $s --vp both; done
```
Очікування = S15/S14: **7/8 PASS** (hero mobile 88.3 FAIL — пастка 56, не чіпати).

## 5. ЗАКОНИ (порушення = зупинись)
Ручна розвідка заборонена · гейти числові, пороги CURVES/VISUAL-GATE НЕ міняти ·
жодних ручних чисел у спеку/choreo · фікс-цикл 3 марні ітерації → ескалація ·
egress-403 policy-denial — РЕПОРТИТИ, не обходити (пастка 59) · verdict-gate:
Єгору лише доведене числами · progress-report у кожному підсумку.

## 6. У КІНЦІ
Онови `KAI/STATE-springs.md` (§ ЯК ПОЧАТИ S17 + § ЖУРНАЛ + пастки), ЗАКОМІТЬ і
ЗАПУШ на `claude/springs-pipeline-s15-4dbrbw`. **Незапушене в контейнері = втрачене.**
