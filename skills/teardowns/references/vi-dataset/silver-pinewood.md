# SILVER PINEWOOD — silver-pinewood.com (живий зонд curl, 2026-06-10)

## 0. META
site_slug: silver-pinewood · live_url: https://silver-pinewood.com · liveness: **live** (200) · рік: n/a в сирці (© Silver Pinewood Residences без року) · тип: ЖК преміум «quiet luxury» біля соснового парку/ріки; one-pager

## 1. ТИПОГРАФІКА
- **display_font = body_font = ОДИН ШРИФТ ОДНА ВАГА: TT Fors Medium 500** — TTFors-Medium.woff2; 1044 глифи; кирилиця 64/64, укр ЄІЇҐ 4/4. Єдиний @font-face на весь сайт(!)
- third_font: нема. Ваги: лише 500
- **H1**: `calc(var(--scale-text-rem)*17)` = **170px** @xxxxl → 128 → 98 → 76 → 30 моб; lh 0.88–0.94em; **ls −0.06em** (найщільніший трекінг із 5); **uppercase**; 500
- **H2**: ×9.8 = 98/76/57/44/22; lh 0.92–0.96em; ls −0.06/−0.04em; uppercase
- **H3**: ×5.7 = 57/44/36/28/16; ls −0.04em
- **body**: ×1.6 = **16px**/12/10/11; lh 1.125–1.2em; **ls +0.04em; UPPERCASE**
- **caption** `.text-small`: ×1.2 = 12/10/8px; uppercase; ls .04em
- fluid: `--scale-text-rem` max(0.84rem…1rem) (html 62.5%); breakpoint-вар каскад
- **H1:body ≈ 10.6:1** (170:16)
- uppercase-стратегія: **ВСЕ uppercase**; вся ієрархія тримається ТІЛЬКИ на розмірі (1 шрифт × 1 вага)
- числа: нічого спеціального; "kern" 1

## 2. КОЛІР
- Мінімальна палітра — 5 змінних (:root): **#f0eae2 light** (крем-база) · **#282828 gray** (дарк-секції) · **#ba8f71 beige** · **#998170 beige-background** (brown-тема) · #fff white · #b62f2f red (error)
- Теми секцій: **ТРИ** — `.ui-light` / `.ui-dark` / `.ui-brown` (+ `-background` варіанти); ритм cream→brown→dark по скролу
- Scrim: `linear-gradient(1turn, transparent 37.42%, rgba(0,0,0,.3))` · `180deg rgba(0,0,0,.3)→transparent 50%` · `164.1deg transparent 75.97% → rgba(0,0,0,.9) 97.52%`
- hairline: `1px solid rgba(var(--t-line-rgb),.15)` / .3; `--t-line-light` rgba(gray|light, 0.2)
- Чисті #000/#fff: #fff так; **чистого чорного НЕМА** — дарк-база #282828

## 3. ДИЗАЙН-СИСТЕМА
- container: 100vw; `--grid-gutter: 0px`; layout-колонки `(100vw − spacing-layout*2)/12`
- radius: 0 домінує (×18); кнопки `--btn-rx` 10/13/15/60px
- кнопки: btn-arrow (стрілочні) + **клон-текст hover** (`data-button-clone-content` ×37)
- spacing: `--spacing` 40/30/20 · `--spacing-layout` 30/20 (стриманий ритм)
- іконки/деко: SVG-контури з line-draw (див. рух)

## 4. РУХ/СКРОЛ
- движок: **Locomotive-style virtual scroll** (namespace="locomotive", lerp:.1) + Barba.js; **Three.js + GLTFLoader у бандлі** (THREE.WebGLRenderer ×31)
- ease: **ВЛАСНА ПАРА, БЕЗ house-ease**: easeOutQuad **cubic-bezier(.25,.46,.45,.94) ×11** + **(.7,0,.4,1) ×10** — єдиний із 5 сайтів без (.25,.74,.22,.99)
- унікально: easing у DOM — **`data-parallax-easing="easeOutQuad|easeSection"` ×17** (per-element криві)
- durations: .4s ×7 · .8s ×5 · .6s/.5s ×3 + мс-мікро (50/25/10ms)
- reveal: opacity .005→1; ×40; `reveal history` ×8
- parallax: **199 інстансів** `data-parallax-` + clamp ×99 + pattern ×64 + measure-selector ×75
- pin/sticky: `data-scroll-sticky` ×15 · **`data-scroll-gravity-well` ×8** (скрол-магніт, найбільше з 5)
- WOW: ① **`data-plugin="svgLength"` ×72 — SVG line-draw контурів по скролу** (фірмовий прийом) ② `illustrationZeus` ×2 = WebGL GLTF-модель `/assets/webgl-zeus/model-optimized/model.gltf` (3D-скульптура) ③ history-плагін: scroll-spy переписує URL (#about → /about — сторінка сама собі роутер) ④ gravity-well ⑤ клон-текст hover
- WebGL: **ТАК, на home** (Zeus GLTF-ілюстрація; Three.js)
- prefers-reduced-motion: ТАК

## 5. КОПІРАЙТ/СЕНС
- hero H1 дослівно: **"Silver Pinewood Residences"** (3 слова) + display-теглайн **"quiet luxury"** (буквально написано в копі!)
- section-headlines дослівно (H2 = повні речення-річки): "Premium residential complex near the iconic Silver Pinewood on the riverbank — is your opportunity to make a legendary address part of your story." · "The towering century-old pines, crystal-clear waters of a bay and fresh air have made Silver Pinewood a true symbol of resort-style elegance." · "natural movement" · "beauty of idle days" · "Courtyard" · "tasteful life" · "ARCHITECTURE" · "Lobby" · "A full suite of advanced engineering solutions and smart features" · "team" · "Request a Call"
- тон: спадково-статусний сторітелінг: "home to generations of renowned musicians, visionary entrepreneurs, and acclaimed film directors — an exclusive haven admired by many but accessible to only a few"
- Big Idea: **«легендарна адреса — тихий статус у спадок»**
- прийоми: легенда місця (сосни/затока/резиденти); заголовок-повне-речення; "your story" — вписування покупця в історію
- цифри-в-копі: майже нема ("century-old pines", "half-hour's reach" — словами, не цифрами)
- CTA-дієслова: Contact Us · Request · Request a Call (мінімальний набір — без каталогу нема що вибирати)
- ВИСНОВОК: продають **СТАТУС-СПАДОК / ПРИВІЛЕЙ** (адреса як легенда, не квадратні метри)

## 6. СТРУКТУРА
- **ОДНА scroll-сторінка, 17 секцій**: top(hero)→quiet-luxury-intro→nature-of-movement→free-days(beauty of idle days)→courtyard→life-with-taste→architecture-intro(+facades/terraces)→lobby→space/engineering→team→callback
- сторінок: **2 унікальні документи** — / (609KB one-pager) + /privacy-policy; 8 «роутів» (/about /architecture /engineering /infrastructure /lobby /location /territory /team) = байт-ідентичний документ (SEO deep-link на якір)
- nav дослівно: About · Location · Infrastructure · Courtyard · Architecture · Lobby · Amenities · Team (+ Contact Us, Privacy Policy)
- visual-search: **НЕМА** (/visual-search, /flats = 404) — чисто атмосферний пре-сейл one-pager

## 7. SIGNATURE
- За 5 сек: один TT Fors Medium капсом на крем #f0eae2 / brown #998170 / dark #282828 + SVG-контури що домальовуються
- Найкрутіший момент: svgLength line-draw ×72 + WebGL Zeus-скульптура + URL що сам перемикається при скролі
- Що вкрасти: дисципліна «1 шрифт × 1 вага × 3 теми» + per-element data-parallax-easing + history scroll-spy роутер
