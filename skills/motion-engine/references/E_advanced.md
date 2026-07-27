# ✨ ЕФЕКТИ — Просунуті (TIER 1-2, GSAP, без важкого WebGL)
> Award-прийоми з madewithgsap-категорій. Кожен 🟢-🟡.

## E11 — HORIZONTAL SCROLL (вертикальний скрол рухає горизонтально)
ScrollTrigger pin + gsap.to(track,{x:()=>-(track.scrollWidth-innerWidth),scrub:1})
Коли: галерея проєктів, таймлайн, кроки. Сильний award-ефект.

## E12 — TEXT MASK / CLIP REVEAL по рядках
SplitText lines → кожен у overflow:hidden wrapper → yPercent 100→0, stagger 0.08
Коли: великі заголовки. «Рядки виїжджають з-під маски». Сигнатура (ERA/Lusion).

## E13 — IMAGE PARALLAX всередині рамки (scale+translate)
img у overflow:hidden; gsap.to(img,{yPercent:-15,scale:1.15,scrub:true})
Коли: фото в картках/секціях. Глибина без 3D.

## E14 — SCROLL-DRIVEN ЛІЧИЛЬНИК/прогрес
прогрес-бар або номер секції міняється по scroll-прогресу.
Коли: довгі сторінки, орієнтація.

## E15 — HOVER DISTORTION (CSS-фейк без WebGL)
clip-path/skew/scale на hover, або CSS filter. Псевдо-рідина.
Коли: картки, кнопки. Дешева заміна WebGL-дисторшну.

## E16 — STICKY SECTION TITLE (заголовок залипає поки контент скролиться)
title position:sticky top:0 поки секція в в'юпорті.
Коли: розділи з багатьма елементами під спільним заголовком.

## E17 — REVEAL ON DRAG (drag-галерея)
Draggable (GSAP) + inertia. Перетягувані картки/слайди.
Коли: портфоліо-галерея, колекція. Інтерактив (Lusion «drag to explore»).

## E18 — LINE DRAW (SVG self-drawing)
stroke-dasharray анімація по scroll. Лінії/підкреслення/мапи малюються.
Коли: схеми, маршрути, акценти, SVG-карти (наш RE-патерн).

## E19 — TEXT SCRAMBLE / typewriter
ScrambleText plugin або посимвольна поява.
Коли: hero-акцент, технічний/gaming вайб.

## E20 — INFINITE MARQUEE з velocity (швидкість від скролу)
marquee, що прискорюється від швидкості скролу (scroll velocity → x speed).
Коли: тег-стрічки. Реактивність = живість.

## ІНСТРУМЕНТ: GSAP core+ScrollTrigger+SplitText+Draggable+ScrambleText+DrawSVG (Club plugins). Lenis. Без WebGL.
