---
id: building-floor-drill
name: "Дріл рівень 1: плити поверхів на фасаді (T-115 + T-104 + T-M32)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "BuildingFloorDrill.create(root, config, opts?)  // root містить [data-bfd-photo] + [data-bfd-svg] (групи data-hoverable='b-f') + [data-bfd-markers] + [data-bfd-tooltip] + [data-bfd-mobile]. config = { floors:[{ref,building,floor,count,areaMin,areaMax,href}], markers:[{building,title,anchor}] } — ЖИВИЙ формат data-plan-plans. opts: { onSelect(floor), touchMq }"
  module: iife
  returns: "{ hover(ref), leave(), activeBuilding(), gate, destroy } (touch: { touch:true } — T-M32 заглушка)"
meaning:
  what: "Рівень 1 visual-search дрілу AIR (живий движок plan+buildingPlan, знято дослівно 2026-07-06): двошаровий план T-104 — фото-ізометрія + невидимі SVG-плити поверхів (T-115). Hover плити: біла заливка .4 за 0.6s air-кривою, tooltip праворуч «Floor N · count offices · м²», маркер ЇЇ вежі інвертується (set 60ms debounce, зняття 120ms delayed — живий buildingPlan). ЗАКОН ЖИВОГО КОНФІГА: clickable = count>0 — плита без вільних офісів світиться приглушено (primary .15) і не клікається. Клік по живій плиті → onSelect/href (стик з T-530 funnel-curtain на зборці). T-M32: на тачі дрил не існує — заглушка «only on desktop» + list-заміна."
  when: "Вхід у конверсійний фунел будь-якого RE-сайту: генплан/фасад → поверх. Наступні рівні: план поверху (T-104 юніти) + попавер T-407."
  lands: "Курсор пливе по фасаду — поверхи спалахують склом, картка праворуч рахує вільні офіси, а бейдж вежі над дахом чемно інвертується, підказуючи де ти. Мертві поверхи чесно глухі: ні світла, ні кліку."
  not_when: "Каталог списком без плану (list-фунел T-M30). Одна будівля без веж — можна без маркерів. На тачі — ніколи (T-M32)."
source:
  grammar: "живий /visual-search: data-plan-plans JSON (clickable=count>0), visual-search.js buildingPlan (60/120ms), visual-search.css (.plan-hoverable стани, 0.6s air), шаблони building/floor; знімки в skills/teardowns/live-archive/air/"
  recording: "Desktop-air.mp4 t≈119–135 (CHOOSE AN OFFICE → ізометрія → плити → floor)"
  registry_ref: ["T-115", "T-104", "T-M32"]
stack: "vanilla, нуль залежностей (стани = класи, рух = CSS transitions живої кривої; JS = тільки debounce 60/120)"
webgl: false
motion_props: [fill, opacity, background-color, color]
trigger: "hover/click плит (подієво); скролу нема"
timing_layer: [B-swap]
owns_pin: false
page_beat: [conversion]
combines_with: [funnel-curtain, numbered-floorplate-select, clean-floor-hover-select]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "clickable = count>0 ДОСЛІВНО: плита з count=0 — disabled-стан (primary .15 на hover), клік блокується (gate.clickBlocked)"
  - "hover: біла заливка .4 (clickable), transition 0.6s cubic-bezier(.25,.74,.22,.99)"
  - "маркер вежі: active при hover її плит з живими таймінгами (set 60ms, зняття 120ms delayed) — інверсія"
  - "tooltip: «Floor N» + «count offices» + «areaMin–Max m²», placement right від bbox плити, fade 0.6s"
  - "клік живої плити → gate.selected + onSelect(floor) (або href)"
  - "T-M32: на тачі SVG/маркери/tooltip сховані, [data-bfd-mobile] показаний"
  - "нуль CLS; destroy() чистить слухачі/таймери/маркери"
---

# building-floor-drill — поверхи спалахують під курсором

Перший юніт Спринту-3 (конверсійне ядро). Живий формат конфіга
збережений 1-в-1 — на зборці фунела можна вставити СПРАВЖНІЙ
data-plan-plans з live-archive без перекладу.

```html
<div data-bfd id="drill">
  <div data-bfd-photo><img src="isometry.avif" alt=""></div>
  <svg data-bfd-svg viewBox="0 0 1594 780">
    <g data-hoverable="2-18"><path d="…"/></g> …
  </svg>
  <div data-bfd-markers></div>
  <div data-bfd-tooltip></div>
  <div data-bfd-mobile hidden>…T-M32 заглушка + список…</div>
</div>
<script>
  BuildingFloorDrill.create('#drill', CONFIG, { onSelect: openFloor });
</script>
```

Далі в спринті: план поверху (T-104 юніти + T-407 попавер з міні-планом,
розширення numbered-floorplate-select), драбинка-стек, T-428 FLIP,
T-530 funnel-curtain як шов між рівнями.
