# PB_cta — CTA/ФІНАЛ award-RE (VI-grounded, конверсійний) ★★
> Переписано з живого зонду 5 VI. 2026-06-09. Споріднено: [PB_site_architecture](../../re-architecture/references/PB_site_architecture) [PB_forms_lead_capture](PB_forms_lead_capture) [P_realestate](../../re-sections/references/P_realestate.md) [D_Springs_architecture](../../re-architecture/references/D_Springs_architecture.md) [[copywriting]].

## 0. РОЛЬ
Остання секція (5/5 завжди остання). Конвертує накопичену емоцію в дію. У VI-RE це НЕ просто «велика кнопка» — це **єдина чітка конверсія + ехо hero-наративу**.

## 1. VI-РЕАЛЬНІСТЬ
- **Одна дія: «Замовити дзвінок»** (callback-modal). Не плутати юзера кількома CTA.
- **CTA-копі ЕХОЇТЬ hero** (рамка наративу): ERA вгорі «The place where life becomes art» → внизу повторює. Nahirna: повторити «власний берег». Це закриває емоційне коло.
- **Invisible-funnel** (Springs): 0 tel/mailto на сторінці — єдиний шлях контакту = callback-форма з прихованим `currentPageLink` (форма знає З ЯКОЇ секції/квартири лід).
- Деталі форми/consent/доставка ліда → [PB_forms_lead_capture](PB_forms_lead_capture).

## 2. ПОБУДОВА
1. Заголовок-ехо hero (емоція, не «Залиште заявку»).
2. ОДНА дія: solid warm-accent кнопка (на відміну від outline-кнопок вище — апекс отримує вирішальну). 
3. Reveal: smooth fade-rise ease «air» (НЕ slideshow).
4. Форма/модалка: name + phone + PDPL-consent (мінімум полів). → [PB_forms_lead_capture](PB_forms_lead_capture).
5. Темна тема (`ui-dark`) — фінал day→night.

## 3. КОПІ (з [[copywriting]] / Fedoriv)
Живе розмовне речення, не канцелярит. CTA-кнопка = наказове дієслово + результат («Записатися на перегляд», «Замовити дзвінок»). Кілька варіантів → обрати найсильніший. Antislop-фільтр (zero em-dash).

## 4. НОРМИ
Заголовок великий (апекс типографіки), але довжина копі ВІЛЬНА (не жорсткий ліміт слів — [PB_discovery_strategy](../../discovery-strategy/references/PB_discovery_strategy) §6). 1 CTA (макс 2). Кнопка full-width на мобілі.

## 5. ПОМИЛКИ
кілька конкуруючих CTA · заголовок-канцелярит замість ехо-емоції · форма-простирадло (багато полів) · НЕ ехоїть hero (коло не закрите) · магнітна кнопка на мобілі (прибрати) · `currentPageLink` не передається (не знаємо звідки лід) · відсутній consent-чекбокс (PDPL).

## 6. ЧЕК
☐ остання секція, ui-dark ☐ ОДНА дія «Замовити дзвінок» ☐ копі ехоїть hero (закриває коло) ☐ кілька варіантів копі → найсильніший, antislop ☐ solid warm-accent кнопка (контраст з outline вище) ☐ форма мінімальна + PDPL-consent + currentPageLink ([PB_forms_lead_capture](PB_forms_lead_capture)) ☐ smooth fade-rise reveal ☐ мобіл full-width, без магніту.
