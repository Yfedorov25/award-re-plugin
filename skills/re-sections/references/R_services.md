# 🍳 RECIPE — SERVICES / ПОСЛУГИ (що ми робимо)
> З замірів Cuberto/Zera (3 пакети). Ясність пропозиції.

## 1. ПРИЗНАЧЕННЯ
Що клієнт отримає. Емоція: ясність + впевненість. Часто продуктизація в 3 пакети (Zera: Website&Design/Growth/3D).

## 2. НОРМИ
- 3-7 послуг АБО 3 пакети-рівні. Назва: 1-3 слова. Опис: 40-100 знаків.
- Висота: 2-3vh.

## 3. СТРУКТУРА (3 варіанти)
- A: сітка карток 3-кол (послуги).
- B: список-акордеон (клік розкриває — max-height+opacity, Zera-патерн).
- C: 3 пакети-колонки з ціною/фічами (продуктизація).
```html
<section class="services">
  <h2>Our services</h2>
  <div class="services__grid"> <!-- 3 col -->
    <div class="service"><span class="num">01</span><h3>Name</h3><p>Desc 40-100ch</p></div>
  </div>
</section>
```

## 4. ТИПОГРАФІКА
- Назва H3: clamp(20px,2vw,32px), weight 500, lh 1.2.
- Нумерація 01/02: моно-шрифт, muted (технічна точність).
- Опис: 14-16px lh 1.5.

## 5. АНІМАЦІЯ
- Stagger-поява карток (E2), 0.08s крок.
- Акордеон (варіант B): max-height 0→auto + opacity, 0.5s power2.inOut (Zera-рух easeOutQuint).
- Hover картки: фон-зсув, рамка, або num-акцент.

## 6. КОД
```js
gsap.from('.service',{y:40,opacity:0,duration:0.9,ease:'power3.out',stagger:0.08,scrollTrigger:{trigger:'.services',start:'top 75%'}})
// акордеон: toggle clip/height через gsap.to(panel,{height:'auto',duration:0.5,ease:'power2.inOut'})
```

## 7-8. GSAP. Нумерація 01/02 додає «системності» (критерій 5). Мобільний: 1 кол. 🟢.
