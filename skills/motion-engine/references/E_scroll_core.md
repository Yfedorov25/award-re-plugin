# ✨ ЕФЕКТИ — Базові scroll/motion (TIER 1, GSAP, без WebGL)
> Будівельні блоки руху. Кожен: що→код→коли. Моделюються за madewithgsap-категоріями.

## E1 — FADE-UP REVEAL (універсальний вхід)
gsap.from(el,{y:60,opacity:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 80%'}})
Коли: поява будь-якого блоку при скролі. Дефолт.

## E2 — STAGGER ХВИЛЯ (список/сітка)
gsap.from('.item',{y:40,opacity:0,duration:1,ease:'power3.out',stagger:0.08,scrollTrigger:{...}})
Коли: картки, послуги, галерея. Крок 0.05-0.15s.

## E3 — PINNED SCROLL (секція залипає, контент змінюється)
ScrollTrigger:{trigger,start:'top top',end:'+=200%',pin:true,scrub:1}
Коли: storytelling, покрокове розкриття, горизонтальний скрол.

## E4 — TEXT SPLIT REVEAL (заголовок по рядках/словах)
SplitText→ gsap.from(lines,{yPercent:100,stagger:0.08,ease:'expo.out',duration:1})
Коли: великі заголовки hero/секцій. Потужний акцент.

## E5 — MARQUEE (нескінченна стрічка)
gsap.to('.track',{xPercent:-50,duration:20,ease:'none',repeat:-1})
Коли: тег-стрічки послуг, лого клієнтів, акцент.

## E6 — MAGNETIC BUTTON (притягання до курсора)
on mousemove: gsap.to(btn,{x:dx*0.3,y:dy*0.3,duration:0.4}); leave→{x:0,y:0}
Коли: ключові CTA. Мікровзаємодія преміуму.

## E7 — IMAGE MASK REVEAL (clip-path шторка)
gsap.from(img,{clipPath:'inset(100% 0 0 0)',duration:1.2,ease:'expo.out',scrollTrigger:{...}})
Коли: поява зображень/медіа. Театрально.

## E8 — PARALLAX (різна швидкість шарів)
gsap.to(layer,{yPercent:-30,ease:'none',scrollTrigger:{scrub:true}})
Коли: глибина, фон vs контент.

## E9 — STICKY STACK (картки накладаються при скролі)
кожна картка position:sticky; top зростає; scale/opacity по scrub.
Коли: послуги/кейси як колода.

## E10 — COUNTER (цифри-докази накручуються)
gsap.from(num,{textContent:0,snap:{textContent:1},duration:2,scrollTrigger:{...}})
Коли: статистика, докази (Федорів).

## ІНСТРУМЕНТ: GSAP core+ScrollTrigger+SplitText + Lenis. Усе 🟢 без WebGL.
