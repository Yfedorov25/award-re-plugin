# PB_nav — НАВІГАЦІЯ award-RE (VI-grounded) ★★
> Переписано з живого зонду 5 VI-сайтів. 2026-06-09. Споріднено: [PB_site_architecture](../../re-architecture/references/PB_site_architecture) [PB_color](../../re-color/references/PB_color.md) [D_ERA_architecture](../../re-architecture/references/D_ERA_architecture.md) [D_AIR_architecture](../../re-architecture/references/D_AIR_architecture.md) [PB_forms_lead_capture](../../forms-lead-capture/references/PB_forms_lead_capture).

## 0. РОЛЬ
Хедер ЖК = не «3-6 пунктів agency», а провідник по ГЛИБОКОМУ сайту (~14 розділів) + ПОСТІЙНИЙ конверсійний якір. На всіх 5 VI: sticky-хедер + «Обрати квартиру» + «Замовити дзвінок» завжди під рукою.

## 1. РЕАЛЬНА VI-СТРУКТУРА (з D_*)
- `class="header js-header header--sticky ui-dark"` — sticky, з theme-класом.
- **~14-пунктовий ЖК-nav** (з [PB_site_architecture](../../re-architecture/references/PB_site_architecture) §2): About · Architecture · Location · Infrastructure/Territory · Gallery · Flats · Visual-search · Parking · Progress · How-to-buy/Mortgage · Developer/Team · Documents · News · Contacts.
- **Sticky-CTA дубль** (5/5): «Обрати квартиру» (→visual-search) + «Замовити дзвінок» (→callback-modal).
- **Favourites-лічильник** у хедері: `favourite-btn js-favourite-counter-parent` + `favourite-btn__counter` (cross-page shortlist, [PB_forms_lead_capture](../../forms-lead-capture/references/PB_forms_lead_capture)).
- Десктоп: повний nav; мобіл/складно: full-screen **modal-menu** (`#menu-modal`, Springs/Silver) → Barba перехоплює клік → scroll-to-anchor.

## 2. THEMED-ХЕДЕР (перефарбування на скролі) ★ VI-підпис
Хедер `data-themed-class`/`ui-dark↔ui-light` — перефарбовується коли перетинає темні/світлі секції (текст/фон лого міняються щоб лишатись читабельними). AIR/ERA: header `data-plugin="themed"`. Це і є «лого читається на всіх фонах» але СИСТЕМНО через [PB_color](../../re-color/references/PB_color.md) токени, не mix-blend-difference хак.

## 3. ПОВЕДІНКА НА СКРОЛІ
- Sticky (не hide/show — VI тримають хедер видимим: конверсія завжди під рукою).
- Фон: прозорий над hero → щільніший tint після ~40px (НЕ backdrop-blur — perf, [PB_performance](../../perf-doctrine/references/PB_performance.md) §4.2; щільний tint дає frosted без read-back).
- Links hover: underline-draw / opacity, ease «air».

## 4. НОРМИ
Висота 60-90px desktop. Nav-пункти ~13-15px, tracking, uppercase часто. Лого ліво, nav+CTA+favourites право. Тап-зона мобіл ≥44px.

## 5. МОБІЛЬНИЙ (з [PB_responsive](PB_responsive.md))
Burger → full-screen modal-menu, пункти stagger-поява (ease «air»), sticky «Обрати квартиру»+«Дзвінок» лишаються. Lang-switch (якщо двомовний).

## 6. ПОМИЛКИ
nav ховається й ховає конверсію (VI тримають видимим) · backdrop-blur на хедері (perf-вбивця §4.2) · лого не перефарбовується між темними/світлими секціями · burger <44px · agency-мінімалізм (3 пункти) на глибокому ЖК · mix-blend-difference замість themed-токенів.

## 7. ЧЕК
☐ sticky + themed-перефарбування (ui-dark↔light) ☐ ~14-пунктовий nav під глибину сайту ☐ постійні «Обрати квартиру»+«Замовити дзвінок» ☐ favourites-лічильник ☐ фон tint (НЕ backdrop-blur) ☐ full-screen modal-menu на мобілі + Barba scroll-anchor ☐ тап ≥44px ☐ a11y: фокус-стани, aria-expanded на burger.
