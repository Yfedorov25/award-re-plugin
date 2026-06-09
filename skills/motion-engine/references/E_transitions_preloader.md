# ✨ ЕФЕКТИ — Переходи сторінок + прелоадер (глобальні)
> Критерії A1: 24 (переходи секцій), 31 (прелоадер як ритуал). Перша й між-сторінкова емоція.

## ПРЕЛОАДЕР (критерій 31 — перша емоція)
Типи (з еталонів):
- **Лічильник 0→100** (Lusion «000000») — поки вантажиться, цифри біжать. Класика.
- **Маска-розкриття** — суцільний колір/лого, тоді clip-path/curtain догори відкриває сайт.
- **Лого-морф** — лого збирається/малюється (DrawSVG), тоді зникає.
Код (curtain):
```js
const tl=gsap.timeline()
tl.to('.preloader__num',{textContent:100,snap:{textContent:1},duration:2,ease:'power1.inOut'})
  .to('.preloader',{yPercent:-100,duration:1,ease:'expo.inOut'})
  .from('.hero__title',{yPercent:100,duration:1,ease:'expo.out'},'-=0.3') // hero входить одразу
```
Норма: 1.5-3s. Не довше (бо дратує). Тільки для емоційних ніш; утилітарним — мінімальний/none.

## ПЕРЕХІД МІЖ СЕКЦІЯМИ (критерій 24 — континуальність)
- Колір-морф фону при скролі (секція А світла → Б темна, плавно через scrub).
- Overlap: наступна секція «наповзає» (pin + наступна йде поверх).
- Continuous: Lenis робить безшовним; уникати різких стрибків.

## ПЕРЕХІД МІЖ СТОРІНКАМИ (критерій: page-transition)
- **Curtain/wipe:** клік → панель закриває екран → нова сторінка → панель відкриває. (Barba.js / View Transitions API / Next router + GSAP).
- **Shared element:** зображення проєкту «летить» з картки у hero нової сторінки (Flip plugin).
- Код (Flip — найвразливіший award-прийом):
```js
const state=Flip.getState('.card-img')
// навігація / DOM-зміна
Flip.from(state,{duration:0.8,ease:'expo.inOut',absolute:true})
```

## ІНСТРУМЕНТ: GSAP (timeline, Flip, DrawSVG), Barba.js або View Transitions API, Lenis. Без WebGL.
## ВІДТВОРЮВАНІСТЬ: прелоадер+curtain 🟢; Flip shared-element 🟡 (потужно); page-transition 🟡.
