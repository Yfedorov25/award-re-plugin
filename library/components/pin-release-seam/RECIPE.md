---
id: pin-release-seam
name: "Pin-then-release шов (замерзає і віддає скрол)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника (прототип-перший)
entry:
  call: "PinReleaseSeam.create(pinned, next, opts)  // pinned = секція, що замерзає; next = секція, що наїжджає поверх. opts: { holdVh (100 — скрол-простір заморозки), releaseShift (75svh — AIR HalfUnderNext), approachShift (50svh — AIR sectionToSticky), contentA/contentB (селектори паралакс-шарів; дефолт — перша дитина), touchMq }"
  module: iife
  returns: "{ render(p), progress(), gate, destroy }  (reduced-motion / touch: { staticParallax:true } — sticky-наїзд живе, паралакс-шари стоять)"
meaning:
  what: "T-510 pin-then-release (живий shared.js AIR: sectionToSticky → sectionFromStickyHalfUnderNext): секція A ЗАМЕРЗАЄ (CSS sticky у рамі 100+holdVh, нуль JS-піна) і віддає скрол; наступна B наїжджає ПОВЕРХ (margin-top:-holdVh, z вище). Паралакс-шари (desktop): A-контент тікає вгору ВДВІЧІ ПОВІЛЬНІШЕ (keyframes AIR: 0→−25→−75svh, ease t²) — лишається видимим у щілині; B-контент визирає з −50svh. На тачі паралакс ВИМКНЕНО (живий JS: enableTouch:false) — sticky-наїзд без scroll-trap, свайп вільний."
  when: "Шов між актами сторінки, де попередній акт мусить «замерзнути» і чесно віддати сцену наступному: hero-фото під наїзд акту, Format-слайдшоу під наступну секцію, будь-який big-media акт перед текстовим. Один із 6 наскрізних механізмів «кіно»-раме."
  lands: "Скрол перестає бути стрічкою: попередня сцена завмирає, наступна насувається поверх неї, а завмерла тікає у глибину вдвічі повільніше — театральна зміна декорацій без жодного WebGL. На тачі — чистий спокійний наїзд без паралакса, свайп ніколи не залипає."
  not_when: "Секції з власним піном у тому ж біті (one pin owner — owns_pin:true). Легкі текстові стики (там досить theme-tween/dim-scrim). Понад 2 поспіль (закон розбити однотемні). Скрабити контент-опасіті замість transform — заборонено."
source:
  grammar: "живий shared.js aircenter.space (витяг 2026-07-06): sectionToSticky { enableTouch:false, easing easeSectionInverse, −50svh→0 } · sectionFromStickyHalfUnderNext { keyframes 200/150/100 → 0/−25/−75svh } · easing-модуль: easeSectionInverse = t², easeSection = 2t−t²; структура = sticky-підкладка + наїзд поверх (реєстр T-503-родич SP sticky--under-next)"
  recording: "Desktop-air.mp4 t11-18.5 (шов фото-акт → THREE TOWERS наживо)"
  registry_ref: ["T-510"]
stack: "vanilla, нуль залежностей (CSS sticky рама + rAF-квантований scroll-драйвер, чистий render(p))"
webgl: false
motion_props: [transform]
trigger: "скрол: прогрес наїзду next поверх pinned (0..1), скраб transform-only; на тачі драйвер не вмикається"
timing_layer: [A-ambient]
owns_pin: true
page_beat: [proof, material]
combines_with: [theme-tween, text-blur-reveal, giant-number-fact]
anti_combos: [second-pin, media-step-switch]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "заморозка = CSS position:sticky у рамі (100+holdVh)vh — нуль JS-піна, нуль scroll-trap (свайп/колесо вільні завжди)"
  - "наїзд: next поверх pinned (margin-top:-holdVh, z-index вище); при p=0..1 next проходить від низу до повного покриття"
  - "паралакс-шари (desktop): A-контент 0→−releaseShift·t² svh (AIR keyframes 0/−25/−75), B-контент −approachShift·(1−t²)→0 svh (AIR −50→0)"
  - "на тачі/reduced: staticParallax:true — шари БЕЗ transform, sticky-механіка живе (живий JS AIR: enableTouch:false)"
  - "render(p) — чиста функція наїзду: реверс повертає нульові зсуви (±1px); стрибок = правильний стан одразу"
  - "рух = transform ТІЛЬКИ, rAF-квантування зі skip-unchanged; CLS < 0.1"
  - "destroy() повністю розгортає структуру (рама знімається, стилі чистяться)"
---

# pin-release-seam — театральна зміна декорацій

П'ятий юніт «КІНО»-рами: замерзання і передача сцени. Знято з живого
JS AIR до числа (keyframes −25/−75svh, ease t², enableTouch:false).

```html
<section id="act-media">…full-bleed…</section>
<section id="act-text">…наступний акт…</section>
<script>
  PinReleaseSeam.create('#act-media', '#act-text');
</script>
```

Закон тача успадкований з живого коду, не з здогаду: обидва AIR-патерни
мають enableTouch:false — мобільний пін це sticky-підкладка без
жодного паралакса (збігається з моб-тірдауном «пін без scroll-trap»).
