# 🍳 RECIPE — CTA-ФІНАЛ (заклик до дії)
> Lusion «go wild», Cuberto «Have an idea?», ERA «request a call». Останній поштовх.

## 1. ПРИЗНАЧЕННЯ
Конвертувати накопичену емоцію в дію. Великий заголовок-запрошення + 1 чітка дія. Найвища емоція сайту.

## 2. НОРМИ
- Заголовок: 2-6 слів, великий («Have an idea?», «Let's work together»). 
- 1 CTA (макс 2). Email/кнопка.
- Висота: 1vh (часто повний екран для драми).

## 3. СТРУКТУРА
```html
<section class="cta">
  <h2 class="cta__title">Have an idea?</h2>
  <a class="cta__btn magnetic">Let's talk →</a>
  <span class="cta__mail">hello@brand.com</span>
</section>
```

## 4. ТИПОГРАФІКА
- Заголовок: НАЙБІЛЬШИЙ на сайті, clamp(48px,10vw,160px), display, lh 0.95, ls -0.03em. Монументально.
- Кнопка: 16-18px, weight 500, з стрілкою.

## 5. АНІМАЦІЯ
- Заголовок: text-split reveal (E4) по словах, expo.out, on scroll-in.
- **Магнітна кнопка (E6, критерій 27):** притягання до курсора 0.3 сили.
- Стрілка → рухається на hover.
- Emotion: великий текст + магнітна кнопка = «зроби крок», тактильно.

## 6. КОД
```js
// magnetic
btn.addEventListener('mousemove',e=>{const r=btn.getBoundingClientRect();
  gsap.to(btn,{x:(e.clientX-r.left-r.width/2)*0.3,y:(e.clientY-r.top-r.height/2)*0.3,duration:0.4})})
btn.addEventListener('mouseleave',()=>gsap.to(btn,{x:0,y:0,duration:0.4,ease:'elastic.out(1,0.3)'}))
```

## 7-8. Анти-слоп на заголовок. Мобільний: магніт→прибрати, кнопка full-width. 🟢.
