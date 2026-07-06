---
id: sticky-card-parallax
name: "Sticky-картка над пливучим фоном (+мобільне дзеркало)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника (прототип-перший)
entry:
  call: "StickyCardParallax.create(section, opts)  // section містить [data-scp-bg] (фон-медіа) і [data-scp-card] (картка). opts: { driftSvh (40 — живий CSS AIR), heightVh (200), touchMq }"
  module: iife
  returns: "{ render(p), progress(), gate, destroy }  (mobile: { mirror:true } — дзеркальна структура T-M17 без скрабу; reduced desktop: { static:true })"
meaning:
  what: "T-215 sticky-card-over-parallax (живий shared.js AIR, патерн landingHarmonyBackground дослівно): картка ЗАМЕРЗАЄ (CSS sticky по центру екрана), фон ПЛИВЕ translateY(−40svh → +40svh) ЛІНІЙНО за повний прохід секції — 80svh глибини без WebGL. T-M17 (мобільне ДЗЕРКАЛО з відео власника): ролі обертаються — ФОТО замерзає (sticky), glass-картка їде поверх; нуль паралакс-трансформів на тачі (сімейний закон enableTouch:false; frosted над статичним фото = дозвіл D2)."
  when: "Story-акт «About the project»-типу: одна картка тексту мусить утриматись у фокусі, поки світ за нею рухається. Акт головної (harmony/life), B3-сторі /about (зв'язка T-215+T-M06), будь-який глибинний біт між full-bleed актами."
  lands: "Око тримає картку, а периферія пливе — глибина відчувається тілом, як у повільному кадрі з паралаксом плеча оператора. На тачі навпаки: світ завмер, картка треться об нього при свайпі — той самий контраст ролей, чесніший для пальця."
  not_when: "Секції під іншим піном у тому ж біті (owns_pin — sticky-картка тримає біт). Кілька карток поспіль (одна картка = один акт). Фон зі скрабленим відео/канвасом під glass-карткою (D2: frosted тільки над статикою — на desktop картка непрозоріша або фон-рендер)."
source:
  grammar: "живий shared.js aircenter.space (витяг 2026-07-06): landingHarmonyBackground { parallax-100-0: translateY(-40svh), parallax-0-100: translateY(+40svh) } — лінійно, clamp; T-M17 = D_AIR_mobile_video f51-55 (фото замерзає, glass-картка + хром-сфера їдуть поверх)"
  recording: "MOBILE-air.mp4.MP4 t24.5-28.5 (T-M17 наживо) + shared.js"
  registry_ref: ["T-215", "T-M17"]
stack: "vanilla, нуль залежностей (CSS sticky + rAF-квантований scroll-драйвер, чистий render(p))"
webgl: false
motion_props: [transform]
trigger: "скрол: прогрес проходу секції (0..1), скраб transform-only; на тачі скраб не вмикається (дзеркальна структура)"
timing_layer: [A-ambient]
owns_pin: true
page_beat: [material, proof]
combines_with: [text-blur-reveal, theme-tween, giant-number-fact]
anti_combos: [second-pin, pin-release-seam]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "desktop: картка sticky по центру (top 50vh, translateY(-50%)) — замерзла ±2px протягом усього проходу; фон translateY(−40svh → +40svh) ЛІНІЙНО (живий CSS AIR, без easing)"
  - "фон має запас ±driftSvh висоти — дрейф ніколи не оголяє країв"
  - "mobile (T-M17): дзеркало — фон sticky full-viewport (замерзає), картка поверх (z 2, наїзд); НУЛЬ transform на фоні"
  - "render(p) — чиста функція проходу: реверс повертає той самий ty (±1svh); стрибок = правильний стан"
  - "рух = transform ТІЛЬКИ, rAF-квантування зі skip-unchanged; CLS < 0.1"
  - "reduced-motion: фон стоїть (static-гілка), структура жива"
  - "destroy() повністю чистить стилі обох шарів і секції"
---

# sticky-card-parallax — картка замерзає, світ пливе

Перший юніт Спринту-2 (story-акти головної). Знято з живого JS AIR
дослівно: 80svh лінійного дрейфу фону під замерзлою карткою.

```html
<section id="about">
  <div data-scp-bg><img src="render.avif" alt=""></div>
  <div data-scp-card class="glass">…текст…</div>
</section>
<script>
  StickyCardParallax.create('#about');
</script>
```

Мобільне дзеркало вшите в той самий атом (matchMedia): фото замерзає,
glass-картка їде поверх — ролі обертаються чесно для пальця.
