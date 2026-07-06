---
id: visual-search-drill
name: "Дріл-естафета: рівень 1 → 2 через T-530 flash + T-428 FLIP"
level: 2
kind: section-variant
status: candidate            # official ТІЛЬКИ після вердикту власника
section: visual-search
mode: click
meaning:
  what: "Юніт 4 спринту-3: обидва рівні дрілу зшиті одною сторінкою. Клік живої плити 2-18 (building-floor-drill) → T-530 flash (funnel-curtain mode 'flash': swap РІВНО під повним покриттям) → рівень 2 на ЖИВОМУ плані 2_18 (floor-plan-select, юніти 157/158 з живими цінами) → T-428 FLIP: число поверху летить з tooltip-картки у nav-info «Floor 18» (first/last rect, transform-only clone, air-крива 0.6s; first-rect фіксується ДО покриття). «← Buildings» — той самий flash назад. Мертві плити не тригерять нічого. Моб: T-M32 заглушка."
  when: "Серце конверсійного фунела: комплекс → поверх → (далі юніт /office). База зборки фунела спринту 4."
  lands: "Клік по поверху — короткий чорний подих, і ти вже над планом; число поверху не зникає, а перелітає з картки у сайдбар — рука розуміє, що це ТОЙ САМИЙ поверх, просто ближче."
  not_when: "Односторінковий список без плану. На тачі (T-M32)."
source:
  grammar: "живі /visual-search + /visual-search/building/2/floor/18 (live-archive): T-530 flash між рівнями; T-428 = REG §6 FLIP first/last; клікабельність/конфіги — живі"
  recording: "Desktop-air.mp4 t≈118–142 (обидва рівні + перехід)"
  registry_ref: ["T-530", "T-428", "T-104", "T-115", "T-407", "T-M32"]
stack: "vanilla атоми бібліотеки (нуль нових залежностей)"
webgl: false
ease: air
motion_props: [transform, opacity, fill]
uses:
  - { atom: funnel-curtain, job: "T-530 flash: swap рівнів рівно під покриттям (mode 'flash'); НУЛЬ пінів" }
  - { atom: building-floor-drill, job: "рівень 1: плити поверхів, clickable=count>0" }
  - { atom: floor-plan-select, job: "рівень 2: живий план 2_18 + T-407 попавер + драбинка" }
pin:
  owner: none
  count: 0
page_beat: [conversion]
gated_by: [R_perf_limits, R_no_webgl]
acceptance:
  - "клік живої плити → fc.play(swap,'flash'): рівень 1 ховається ПІД покриттям, рівень 2 (Building 2/Floor 18, 2 юніт-маркери) видимий після"
  - "T-428 FLIP: клон числа поверху летить tooltip→nav-info (gate.flips=1); first-rect знятий ДО покриття; reduced-motion — без FLIP і штори"
  - "«← Buildings» — flash назад (gate.plays=2)"
  - "мертва плита: жодної штори (plays не росте)"
  - "T-M32: на тачі заглушка"
  - "console errors == 0; нуль пінів (conversion gate)"
files: [combo-lab.html, RECIPE.md]
---

# visual-search-drill — чорний подих між рівнями

Цеглини не змінені — комбо лише зшиває три готові атоми. На зборці
фунела (юніт 6, зі спринтом 4) сюди досипаються list-фунел T-M30 і
unit-сторінка A-13.
