# composition-map — L3 організм (карта композицій springs)

> Модуль #17/17. НЕ двоплатформний прийом — це рівень ВИЩЕ за молекулу: карта того,
> як L1-атоми / L2-молекули (16 модулів у `techniques/`) СКЛАДАЮТЬСЯ в цілі springs-секції.

## Що це

Вищий рівень таксономії: **L1 атом → L2 молекула → L3 організм (ціла секція)**.
Springs-секція ніколи не один прийом — це **3–5 прийомів у стек** за граматикою
`rules/STACKING-GRAMMAR.md` (один Ambient + один Entrance + один Interaction + theme-flip
на шві). Ця сторінка мапить кожен `l-*` блок головної springs.estate (з `D_Springs_architecture §2`)
на конкретний стек наших модулів — з клікабельним демо кожного прийому.

## Модель — три часові шари (STACKING-GRAMMAR)

| шар | коли | приклади в springs |
|---|---|---|
| **A · Ambient** | завжди-он поки секція у вью | rotated-collage drift, brand-tint, render-scale breathe |
| **B · Entrance** | один раз на inview | split-word reveal, dual-slicer, vertical-curtain-wipe, raster-tile, stat/odometer |
| **C · Interaction** | за жестом користувача | portrait/fullscreen swipe, layer-accordion tap, funnel-curtain tap |

## Мапа секцій (springs головна, D_arch §2)

hero(l-intro) · wellness(WebGL) · nature(WebGL) · place(WebGL+стати) · map(l-map) ·
residences(l-residences) · interiors(l-interiors) · design(l-design) · gallery(/gallery) ·
cta(l-callback). Точний стек кожної — у `index.html`.

## 🔴 Межа: WebGL

Springs має **3 WebGL-біти** (wellness / nature-canvas / 3D-tree, Three.js+OGL). Ми
відтворюємо лише **DOM-нарацію прийому** поверх — **паритет WebGL-сцени НЕ заявляється**.
Пам'ять [[taxonomy-base-exists]].

## Наступна фаза (після 17 модулів)

Розібрати L2-молекули на переюзні **L1-атоми** (десятки: clip-канал, stagger,
translateY-drift, wash-opacity, odometer-column…) — щоб будувати нові award-секції
точніше. Springs дав перший повний зріз стеку; інші сайти доповнять граматику.

## Демо

`index.html` — карта секція→стек, клікабельні демо всіх 16 модулів. Тема light/dark
(кнопка ◐). Пам'ять [[techniques-format-spec]] [[taxonomy-base-exists]] [[mobile-is-pinned-scroll]].
