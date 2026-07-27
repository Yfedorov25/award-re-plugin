# SO-7 · Interiors → Footer — дослідження «ЧОМУ ТАК»

> Сьомий (фінальний scroll-) під-організм. Пам'ять [[live-first-before-visual]] [[visual-parity-system]].
> 🔴 LIVE, CDP synthesizeScrollGesture. Знято S27: `extraction/live-ref/SO-7-int-cta-b/frame-000.png`
> (interiors-tail «Refinement is the new luxury» + темно-зелений footer в одному кадрі) — підтверджено
> другим незалежним прогоном `SO-7-interiors-gallery-cdp/frame-000.png`. Self-floor = **~0.5%
> (СТАТИЧНИЙ шов — 2 незалежні live-кадри byte-identical)** → сувора піксельна ціль ≤1%.
> Асети: `media/interiors-bg.webp` (8.interiors_bg) + `media/springs-footer-logo.svg` (реальний
> footer-wordmark springs 300×99). Baseline: `scripts/baselines/so7-interiors-footer.png`.

## 🔴🔴 LIVE СПРОСТУВАВ ТАБЛИЦЮ (7-й раз) — ключове відкриття S27
SUBORGANISMS казала «SO-7 Interiors→**Gallery** (vertical-curtain clip)» і «SO-8 Gallery→CTA». **Live-DOM
скан (`[class*=l-]`) це СПРОСТУВАВ:**
- **«Gallery» = ГЕРОЙ на верху** (`l-gallery-container` → нахилений masked фото-reel «Splendor of
  Renewal»), тобто вже в межах SO-1 — НЕ пізня секція.
- **`l-callback`(CTA «Open the doors of Springs») і `l-favorites` = МОДАЛКИ-ОВЕРЛЕЇ** (`h:0` у layout;
  лінк «Contact us»→`#callback-modal`, ♡→`#favorites-modal`), НЕ прокручувані секції.
- Після `l-interiors` (layout top 25020, h 3150) **одразу FOOTER** (28170→28878, bodyH 28878).
→ Реальний фінальний scroll-шов = **Interiors → темно-зелений Footer** (аутро). SO-8 переозначено на модалки.

## Що це за під-організм
`[Interiors (full-bleed тепле фото + «Refinement is the new luxury»)]` + **ШОВ (фото їде вгору →
темно-зелений footer підіймається знизу, sticky--under-previous)** + `[Footer / аутро «Springs»]`.

## 🔬 LIVE-МЕХАНІКА (знято, CDP)
Interiors = тепле full-bleed інтер'єрне фото (букле/дерево/жалюзі, luma ~70-109); права колонка копі
«…enjoy the beauty of your new life from the very first moments. Muted palette, arched portals, smooth
curves. **Refinement is the new luxury.**». Хедер: Menu · **Residences** · Springs(spiral) · Contact us · ♡.
- **Шов = sticky--under-previous** (та сама pin-родина що весь сайт): інтер'єр'їде вгору, з-під нього
  підіймається **темно-зелене поле** (footer, luma ~72, deep emerald #0e241d-ish).
- **Footer-аутро (static):** кремовий back-to-top circle-arrow (top-left ~75/265) · велике кремове
  серіф-лого **«Springs» + spiral** по центру (реальний `logo-footer.svg`, 300×99) · рядок унизу
  «LEGAL INFORMATION» (ліво) ↔ «SITE BY VIDE INFRA» + VI-бейдж (право) над hairline-роздільником ·
  legal-параграф (3 рядки дрібним капсом) · «© 2026. ALL RIGHTS RESERVED.».
- Це НЕ vertical-curtain clip (таблиця брехала) — це м'який reveal footer'а з-під фото, статичний.

## 1-5 (grounded в live)
1. **Чому поруч:** Interiors = остання емоційна нота продукту (відчуй матеріал зсередини). Footer =
   вихід із наративу в бренд/legal. Природне закриття: після «Refinement is the new luxury» — тиша
   темно-зеленого поля з іменем бренду. Емоційна дуга сайту замикається там де почалась (герой темний).
2. **Чому такий шов:** не різкий cut і не curtain-wipe — **м'який sticky-reveal** (фото піднімається,
   footer уже «стоїть» під ним). Це найтихіший шов сайту: після максимуму теплоти Interiors градус
   спадає в спокій. Колірний флип 🟡тепле-нейтр.→🟢темно-зелений = **повернення в темну зелень героя**
   (кільцева композиція: сайт відкрився темно-зеленим reel'ом, закривається темно-зеленим footer'ом).
3. **Анімації:** Ambient — обидва шари майже нерухомі (self-floor 0.5%); Entrance — footer НЕ анімує
   вхід окремими рядками (це аутро, не акт-секція): він просто відкривається з-під фото; лого/legal
   присутні. Interaction — back-to-top повертає на герой. Мінімум руху = навмисне (спад енергії).
4. **Колір:** 🟡тепле-нейтральне (беж/дерево Interiors) → 🟢**deep emerald** footer. Останній флип
   ритму «смарагд↔оливка↔крем↔тепле» повертається в вихідний смарагд. Дає відчуття завершеності/дому.
5. **Взаємодія:** scroll-driven reveal; back-to-top жест (повернення). Mobile: те саме, footer стек
   вертикально (лого центр, legal під ним), pinned-scroll reveal ([[mobile-is-pinned-scroll]]).

## Провенанс
- Механіка/палітра/копі: `extraction/live-ref/SO-7-int-cta-b/frame-000.png` (+ `SO-7-interiors-gallery-cdp/frame-000.png`).
- Порядок секцій (спростування Gallery/CTA): live-DOM `[class*=l-]` скан S27 (див. SUBORGANISMS.md ✏️S27).
- Self-floor ~0.5%: два незалежні CDP-прогони тієї ж фази = byte-identical (СТАТИЧНИЙ шов, не рухомий).
- Асети: `interiors-bg.webp` (8.interiors_bg, з SO-6) + `springs-footer-logo.svg` (реальний footer-lockup).
