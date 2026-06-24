---
id: R_anti_combos
kind: rule
gates: [anti_combos, owns_pin, trigger, combines_with]
severity: hard
---

# Anti-combos — що НЕ стакати

Combining techniques is where award sites quietly turn cheap. Each rule below is a pairing that fights itself when layered in one section. Check every section against this list before building.

- **Один pin-owner на секцію — завжди.** Не стакай два пін-власники в одній секції (puzzle-image + cards-swipe, або focus-render-switch + media-step-switch одночасно). Обидва хапають `pin` + `pinSpacing`; другий ScrollTrigger б'ється з першим і лейаут стрибає. Якщо потрібні дві pin-механіки — це дві секції.

- **Один годинник на елемент.** Кожен елемент належить рівно одному з трьох годинників (scroll-scrub / pointer-spring / autoplay). Не parallax-скрабь той самий вузол, що вже крутить pointer-spring. Не скрабь `video.currentTime`, поки відео на autoplay — це два годинники на одному елементі, дає seek-стрибки.

- **Синхронний рух багатьох елементів без stagger = дешевий «вибух».** Slide-out картки на одному keyframe, puzzle-плитки зі `staggerAmount: 0` (= просто fade+zoom), великий розкид puzzle-тексту без спільного ease (= конфетті). Завжди: stagger + один спільний ease на всю групу.

- **Не накладай два text-fade над рухомим wipe/шовом** (пастка media-step-switch). Два тексти б'ються — каша. Прибирай (dim) вихідний текст ДО шва, прояснюй вхідний ПІСЛЯ шва. Ніколи не одночасно.

- **Не стакай моушн на конверсійному вузлі.** Обидва еталони гасять рух майже до нуля на формі/рішенні (ERA §08, Springs §09). Пін або 4 рухи навалені на CTA б'ються з рішенням користувача — anti-pattern. Тиша на воротах конверсії.

- **Один пік, не два поспіль.** Не став дві counter-parallax пари в сусідніх секціях і не клей два full-assemble climaxes підряд (дві puzzle-image обкладинки одна за одною). Пік мусить бути одиничним — ERA навмисно декомпресує §06 одразу після кульмінації §05 (менше одночасних шарів). Дві кульмінації поспіль сплющують обидві.

- **Appear-gate ПЕРЕД scrub.** Не клади deco/parallax над секцією, що frame-скрабить важку медіа, без decode-гейту першим — скраб стартує до того, як кадри декодуються, і плитки блимають порожнечею. Завжди appear-gate (декод-гейт) перед тим, як стакати scrub.

- **Без magnetic snap під довгим reveal.** Не стакай gravity-well / scroll-snap на секції, яку читають (контент). Рада позначила scroll-trap як неправильний для RE (нотатка реєстру). Магнітний snap — лише для коротких index/map секцій, ніколи під довгим reveal.
