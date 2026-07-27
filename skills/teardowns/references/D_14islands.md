# D_14islands — 14islands.com (ГЛИБИННИЙ РОЗБІР, 10/10 за схемою v1) ✅
> СВІТОВИЙ ЕТАЛОН + НАШ ТОЧНИЙ СТЕК: Next + React + R3F + Lenis. Stockholm/Reykjavík.
> Клієнти: Cartier, United Nations, Google, Breakthrough Energy. Розбір desktop 1280.

## 1. ТЕХ-СТЕК ★★★ (буквально наш цільовий)
- **Next + React + WebGL2 + Lenis, 16 скриптів.** R3F підтверджено через **leva-токени** (`--leva-*` у :root — Leva це GUI-дебагер, що йде в парі ТІЛЬКИ з React Three Fiber). Це прямий доказ: award-студія будує на Next+R3F+Lenis = наш план валідний 1:1.
- **Home тримає легкість:** головний 3D-canvas неактивний (300×150 дефолт), hero використовує **відео .mp4**, не real-time 3D. Важкий R3F — на внутрішніх кейсах. УРОК: навіть R3F-студія на home кладе відео заради швидкості, 3D показує в проєктах.

## 2. ДИЗАЙН-ТОКЕНИ (112 :root) ★★★
### 2.1 EASING-БІБЛІОТЕКА як токени (16+ кривих — ПЕРЕЙМАЄМО 1:1) — золото
Повний Penner-набір як CSS-змінні (професійний підхід — easing = дизайн-токен):
- --ease-quad-in-out: cubic-bezier(0.455,0.03,0.515,0.955)
- --ease-quad-out: cubic-bezier(0.25,0.46,0.45,0.94)  ← наш дефолт індустрії (easeOutQuad)
- --ease-quad-in: cubic-bezier(0.55,0.085,0.68,0.53)
- --ease-cubic-in-out: cubic-bezier(0.645,0.045,0.355,1)
- --ease-cubic-out: cubic-bezier(0.215,0.61,0.355,1)
- --ease-cubic-in: cubic-bezier(0.55,0.055,0.675,0.19)
- --ease-quart-out: cubic-bezier(0.165,0.84,0.44,1)
- --ease-quart-in: cubic-bezier(0.895,0.03,0.685,0.22)
- --ease-quint-in-out: cubic-bezier(0.86,0,0.07,1)
- --ease-expo-out: cubic-bezier(0.19,1,0.22,1)  ← expo (як Cuberto)
- --ease-expo-in: cubic-bezier(0.95,0.05,0.795,0.035)
- --ease-sine-in-out: cubic-bezier(0.445,0.05,0.55,0.95)
- --ease-back-out: cubic-bezier(0.175,0.885,0.32,1.275)  ← з «перельотом» (грайливі появи)
- --ease-back-in: cubic-bezier(0.6,-0.28,0.735,0.045)
- --ease-back-in-out: cubic-bezier(0.68,-0.55,0.265,1.55)
- --ease-back-out-more: cubic-bezier(0.56,0.91,0.465,1.65)  ← сильніший переліт
→ ЦЕ ГОТОВА СИСТЕМА для нашого motion-system.md. Копіюємо як `--ease-*` змінні в кожен проєкт.

### 2.2 Типографіка
| Роль | Font | Size | Weight | lh | ls |
|---|---|---|---|---|---|
| H3 (проєкти) | AftenScreen | 23.7px | 400 | 30.8px (1.3) | -0.95px |
| H1/нав | BentonSans | 16px | 400 | normal | normal |
| body/UI | BentonSans | 12px | 400 | 16.8px (1.4) | normal |
- Шрифти: AftenScreen(+Italic) display + BentonSans (gротеск UI/body) + Inter fallback. Файли: BentonSans-Regular.woff2, AftenScreen.woff.
- Дрібний UI (12px) — скандинавський мінімалізм, контент-зірка.

### 2.3 Кольори: тематична система (--color-beige-theme-*) — сайт перемикає теми (beige та ін.).

## 3. DOM-АРХІТЕКТУРА
- Next SSR DOM (SEO-friendly, текст у DOM) + R3F canvas точково. Lenis smooth-scroll. Leva для дебагу шейдерів (у проді лишилась — підказка, що активно тюнять 3D).

## 4. ПОЕКРАННА РОЗКАДРОВКА (копірайт дослівно)
### S1 HERO: «Lovable Products / from vision to launch» (емоційне «lovable» + повний цикл). Sub: «WE WORK CLOSELY WITH OUR CLIENTS TO CREATE OUTSTANDING EXPERIENCES FOR THEIR AUDIENCES.»
### S2 SERVICES/WORK: тег-система ніш (кожен проєкт = назва + категорія): Cartier(Luxury), Poly AI(AI), Neko(Healthtech), Breakthrough Energy + UN(Sustainability), Galxe/Hatom/Flipside(Web3), Primer(Fintech), JustFoodForDogs/Oyyo/Krepling(Ecommerce), Google Interland(Education), безліч Gaming/AR-VR. Діапазон ніш величезний.
### S3 ABOUT: «14islands designs and builds digital products, brands, and experiences — offices in Stockholm and Reykjavík.» + «OUR TEAM FOSTERS AN INCLUSIVE CULTURE OF CRAFT, COLLABORATION, AND CREATIVITY.»

## 5. ПЕРЕХОДИ / РУХ ★ (виміряно)
- Домінанта 0.3s × 63 (UI швидко) + 0.4s × 13.
- **Прогресивний stagger-ланцюг:** `1.25s/0.5s → 1.3s/0.55s → 1.35s/0.6s → 1.4s/0.65s → 1.45s/0.7s` — кожен елемент +0.05s тривалості І +0.05s другої властивості. Каскадна хвиля з подвійним наростанням (delay+duration).
- Easing з токен-бібліотеки (quad-out дефолт, back-out для грайливих).
- Емоція: чисто, скандинавськи стримано, але з теплою хвилею stagger.

## 6-8. КОПІРАЙТ / ЕМОЦІЯ
- Big Idea: «Lovable Products» (емоційне слово в центрі — не «digital products», а «lovable»). Позиція: vision→launch (повний цикл).
- Тег-система ніш = демонстрація широти без хвастощів. Архетип Creator+Everyman (craft+inclusive).
- Тон: теплий-професійний, «craft, collaboration, creativity». Скандинавська стриманість.
- Героїчний момент: stagger-хвиля проєктів + перемикання тем + точкові R3F-сцени в кейсах.

## 9. ВІДТВОРЮВАНІСТЬ ★★★ (наш стек — майже все 🟢-🟡)
- **Easing-токен-бібліотека:** 🟢 копіюємо 16 `--ease-*` змінних 1:1 у :root. Найцінніший трофей — готова система.
- **Прогресивний stagger (+0.05s крок):** 🟢 GSAP stagger:{each:0.05} або ланцюг delay. Наш R04.
- **Next+R3F+Lenis:** 🟡 наш цільовий стек, leva для дебагу шейдерів (npm i leva).
- **Home=відео, 3D в кейсах:** 🟢 стратегія легкості — mp4 hero + R3F точково. ПЕРЕЙМАЄМО (швидкий home, важкий 3D глибше).
- **Тематична система (--color-X-theme-*):** 🟢 CSS-змінні з префіксом теми + перемикач.
- **Тег-система портфоліо (проєкт+ніша):** 🟢 дані-структура.

## 10. ІНЖЕНЕРНИЙ HANDOFF (НАШ ЕТАЛОННИЙ СТЕК)
- Стек 1:1: Next + React + R3F + drei + Lenis + GSAP + leva(dev). Це фактично наш план.
- Токени: скопіювати easing-бібліотеку (16 кривих) як `--ease-*`. Display(AftenScreen-аналог: PP Neue Montreal/Cabinet Grotesk) + BentonSans-аналог(Inter/Geist) UI. Тематична палітра.
- Рух: 0.3s UI + прогресивний stagger 0.05s крок, easeOutQuad дефолт, back-out для грайливих.
- Стратегія: home легкий (відео hero), R3F-сцени в кейсах. SSR для SEO.
- 🟡 реально — це і є наш базовий award-стек для tech/agency/product. НАЙБЛИЖЧИЙ орієнтир для копіювання.

## [МОБІЛЬНИЙ] — за обмеженням зонда (resize не дає істинний viewport): нав має hamburger, SSR-DOM адаптивний. Точні мобільні px — потребують реального девайса.
