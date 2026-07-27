# R_text_scroll_fill — двотоновий заголовок, що «заливається» на скролі
> Великий заголовок: частина слів уже ЧОРНІ, решта СІРІ; сірі стають чорними по мірі входу в в'юпорт.
> Джерело: findrealestate.com (Cuberto). Тека: library/recipes/. Стек: GSAP + ScrollTrigger (+SplitText або ручний split).

## КОЛИ ВЖИВАТИ
- Великі бренд/маніфест-заяви (hero-сусіди, «навіщо ми», цінності). 1 на секцію — це акцент, не для абзаців тексту.
- RE, бренд, продукт, агенції. Дає відчуття «текст оживає / читається разом зі мною».

## ПРИНЦИП
1. Розбити заголовок на слова (або символи) в окремі `<span>`.
2. Базовий колір слів — світло-сірий (`--muted`).
3. ScrollTrigger зі `scrub` прив'язує прогрес скролу до кількості «залитих» у чорний слів (stagger).
4. Анімуємо ЛИШЕ `color` (нуль reflow). Кегль великий, трекінг від'ємний.

## КОД (GSAP + ScrollTrigger, ванільний split)
```html
<h2 class="fill" >It's about identity. Progress. You're looking for alignment.</h2>
```
```css
.fill{font:700 clamp(32px,5vw,93px)/1.0 "Instrument Sans",sans-serif;letter-spacing:-.02em;max-width:18ch;}
.fill .w{color:#b9b9b9;transition:none;will-change:color;}
```
```js
gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll('.fill').forEach(el=>{
  // split на слова, зберігаючи пробіли
  el.innerHTML = el.textContent.trim().split(/(\s+)/).map(t=>
    /\s+/.test(t) ? t : `<span class="w">${t}</span>`).join('');
  const words = el.querySelectorAll('.w');
  gsap.to(words,{
    color:'#151717', stagger:1, ease:'none',
    scrollTrigger:{ trigger:el, start:'top 80%', end:'top 35%', scrub:true }
  });
});
```
- Lenis: працює поверх — додай `lenis.on('scroll', ScrollTrigger.update)` і `gsap.ticker.add(t=>lenis.raf(t*1000))`.

## ВАРІАЦІЇ
- **Per-char** замість per-word (щільніше, для коротких хедлайнів).
- **Opacity-fill** (0.25→1) замість color — на темному тлі.
- **Reveal-mask** (clip-path/overflow:hidden + translateY) для першої появи + fill на скролі поверх.

## JUNIOR-ПОМИЛКИ
- Анімувати `opacity` всього блоку (втрачаєш ефект послівного «оживання»).
- `scrub:true` без `end` → стрибки; задавай вікно start/end.
- Розбивати на слова через `innerHTML=...replace(' ')` без збереження множинних пробілів/пунктуації — ламає кернінг.
- Дрібний кегль — ефект не читається; це для ВЕЛИКИХ заяв.
- Забути `will-change:color` → мерехтіння на слабких GPU.

## ЧЕКЛИСТ
- [ ] Великий кегль (≥32px моб / ≥64px деск), від'ємний трекінг.
- [ ] Слова в span, базовий колір muted, will-change:color.
- [ ] ScrollTrigger scrub з вікном start/end, stagger.
- [ ] Анімується лише color/opacity (нуль reflow).
- [ ] 1 такий заголовок на секцію.
