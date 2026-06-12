# D_Springs_architecture — springs.estate ПОВНА АРХІТЕКТУРА ✅
> Vide Infra «luxury poetry». Живий зонд curl, 2026-06-09. Доповнює D_Springs (повний розбір: D_Springs_architecture + D_SPRINGS_video) + [PB_visual_search](../../re-visual-search/references/PB_visual_search) + [PB_site_architecture](../../re-architecture/references/PB_site_architecture).
> Стек: webpack jQuery-плагіни ($.fn.plan/visualSearch/cursor) + Barba.js + Locomotive-style virtual-scroll + **Three.js + OGL** (3 шейдер-сцени). ~109 URL.

## 1. ГЛИБИНА (~109 URL, sitemap 404)
- **Story (6):** / · /about(All Shades of Beauty) · /design(Design & architecture) · /location(The Center of Your Life) · /infrastructure(Amenities) · /gallery
- **Catalog+selection (2):** /flats(Residences) · /visual-search(плита, 4.4MB!)
- **Trust/legal (2):** /agreement · /privacy-policy
- **Unit (~100):** /flat/{id} (ID несеквенційні: 31,37,51,62,105,122,138,153...) — у visual-search payload 100 унікальних /flat/N
**Урок:** глибина помірна (109) — luxury продає атмосферою, не обсягом інвентаря (контраст ERA 270 / AIR 120).

## 2. ГОЛОВНА — 12 блоків (префікс `l-*`), повільні luxury-reveal
1. Preloader (preloaderLanding, 4-div градієнт)
2. HERO `l-gallery/l-intro` — H1.h0 «Splendor of Renewal», reveal title **delay 1000ms** (1с), sub «step into your true self»
3. **Wellness** — WebGL canvas js-wellness-canvas (webglWellness)
4. **Nature** — WebGL canvas js-nature-canvas (webglNature) + natureCaptionMoveUp
5. **Place** — WebGL **3D-дерево** js-tree-canvas (webglTree, 6 canvas) + Vimeo-bg відео. «watercolor tenderness»
6. Map — landingMapScroll (scroll-driven SVG-карта)
7. Residences — residencesSlide parallax → каталог
8. Interiors — tabs mouseAnimation + custom cursor. «glistening waves»
9. Design — designMoveLeftImage/RightImage (зустрічний parallax-pair)
10. Callback — lead-form (ajaxForm recaptcha)
11. Favorites — shortlist
12. Footer

## 3. СЕКЦІЇ ПО СТОРІНКАХ (per-page section префікс — дисципліна namespace)
| Сторінка | префікс | Підпис-елемент |
|---|---|---|
| /about | `a-*` (6 секцій) | a-mouse-slider (mouse-driven photo-slider + custom cursor) |
| /design | `de-*` | зустрічний left/right parallax (58 блоків); категорії Flats/Townhouses/Penthouses |
| /location | `lo-*` | scroll-driven inline-SVG карта (data-plugin="parallax location") |
| /infrastructure | `i-*` | inline-SVG карта (59 svg) + tabs-фільтр + popover |
| /gallery | `y-*` | pinned desktop scroll-gallery + custom scrollbar; фільтри Architecture/Infrastructure/Residencies |
**Дисципліна:** кожна сторінка має свій section-namespace (l-/a-/de-/lo-/i-/y-), АЛЕ спільний footer (l-callback+l-favorites) і ОДНУ моушн-мову (data-reveal, parallax, ease .25,.74,.22,.99). Однаковий скелет, різна плоть.

## 4. VISUAL-SEARCH — дані ЯК АТРИБУТ (не API) → [PB_visual_search](../../re-visual-search/references/PB_visual_search)
- Плита = **14× `data-plan-plans`** JSON inline (один блок 888KB). 4.4MB сторінка = ці дані. Рендер jQuery `$.fn.plan`.
- 3 рівні: buildings.svg → /plans/{floor}/Floor_N.svg(~300KB) → Flat_N_n.svg(~8/поверх).
- Hot-zones: `<g class="plan-hoverable plan-hoverable--clickable" data-hoverable="N" style="mix-blend-mode:multiply">` + sibling `data-anchor="N"`.
- **Статус (visual-search.css):** база `.plan-hoverable{fill:#583e23;opacity:0}` (невидима); hover/active `opacity:1`; **sold `--disabled{fill:rgba(70,73,63,.5);opacity:1}`** (mудно-зелений), pointer-events мертві. Маркер-pill `--apartment`: sold `background:#a69c8c`(беж-сірий); **reserved** інвертований (bg=background,color=heading) + `.plan-marker__lock` іконка.
- JS-state combos: `{active:true}`(200), `{clickable:false,disabled:true,hoverable:false}`(112 sold), `{disabled,clickable:false}`(9). Click → деактивувати всі → set find(ref).state.active.
- Flat-обʼєкт: id,ref,code,link:/flat/31,type:«Классическая»,square:213.9,rooms:4,price_per_m,price,features[],views[]. 200 records / 100 покупних. 360° pano-tour (tour.js) у модалках.

## 5. INFRASTRUCTURE МАПА
0 mapbox/google/leaflet/yandex. Inline-SVG (59 svg) той самий plan-hoverable/plan-marker. POI = `plan-marker--feature` glass-pill (leaf/gym/parking/cutlery), `backdrop-filter:blur(5px)`, зʼєднані plan-marker__line. Фільтр tabs mouseAnimation, тултіпи popover.

## 6. ЗВʼЯЗКИ (невидима воронка до прояву наміру)
- Menu = full-screen modal (modalMenu). /flats найлінкованіша (9 лінків) = хаб воронки.
- **БЕЗ tel/mailto/соцмереж** — контакт ЛИШЕ через callback (ajaxForm recaptcha) з прихованим `currentPageLink` (форма авто-чіпляє З ЯКОЇ сторінки/квартири лід).
- **Favourites shservе** весь сайт: серце → лічильник у header → shortlist → favouriteForm АБО favouriteDownload (PDF обраних). Так загальний «інтерес» біндиться до конкретних unit-ID.
- Chain: /flats ↔ /visual-search → building → floor-modal → flat-marker → /flat/{id}(+360°tour+similar+compass) → favourite → callback.

## 7. СТЕК
webpack jQuery-плагіни ($.fn.visualSearch/cursor/plan), 3 бандли (shared.js 1.42MB). Переходи **Barba.js** (94 namespace, leave/enter/once). Скрол **Locomotive-style virtual** (smooth-scroll, VirtualScroll, parallax measured vs .sticky). **Three.js+OGL** (WebGLRenderer 37×, ShaderMaterial 23×, ogl 15×): webglTree(6 canvas)+webglNature+webglWellness. Ease **cubic-bezier(.25,.74,.22,.99) ×72**.

## 8. ВЕРДИКТ (5)
1. **Один plate-движок = 3 продукти** — plan-hoverable+plan-marker+JSON-state рендерить buildings/floors/flats + infra-map + location-map. Статус = CSS-modifier + mix-blend-mode overlay, 0 per-state ассетів.
2. **Дані-як-атрибут, не API** — увесь 200-flat каталог inline у data-plan-plans (ціна natural strings; 4.4MB сторінка). SEO-friendly, 0 client round-trips. (ERA тонший — fetch JSON.)
3. **Per-page namespace дисципліна** — l-/a-/de-/lo-/i-/y- але ОДИН footer + ОДНА моушн-мова.
4. **«Luxury/поетика» = стриманість + named-choreography, не щільність** — ~10-12 величезних full-bleed секцій, hero-reveal delay 1с, .8-1.6s транзишн, ОДНЕ велике поетичне речення на секцію, bespoke named parallax (designMoveLeftImage...). WebGL лише 3 емоційні біти (tree/nature/wellness).
5. **Воронка невидима до наміру** — 0 phone/email; єдина конверсія = cross-site favourites що авто-біндить /flat/{id}+currentPageLink до одного recaptcha-callback.
