# 📘 ПЛЕЙБУК — SCROLL-ХОРЕОГРАФІЯ (як контент живе при скролі)
## 1. РОЛЬ: скрол = головна взаємодія. Хореографія появ/переходів = відчуття «живого, продуманого».
## 2. ТИПИ СКРОЛ-ПОДІЙ: reveal-on-enter · pin+scrub (секція залипає) · parallax (різні швидкості) · horizontal-scroll · sticky-stack (картки колодою) · progress-driven (лічильник/морф).
## 3. ПОБУДОВА: 1) Lenis глобально (lerp 0.1) → 2) кожна секція: reveal на in-view (start 'top 80%') → 3) ключові секції: pin+scrub для storytelling → 4) фон: parallax → 5) герой-моменти: horizontal/sticky-stack → 6) reduced-motion fallback.
## 4. ДЕРЕВО: проста сторінка→reveal+parallax; storytelling→pin+scrub; галерея→horizontal-scroll; послуги/кейси→sticky-stack; дані→progress counter.
## 5. ПРАВИЛА: reveal на in-view не на load. scrub:1 (плавно прив'язано до скролу). Не pin усе (1-2 ключові). Continuous (Lenis безшовно). 1 герой-скрол-момент на сайт.
## 6. КОД:
```js
// reveal патерн на всі секції
gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{y:60,opacity:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 80%'}}))
// pin+scrub
ScrollTrigger.create({trigger:'.story',start:'top top',end:'+=200%',pin:true,scrub:1})
// horizontal
gsap.to('.track',{x:()=>-(track.scrollWidth-innerWidth),ease:'none',scrollTrigger:{trigger:'.h-section',pin:true,scrub:1,end:'+=2000'}})
```
## 7. ПОМИЛКИ: reveal на load (стрибає) · pin усього (заплутано) · нема Lenis (різко) · parallax на важких елементах (лагає) · нема reduced-motion · все scrub без сенсу.
## 8. ПРИКЛАДИ: ERA sticky mask-reveal+3s; Lusion virtual-scroll WebGL-камера; 14islands прогресивний stagger; IG persistent-фон scene-swap.
## 9. МОБІЛЬНИЙ: спростити pin/horizontal (важко на тач), reveal лишити, parallax зменшити.
## 10. ЧЕК: ☐ Lenis ☐ reveal in-view ☐ scrub плавний ☐ 1-2 pin не все ☐ 1 герой-момент ☐ reduced-motion ☐ мобільний спрощений.
