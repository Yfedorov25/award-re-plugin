---
id: floor-plan-select
name: "Дріл рівень 2: план поверху + попавер з міні-планом (T-104 + T-407 + T-M32)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "FloorPlanSelect.create(root, config, opts?)  // root: [data-fps-svg] (інлайн SVG з data-hoverable='nr') + [data-fps-markers]/[data-fps-tooltip]/[data-fps-nav]/[data-fps-info]/[data-fps-mobile]. config = { building, floor, units:[живий формат data-plan-plans], floors:[{floor,available,href}] }. opts: { onSelect(unit), touchMq }"
  module: iife
  returns: "{ hover(nr), leave(), multi:{enter,exit,toggle,all,none,selection}, gate, destroy } (touch: { touch:true } — T-M32)"
meaning:
  what: "Рівень 2 visual-search дрілу AIR (живий /visual-search/building/2/floor/18, знято дослівно): SVG-план поверху з юнітами-плитами (T-104), маркер-номер на кожному юніті (інверсія на hover), і T-407-попавер ЖИВОГО шаблону visual-search-floor: area м² + ціна з пробілами + закреслена стара при знижці + МІНІ-ПЛАН юніта зображенням; placement top з triangle. Драбинка floor-nav зліва: живі поверхи лінками, мертві is-disabled, поточний підкреслений; nav-info «Building B / Floor F». Вся палітра станів на одній живій кривій 0.6s cubic-bezier(.25,.74,.22,.99). Лаба працює на СПРАВЖНЬОМУ плані 2_18.svg з живими юнітами 157/158 і цінами."
  when: "Другий крок фунела після building-floor-drill: поверх обраний — тепер юніт. Будь-який RE-сайт з поповерховими планами."
  lands: "План лежить як креслення на столі: офіс під курсором темніє, його номер інвертується, а над ним виринає картка з міні-планом і цінами — все, що треба для рішення, не покидаючи плану. Драбинка зліва тримає контекст вежі."
  not_when: "Мало юнітів без планів (list-картки). На тачі — ніколи (T-M32: заглушка + список)."
source:
  grammar: "живий /visual-search/building/2/floor/18: data-plan-plans (nr/area/actualPrice/plan/disabled), шаблони visual-search-floor + office-fixed, .floor-nav; знімки і ЖИВИЙ SVG у skills/teardowns/live-archive/air/ (plans/2_18.svg)"
  recording: "Desktop-air.mp4 t≈131–142 (план 2/18: попавер 432 935 800 + драбинка)"
  registry_ref: ["T-104", "T-407", "T-M32"]
stack: "vanilla, нуль залежностей (стани = класи, рух = CSS transitions живої кривої)"
webgl: false
motion_props: [fill, opacity, background-color, color]
trigger: "hover/click юнітів (подієво)"
timing_layer: [B-swap]
owns_pin: false
page_beat: [conversion]
combines_with: [building-floor-drill, funnel-curtain, numbered-floorplate-select]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "попавер = живий шаблон: area м² + ціна пробілами + del стара (лише при discount) + міні-план img; top + triangle; 0.6s"
  - "маркер-номер юніта на bbox-центрі; hover = інверсія"
  - "disabled-юніт: без попавера, без кліку (gate.clickBlocked)"
  - "клік живого → gate.selected + onSelect(unit)"
  - "драбинка: <a> живі / is-disabled мертві / is-active поточний; column-reverse; nav-info Building/Floor"
  - "SELECT MULTIPLE (живий js-plan-multi-select): enter → ✛-плюсики ЛИШЕ на живих юнітах (office-toggle, active → 45°); панель «Your selection»: список №/м²/ціна + «Show N offices» + totalArea + сумарна ціна; all/none/hide; кнопки по [data-fps-multi]"
  - "компас (живий .compass--right-bottom): слот [data-fps-compass], кут opts.compassDeg (живий −15°)"
  - "T-M32: на тачі план+сайдбар сховані, заглушка видима"
  - "нуль CLS; destroy() чистить"
---

# floor-plan-select — креслення, що відповідає на hover

Другий юніт Спринту-3. Лаба на СПРАВЖНЬОМУ живому плані (2_18.svg,
юніти 157/158, ціни з конфіга) — формат data-plan-plans 1-в-1, на зборці
фунела вставляється реальний конфіг без перекладу. SELECT MULTIPLE і компас вшиті (юніт 3 спринту). Далі: T-428 FLIP + T-530 штора між рівнями 1↔2.
