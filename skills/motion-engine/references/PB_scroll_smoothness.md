# 📘 ПЛЕЙБУК — ІНЖЕНЕРІЯ ПЛАВНОСТІ СКРОЛУ (чому текст «не пливе» + швидкість)
> Найважливіший технічний плейбук. Пояснює ПРИЧИНУ враження «дорого/чітко/гладко» на топ-сайтах (Elva, Son Daven). Це інженерія, не магія.
> Заміряно наживо: Son Daven (Lenis+GSAP+792 split-вузли+34 will-change), Elva (кастомний transform-scroll, body overflow:hidden).

## 1. ЧОМУ ТЕКСТ «ПЛИВЕ» У ДЖУНІОРА (корінь проблеми):
- Анімують властивості, що викликають REFLOW/REPAINT: top/left/margin/width/height/font-size. Браузер перераховує layout щокадру → «желе», лаг, текст «пливе».
- Нема GPU-шарів → анімація на CPU → ривки.
- Нативний скрол + важкі reveal → конфлікт, «гумовий» ефект.
- Subpixel-рендер тексту під час transform без backface/translateZ → «розмазування».
РІШЕННЯ: анімувати ТІЛЬКИ transform+opacity (GPU-композитні, не чіпають layout) + готувати шари will-change.

## 2. ТРИ СТОВПИ ПЛАВНОСТІ (з замірів топ-сайтів):
### СТОВП 1 — SMOOTH-SCROLL рушій (керована інтерполяція, не нативний скрол)
- **Lenis** (Son Daven: html.lenis) — інтерполює позицію скролу (lerp), синхронізує з rAF. Дає «вагу» й гладкість.
- АБО кастомний transform-scroll (Elva: body overflow:hidden + контент рухається matrix-translate через rAF). Складніше, але повний контроль.
- Рекомендація: **Lenis** (простіше, перевірено). Кастом — тільки для особливих ефектів.
### СТОВП 2 — GPU-КОМПОЗИТИНГ (чому текст НЕ пливе)
- Анімовані елементи: `will-change: transform` (Son Daven: 34/60 елементів!) — браузер заздалегідь виносить на окремий GPU-шар.
- Анімувати ВИКЛЮЧНО `transform` (translate/scale/rotate) + `opacity`. НІКОЛИ top/left/width/margin/font-size.
- `transform: translateZ(0)` або `translate3d` — форсує GPU-шар (Elva: matrix-translate).
- `backface-visibility: hidden` на тексті — прибирає subpixel-«розмазування» при русі.
### СТОВП 3 — SCROLLTRIGGER синхронізація (рух прив'язаний до скролу, не до часу)
- GSAP ScrollTrigger + Lenis з'єднані: `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add(t=>lenis.raf(t*1000))`.
- scrub:1 — анімація ПРИВ'ЯЗАНА до позиції скролу (не грає по таймеру) → відчуття «контролю», гладкість.

## 3. ПОКРОКОВА ПОБУДОВА ПЛАВНОГО СКРОЛУ:
1) Підключи Lenis (lerp 0.08-0.12; менше=важче/повільніше, більше=жвавіше).
2) З'єднай Lenis+GSAP ticker (код нижче) — ОДИН rAF-цикл на всі (не два конкуруючі).
3) gsap.ticker.lagSmoothing(0) — вимкни авто-згладжування лагу (дає консистентність).
4) Усі reveal-анімації: тільки transform+opacity.
5) На анімовані елементи: will-change:transform ПЕРЕД анімацією, ПРИБРАТИ після (will-change постійно = з'їдає пам'ять!).
6) Split-text: розбити заголовки на символи/слова (SplitText), кожен span — окремий transform.
7) prefers-reduced-motion: вимкнути smooth-scroll+split.

## 4. КОД (еталонний setup — з Son Daven):
```js
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
lenis.on('scroll', ScrollTrigger.update)              // синхрон скролу й тригерів
gsap.ticker.add((t) => lenis.raf(t * 1000))           // ОДИН rAF-цикл
gsap.ticker.lagSmoothing(0)

// reveal БЕЗ «пливання» — тільки transform+opacity, з will-change cleanup
gsap.utils.toArray('.reveal').forEach((el) => {
  gsap.set(el, { willChange: 'transform, opacity' })   // готуємо GPU-шар
  gsap.from(el, {
    yPercent: 100, opacity: 0, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 85%' },
    onComplete: () => gsap.set(el, { willChange: 'auto' })  // ПРИБИРАЄМО після
  })
})
```
```css
/* текст не «розмазується» при русі */
.reveal, .char { backface-visibility: hidden; transform: translateZ(0); }
.line-wrap { overflow: hidden; }   /* маска для per-line reveal */
@media (prefers-reduced-motion: reduce){ html.lenis{ scroll-behavior:auto } }
```

## 5. SPLIT-TEXT (чому заголовки виглядають «продумано», Son Daven 792 вузли):
- Розбити H1/H2 на рядки→слова→символи (GSAP SplitText або власний JS).
- Кожен рядок у wrapper `overflow:hidden`, символи/слова виїжджають yPercent 100→0 з-під маски.
- Stagger 0.02-0.05s між символами / 0.05-0.08s між словами.
- ease кастомний (Son Daven --ease-write cubic-bezier(0.333,0,0.667,1)).
- Результат: текст «складається» елегантно, не блимає цілим блоком.

## 6. ПАРАМЕТРИ ПЛАВНОСТІ (з замірів):
- Lenis lerp: 0.08-0.12 (Son Daven ~0.1).
- will-change на 30-50% анімованих елементів (Son Daven 34/60). НЕ на всіх (пам'ять).
- scrub: 1 (плавна прив'язка) для pin-секцій.
- 60fps ціль: жодних layout-властивостей в анімації.

## 7. ПОМИЛКИ ДЖУНІОРА (через що «пливе» й лагає):
- Анімація top/left/margin/width/height/font-size (REFLOW щокадру) → желе.
- Нема smooth-scroll рушія (голий нативний + reveal = гумово).
- will-change на ВСІХ елементах постійно (з'їдає RAM, тормозить).
- Два rAF-цикли (Lenis свій + GSAP свій, не з'єднані) → конфлікт, мікро-лаги.
- Reveal по таймеру (duration) замість scrub при скролі → рве синхрон.
- Split-text без overflow:hidden масок → символи блимають.
- Нема backface-visibility → текст «розмазується» субпікселями.
- font-size анімація замість scale (reflow).

## 8. ПРИКЛАДИ (заміряно):
- **Son Daven:** Lenis + GSAP ScrollTrigger + 792 split-вузли + 34/60 will-change:transform + 5 easing-токенів (--ease-write для тексту). Еталон «текст не пливе».
- **Elva:** body overflow:hidden + кастомний transform-scroll (matrix-translate через rAF) + object-fit відео. Повний контроль позиції, нативний скрол вимкнено.
- ERA: data-reveal-duration=3000, Locomotive smooth-scroll.

## 9. МОБІЛЬНИЙ: Lenis smoothTouch=false (нативний тач плавніший за інтерпольований на тачі), спростити split (слова не символи), will-change обережно (мобільна RAM), 3D-шари мінімум.

## 10. ЧЕК ПЛАВНОСТІ: ☐ smooth-scroll рушій (Lenis) ☐ ОДИН rAF-цикл (Lenis+GSAP з'єднані) ☐ lagSmoothing(0) ☐ анімація ТІЛЬКИ transform+opacity ☐ нуль layout-властивостей ☐ will-change перед+cleanup після ☐ backface-visibility:hidden на тексті ☐ split-text у overflow:hidden масках ☐ scrub для pin ☐ 60fps перевірено ☐ reduced-motion.

## + ВАРІАНТ: НАТИВНА CSS-ПЛАВНІСТЬ без бібліотек (з Novu)
- award-скрол досяжний БЕЗ Lenis/GSAP — на нативному CSS scroll-driven animations:
```css
@supports (animation-timeline: scroll()){
  .reveal{ animation: revealUp linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
  @keyframes revealUp{ from{ opacity:0; transform:translateY(60px) } to{ opacity:1; transform:none } }
}
```
- Переваги: нуль JS-бандла на анімацію, нативна 60fps плавність, простота.
- Коли нативний CSS: прості reveal/parallax, сучасні браузери (з @supports fallback).
- Коли Lenis/GSAP: складна оркестрація (pin, scrub, split-text, послідовності), потрібен контроль.
- ВАЖЛИВО: нативний smooth-scroll (html{scroll-behavior} НЕ дає Lenis-«ваги») — для тієї «ваги» все одно Lenis. Але reveal-анімації можна на CSS.
