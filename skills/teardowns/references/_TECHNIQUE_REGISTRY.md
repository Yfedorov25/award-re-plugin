# 🎛️ _TECHNIQUE_REGISTRY — 100% прийомів Vide Infra (5 сайтів, exhaustive sweep)
> Повний реєстр КОЖНОГО прийому/анімації/переходу/візуалізації з живого зонду ERA·AIR·Springs·SilverPinewood·Ever (CSS/JS bundles). 2026-06-09.
> Мета: плагін має знати 100% і пропонувати ВАРІАНТИ. Раніше мали ~25 — реально 150+. Споріднено: [PB_motion_score](../../motion-score/references/PB_motion_score) (блюпринт v0.1, історичний) [PB_variants_prototyping](../../variants-prototyping/references/PB_variants_prototyping).
> Колонка **NW** = наше no-WebGL покриття: ✅ маємо/тривіально · 🔶 треба дописати рецепт · 🔴 WebGL→потрібен переклад.

## 0. РУШІЙ (спільний для всіх 5)
Vanilla **jQuery-plugin система** (`$.fn.X` ↔ `data-plugin="X"`, кілька через пробіл) + **Barba.js** (SPA-переходи, namespace="page") + **кастомний/Locomotive smooth-scroll** (lerp ~.1, rAF, `precisescroll` подія) + точково Three.js/krpano/Owl/Keen/Popper/Splitting/Google Maps. **0 GSAP** — власний rAF+spring/lerp tween-движок. → НАШ переклад: GSAP+Lenis+React-компоненти роблять те саме; spring-value = quickTo.

## 1. ★ СИГНАТУРНИЙ EASE — ПЕР-САЙТ (НЕ універсальний! критична правка)
- **ERA / AIR / Ever:** `cubic-bezier(.25,.74,.22,.99)` (29/23/55 ужитків) — наш "air". ✅
- **Springs:** `cubic-bezier(.25,.74,.22,.99)` теж домінує (107×) + slow `.55,0,.1,1`.
- **Silver Pinewood:** `cubic-bezier(.25,.46,.45,.94)` (=easeOutQuad)! `.25,.74,.22,.99` ТАМ НЕМАЄ. 
- Спільні вторинні: `.55,0,.1,1` (повільні morph 8s/1.6s), `.47,.04,.5,-.06` (★ anticipation, негативний overshoot — у ВСІХ 5), `.7,0,.4,1`/`.645,.045,.355,1`.
- **Урок:** ease = рішення проєкту (motion-score фіксує ОДИН), не глобальна константа. Бери air для теплих, easeOutQuad для стриманих.
- Durations-каркас: `.4s` micro · `.8s` luxury hover/reveal · `1.6s` block · `2.4s` slower · `2.8s` title · `.2s` fast · stagger 60ms/line (title) + 180ms (group).

## 2. ★ PARALLAX = INLINE SCROLL-KEYFRAME (головний механізм, ми мали лише named-patterns!)
`data-parallax-{FROM}-{TO}='{"transform":"...","opacity":n}'` — FROM/TO = scroll-progress % крізь viewport-pass елемента; JSON-transform інтерполюється між кейфреймами. Домінантна пара `0-50`/`100-50` (Ever 139×) і `100-0`/`0-100`. Значення calc() з design-токенів (не magic-px!): `translateY(calc(var(--spacing)/30*-105…))`. 🔶 НАШ переклад: GSAP fromTo з scrub по тих самих % + значення з токенів.
- Модифікатори: `clamp`, `enable-mq`(md-up desktop-only), `measure-selector`(.section/.sticky/picture), `easing`, `mobile-smooth`, `enable-touch`.
- **Named-patterns** (поверх інлайн): кожен сайт має 44-69 іменованих (`landingFormatCounter`, `designMoveLeftImage`, `videoZoom`, `mapPath1/2/3`...) — це пресети інлайн-кейфреймів під секцію. ✅ концепт, 🔶 каталог.
- `data-deco-*` (Ever 130×, ERA 48×): декор-шар, `data-deco-transform` + `data-deco-multiplier` (скаляр/per-axis) — mouse/scroll depth-offset. ✅

## 3. CSS-ДВИЖОК АНІМАЦІЙ — `.animation--{name}` + `--inactive/--active` (Ever, найчистіший)
Кожен елемент: база `.animation--{name}` (transition-property/duration/`var(--transition-easing)`) + старт-стан `--{name}--inactive` (схований transform). Плагіни `appear`/`reveal`/`tabs` тогглять inactive↔active → CSS-transition. ✅ (= наш data-reveal/clip патерн). Сім'ї: image-clip-in/out-left/right (inset wipe), image-in/out (translateX+opacity), fade/fade-zoom (scale1.1), deco, slide-bottom/top (span+overflow:clip), modal-in/out(-left), button, title/text (border-reveal). Speed-модифікатори fast/slow/slower/block.

## 4. REVEAL / ТЕКСТ
- **`appear`** (★ найуживаніший: ERA 1141, Ever 1128, Springs 369, SP 85) — lazy-decode-gate: IntersectionObserver + native `img.decode()` + reveal-on-inview, gate-ить інші плагіни до декоду. rootMargin preload 600px. **= наш DecodeAhead, але ще й reveal-тригер.** ✅
- **`reveal`** — staggered group: stagger 180ms + 30ms base, group/element distance. ✅
- **`splitChars`/`splitLines`** (власний SplitText) → `data-reveal="text/title"`; **per-word line-stagger 60ms** (`.word{transition-delay:calc(--line-index*60ms)}`, title 2.8s). ✅ (SplitText маємо).
- **`titleFill`** (Ever) — scroll-driven прогресивна заливка тексту. 🔶 (= R_text_scroll_fill, маємо).
- Reference-counted класи (`addClassCounted`) — overlapping observers не конфліктують. ✅ патерн.

## 5. VISUALIZATIONS (по сайтах)
- **visualizationLines** ×5 (ERA) — 🔴 WebGL Three.js line-mesh + Fresnel glow + UnrealBloom + ACES tone-map. Shader: vAlpha = Fresnel×timeNoise×progressWipe. → 🔴 ПЕРЕКЛАД: SVG self-draw (svgLength stroke-dashoffset) дає 70% враження без WebGL.
- **149-frame sequence** (ERA `ANIMA_*.png.webp`) + **Ever ~2628-img progress** — scroll-scrub. Ever progress НЕ канвас а **horizontal-takeover timeline** (pin + translateX по precisescroll). ✅ canvas-2D scrub (hero Quadro) / horizontal-pin.
- **3 WebGL gradient-scenes** (Springs webglTree/Nature/Wellness) — 🔴 ОДИН IQ animated-gradient plane shader (не 3 різні, не реальне дерево!): value-noise UV-rotate + sin-warp + mix 3 бренд-кольорів. Mouse-orbit lerp. → 🔴 ПЕРЕКЛАД: CSS animated-gradient / canvas-2D noise, АБО просто статичний градієнт-фон.
- **WebGL Zeus GLTF** (SP illustrationZeus) — 🔴 DRACO+AVIF, fov:12 long-lens, mouse-tracked shadow-light, multi-rate scroll-parallax груп (0.5/0.25/−1×), camera-orbit applyAxisAngle, easeInOutExpo intro, CSS film-grain (`noise-animation` keyframe). → 🔴 ПЕРЕКЛАД: pre-rendered orbit frames (canvas-2D) + статичні ракурси crossfade.
- **WebGL revolves-carousel** (AIR about) — 🔴 shader rounded-corners(discard) + UV-distortion on scroll. Має DOM-fallback `aboutRevolvesMobileCarousel`. → 🔶 CSS clip + scale crossfade.
- **Hero ring shader** (ERA preloader) — 🔴 half-ring Fresnel. → 🔶 SVG/canvas arc draw.
- **3d-map** (ERA) — 🔴 GLTF+OrbitControls+Raycaster+OutlinePass+Bloom+TWEEN fly-to. → 🔴 pre-rendered orbit (наш (бойове рішення quadro: карта DOM-only 2.5D, без WebGL/R3F; вердикт) АБО SVG-карта.
- **inline-SVG plan/map** (всі) — 2-шар (artwork.svg + anchor.svg з data-anchor rects), data-plan-plans JSON, plan-marker--{type}, Floating-UI/Popper тултіпи, категорійний фільтр. ✅ → [PB_interactive_map](../../re-interactive-map/references/PB_interactive_map) [PB_visual_search](../../re-visual-search/references/PB_visual_search).
- **svgLength self-draw** (ERA 266, SP 72) — getTotalLength→`--path-length`→stroke-dashoffset draw-on. ✅ (= DrawAccent/HairlineDivider).
- **Counters** — count-up на reveal (numbers-in). ✅
- **before/after comparison** (Ever imageComparison) — hover→split слідує курсору (spring .5), touch→drag. 🔶 рецепт.
- **mouse photo-slider** (Springs a-mouse-slider) — hover translate по mouse-X (spring .05) + draggable fallback. 🔶
- Google Maps Advanced (Ever location) — категорій-фільтр маркерів. (ми → inline-SVG, не Google).

## 6. TRANSITIONS / SCROLL
- **Barba.js** (всі) — `data-barba=wrapper/container`, namespace=page, hooks once/before/leave/enter/after. Plugin-и: stylesheet-swap+script-rerun, cache-clear, prefetch XHR (`x-barba` header). Ever: `data-ajax-page-transition="modal-in"` (нова сторінка в'їжджає модалкою). 🔶 НАШ: Next router/View-Transitions АБО Barba (стек=вибір).
- **smooth-scroll** — Locomotive/кастом lerp .1, `data-scroll-section/sticky/target`, `precisescroll` rAF-подія (всі scroll-плагіни слухають її, не raw scroll). ✅ Lenis.
- **gravity-well** (ERA/AIR/Springs/SP) — `data-scroll-gravity-well='[{viewport,element}]'` магнітний snap-to-section (lerp). + `data-scroll-snap-point`. 🔶 рецепт (council: НЕ scroll-trap для RE — обережно).
- **sticky cross-fade stacking** (SP, найважливіше) — pure-CSS: `.sticky--under-next{margin-bottom:calc(dist*-1)}` + `:after` спейсер + наступна `clip-path:polygon(0 100vh…)` → секція в'їжджає ПІД попередню без JS. ✅ 🔶 рецепт.
- **sectionToSticky→sectionFromSticky(HalfUnderNext)** (AIR) — pin-then-release ланцюг. ✅
- **horizontal-takeover** (Ever progress/Springs stickySlider) — pin section, vertical scroll→translateX (matrix3d). 🔶
- **preloader** — варіанти: split-panel (AIR top/bottom роз'їзд+text-in→logo-parallax), liquid-fill clip-path logo що morph-ить у хедер 8s (Springs), palette-cycle logo themed під наступну сторінку + staggered letter-fade (Ever). ✅ 🔶 каталог варіантів.
- **FLIP** (SP 86 hits) — getBoundingClientRect first/last→animate delta (движок contentAnimation). ✅ (GSAP Flip).
- **clip/mask reveals** — `intro-clip-in` polygon, `clip-in-up`, ellipse-grow `ellipse(10% at -10% 110%)→ellipse(160%)`, image-clip wipe. ✅ (data-clip маємо).
- **scroll-opens-modal** (ERA `modal-open-on-scroll`). 🔶
- **history scroll-spy router** (SP/ERA) — replaceState переписує URL-hash на in-view секцію (deep-link якорі). ✅ 🔶.

## 7. MICRO-INTERACTIONS
- **custom cursor** (всі: Ever 77, ERA 15) — spring/lerp follow (strength .25, .9 коли clickable), режими zoom-in/left/right/clickable/button-morph, hidden-spots, parallax-follow (= магнітний). ✅ (Cursor маємо, додати режими).
- **button** — `data-button-clone-content` клонує лейбл (hover text-swap/slide), btn__outline = 2×SVG-rect+svgLength draw-on hover, pseudo-fill slide. 🔶 рецепт.
- **cardHover/cardsHover/principlesCards** — групований hover класами. ✅
- **favourites** (всі) — toggle+counter-badge+list-panel+**PDF-експорт**(/api/favourite/pdf/mail)+email. Cross-page localStorage. ✅ → [PB_forms_lead_capture](../../forms-lead-capture/references/PB_forms_lead_capture).
- **popover/tooltip** (Ever 575+48, ERA 222) — Popper/Floating-UI, animation popover-bottom-in/top-out, trigger hover-strict/click, sync-варіанти, triangle-adjust, desktop+mobile templates. ✅ 🔶.
- **plan-marker hover** — №·м²·ціна popover, статус-кольори. ✅ → [PB_visual_search](../../re-visual-search/references/PB_visual_search).
- **filter chips / range-sliders** (власний `range`, не noUiSlider) — handle+connector, money-formatter, price/floor/area; list↔plan `selector__link` toggle; resultSort; ajaxList+count; pushState без reload. ✅ 🔶.
- **tabs/tabsswipe** — swipeable, animate-height, image-clip-in-left/right контент, counter, openConnectedTab. ✅
- **forms** — inputState(floating-label)+inputMask+phonenumber(intl-tel)+choice+dynamicForm+ajaxForm+recaptcha(v2/v3)+reachGoal/Comagic/Mindbox/Calltouch. ✅ → [PB_forms_lead_capture](../../forms-lead-capture/references/PB_forms_lead_capture).
- **intro split-hover** (Ever) — курсор-X свопить hero-фон --1↔--2. 🔶
- **imageZoom** (ERA click/pinch lightbox), **mortgage** калькулятор (range→monthlyPay), **accordion**, **flip class-toggle**, **scrollableIndicator** ("scroll to explore"+is-finished), **stickyBottom** CTA-бар, **cookieConsent**, **mobileScrollable**. ✅ 🔶.

## 8. ЩО БУЛО ПРОПУЩЕНО (топ, тепер закрито)
inline-keyframe-parallax (не лише named) · `appear` decode+reveal gate · `contentAnimation` controller (counter/sticky/height/timer) · `svgLength` self-draw · custom-cursor spring-режими · sticky-clip-path stacking · gravity-well+snap · `deco` parallax-шар · `themed`/`changeTheme` IntersectionObserver theme-swap · button clone-content+outline · range власний слайдер · before/after spring · mouse-slider · Keen/Owl carousel + custom fade/loop ефекти · FLIP · precisescroll · palette-cycle/liquid-fill preloader варіанти · Barba modal-in transition · per-site ease (SP ≠ air) · anticipation ease `.47,.04,.5,-.06` · 44-69 named-parallax-patterns per site · WebGL-shader internals (для no-WebGL перекладу).

## 9. ПРИНЦИП ВИКОРИСТАННЯ (плагін)
v1: СТРУКТУРОВАНИЙ канон тепер ../../grammar/references/_REGISTRY_TID.md (109 T-ID + 22 архетипи + комбінації) — стеки складай ЗВІДТИ; цей файл = першоджерельна проза. Старе: «реєстр = меню прийомів». Для кожної секції motion-score обирає 2-4 КАНДИДАТИ звідси → [PB_variants_prototyping](../../variants-prototyping/references/PB_variants_prototyping) показує варіанти → user обирає. 🔴-прийоми ЗАВЖДИ через no-WebGL переклад (колонка NW). Жоден прийом не «вигаданий» — усе зняте з живих VI.
