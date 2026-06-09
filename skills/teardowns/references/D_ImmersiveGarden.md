# D_ImmersiveGarden — immersive-g.com (ГЛИБИННИЙ РОЗБІР, 100% за схемою v1) ✅
> СВІТОВИЙ ЕТАЛОН + НАЙВАЖЛИВІШИЙ ДЛЯ НАС: Nuxt + WebGL2 (фреймворк, НЕ власний движок) = те, що ми реально повторимо на Next+R3F.
> Paris. Awwwards-студія. Клієнти: Louis Vuitton, Cartier, Dior, OMEGA, Longines. Розбір desktop 1280×712 live.

## 1. ТЕХ-СТЕК ★ (наш орієнтир)
- **Nuxt + WebGL2 (Three) + GSAP, 8 canvas, лише 2 скрипти.** Фреймворк + WebGL = ДОСЯЖНО нам (R3F-аналог).
- Lenis=false (GSAP ScrollSmoother/власний скрол). docHeight=712=1vp → virtual scroll (body не скролиться).
- 8 canvas = 1 великий фоновий (1280×712, absolute) + 7 мікро (30×30, іконки/курсор у WebGL).
- **Архітектура:** ОДИН постійний WebGL-фон обслуговує весь сайт; секції-сцени змінюються всередині нього (persistent canvas + scene swapping). Це ключовий патерн — не новий canvas на секцію, а одна сцена, що морфить.

## 2. ДИЗАЙН-ТОКЕНИ
### 2.1 Типографіка — антиква домінує (editorial-розкіш)
| Роль | Font | Size | Weight | line-height |
|---|---|---|---|---|
| H1 hero | PSTimes | 39px | 400 | 43px (1.1) |
| body | PSTimes | 20px | 400 | 28px (1.4) |
| link | PSTimes | 20px | 400 | 28px |
- **PSTimes (антиква) СКРІЗЬ** — навіть у body (рідкісно! зазвичай body=гротеск). Це сильна editorial-заявка: антиква = культура, спадщина, розкіш.
- + HelveticaNeue Regular/Light (допоміжний гротеск для UI). Файли: PSTimes-Regular.woff2 + HelveticaNeue-Regular.woff2.
- 0 :root CSS-токенів — дизайн-система в Nuxt/Vue scoped-компонентах, не CSS-змінних.

### 2.2 Палітра
- База світла #e8e8e8 (тепло-сіра). Темний текст. Мінімалізм (колір дає WebGL-сцена, не CSS).

## 3. DOM-АРХІТЕКТУРА Й ШАРИ
- 1 фоновий canvas (absolute, повна сцена) + DOM-контент поверх (текст у DOM, на відміну від AT — тому SEO ок) + 7 мікро-canvas (іконки).
- Гібрид: WebGL-фон-зірка + DOM-текст делікатно поверх (fade-ієрархія).

## 4. ПОЕКРАННА РОЗКАДРОВКА (копірайт дослівно)
### S1 HERO: «Innovative / digital / experiences / studio» (4 рядки, PSTimes 39px) + «Scroll down» + «Click to enable sound» (аудіо як AT).
### S2 INTRO-маніфест: «Transcend anything seen or felt before...» (трансценденція).
### S3+ PORTFOLIO (кожен проєкт = 1 поетичне речення-запрошення з дієсловом занурення):
- LV VIA: «Explore our collaboration with Louis Vuitton on VIA... first digital trunk.»
- Cartier: «Discover Cartier's End of Year: redefining elegance... Above the Clouds.»
- Dior: «Step into an exquisite 3D journey through Dioriviera...»
- OMEGA, Longines, Girard-Perregaux, крипто (GLEEC/Hatom). Усі — «Step into / Dive into / Discover / Explore / Uncover».
### FOOTER: inquiries@immersive-g.com, 14 avenue Claude Vellefaux Paris 75010, соцмережі.

## 5. ПЕРЕХОДИ / РУХ ★ (виміряно наживо)
- **Двополюсний темп:** 1.9s × 54 (драматичні появи/сцени) + 0.25s × 104 (UI/мікро). Між ними майже нічого.
- **opacity-домінанта** (з retrofit: 182×) — DOM-елементи делікатно проявляються через fade, щоб не конкурувати з WebGL-фоном. Fade-ієрархія.
- easing: ease-in-out (для 1.9s симетрично-плавно) + easeOutQuart.
- Емоція: 1.9s = кінематографічно повільно, fade = делікатно. Розкіш через стриманість DOM + багатство WebGL.

## 6-8. КОПІРАЙТ / ЕМОЦІЯ
- Big Idea: «Innovative digital experiences studio». Маніфест: «Transcend anything seen or felt before» (трансценденція — обіцяє небачене).
- Кожен кейс — запрошення в подорож (дієслова занурення). Архетип Magician/Creator.
- Аудіо (Click to enable sound) = іммерсія (як AT). Емоція: занурення в люкс-світ.
- Героїчний момент: WebGL-фон зі стихіями (rocks/fish/reliefs/plaster) + 1.9s reveal антиквою = «входиш у живий світ бренду».

## 9. ВІДТВОРЮВАНІСТЬ (як це зроблено й чи повторимо) ★★★ НАЙВАЖЛИВІШЕ ДЛЯ НАС
### Ассети (з network — точно як радив AT):
- **Геометрія: Draco-стиснена .glb** (`bg_low_draco.glb`, `reliefs_high_compressed.glb`, `fish.glb`, `footer_compressed.glb`).
- **Текстури: KTX2** (GPU-стиснені: `rocks_normal.ktx2`, `normal_05.ktx2`, `normal_06.ktx2`) + matcap (`matcap-6.png`) + PBR (`plaster.jpg`, `roughness.jpg`, `black-dust.webp`).
- Тобто IG = Three + Draco + KTX2 + matcap — стандартний R3F-стек! Усе це є в drei.

### Чи повторюється — 🟡 ДОСЯЖНО НАМ (на відміну від Lusion/AT):
- **Persistent WebGL-фон + scene swapping** → R3F `<Canvas>` один на весь сайт (fixed), сцени через роутинг/scroll-стан. drei: `useGLTF` (Draco), `KTX2Loader`, `matcapMaterial`. 🟡.
- **Антиква в body + WebGL-фон + fade DOM поверх** → чистий CSS + R3F фон. 🟢-🟡.
- **Двополюсний рух 1.9s/0.25s** → GSAP: контентні появи 1.9s ease-in-out, UI 0.25s. 🟢.
- **Аудіо-іммерсія** → Howler.js. 🟢.
- **Оптимізація ассетів Draco+KTX2** → gltf-pipeline (Draco) + `@gltf-transform` (KTX2) у білд-пайплайні. Це те, ЩО РОБИТЬ 3D плавним. 🟡 (вимагає налаштування пайплайну, але не власного движка).

### АЛЬТЕРНАТИВА якщо 3D задорого:
- Pre-rendered відео WebGL-сцени (Blender) як фон + DOM-текст поверх з GSAP 1.9s fade. Дає 80% враження IG без real-time Three. 🟢.

## 10. ІНЖЕНЕРНИЙ HANDOFF (НАШ ОСНОВНИЙ ШАБЛОН для emotional-ніш)
- (B) «Досяжний аналог» = фактично НАШ цільовий стек:
  - **Next + R3F + drei + GSAP ScrollTrigger** (+ Lenis virtual scroll).
  - 1 persistent `<Canvas>` фон (fixed), сцени морфлять за scroll-станом.
  - Ассети: Blender → Draco .glb (`useGLTF`) + KTX2 текстури (`KTX2Loader`) + matcap матеріали. Higgsfield для текстур/HDRI якщо треба.
  - Типо: антиква-display (PSTimes-аналог: PP Editorial New / Migra) + гротеск UI.
  - Рух: GSAP 1.9s ease-in-out контент + 0.25s UI, opacity-fade DOM (не конкурувати з фоном).
  - Аудіо: Howler. Текст у DOM (SEO!), не в canvas.
  - 🟡 реально за 3-4 тижні. ЦЕ НАШ ЕТАЛОННИЙ СТЕК для emotional/luxury/agency проєктів.
- Ключовий висновок: IG доводить, що award-3D рівня Louis Vuitton досяжний на Nuxt/Next+Three+Draco+KTX2 — БЕЗ власного движка. Це наш стеля-орієнтир, реалістичний.

---
## [ДОПОВНЕННЯ v1.1] МОБІЛЬНА ПЕРЕБУДОВА (390px) + обмеження зонда
- При resize вікна до 390px сайт **підвисав** (CDP timeout) — важкий WebGL переналаштовує 8 canvas під новий viewport. Сам по собі сигнал: IG не легкий на слабких пристроях, мобільна продуктивність — виклик навіть для топ-студії.
- Внутрішній viewport лишався 1280 навіть при вузькому вікні — натяк, що сайт може скейлити сцену, а не робити класичну responsive-перебудову breakpoint'ами. (Потребує перевірки на реальному пристрої.)
- Hamburger-меню в DOM не знайдено за стандартними класами — нав може бути у WebGL або з'являтись по-іншому.
- **Урок для нас:** важкий persistent-WebGL = ризик мобільної продуктивності. У нашому стеку ОБОВ'ЯЗКОВО: на мобільному вимикати/спрощувати 3D (reduced quality або статичний фон), окремі breakpoint'и для типографіки, реальний тест на середньому Android. Не копіювати «desktop-3D на всіх пристроях».
- ОБМЕЖЕННЯ ЗОНДА: повний поекранний мобільний скрін IG не знятий через підвисання. Для сайтів, що це дозволяють, мобільний знімаємо повністю.
