# ATOM: mobile-hero — вертикальний мозаїчний hero (v1) [MOBILE 390×844]

## СУТЬ
Мобільний hero springs: вертикальний МОЗАЇЧНИЙ ГРИД природних тайлів (повернутий ~-6°, живий
parallax-дрейф), поверх — display-титул «Splendor of Renewal» серифом ВНИЗУ-СПРАВА (2 рядки),
абзац «Exclusive residence…» центр-зліва, scroll-hint (кружок-стрілка) знизу-зліва. Хедер:
Springs + RESIDENCES + серце + burger. Вертикальна версія desktop hero-intro (інший лейаут).

## ДЖЕРЕЛО = ЖИВЕ ВІДЕО
FILM: `ScreenRecording_07-17-2026 16-01-25_1.MP4` (mobile springs.estate, portrait 1170×2532);
hero t≈0-4s; beat-кадри `~/Downloads/CD-RUN-mobile-hero-v1/reference/`.

## МЕХАНІКИ (з живого відео; наратив голосом ВІДСУТНІЙ — вхід/темп = гіпотези)
- M1 ГРИД: вертикальний мозаїчний грид (2 колонки, різновисокі тайли природа), повернутий ~-6°,
  overscan (виходить за краї). Тайли ЖИВІ — повільний parallax-дрейф/зум (між кадрами видно рух).
- M2 ТИТУЛ: «Splendor of Renewal» серифом, 2 рядки, ВНИЗУ-СПРАВА, вирівняний праворуч, великий.
- M3 АБЗАЦ: «Exclusive residence with a rich wellness infrastructure next to Nature Park»
  центр-зліва, дрібний, на тайлах (читабельний, локальний scrim).
- M4 SCROLL-HINT: кружок з стрілкою-вниз, знизу-зліва.
- M5 ХЕДЕР: Springs (лого+wordmark) зліва, RESIDENCES + серце + burger справа.
- M6 ВХІД (гіпотеза — на кадрах hero вже на місці): грид/тексти проявляються при завантаженні.
  Тайли живуть постійним дрейфом (стенд-ін відео, поза clock).
- ВИХІД на скрол → наступна секція (Architecture-зум) — інший атом.

## ІНТЕРАКТИВ / СКРОЛ (390×844)
Це верхня секція. На моб — скрол вниз веде до наступної. Тайли дрейфують (idle). Hooks:
`window.render(p)` (якщо є вхідна анімація по скролу — clamp 0..1) + `window.__ATOM_OK__`.

## ВІДКРИТІ ПИТАННЯ (закрити наративом/повільним відео)
1. Вхідна анімація hero (грид fade/scale-in? тексти стаггером?) — на кадрах вже на місці.
2. Темп/амплітуда parallax-дрейфу тайлів. 3. Чи грид рухається на СКРОЛ (parallax) чи лише
idle. 4. Кут повороту точний (~-6°?). 5. Скільки тайлів/колонок.

## TRANSFER-ГЕЙТ (390×844)
Той самий закон на іншому фасаді: інша к-сть тайлів/кут, інший титул, інша палітра — вертикальний
мозаїчний грид + display-титул внизу-справа + абзац зліва + живий дрейф працюють.

## СТАН
FILM ✅ · NARRATE ⬜ · SPEC v1 · BUILD ✅ · **APPROVED ✅ (Єгор, 2026-07-18, «всі 3 залишимо»)**.
CD проєкт 977b862d, 3 варіанти + збірка → `variants/{a,b,c,all}.html`. Другий MOBILE-атом (M2).
Вертикаль desktop hero-intro.

## ГЕЙТИ (на RAW, 0 фіксів у білді — усі «фейли» = дефекти самих гейтів)
- `scripts/mobile-hero-gate.mjs`: **14/14 ALL PASS ×3**, 0 console-err. Перевіряє: хук render(p),
  Lenis, ≥130vh, CSS-lint transform-ownership (статичні rotate/center дозволені, drift/parallax=GSAP),
  грид покриває екран, нахил ~-6°, ≥6 тайлів, титул внизу-справа, абзац mid-left, hint bottom-left,
  хедер зверху, 0 overflow-X, on-scroll parallax рухає .mosaic-parallax, idle-дрейф .tile-inner (rAF),
  render-детермінізм+clamp, тач по hint.
- `scripts/mobile-hero-coll.mjs`: **0 collisions ×3** (текст-шари не налазять @render 0/0.5/1).
- 🔴 УРОК ГЕЙТА: idle-дрейф міряти через РЕАЛЬНИЙ rAF-цикл у сторінці, НЕ page.waitForTimeout
  (gsap.ticker приведений Lenis→rAF, wall-clock пауза його не просуває в headless). querySelector
  зі списком через кому бере ПЕРШИЙ у DOM-порядку — .tile (батько) перекриває .tile-inner; цільовий
  шар брати явно. Entry scale-in масштабує кліпнутий шар за краї .hero{overflow:hidden} — це НЕ
  overflow сторінки (scrollWidth=innerWidth), out-of-bounds рахувати лише при реальному overflow.

## ЗВІРКА vs ЖИВЕ — ЩО ПЕРЕВІРЕНО, А ЩО НІ (чесно)
🔴 **element-gate НЕ застосовний до цього атома** — немає `spec/frame-*.json` (answer-key) для
mobile-hero, і це DUMMY-ФАСАД (`src != live` навмисно: свій зелено-градієнтний фасад, не копія
springs-контенту). Substitute-asset guard провалив би будь-що за конструкцією; per-element bbox-звірки
робити НЕМА З ЧИМ. Той самий випадок, що residences-slab (piксельна/per-element парність не міряна).
- ✅ **Звірено проти SPEC** (structural, playwright-числа, НЕ на око): грид присутній+покриває екран,
  нахил -6.0° (виміряний з matrix), 8 тайлів, титул внизу-справа (cx>0.45W, cy>0.55H — координати),
  абзац mid-left, hint bottom-left, хедер зверху, 0 overflow-X, parallax рухає шар, idle-дрейф живий
  (rAF), render детермінований, 0 текст-колізій. Це `mobile-hero-gate.mjs` 14/14 + coll 0.
- ⬜ **НЕ звірено (0 element-gate checks)**: per-element геометрія проти живого кадру (немає answer-key);
  темп/амплітуда дрейфу проти live-темпу; точний вхід (наратив голосом відсутній — гіпотеза).
- 👁️ Око проти beat-1-hero.jpg — лише ГРУБА структурна відповідність ролей (титул унизу-справа тощо),
  НЕ доказ «1-в-1». Вердикт Єгора по борду — вирішальний.

## ВАРІАНТИ
- **A reveal-as-one** — весь шар fade+scale(1.045→1) як одна композиція, тихий editorial дрейф.
- **B tile-cascade** — мозаїка збирається (тайли pop-in stagger random, back.out), сильніший дрейф,
  column-split parallax (кол.1 ↑ / кол.2 ↓).
- **C designer's cut** — ken-burns вхід (kenburns scale 1.16→1.0), light-shift по плитках,
  line-masked титул (рядки виїжджають знизу з маски).
