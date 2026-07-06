---
id: home-air
name: "ЗБОРКА ГОЛОВНОЇ AIR (спринт-2 екзамен: два вікна поруч)"
level: 3
kind: page-assembly
status: candidate            # екзамен: Єгор гортає поруч з aircenter.space (DoD рівень 3)
section: home
mode: scroll
meaning:
  what: "Перша посторінкова репліка за DoD AIR-COMPLETE: головна aircenter.space цілком, акти в живому порядку top → impulse → format → harmony → life → people → status → footer. Фото і копі — ЖИВІ (hotlink на aircenter.space media) — для чесного порівняння «два вікна поруч». 10 движків бібліотеки змонтовані як на живому сайті."
  when: "Мілстоун-екзамен спринту-2 і база для фікс-кіл: розбіжність із оригіналом = фікс до збігу; атом, що не збігся на сторінці, повертається в доробку незалежно від атом-вердикту."
  lands: "Прелоадер-конвой → літери A I R збираються скролом → акти дихають reveal-каноном → Format гортає тези під лічильник-курсор → картка Harmony замерзає над пливучим фасадом → числа району злітають → двори обертаються ребром → шов Status ріже лобі знизу вгору → футер віддзеркалює A I R."
source:
  grammar: "живий DOM/CSS/JS aircenter.space (усі витяги 2026-07-06) + атоми бібліотеки спринтів 1–2"
  recording: "Desktop-air.mp4 t0–29 + t63–118 (повний прохід головної) → AIR-REF--home-air.mp4; наша зборка → PAGE--home-air.mp4"
  registry_ref: ["T-310", "T-322", "T-422", "T-501", "T-512", "T-513", "T-524", "T-215", "T-311", "T-M11", "T-M23", "T-M06"]
stack: "vanilla атоми + GSAP 3.12.5/ScrollTrigger (spread/gnf/brv). Живі фото hotlink — потрібен інтернет."
webgl: false
uses:
  - { atom: preloader-logo-convoy, job: "вхідний ритуал (official)" }
  - { atom: kinetic-letters-hero, job: "hero A I R → лого хедера + футер-дзеркало" }
  - { atom: air-menu-overlay, job: "хедер (A-18 themed) + двофазне меню (A-17/T-M11)" }
  - { atom: spread-row-headline, job: "spread-бенди impulse/life/people (T-310)" }
  - { atom: text-blur-reveal, job: "reveal-канон актів (T-322)" }
  - { atom: pinned-counter-slideshow, job: "Format-пін з лічильником-курсором (T-513)" }
  - { atom: sticky-card-parallax, job: "Harmony: картка замерзає, фасад пливе (T-215)" }
  - { atom: giant-number-fact, job: "Life: числа району 1/3/7/11 (T-422)" }
  - { atom: center-focus-carousel, job: "двори зі скосом — дельта варіанта air-courtyards (no-WebGL переклад)" }
  - { atom: image-slider-wipe, job: "Status: слайдер 1/2 + шов-кліп (T-512/T-M23)" }
pin:
  owner: "послідовні акти: fmtpin (T-513) · scp (T-215) · isw (T-512) — по одному на біт, як на живій головній"
  count: 3
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "порядок актів = живий (top→impulse→format→harmony→life→people→status→footer); PROBE-гейт: усі 10 движків init, errors 0, дрейф якоря ≤4px"
  - "ЕКЗАМЕН (вирішальний): два вікна поруч з aircenter.space, desktop І телефон, синхронний скрол Єгора; розбіжність = фікс до збігу"
  - "свідомі діри v1 (на фікс-кола): Vimeo-фон Format (стоїть live-постер) · grid→fullbleed скейл фото · внутрішній дрейф фото слайдера ±16.666% · курсор-стрілка каруселі · шви sectionToSticky між актами (T-510 сім'я)"
files: [combo-lab.html, RECIPE.md]
---

# home-air — головна одним диханням

Фінальний юніт Спринту-2. Це НЕ ще один атом — це екзамен: чи складаються
10 движків бібліотеки в ту саму сторінку, що жива головна AIR. Фото і копі
навмисно живі (hotlink) — щоб у двох вікнах поруч відрізнялась тільки
МЕХАНІКА, і кожна розбіжність била в очі.

Запуск: сервер 8820 → `/combos/home-air/combo-lab.html` поруч із
https://aircenter.space у сусідньому вікні.
