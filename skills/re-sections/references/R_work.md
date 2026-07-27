# 🍳 RECIPE — WORK / ПРОЄКТИ (серце сайту-агенції/портфоліо)
> Найбільша секція. З замірів Cuberto (6.2vh — найбільша) / 14islands / NK.

## 1. ПРИЗНАЧЕННЯ
Докази майстерності. Емоція: захват + довіра. Кожен кейс = подія. Головна конверсійна секція для агенцій/портфоліо.

## 2. НОРМИ КОНТЕНТУ (заміри)
- Кількість кейсів: 4-10 (Cuberto 12, 14islands багато, NK 7). Для лендингу 3-4.
- Назва проєкту: 1-4 слова. Опис-результат: 30-80 знаків («Punto Pago – First Super-App in LatAm»).
- Тег категорії: 1-2 слова (Luxury/Web3/Fintech — патерн 14islands/NK).
- Висота секції: 3-6vh (велика, кейси крупні).

## 3. СТРУКТУРА (2 варіанти)
**Варіант A — вертикальний список крупних карток (Cuberto/NK):**
```html
<section class="work">
  <h2 class="work__title">Featured projects</h2>
  <a class="work__item"> <!-- крупна, full-width або 2-col -->
    <div class="work__media"><img/video></div>
    <div class="work__meta"><h3>Project name</h3><span class="tag">Category</span><p>Result 30-80ch</p></div>
  </a> <!-- ×N -->
</section>
```
**Варіант B — тег-список рядками (14islands):** компактні рядки name+category, hover розкриває прев'ю.

## 4. ТИПОГРАФІКА
- Назва проєкту H3: display, clamp(24px,3vw,48px), weight 400-500, lh 1.1, ls -0.02em.
- Тег: 11-13px uppercase, ls +0.05em, weight 500, у «пігулці» або просто.
- Опис: 14-16px, muted-колір.

## 5. АНІМАЦІЯ
- Поява карток: stagger fade-up (E2), крок 0.08-0.1s, 1s, power3.out, on scroll-in-view.
- **Hover картки (критерій 29):** image scale 1.0→1.05 (0.6s ease), overlay-fade, назва translateX 8px або колір-морф. Курсор-слово «View» (опц.).
- Альтернатива: image mask-reveal (E7) при вході.
- Emotion: кожна картка «дихає» при наведенні = живий, дорогий.

## 6. КОД-СКЕЛЕТ
```js
// поява
gsap.from('.work__item',{y:60,opacity:0,duration:1,ease:'power3.out',stagger:0.1,
  scrollTrigger:{trigger:'.work',start:'top 70%'}})
// hover (на кожну картку)
item.addEventListener('mouseenter',()=>gsap.to(item.querySelector('img'),{scale:1.05,duration:0.6,ease:'power2.out'}))
item.addEventListener('mouseleave',()=>gsap.to(item.querySelector('img'),{scale:1,duration:0.6}))
```

## 7. ІНСТРУМЕНТ: GSAP ScrollTrigger. Зображення webp/avif, lazy. Відео-прев'ю muted/loop.
## 8. ЧЕКИ: опис-результат не «красивий проєкт», а ЩО дав (Федорів-докази). Мобільний: 1 колонка, hover→tap. 🟢 повністю.
