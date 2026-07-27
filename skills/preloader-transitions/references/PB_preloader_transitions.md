# 📘 ПЛЕЙБУК — ПРЕЛОАДЕР + ПЕРЕХОДИ (перша й між-сторінкова емоція)
## 1. РОЛЬ: прелоадер = перша емоція (ритуал входу). Page-transition = відчуття «єдиного досвіду», не набору сторінок.
## 2. ТИПИ ПРЕЛОАДЕРА: лічильник 0-100 (Lusion «000000») · маска-розкриття (curtain) · лого-морф (DrawSVG). ТИПИ ПЕРЕХОДУ: curtain/wipe · shared-element (Flip) · fade · колір-морф секцій.
## 3. ПОБУДОВА ПРЕЛОАДЕРА: 1) overlay на весь екран → 2) лічильник/маска/лого (1.5-3s) → 3) curtain-вихід (yPercent-100) → 4) hero входить одразу (overlap -0.3). Тільки для емоційних ніш; B2B/SaaS — мінімальний/none.
## 4. ПОБУДОВА PAGE-TRANSITION: Barba.js / View Transitions API / Next router + GSAP. curtain закриває→нова сторінка→відкриває. Або Flip shared-element (зображення «летить» з картки в hero).
## 5. НОРМИ: прелоадер 1.5-3s (не довше — дратує). Transition 0.6-1s.
## 6. КОД:
```js
const tl=gsap.timeline()
tl.to('.pre__num',{textContent:100,snap:{textContent:1},duration:2,ease:'power1.inOut'})
  .to('.preloader',{yPercent:-100,duration:1,ease:'expo.inOut'})
  .from('.hero__title',{yPercent:100,duration:1,ease:'expo.out'},'-=0.3')
// Flip shared-element:
const state=Flip.getState('.card-img'); /*DOM-зміна*/ Flip.from(state,{duration:0.8,ease:'expo.inOut',absolute:true})
```
## 7. ПОМИЛКИ: прелоадер >3s (дратує) · прелоадер на утилітарному сайті (зайве) · різкі page-переходи (рве досвід) · фейк-лічильник без сенсу.
## 8. ПРИКЛАДИ: Lusion лічильник 000000+curtain; AT WebGL-переходи; Flip shared-element між сторінками.
## 9. МОБІЛЬНИЙ: прелоадер коротший, transitions простіші (curtain/fade).
## 10. ЧЕК: ☐ прелоадер для емоційних ніш ☐ ≤3s ☐ hero входить одразу після ☐ page-transition безшовний ☐ утилітарним — мінімум.

## + ВАРІАНТ: ПРЕЛОАДЕР-ВХІД з вибором звуку (storytelling/іммерсив)
- Екран входу: «enter with sound / enter without sound» + лічильник 0-100% (Ten Years Away, AT, IG).
- Дає контроль аудіо одразу (для іммерсивних з музикою) + ритуал входу в досвід.
- Коли: storytelling, графічні новели, бренд-досвіди з аудіо. НЕ для утилітарних.
- Лічильник може нести сенс (роки/число теми), не просто 0-100.
