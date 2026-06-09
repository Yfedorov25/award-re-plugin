# 📘 ПЛЕЙБУК — ПОКАЗ МОБІЛЬНОГО ДОДАТКА (телефон + функції всередині, прийом Elva)
> Як показати застосунок так, щоб людина ЗРОЗУМІЛА функції за секунди. Геніальність Elva: функції живуть В телефоні, синхронно з текстом-поясненням.
> Заміряно: Elva — .mainflow-mobile__phone з <video> (об'єкт-fit:contain), функції = відео в рамці.

## 1. РОЛЬ: для app/SaaS показати продукт = показати ЯК ВІН ВИГЛЯДАЄ В ДІЇ. Телефон-мокап з живим екраном = «я вже бачу як користуюсь». Найсильніша конверсія для додатків.

## 2. ГОЛОВНИЙ ІНСАЙТ (чому Elva геніальна):
Не статичний скрін, не список фіч текстом, а: **рамка телефону + ВІДЕО функції всередині + текст-пояснення синхронно збоку/під ним**. Людина читає «Elva picks the clips» і ОДНОЧАСНО бачить це на екрані телефону. Показ+розповідь разом = миттєве розуміння.

## 3. ТИПИ ПОКАЗУ ДОДАТКА (обери):
| Тип | Як | Коли |
|---|---|---|
| **Телефон + відео-екран** (Elva) | рамка + mp4 функції всередині | головний — демо в дії |
| **Sticky-телефон + скрол-фічі** | телефон залипає, текст-фічі скроляться, екран міняється | багато функцій по черзі |
| **Scroll-scrub екран** | скрол гортає екрани додатка в телефоні | покроковий флоу |
| **Карусель скрінів** | свайп екранів | галерея фіч |
| **Hover-фічі** | наведення на фічу → екран міняється | desktop, інтерактив |

## 4. ГЕНІАЛЬНА ПРОСТОТА ELVA (як насправді зроблено — заміряно):
- Телефон-рамка + екран = ОДНЕ ВІДЕО mp4 (1_1_m.mp4, object-fit:contain). Дизайнер рендерить готове відео телефону з анімованими функціями.
- Сайт просто вставляє <video muted loop playsinline>. НУЛЬ складного коду інтерфейсу.
- Чому геніально: уся складність (UI, анімації функцій) — у відео (контроль дизайнера), а не в крихкому веб-коді. Швидко, надійно, виглядає ідеально.
- Альтернатива (складніше): рамка телефону CSS/PNG + реальний HTML-екран всередині (інтерактивно, але дорого).

## 5. ПОКРОКОВА ПОБУДОВА (sticky-телефон + скрол-фічі — найсильніший патерн):
1) Секція висотою 300-400vh (простір для скролу фіч).
2) Телефон — position:sticky, top центрований, лишається на місці поки скролимо.
3) Збоку (desktop) / під (mobile) — блоки-фічі, кожен 100vh, скроляться повз телефон.
4) На зміні фічі (ScrollTrigger): екран телефону міняється (відео seek / зміна mp4 / crossfade скрінів).
5) Текст фічі fade-in коли він навпроти телефону.
6) Прогрес-індикатор (1/4 фічі) опційно.

## 6. КОД (sticky phone + scroll features):
```html
<section class="app-showcase"> <!-- height: 400vh -->
  <div class="phone"> <!-- position:sticky; top:50%; translateY(-50%) -->
    <video class="phone__screen" muted loop playsinline autoplay></video> <!-- або img-екрани -->
  </div>
  <div class="features">
    <div class="feature" data-video="f1.mp4">Feature 1 text</div>
    <div class="feature" data-video="f2.mp4">Feature 2 text</div>
  </div>
</section>
```
```css
.app-showcase{ position:relative }
.phone{ position:sticky; top:50%; transform:translateY(-50%); will-change:transform }
.phone__screen{ object-fit:contain; border-radius:32px; backface-visibility:hidden }
.feature{ min-height:100vh; opacity:.3; transition:opacity .4s }
```
```js
const screen=document.querySelector('.phone__screen')
gsap.utils.toArray('.feature').forEach((f)=>{
  ScrollTrigger.create({ trigger:f, start:'top center', end:'bottom center',
    onEnter:()=>{ screen.src=f.dataset.video; screen.play(); gsap.to(f,{opacity:1,duration:.4}) },
    onLeave:()=>gsap.to(f,{opacity:.3,duration:.4}),
    onEnterBack:()=>{ screen.src=f.dataset.video; gsap.to(f,{opacity:1}) }
  })
})
```
ELVA-варіант (найпростіший): просто телефон-відео в hero/секції, де відео саме показує функції циклом:
```html
<div class="mainflow-mobile__phone"><video src="demo.mp4" muted loop playsinline autoplay></video></div>
```

## 7. ВІДЕО-ЕКРАН — правила якості:
- muted + loop + playsinline + autoplay (playsinline критично для iOS — інакше fullscreen).
- poster для миттєвого LCP (перший кадр як зображення поки вантажиться).
- object-fit:contain (не обрізати UI) або cover якщо рамка окремо.
- border-radius під екран телефону (32-48px) + backface-visibility:hidden.
- Стиснене відео (webm+mp4 fallback), коротке (5-10с loop), preload=metadata.
- Рамку телефону: або частина відео (Elva), або PNG/CSS поверх.

## 8. ПОМИЛКИ ДЖУНІОРА:
- Статичний скрін замість відео в дії (не видно ЯК працює).
- Список фіч текстом без візуалу (нудно, не зрозуміло).
- Відео без playsinline (на iOS відкриває fullscreen — ламає UX).
- Важке незжате відео (повільний LCP).
- Текст-пояснення НЕ синхронізований з тим, що на екрані (Elva сила саме в синхроні).
- Реальний HTML-екран коли досить відео (зайва складність, крихкість).
- Нема poster (порожній телефон поки вантажиться).

## 9. ПРИКЛАДИ (заміряно):
- **Elva:** .mainflow-mobile__phone + video object-fit:contain. Функції = відео в телефоні, текст-пояснення синхронно. «Personal AI director» — і бачиш на екрані як AI монтує. Геніальна простота.
- App Store-стиль сайти: sticky-телефон + скрол-фічі.

## 10. МОБІЛЬНИЙ: телефон менший або full-width, фічі під телефоном (стек), відео легше, sticky обережно (на тачі краще scroll-знімки ніж важкий sticky). ЧЕК: ☐ відео в дії не статика ☐ playsinline+muted+loop ☐ poster ☐ текст синхрон з екраном ☐ object-fit правильний ☐ радіус екрану ☐ стиснене відео ☐ мобільна перебудова.

## + ВАРІАНТ 2 PHONE-MOCKUP: рамка-PNG + UI-відео + маска (з Bevel Health)
- Структура: контейнер → рамка-PNG (тільки корпус телефону, прозорий екран) → UI-відео ВСЕРЕДИНІ (демо функцій) → clip-маска по формі екрану.
- Відмінність від Elva (все-в-одному-відео): тут рамка й UI РОЗДІЛЕНІ → легко міняти UI-відео без перерендеру рамки, кілька різних демо в одній рамці.
- Код: рамка-img position поверх, UI-video під ним з border-radius+overflow:hidden (маска).
```css
.phone{ position:relative }
.phone__frame{ position:absolute; inset:0; z-index:2; pointer-events:none } /* PNG корпус */
.phone__ui{ position:absolute; inset:4%; border-radius:38px; overflow:hidden; z-index:1 } /* відео-екран */
.phone__ui video{ width:100%; height:100%; object-fit:cover }
```
- Коли Elva-спосіб (все в відео): простіше, 1 файл, для одного демо. Коли Bevel-спосіб (рамка+UI окремо): гнучкіше, кілька демо, зміна UI без рамки.
- Health/fintech app: додати PRIVACY-секцію (знімає страх за дані) + соц-доказ рано (X members).
