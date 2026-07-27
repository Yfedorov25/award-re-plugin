# 🍳 RECIPE — ABOUT / PROCESS + ЦИФРИ-ДОКАЗИ
> ERA (цитати/імена), NK («since 2003»). Олюднення + докази (Федорів).

## 1. ПРИЗНАЧЕННЯ
Хто ми, чому довіряти. Емоція: довіра + людяність. Докази через цифри/роки/імена.

## 2. НОРМИ
- Текст: 1-3 абзаци по 90-200 знаків. Цифри-докази: 3-4 (рік заснування, к-ть проєктів/клієнтів, %).
- Висота: 1-2vh.

## 3. СТРУКТУРА
```html
<section class="about">
  <p class="about__lead">1-2 sentences manifesto.</p>
  <div class="about__stats">
    <div><span class="num">2003</span><span class="lbl">since</span></div>
    <div><span class="num">380+</span><span class="lbl">projects</span></div>
  </div>
</section>
```

## 4. ТИПОГРАФІКА
- Lead-текст: clamp(20px,2.5vw,40px), display або великий гротеск, lh 1.3 (читається як заява).
- Цифри: display великий clamp(40px,6vw,96px), weight 400. Лейбли: 12px uppercase muted.

## 5. АНІМАЦІЯ
- Lead: text-split reveal по словах/рядках (E4).
- Цифри: counter-накрутка (E10) on scroll-in. 2s, ease-out.
- Emotion: цифри, що «ростуть» = відчуття масштабу/доказу.

## 6. КОД
```js
gsap.from(num,{textContent:0,snap:{textContent:1},duration:2,ease:'power2.out',scrollTrigger:{trigger:'.about__stats',start:'top 80%'}})
```

## 7-8. Цифри РЕАЛЬНІ (Федорів: докази). Не вигадані. 🟢.
