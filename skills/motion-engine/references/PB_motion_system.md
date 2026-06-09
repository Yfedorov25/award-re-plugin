# 📘 ПЛЕЙБУК — MOTION-СИСТЕМА (рух award-рівня)
> Рух = головний award-сигнал після типографіки. З 9 розборів + 4 підтвердження easing-токенів.

## 1. РОЛЬ: точний рух перетворює статичний дизайн на «живий, дорогий». Недбалий рух = дешево навіть при гарній статиці.

## 2. ФУНДАМЕНТ — EASING-БІБЛІОТЕКА як токени (must-have!):
4 з 4 award-R3F-студій тримають Penner-криві як `--ease-*`. КОПІЮЙ у :root:
```css
:root{
  --ease-out-quad:cubic-bezier(0.25,0.46,0.45,0.94);   /* ДЕФОЛТ усього */
  --ease-out-cubic:cubic-bezier(0.215,0.61,0.355,1);
  --ease-out-quart:cubic-bezier(0.165,0.84,0.44,1);
  --ease-out-expo:cubic-bezier(0.16,1,0.3,1);          /* драматичні появи (Cuberto) */
  --ease-out-circ:cubic-bezier(0.075,0.82,0.165,1);    /* дуже плавне гальмо (NK) */
  --ease-in-out-quart:cubic-bezier(0.77,0,0.175,1);
  --ease-back-out:cubic-bezier(0.175,0.885,0.32,1.275);/* з «перельотом», грайливо */
}
```
GSAP: ease:'power2.out'(=quad), 'expo.out', 'circ.out', 'back.out(1.7)'.

## 3. ШКАЛА ТРИВАЛОСТЕЙ (під роль):
- UI/мікро (hover, toggle): 0.2-0.4s.
- Контентні появи: 0.8-1.2s (Cuberto 1.2, NK 0.6).
- Драматичні (hero/luxury reveal): 1.5-3s (ERA 3s, IG 1.9s).
- Marquee/infinite: 15-25s linear.
НЕ роби все 0.3s (мертво) і не все 2s (повільно дратує). Темп під нішу (див. дерево).

## 4. ДЕРЕВО ТЕМПУ (під нішу):
- Luxury/RE → повільно 1.5-3s, ease-out-expo/circ. Розкіш не поспішає.
- B2B/SaaS → швидко 0.2-0.5s, Material/quad. Ефективність.
- Агенція/креатив → виразно 0.8-1.2s, expo.out. Майстерність.
- Gaming/bold → енергійно 0.5-0.8s. Драйв.
- Арт → рівний 0.5s. Споглядання.

## 5. STAGGER (хвиля, не разом):
- Крок 0.05-0.15s між сусідами. Прогресивний (+0.05s, 14islands) = органічно.
- `gsap.from('.item',{y:40,opacity:0,duration:1,ease:'expo.out',stagger:0.08})`.
- Розшарований (transform і opacity з різним delay, Cuberto) = жвавіше.

## 6. ПРАВИЛА (з A1):
- Усе на transform+opacity (не top/left/width — лагає). GPU.
- Scroll-reveal на in-view (ScrollTrigger start:'top 80%'), не на load (крім hero).
- Smooth-scroll Lenis обов'язково (lerp 0.08-0.12).
- 1 героїчний момент на секцію, решта стримана.
- prefers-reduced-motion: вимкнути/спростити (accessibility + проф).
- Hover: scale 1.02-1.05, 0.3-0.4s, не миттєво.

## 7. КОД (база проєкту):
```js
import Lenis from 'lenis'; import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger'; gsap.registerPlugin(ScrollTrigger)
const lenis=new Lenis({lerp:0.1}); 
lenis.on('scroll',ScrollTrigger.update);
gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)
// reduced motion
if(matchMedia('(prefers-reduced-motion:reduce)').matches){gsap.globalTimeline.timeScale(100)}
```

## 8. ПОМИЛКИ ДЖУНІОРА: linear/ease на контенті · все 0.3s · нема stagger · анімація top/left/width · reveal на load (стрибає) · нема Lenis · нема reduced-motion · все рухається одразу · миттєвий hover.

## 9. ПРИКЛАДИ: Cuberto 1.2s expo×50; ERA 3s reveal; IG 1.9s+0.25s двополюс; NK 0.6s; 14islands прогресивний stagger; Parallel 0.5s рівний.

## 10. ЧЕК: ☐ easing-токени в :root ☐ темп під нішу ☐ stagger хвилею ☐ transform/opacity only ☐ scroll-reveal in-view ☐ Lenis ☐ reduced-motion ☐ hover з рухом ☐ 1 герой-момент/секція.
