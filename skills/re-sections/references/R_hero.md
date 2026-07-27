# 🍳 РЕЦЕПТИ TIER 1-2 — структура + перший зразок (HERO)
> Кожен рецепт = готове креслення секції для Claude Code: норми тексту + структура + точна анімація + код + інструмент.
> Стек: Next/HTML + GSAP + Lenis (+ R3F опційно для TIER 2). БЕЗ важкого WebGL.

## ШАБЛОН РЕЦЕПТА (для кожного типу секції):
1. ПРИЗНАЧЕННЯ (роль у воронці, яка емоція)
2. НОРМИ КОНТЕНТУ (символи/слова/елементи — з реальних замірів)
3. СТРУКТУРА (DOM-розмітка, сітка, vh)
4. ТИПОГРАФІКА (розміри clamp, ваги, lh, ls)
5. АНІМАЦІЯ (що→коли→як: тривалість, easing, stagger, тригер) + emotion
6. КОД-СКЕЛЕТ (GSAP, готовий)
7. ІНСТРУМЕНТ (бібліотеки, recipe-залежності)
8. АНТИ-СЛОП (копірайт-чек), МОБІЛЬНИЙ, ВІДТВОРЮВАНІСТЬ

═══════════════════════════════════════════════
## RECIPE H — HERO-СЕКЦІЯ (TIER 1) ✅ зразок
═══════════════════════════════════════════════

### 1. ПРИЗНАЧЕННЯ
Перший екран. Емоція за 3 секунди + Big Idea + один шлях далі (scroll/CTA). Найважливіша секція.

### 2. НОРМИ КОНТЕНТУ (з замірів Cuberto/14islands/NK/ERA)
- Заголовок (H1): **3-6 слів, 30-50 знаків.** (Cuberto 35/5, ERA «PLACE OF ART» 3, NK «North Kingdom» 2.)
- Підзаголовок: 1 речення, **80-120 знаків.** (Cuberto 99.)
- CTA: 1-2 максимум, дієслово (2-4 слова). Часто + «scroll to explore».
- Висота: **100vh** (повний екран) або 0.7-0.8vh (Cuberto короткий).
- Елементів у кадрі: 3-5 (заголовок, підзаг, CTA, лейбл, медіа). Не більше.

### 3. СТРУКТУРА
```html
<section class="hero"> <!-- min-height:100vh; flex column; justify center -->
  <span class="hero__label">label / scroll hint</span>
  <h1 class="hero__title">Big Idea 3-6 words</h1>
  <p class="hero__sub">One sentence, 80-120 chars.</p>
  <a class="hero__cta">Verb CTA</a>
</section>
```
- Сітка: контент у 12-кол (як Lusion calc((100%-11*2vw)/12)) або max-width 1200-1440 + бічні clamp(20px,5vw,80px).

### 4. ТИПОГРАФІКА
- H1: display-шрифт, `clamp(40px, 7vw, 120px)`, weight 400-500, **lh 0.95-1.0** (щільний, як Cuberto 1.0 / ERA 0.93), **ls -0.02em до -0.04em** (від'ємний трекінг великих).
- Підзаг: гротеск, `clamp(16px, 1.4vw, 20px)`, lh 1.4, ls 0 або +0.01em.
- Лейбл: 12-14px, uppercase, weight 500, ls +0.05em.

### 5. АНІМАЦІЯ (Cuberto-патерн — виміряно)
- Послідовність входу (на load, stagger): лейбл 0s → H1 0.1s → підзаг 0.2s → CTA 0.3s.
- Кожен: fade-up `opacity 0→1` + `translateY 40-60px→0`.
- Тривалість: **1.2s**, easing **expo.out `cubic-bezier(0.16,1,0.3,1)`**.
- H1 додатково: можна per-line/per-word reveal (SplitText) — кожен рядок clip-path inset(100% 0 0 0)→inset(0).
- Emotion: швидкий виліт + довге елегантне осідання = «впевнено, дорого».

### 6. КОД-СКЕЛЕТ (GSAP)
```js
import gsap from 'gsap'
const tl = gsap.timeline({ defaults:{ duration:1.2, ease:'expo.out' }})
tl.from('.hero__label',{ y:30, opacity:0 })
  .from('.hero__title',{ y:60, opacity:0 }, 0.1)
  .from('.hero__sub',  { y:40, opacity:0 }, 0.2)
  .from('.hero__cta',  { y:40, opacity:0 }, 0.3)
// per-line title (потужніше):
// import SplitText; new SplitText('.hero__title',{type:'lines'})
// tl.from(lines,{yPercent:100, stagger:0.08, ease:'expo.out', duration:1},0)
```
+ Lenis для smooth-scroll глобально:
```js
import Lenis from 'lenis'; const lenis=new Lenis(); 
function raf(t){lenis.raf(t);requestAnimationFrame(raf)} requestAnimationFrame(raf)
```

### 7. ІНСТРУМЕНТ
- GSAP (core + SplitText для per-line) + Lenis. БЕЗ WebGL.
- Медіа-фон (опц.): відео .mp4 (Higgsfield/Kling), не real-time 3D (урок 14islands/NK home=відео).

### 8. ЧЕКИ
- АНТИ-СЛОП: H1 проходить банлист (нуль em-dash, нуль кліше, тест Федоріва).
- МОБІЛЬНИЙ: H1 clamp вниз до 40px, vh→svh (мобільний бар), CTA на всю ширину, stagger швидший.
- ВІДТВОРЮВАНІСТЬ: 🟢 повністю (GSAP+Lenis). За години.

═══════════════════════════════════════════════
## ПЛАН РЕШТИ РЕЦЕПТІВ (наступні):
- RECIPE W — WORK/PROJECTS (велика секція, 6 екранів, картки, hover-reveal)
- RECIPE S — SERVICES (список, stagger-поява, акордеон)
- RECIPE A — ABOUT (текст + статистика, scroll-reveal)
- RECIPE C — CTA-фінал (великий заголовок, магнітна кнопка)
- RECIPE N — NAV (sticky, ховається на скрол, мобільний бургер)
- RECIPE F — FOOTER (контакти, marquee, великий лого)
- + ефект-рецепти: marquee, parallax-text, image-mask-reveal, sticky-stack, magnetic-button, horizontal-scroll, infinite-loop, counter, drag-gallery.
