# D_FindRealEstate — findrealestate.com (РОЗБІР, RE-ПЛАТФОРМА/брокеридж) ✅
> Студія **Cuberto**. Маркетплейс-брокеридж (NYC): Buy/Sell/Rent + Mortgage/PM/Development. Awwwards HM.
> ★ Цінний: ІНШИЙ RE-архетип — не одиничний ЖК, а транзакційна платформа з award-анімацією + сміливий «рух»-голос + recipe двотонового scroll-fill заголовка.

## 1. СТЕК (заміряно)
- **Lenis** (smooth-scroll) + **video hero (1)**, canvas=0 (без WebGL), 20 will-change, **17.7 екранів** (scrollH 11674). Next.js (за Awwwards; глобали обфусковані). Swiper.
- Анімація — scroll-driven (GSAP-патерн ScrollTrigger, навіть якщо мінімізований). Контентний продукт (Search/Agents/Join/Paperwork, reCAPTCHA), не брошура.

## 2. ПЛАВНІСТЬ + ⭐ RECIPE: двотоновий scroll-fill заголовок
- **Прийом-підпис:** великі заяви, де текст іде ЧОРНИЙ + продовження СІРЕ, і сіре «заливається» в чорний у міру скролу (word/char ScrollTrigger на `color`). Приклади наживо: «This isn't just [чорний] about real estate. [сіре]», «You're not just looking for a place. [чорний] You're looking for alignment… [сіре]». → дає відчуття «читання, що оживає».
- Темп: **0.9s ×26 (домінанта — великі появи) + 0.3s ×21 (UI) + 0.4s/0.8s комбо**. Повільніше за luxury-RE (0.5s) — кінематографічні манери. (+ 4s loop — відео/маркі.)
- 20 will-change, split (4+, росте) — transform/opacity, нуль reflow.

## 3. ТОКЕНИ
- Типо (редакторська пара): **Instrument Sans** (грос 400/700) + **Lora** (серіф 400/700). H1 «Find What Moves You» — Instrument Sans 700, **93px / lh 93px (1.0) / ls −1.87px**. Впевнений модерн-грос (НЕ luxury-антиква).
- Палітра: світла база + **near-black `#151717` (rgb 21,23,23)** секції (testimonials/CTA) + сірий для незалитого тексту. Чорний pill-CTA. Високий контраст, графічно.

## 4. СТРУКТУРА (платформа: маніфест + функції + пруф)
Hero (відео + «Find What Moves You» + Find Properties/Start Your Search) → Why FIND → **маніфест** «This isn't just about real estate» / «Real Estate, Rewired.» → testimonials «Don't Take Our Word for It» → **How FIND Can Help You** (Buy / Sell / Rent — з пруфом «10,000+ разів») → Support Beyond Buying & Selling (Mortgage · Property Management · Construction & Development) → Blog & Resources → фінал-CTA «Find You. We'll Help You Get There.»

## 6-7. КОПІРАЙТ (★ сміливий «рух»-голос, фрагменти)
- Емоційний хук-вордплей: «**Find What Moves You**» (moves = переїзд + зворушує).
- Анти-корпоратив, маніфест: «This isn't just about real estate», «Real Estate, Rewired.», «It's about identity. Progress. Getting unstuck.», «looking for alignment».
- Спільнота/рух: «**Join The Movement**», «Get Started with FIND».
- Пруф у бенефіті: «Buy smarter…we've done this over 10,000 times», «Sell fast, sell high», «hidden rentals before they hit the market».
- Соц-доказ секцією: «Don't Take Our Word for It».
- CTA активні, імперативні: Start Your Search · Let's Get Started · Discover Our Services.
- Тон: впевнений, прямий, бунтівний-оптимістичний, «ти + ми проти ринку». Прямо «ти/you». ⚠️ англ. вживає «—»; для нашого копі беремо ЕНЕРГІЮ й структуру, не пунктуацію.

## 8. ЕМОЦІЯ: рух уперед, розблокування, впевненість, належність до «руху». Продає трансформацію життя + експертну довіру (не предмет розкоші). Контраст до luxury-стриманості.

## 9. ВІДТВОРЮВАНІСТЬ 🟢 90%
- 🟢 Lenis + ScrollTrigger двотоновий заливний заголовок, грос+серіф пара, графічна near-black палітра, відео-hero, маніфест-секції, pill-CTA, services-сітка з пруфом.
- 🟡 Відео-hero (свій матеріал) + обсяг копірайту (потрібен сильний копірайтер для «руху»-голосу).
- Наш стек: Next + Lenis + GSAP ScrollTrigger (SplitText на `color` для fill) + Swiper.

## 10. ЗБАГАЧУЄ:
- **НОВИЙ R_text_scroll_fill (recipe):** двотоновий заголовок — текст ділиться на чорну (вже «прочитану») + сіру частину; ScrollTrigger анімує `color` сірих слів у чорний у міру входу в в'юпорт. Великий кегль, центр/ліво. Дає «оживання тексту» — сильний RE/бренд-прийом.
- **PB_scroll_smoothness:** ще контекст — Lenis (без Locomotive) + повільний темп 0.9s для великих появ. Lenis = універсальний рушій (і тут, і Olivia Harper на WP).
- **PB_copywriting:** RE-БРЕНД (платформа) голос — анти-корпоратив маніфест + вордплей-хук + пруф-у-бенефіті + «рух/спільнота» — альтернатива luxury-поезії. Для брокериджів/маркетплейсів/агенцій (масовий сегмент), не для одиничного luxury-ЖК.
- **P_realestate (платформа-контур):** Hero+пошук → маніфест «навіщо ми інші» → соц-доказ → Buy/Sell/Rent з пруфом → суміжні послуги (Mortgage/PM/Development) → блог → CTA. Двоконтурність: емоція (маніфест) + функція (послуги+пошук).

## ДЖЕРЕЛО
findrealestate.com (Cuberto) — Awwwards HM, Next.js. Розбір: Claude in Chrome (стек+стилі+структура+копірайт+візуал), черв. 2026.
