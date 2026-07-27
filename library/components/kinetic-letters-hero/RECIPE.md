---
id: kinetic-letters-hero
name: "Kinetic-letters hero → лого хедера + дзеркальний футер"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника (прототип-перший)
entry:
  call: "KineticLettersHero.create(section, opts)  // section = hero-секція висотою >100vh (скраб-простір). opts: { wordmark ('AIR'), headerScale (50/140 — живий JS AIR), headerLeftVw (16), headerTopVh (3.2), assembleAt (0.85 — keyframe AIR), ink }. Футер-дзеркало: KineticLettersHero.footer(target, { wordmark, ink, scaleFrom (0.92) })"
  module: iife
  returns: "create → { render(p), letters, gate, destroy } (reduced: { static:true } — розведений рядок стоїть); footer → { letters, destroy }"
meaning:
  what: "T-311 kinetic nav-letters (живий shared.js AIR, патерни landingIntroLogoA/I/R): гігантський РОЗВЕДЕНИЙ wordmark у hero; скрол секції ЗБИРАЄ літери в лого хедера — scale 50/140 (140px гіганта → 50px лого), виїзд угору, зсув на ~2 грід-колонки вправо, колапс розведення (в AIR: I на −193/1420, R на −388/1420; у нас — обміри й пакування впритул). easeOutQuad, clamp, чистий render(p) — реверсивний. Sticky-сцена без JS-піна. Футер (A-16) = дзеркальний spread + scale-в'їзд 0.92→1 once (моб-закон f109-111)."
  when: "Hero головної будь-якого сайту сім'ї: бренд-рядок = перший кадр і НАВІГАЦІЙНА естафета (wordmark буквально стає лого хедера — глядач бачить, звідки лого взялося). Замикається дзеркалом у футері: сайт відкривається і закривається одним рядком. T-M02: та сама механіка на тачі (AIR: px-драйвер 248px)."
  lands: "Скрол першого екрана відчувається як жест збирання: величезні літери, розкидані по всій ширині, слухняно стискаються в маленьке лого і стають на місце в хедері — «сайт склався в кишеню». Реверс скролу розбирає їх назад — контроль у глядача. Внизу сторінки той самий рядок виростає знову: рамка-дзеркало."
  not_when: "Внутрішні сторінки (там лого хедера вже стоїть — естафета була б брехнею). Wordmark довший ~6+ літер (розведення гине — закон T-M01: на вузьких портах spread живе лише у wordmark). Секції під іншим піном у тому ж біті (one pin owner; тут пін = CSS sticky, але біт зайнятий)."
source:
  grammar: "живий shared.js aircenter.space (витяг 2026-07-06): landingIntroLogoA/I/R — parallax-0-0 (центр, scale 1) → parallax--85-0 (translateY(-50svh), translateX(gutter×2+col×2), I/R колапс-зсуви, scale(50/140), easeOutQuad) → hold до -100 → вихід -150; *Mobile: драйвер 248px, фінал 131.25/(innerWidth−40); футер-дзеркало = A-16 + моб-закон f109-111 (scale-в'їзд «менший → гігант»)"
  recording: "Desktop-air.mp4 t2-7.5 (збірка наживо) + D_AIR_mobile_video f109-111"
  registry_ref: ["T-311", "T-M02"]
stack: "vanilla, нуль залежностей (CSS sticky сцена + rAF-квантований scroll-драйвер, чистий render(p))"
webgl: false
motion_props: [transform]
trigger: "скрол hero-секції (прогрес 0..1, скраб transform-only — D4-чистий); футер: IO once"
timing_layer: [A-ambient]
owns_pin: false
page_beat: [hero]
combines_with: [preloader-logo-convoy, text-blur-reveal, theme-tween]
anti_combos: [second-pin, hero--wordmark-docks-to-nav]
gated_by: [R_anti_combos, R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "p=0: гігант-spread на всю ширину (перша літера <12vw від лівого краю, остання >88vw, висота >12% ширини)"
  - "p=assembleAt: літери зібрані В ЛОГО — scale ≈50/140 (±0.05), верх екрана (<12vh), компактний рядок (<30vw), порядок X монотонний (без перетинів)"
  - "render(p) — ЧИСТА функція прогресу: скрол назад повертає гігант-spread з точністю ≤2px (reverse-safe); стрибок у середину = правильний стан одразу"
  - "рух = transform ТІЛЬКИ (translate+scale, origin 0 0), rAF-квантування зі skip-unchanged; нуль CLS"
  - "sticky-сцена = CSS position:sticky (нуль JS-піна); після секції літери їдуть геть природно"
  - "футер-дзеркало: той самий spread-рядок; scale-в'їзд 0.92→1 once на air-ease 1s (reveal-канон)"
  - "reduced-motion: статичний розведений рядок, нуль скрабу"
---

# kinetic-letters-hero — wordmark стає лого хедера

Найбільший юніт «КІНО»-рами: естафета бренду hero → хедер, знята з
живого JS AIR до числа (scale 50/140, keyframe 85%, easeOutQuad).
Замикає рамку сайту разом із футер-дзеркалом.

```html
<section class="hero" style="height:185vh">…</section>
<footer><div id="mark"></div></footer>
<script>
  KineticLettersHero.create('.hero', { wordmark: 'ДІМ' });
  KineticLettersHero.footer('#mark', { wordmark: 'ДІМ' });
</script>
```

Зв'язка з прелоадером (preloader-logo-convoy): конвой збирає розведений
рядок → hero тримає його гігантом → скрол пакує в лого. Один wordmark
проживає три стани безперервно — це і є «сайт як один фільм».
