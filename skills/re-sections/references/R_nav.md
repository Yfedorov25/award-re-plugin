# 🍳 RECIPE — NAV / НАВІГАЦІЯ (sticky, реагує на скрол)
> Усі 7 еталонів. Глобальний елемент. ERA sticky-header, Lusion hamburger-overlay.

## 1. ПРИЗНАЧЕННЯ
Орієнтація без відволікання. Має «знати», де користувач (ховатись/показуватись на скрол).

## 2. НОРМИ
- 3-6 пунктів (Lusion: Home/About/Projects/Labs + CTA). Лого ліворуч, меню/CTA праворуч.
- Висота: 60-90px desktop.

## 3. СТРУКТУРА
```html
<header class="nav"> <!-- fixed; mix-blend-mode:difference (опц, читається на будь-якому фоні) -->
  <a class="nav__logo">Brand</a>
  <nav class="nav__links"><a>Work</a><a>About</a><a>Contact</a></nav>
  <a class="nav__cta">Let's talk</a>
  <button class="nav__burger"> <!-- mobile --> </button>
</header>
```

## 4. ТИПОГРАФІКА: 13-15px, weight 500, uppercase або none, ls +0.02em.

## 5. АНІМАЦІЯ (критерій: nav реагує на скрол)
- **Hide-on-scroll-down / show-on-up:** translateY -100%↔0, 0.4s power2.out.
- Зменшення/фон при скролі: прозорий→з фоном після 50px.
- Links hover: underline-draw (scaleX 0→1) або колір-морф.
- Mobile: burger→full-overlay меню (stagger пунктів).
- mix-blend-mode:difference щоб лого читалось на світлому й темному.

## 6. КОД
```js
let last=0
ScrollTrigger.create({onUpdate:s=>{const y=s.scroll()
  if(y>last&&y>100)gsap.to('.nav',{yPercent:-100,duration:0.4})
  else gsap.to('.nav',{yPercent:0,duration:0.4}); last=y}})
```

## 7-8. Тап-зони ≥44px mobile. Overlay-меню зі stagger. 🟢.
