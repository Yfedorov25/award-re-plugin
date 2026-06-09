# 📘 ПЛЕЙБУК — ПОБУДОВА HERO-СЕКЦІЇ (майстер-клас від нуля до award)
> Як збудувати hero, що за 3 сек дає Big Idea + 1 шлях далі. Найважливіша секція сайту.

## 1. ЩО ЦЕ + РОЛЬ
Перший екран. Завдання: (а) миттєво передати суть/емоцію, (б) дати Big Idea, (в) один чіткий шлях далі (scroll/CTA). За 3 сек людина має зрозуміти «що це і чи моє».

## 2. ТИПИ HERO (обери під ціль) ★
| Тип | Вигляд | Коли | Приклад-еталон |
|---|---|---|---|
| **Centered statement** | заголовок по центру, мінімум | бренд/маніфест, сила в слові | ERA «PLACE OF ART», Parallel «Parallel universe» |
| **Split (текст+медіа)** | текст ліво, медіа право | продукт/послуга, треба показати | SaaS-лендинги |
| **Asymmetric editorial** | зміщений заголовок, сітка | агенція/портфоліо, редакторськість | Lusion, 14islands |
| **Video/media-ffull** | відео на весь екран + текст поверх | емоція/luxury/спектакль | IG, NK (showreel) |
| **Type-hero (типографіка-зірка)** | гігантський текст = весь екран | сміливий бренд, типографіка | NK FKDisplay 95px, Cuberto 72px |
| **Manifesto (теза+підтеза)** | довший заголовок-думка | B2B/консалтинг, складна цінність | Lumena «Humanizing Performance» |

## 3. ПОКРОКОВА ПОБУДОВА (від нуля)
**Крок 1 — обери тип** (дерево рішень нижче) під ціль/нішу.
**Крок 2 — застав висоту й сітку:**
- Висота: `min-height: 100svh` (svh, не vh — мобільний бар!). Емоційні = повний екран; утилітарні можуть 0.7-0.85.
- Сітка: 12-кол `calc((100% - 11*2vw)/12)` або max-width 1440 + бічні `clamp(20px,5vw,80px)`. Контент вирівняти за сіткою (не «на око»).
**Крок 3 — типографічна шкала hero:**
- H1: display-шрифт, `clamp(40px, 7vw, 120px)` (тип-hero до 160px), weight 300-500, **lh 0.95-1.05** (щільний!), **ls -0.02em…-0.04em** (від'ємний). Це 80% «дорогого» вигляду.
- Підзаголовок: гротеск, `clamp(16px,1.4vw,20px)`, lh 1.4, муто-колір.
- Лейбл/scroll-hint: 12-14px uppercase, ls +0.05em, weight 500.
**Крок 4 — копірайт** (через анти-слоп):
- H1: 2-6 слів (centered/type коротше; manifesto довше 8-13 слів). Big Idea, не опис.
- Підзаг: 1 речення 80-120 знаків — хто+кому+що або емоційне поглиблення.
- CTA: 1 дієслово (2-4 слова). + scroll-hint.
**Крок 5 — послідовність входу (load):**
- Stagger: лейбл 0s → H1 0.1s → підзаг 0.2s → CTA 0.3s. Кожен fade-up (y:40-60→0, opacity 0→1).
- Тривалість 1.0-1.2s, easing `expo.out cubic-bezier(0.16,1,0.3,1)`.
- Сильніше: H1 per-line reveal (SplitText, yPercent 100→0 з-під маски, stagger 0.08).
**Крок 6 — фон:**
- Відео (.mp4/.webm, muted/loop, poster) — найкраще для емоції, легше за 3D (урок 14islands/NK).
- АБО статичне зображення (webp, cover) + легкий parallax/scale.
- АБО колір/градієнт + типографіка-зірка.
- НЕ real-time 3D на home без потреби (важко мобільному).
**Крок 7 — мобільна перебудова:** H1 clamp вниз до 36-40px, split→стек (текст над медіа), CTA full-width, svh, stagger швидший (0.05s).
**Крок 8 — чек по критеріях** (нижче).

## 4. ДЕРЕВО РІШЕНЬ (який тип обрати)
- Складна цінність B2B/консалтинг → **Manifesto**.
- Бренд/luxury, сила в ідеї → **Centered statement** (+відео-фон якщо є).
- Продукт/SaaS, треба показати інтерфейс → **Split**.
- Агенція/портфоліо/студія → **Asymmetric editorial** або **Type-hero**.
- Емоція/спектакль/є відео → **Video-full**.
- Сміливий бренд, шрифт як ідентичність → **Type-hero**.

## 5. ТОЧНІ ПАРАМЕТРИ (з норм 8 сайтів)
H1: 2-6 слів / 17-50 знаків. clamp(40px,7vw,120px). lh 0.95-1.05. ls -0.02…-0.04em. weight: 300 (вишукано REF) / 400 (ERA/Parallel) / 500 (Cuberto/NK).
Підзаг: 80-120 знаків. Вхід: stagger 0.1s, fade-up 1.2s expo.out.

## 6. КОД-СКЕЛЕТИ
```js
// БАЗОВИЙ вхід (будь-який тип)
const tl=gsap.timeline({defaults:{duration:1.2,ease:'expo.out'}})
tl.from('.hero__label',{y:30,opacity:0})
  .from('.hero__title',{y:60,opacity:0},0.1)
  .from('.hero__sub',{y:40,opacity:0},0.2)
  .from('.hero__cta',{y:40,opacity:0},0.3)
// TYPE-HERO per-line (потужніше):
const split=new SplitText('.hero__title',{type:'lines',linesClass:'line'})
// wrap кожен .line у overflow:hidden
tl.from(split.lines,{yPercent:100,stagger:0.08,duration:1,ease:'expo.out'},0)
// VIDEO-f<background>: <video autoplay muted loop playsinline poster=...> + overlay для контрасту тексту
```

## 7. ТИПОВІ ПОМИЛКИ ДЖУНІОРА (НЕ роби)
- lh 1.4 на H1 (має 0.95-1.05). Розхлябано.
- Дефолтний шрифт / маленький H1 (32px). Нема контрасту = дешево.
- Усе входить одночасно (нема stagger). Мертво.
- 5+ елементів у hero (перевантаження). Має 3-5.
- Заголовок-опис замість Big Idea («Ласкаво просимо на сайт компанії»).
- vh замість svh (мобільний бар ріже).
- Real-time 3D де досить відео (лагає).
- Нема scroll-hint (людина не знає що далі).

## 8. РЕАЛЬНІ ПРИКЛАДИ (з D-розборів)
- ERA: centered, Decart 171px/lh0.93/uppercase, 3s reveal, відео-рендер фон. Luxury.
- Cuberto: editorial, Suisse 72px/lh1.0/ls-0.72, fade-up 1.2s expo, кастом-курсор.
- NK: type-hero, FKDisplay 95px, відео-showreel фон, темна #050311.
- Lumena: manifesto, «Humanizing Performance» 9 слів, кремова база, моно-підзаг.
- Parallel: centered, Haval 120px + light body 200, рівний 0.5s рух.

## 9. МОБІЛЬНИЙ: H1 36-40px, split→стек, CTA full-width, svh, рух швидший. Тап-зони ≥44px.

## 10. ЧЕК (A1-критерії для hero):
☐ H1 контраст ≥4:1 до body ☐ display≠body шрифт ☐ lh 0.95-1.05 ☐ від'ємний трекінг ☐ stagger-вхід ☐ expo/quad easing ☐ Big Idea не опис ☐ 1 чіткий CTA+scroll-hint ☐ svh ☐ 3-5 елементів ☐ фон легкий (відео/img не 3D) ☐ анти-слоп пройдено.
