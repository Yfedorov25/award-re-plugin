# SPRINGS — springs.estate (живий зонд curl, 2026-06-10)

## 0. META
site_slug: springs · live_url: https://springs.estate · liveness: **live** (200) · рік: n/a в сирці (футер «© 2026» — динамічний) · тип: ЖК преміум wellness (apartments + terraced townhouses + duplex penthouses)

## 1. ТИПОГРАФІКА
- **display_font: Victor Serif** 40 Regular 400 — VictorSerif-40Regular.woff2 + 45 RegularItalic; 665 глифів; кирилиця 64/64, укр ЄІЇҐ 4/4
- **body_font: TT Commons Pro** — Regular 400 woff2 + Md 500 + Bold 700 (.otf!); 1897 глифів; кирилиця повна
- third_font: нема. Ваги: 400 (серіф + body), 500 (captions/btn), 700 (рідко)
- **Hero-display** `.g1`: ×26 = **260px** @xxxxl → 220 → 180 → 60 моб; lh **0.615em**(!); ls −0.02em; **lowercase** (text-transform:none)
- `.h0`: ×18 = 180/145/125/100/50; lh 0.84–0.89em
- **H1** `.h1`: ×10 = **100px**/80/70/50/36; lh 0.9–0.95em; ls −0.02em; lowercase; 400
- **H2**: ×7 = 70/60/50/40/26; lh 0.9–0.93em
- **H3**: ×6 = 60/50/40/32/26
- **body** `.text-t1`: ×2 = **20px**/16; lh 1.1em; ls −0.02em; TT Commons Pro 400
- **caption** `.text-c1`: 1.2rem = **12px**; lh 1.5em; **UPPERCASE; ls .08em** — єдиний капс у системі (контраст-механіка)
- fluid: `--scale-text-rem` max(0.84rem…1rem) формула (html 62.5%); EN-корекція: `[lang=en] … line-height: calc(var(--lh) + .2em)` — окремий lh для латиниці(!)
- **H1:body**: hero 260:20 = **13:1**; робочий H1 100:20 = 5:1
- uppercase-стратегія: ІНВЕРСІЯ — заголовки lowercase серіф, лише caption/btn uppercase
- числа: серіфом у display; tabular нема

## 2. КОЛІР
- Найбагатша палітра з 5 (:root): **#162d24 dark-green** (тем-база) · **#1b4732 green** (акцент/hover) · **#e0d1b6 beige** · **#f5e8d1 beige-background** · #030303 black · #101e27 dark-blue · #005160 blue · #67bfda light-blue · #bee5ee sky · #758535 olive · #a7b431 light-green · #e1c35b error (ЖОВТИЙ error!) · #fff
- Градієнти кнопок: `--c-button-hover-gradient-light: linear-gradient(101.51deg, rgba(27,71,50,0) 37.02%, #1b4732 308.4%)` + dark-варіант hsla(39,40%,80%)
- Теми секцій: `.ui-light` (beige-bg, ×9) / `.ui-dark` (dark-green, ×4) + `-background` варіанти
- Scrim: `linear-gradient(180deg, transparent, rgba(0,0,0,.4))` · `transparent 81.32% → rgba(0,0,0,.6)` · `165.22deg transparent 30% → rgba(0,0,0,.6) 89%`
- Чисті: #fff так; чорний НЕ чистий — **#030303**

## 3. ДИЗАЙН-СИСТЕМА
- container: 100vw; `--grid-gutter: 0vw` (безгаттерна сітка, повітря через spacing)
- radius: кнопки `--btn-rx` 10/15/100px + `min(50%, height/2)` pill; картки 20px, великі 40/60px
- hairline: `rgba(var(--t-heading-rgb), 0.1)` ×16 + var(--t-line) rgba(beige|dark-green, 0.2)
- кнопки: pill з **клон-текст hover** (`data-button-clone-content` ×25 — текст дублюється і виїжджає)
- spacing: `--spacing` 80/60/30 · `--spacing-layout` 80/60/20 (найбільше повітря з 5)

## 4. РУХ/СКРОЛ
- движок: **Locomotive-style virtual scroll** (namespace="locomotive", lerp:.1) + Barba.js; **Three.js + OGL у бандлі** (THREE.WebGLRenderer ×31, 288 WebGL-згадок)
- ease: house **cubic-bezier(.25,.74,.22,.99) ×72 — РЕКОРД** із 5 сайтів · (.55,0,.1,1) ×9 · easeInOutCubic (.645,.045,.355,1) ×4 · JS: (0.2,0.6,0.35,1)
- durations: .4s ×37 · .8s ×19 · 1.6s ×10 · 1.4s ×4 · **8s ×2** (повільні luxury-фони)
- reveal: opacity .005→1; ×32
- parallax: **136 інстансів** `data-parallax--` + named patterns (`designMoveLeftImage`/`designMoveRightImage`) + clamp ×74 + measure-selector ×61 + `data-parallax-enable-touch="false"`
- pin/sticky: **`data-scroll-sticky` ×28 — РЕКОРД** + `data-scroll-snap-point` ×20 (снап-хореографія) + mobileScrollable
- WOW: ① WebGL-дерево (`data-plugin="webglTreeCallback"` ×2; блоки l-nature-bg-item--webgl, l-place-webgl) ② клон-текст hover кнопок ③ scroll-snap секційна хореографія ④ 12 повільних l-блоків із sticky-сценами ⑤ inputBear(!) — форма з ведмедиком
- WebGL: **ТАК, на home** (шейдерні сцени природи/місця; 3 сцени по сайту)
- prefers-reduced-motion: НЕМА

## 5. КОПІРАЙТ/СЕНС
- hero H1 дослівно: **"Splendor of Renewal"** (EN, 3 слова) + "Premium Living with Unrivaled Views" + лід "Apartments, terraced townhouses, and duplex penthouses in a quiet, green neighborhood."
- section-headlines дослівно: "Open the doors of Springs and step into your true self" · "Wellness" · "Nature" · "Place" · "Design" · "Interiors" (+ лід-абзаци: "Enclave of peace and quiet, your personal happy place…")
- тон: поетичний wellness-гіпноз, 2-га особа, сенсорика: "aroma of espresso adorned with creamy milk foam", "soft glare on the water", "fragrant warmth of the hammam"
- Big Idea: **«дім як спа — оновлення себе»** (splendor of renewal = розкіш оновлення)
- прийоми: наказово-запрошувальний ("Open the doors…", "Let your thoughts flow freely…"), пряме питання ("Do you sense the aroma of espresso…?"), сценарії-медитації
- цифри-в-копі: майже нуль на home — продає атмосфера, не факти
- CTA-дієслова: select residence · submit a request · callback · Search flats · subscribe · Contact us · request (квірк: в EN-версії лишилися RU-кнопки «резиденции», «оставить заявку»)
- ВИСНОВОК: продають **СПОКІЙ І САМООНОВЛЕННЯ** (wellness як новий статус)

## 6. СТРУКТУРА
- home **12 l-блоків**: l-intro→l-wellness(спа/йога/фітнес/кафе)→l-nature(+WebGL фон)→l-place(+webgl/відео)→l-design→l-interiors→l-residences→l-gallery→l-map→l-callback(+l-favorites)
- сторінок: **~109** (6 story + 2 catalog + 2 legal + ~100 /flat/{id})
- nav дослівно: Residences · Search flats · About · Design · Location · Amenities · Gallery · Visual search · Contact us · legal information
- visual-search: **ТАК** (/visual-search — плита 4.4MB)

## 7. SIGNATURE
- За 5 сек: lowercase-серіф Victor Serif 260px на dark-green #162d24 + крем #f5e8d1; жодного капс-заголовка
- Найкрутіший момент: WebGL-дерево за текстом + 28 sticky-сцен повільної снап-хореографії
- Що вкрасти: контраст «12px caption .08em uppercase ↔ 260px lowercase serif» + клон-текст hover кнопок + house-ease ×72 як єдиний рух
