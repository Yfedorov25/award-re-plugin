# D_Lusion — lusion.co (ГЛИБИННИЙ РОЗБІР, 100% за схемою v1) ✅
> СВІТОВИЙ ЕТАЛОН. Awwwards Site of the Year, Bristol UK. 3D & Interactive Web Studio.
> Розбір: desktop 1280×660 live. Інженерна глибина — px/токени/clamp/архітектура.

## 1. ТЕХ-СТЕК
- **vanilla + WebGL2, 3 canvas, лише 2 скрипти** — ВЛАСНИЙ движок (THREE/GSAP/Lenis НЕ на window, усе в бандлі).
- **АРХІТЕКТУРА СКРОЛУ (ключове відкриття):** body НЕ скролиться (docHeight=660=1vp). Увесь контент у fixed-контейнері висотою **37949px (~57 екранів)**. Скрол повністю перехоплений движком (wheel/touch → віртуальний прогрес → WebGL-камера + DOM-трансформації через JS, НЕ нативний скрол). Програмний scrollTo не діє.
  → Це фундаментальний патерн топ-3D: DOM статичний/fixed, рух живе в шейдерах за віртуальним прогресом з власною інерцією.
- Прелоадер (важка WebGL-сцена). Лічильник «000000» у футері (preloader counter).

## 2. ДИЗАЙН-ТОКЕНИ (з :root — 32 змінні)
### 2.1 Типографіка
| Роль | Font | Size | Weight | line-height | transform |
|---|---|---|---|---|---|
| H1 hero | Aeonik | 32px | 400 | 35.2px (1.1) | none |
| H2 | Aeonik | 19.2px | 400 | 26.88px (1.4) | none |
| H3 | Aeonik | 38px | 400 | 43.7px (1.15) | none |
| label/body | Aeonik | 14px | 500 | 16.1px | UPPERCASE |
- **Шрифт-стек (точні файли):** Aeonik 400/500/400-italic + IBMPlexMono 400/500 + LusionMono 400.
- Принцип: Aeonik основний (ваги 400/500), моно для технічних підписів. lh щільний 1.1-1.15. Лейбли 14px/500/uppercase.

### 2.2 Палітра (11 токенів з ролями) — «цифрова веселка на ч/б»
- База: black #000, white #fff, off-white #f0f1fa, dark-white #e4e6ef, grey-blue #2b2e3a.
- Акценти RGB: blue #1a2ffb, header #0016ec, red #ff4c41, green #c1ff00, purple #8832f7, magenta #f0f.
- error #e90000. Project-details: інверсія (чорний фон/текст для кейсів).

### 2.3 Сітка й spacing (ТОЧНО)
- **12 колонок:** `--grid-space: calc((100% - 11 * 2vw) / 12)` (11 гаттерів × 2vw).
- Vertical padding секцій: `--base-padding-y: clamp(30px, 4vw, 50px)`.
- Header-size: `clamp(1rem, 1vw, 2rem)`. Cross/icon: `clamp(.875rem, 1vw, 2rem)`.
- vh-токен: `--vh` = 1% реальної висоти (660px → 6.6px).

### 2.4 Форма
- `--global-border-radius: 20px` (єдиний радіус усюди).

## 3. DOM-АРХІТЕКТУРА Й ШАРИ (z-index)
- Шар 1: canvas fixed (фон 3D-сцена, z auto, pointer-events auto).
- Шар 2: fixed DIV-контент 37949px (увесь скрол-контент, трансформується JS).
- Шар 3: overlay canvas z=100 (переходи/частинки поверх).
- UI: z=99 (хедер), z=1000 (меню/оверлеї).
- Кастомний курсор (canvas 45×45 + --cross-size токен).

## 4. ПОЕКРАННА РОЗКАДРОВКА (дослівний копірайт)
### S1 HERO
- H1: «We create 3D visual storytelling and interactive web experiences that help brands stand out» (Aeonik 32px/400).
- Лейбл: «SCROLL TO EXPLORE». Хедер: HOME / ABOUT US / PROJECTS / LABS + «LET'S TALK».
### S2 INTRO / APPROACH
- Великий: «Bold Ideas, Brought to Life».
- Body: «We combine design, motion, 3D, and development to create digital experiences that feel visually striking and technically seamless. From campaign launches to immersive brand worlds, we build work that captures attention and invites interaction.»
- CTA: «OUR APPROACH» + «PLAY REEL».
### S3 FEATURED WORK
- Заголовок «Featured Work». Підзаг: «A SELECTION OF IMMERSIVE DIGITAL EXPERIENCES CREATED FOR AMBITIOUS BRANDS AND FORWARD THINKING TEAMS.»
- Тег-стрічка послуг (kinetic marquee): «CONCEPT • WEB • DESIGN • DEVELOPMENT • 3D • ANIMATION».
- Проєкти (kinetic per-letter reveal, кожна літера в 4 span-дублях для анімації): Oryzo AI, Of The Oak, Devin AI, Porsche: Dream Machine, Synthetic Human, Meta: Spatial Fusion, Space-NFT Marketplace, D2024, ChooChoo World, Soda Experience. Кожен з тегами послуг.
- CTA: «SEE ALL PROJECTS».
### S4 PHILOSOPHY
- «Where Creative Ideas Become Immersive Experiences».
- «We do not chase trends or produce work that looks like everyone else. We focus on creating visually distinctive digital experiences that reflect your brand, engage your audience, and make people remember what they saw.»
### S5 CTA-фінал (kinetic per-letter)
- «STEP INTO A NEW WORLD AND LET YOUR IMAGINATION RUN WILD».
- «IS YOUR BIG IDEA READY TO GO WILD?» → «Let's work together!» (per-letter дубльований).
### S6 FOOTER
- Адреса: Suite 2, 9 Marsh Street, Bristol, BS1 4AA, UK. hello@lusion.co / business@lusion.co.
- «©2026 LUSION Creative Studio. R&D: labs.lusion.co. Built by Lusion with ❤️».
- Page-transition підказка: «KEEP SCROLLING TO LEARN MORE / ABOUT US / NEXT PAGE» + лічильник «000000».

## 5. ПЕРЕХОДИ / РУХ
- **Per-letter kinetic reveal:** заголовки розбиті по літерах, кожна в 4 дублях (span×4) — для покадрової/3D-анімації появи літер. Це сигнатура Lusion.
- **Kinetic marquee** тег-стрічок послуг (нескінченний рух тексту).
- Interactive transition: 0.5s ease (hover-стани лінків/кнопок).
- Page-transition: скрол у футері веде на наступну сторінку (continuous scroll between pages, «NEXT PAGE»).

## 6. НАВІГАЦІЯ
- Хедер: HOME / ABOUT US / PROJECTS / LABS, CTA «LET'S TALK». Меню: MENU/CLOSE (повноекранне, z=1000).

## 7. КОПІРАЙТ-АНАЛІЗ
- Big Idea: «3D visual storytelling + interactive experiences» (продають storytelling, не сайти).
- Позиціонування (onlyness): «We do not chase trends or look like everyone else» — пряма заявка на унікальність.
- Тон: впевнений, артистично-технологічний, заклик до «wild imagination». Архетип Creator/Magician.
- Фірмове: «Bold Ideas, Brought to Life», «STEP INTO A NEW WORLD».

## 8. ЕМОЦІЙНА ПАРТИТУРА
- Hero: інтрига (3D-сцена + scroll to explore). Intro: впевненість. Work: захват (per-letter reveal проєктів = кожен як подія). Philosophy: довіра (ми не як усі). CTA: запал («go wild»).
- Героїчний момент: per-letter kinetic 3D-reveal назв проєктів у WebGL — те, що неможливо повторити без власного движка.

## 9. ВІДТВОРЮВАНІ РЕЦЕПТИ (в базу)
- **Virtual scroll через fixed-контейнер + WebGL-камера** (не нативний скрол) → R-новий (топ-3D архітектура). 🔴 складно.
- **Per-letter kinetic reveal** (split тексту, span-дублі, stagger по літерах) → R23 kinetic-type. 🟡.
- **Kinetic marquee тег-стрічок** послуг → R-простий. 🟢.
- **Один радіус 20px + 12-кол сітка 2vw гаттери + clamp padding** як токен-система → toolbox. 🟢.
- **Інверсія палітри** для проєктних сторінок (чорний фон) → patterns. 🟢.

## 10. ІНЖЕНЕРНИЙ HANDOFF
- Стек для відтворення «справжнього Lusion»: власний WebGL2-движок або R3F + кастомний scroll-hijack (Lenis virtual + ScrollTrigger scrub) + per-letter SplitText. 🔴 високий рівень.
- «Lusion-lite» (досяжно для нас): Next+R3F+Lenis, 1 fixed canvas-фон, DOM-контент поверх з GSAP per-letter reveal + marquee, токени (Aeonik-аналог, 12-кол сітка, radius 20px, RGB-акценти на ч/б). 🟡.
