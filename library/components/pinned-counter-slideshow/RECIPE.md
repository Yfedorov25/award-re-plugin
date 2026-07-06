---
id: pinned-counter-slideshow
name: "Пін «Format»: текст-слайди з лічильником-курсором (T-513 + T-M06)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника (прототип-перший)
entry:
  call: "PinnedCounterSlideshow.create(section, opts)  // section містить [data-pcs-layer]>[data-pcs-bg]+[data-pcs-card]>[data-pcs-text]×N + [data-pcs-widget] (бар+N/M) + [data-pcs-ticks]. opts: { stepSvh (85), textDelayMs (250), lineStaggerMs (60), blurPx (10), cursorCounter (true), hoverMq, touchMq }"
  module: iife
  returns: "{ render(p), progress(), index(), goTo(i), gate, destroy } (gate.follower = чи активний cursor-counter)"
meaning:
  what: "Пін «Format» головної AIR (живий DOM/JS, знято дослівно 2026-07-06): N текст-слайдів гортаються скролом над ПОСТІЙНИМ медіа-фоном — той самий движок contentAnimation, що в слайдері Status (index = floor(p·N), текст blur-swap delay 0.25 + 60ms/рядок, лічильник «N / M» свапається НА СТАРТІ). Прогрес desktop = ОДИН бар 2px, що їде translateX(−100%→0) безперервно за ВЕСЬ пін. Фішка AIR: на hover-десктопі лічильник-віджет Є КАСТОМНИМ КУРСОРОМ секції (живий cursor--counter) — липне до курсора з lerp-хвостом; на no-hover — статичний у куті. Моб (T-M06 підтверджено на AIR): той самий скрол-пін, лічильник схований, прогрес = 2 line-ticks з покроковим fill."
  when: "Story-акт, де ОДНЕ сильне медіа (відео-луп бренд-об'єкта, рендер) тримає екран, а 2–3 тези гортаються поверх: «Format» головної (три вежі 14–34), пін CMWP /management, цифро-дек офісних переваг /about."
  lands: "Світ стоїть — тільки думки перегортаються. Лічильник біжить біля самого курсора, наче секція відповідає руці; бар доповзає до кінця рівно тоді, коли пін відпускає. На тачі ті самі два штрихи-ticks заповнюються під пальцем."
  not_when: "Фото мусить мінятись разом із текстом — це image-slider-wipe (T-512), не цей атом. Більше ~3 тез (пін росте на step за кожну). Під іншим піном у біті (owns_pin)."
source:
  grammar: "живий DOM aircenter.space #format (витяг 2026-07-06): sticky --items-count:2 + contentAnimation plugins='controller events counter sticky' + counter__progress-bar parallax 0-0→200-100 + cursor--counter follower + progress-bar is-hidden--md-up (2 line-ticks); движок = той самий, що знятий для image-slider-wipe"
  recording: "MOBILE-air.mp4.MP4 (Format-пін на моб: спіраль + текст-слайди + 2 line-ticks — T-M06)"
  registry_ref: ["T-513", "T-M06"]
stack: "vanilla, нуль залежностей (CSS sticky пін + rAF-скрол-драйвер + WAAPI blur-свапи + rAF-lerp follower)"
webgl: false
motion_props: [transform, filter, opacity]
trigger: "скрол: прогрес піна → індекс (свап = подієва WAAPI-анімація); hover: mousemove → follower (transform-only)"
timing_layer: [B-swap]
owns_pin: true
page_beat: [material, vision]
combines_with: [text-blur-reveal, theme-tween, image-slider-wipe, pin-release-seam]
anti_combos: [second-pin, funnel-curtain]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "пін: шар sticky 100svh, секція 100svh+(N−1)·stepSvh; index = min(floor(p·N), N−1)"
  - "лічильник ставиться НА СТАРТІ свапу (до анімацій); формат «N» + «/ M»"
  - "бар: безперервний translateX(−100%·(1−p)) за весь пін, transform-only БЕЗ transition, реверсивний (±6%)"
  - "текст: out blur(0→10) одразу; in delay 0.25s + 60ms/рядок (md-up, спани розгорнуті після settle); стек у грід-клітинці — нуль CLS"
  - "cursor-counter (hover-mq): віджет з'являється на mousemove, тягнеться до курсора lerp-ом (0.18/кадр), зникає на mouseleave; transform-only; на no-hover/reduced — статичний"
  - "моб (T-M06): пін живий на тачі, віджет схований, 2 line-ticks fill_i = clamp(p·N−i); текст цілим блоком"
  - "reduced-motion: свапи миттєві, follower вимкнений, бар/ticks живі"
  - "CLS < 0.1; рух = transform/filter/opacity ТІЛЬКИ; destroy() чистить слухачі, стилі, анімації"
---

# pinned-counter-slideshow — світ стоїть, думки гортаються

Третій юніт Спринту-2. Закриває «Format» головної (без-T-ID №6 → реєстр
дожатий рядком T-513) тим САМИМ живим движком contentAnimation, що вже
знятий для `image-slider-wipe`: тут він гортає текст над постійним фоном
замість фото, а лічильник стає курсором секції.

```html
<section id="format">
  <div data-pcs-layer>
    <div data-pcs-bg><video src="spiral.mp4" muted loop autoplay></video></div>
    <div data-pcs-card>
      <div data-pcs-text><p>…теза 1…</p></div>
      <div data-pcs-text><p>…теза 2…</p></div>
    </div>
    <div data-pcs-widget>
      <div data-pcs-bar-track><div data-pcs-bar></div></div>
      <p><span data-pcs-count>1</span> <span data-pcs-total>/ 2</span></p>
    </div>
    <div data-pcs-ticks></div>
  </div>
</section>
<script> PinnedCounterSlideshow.create('#format'); </script>
```

За межами атома (свідомо, на ЗБОРКУ ГОЛОВНОЇ): в'їзд/вихід шарів
(sectionToSticky / sectionFromStickyHalfUnderNext — сім'я T-510/T-503),
grid→fullbleed скейл фото над піном (landingFormatImageWrapper) і
Vimeo-фон — у лабі фон статичний.
