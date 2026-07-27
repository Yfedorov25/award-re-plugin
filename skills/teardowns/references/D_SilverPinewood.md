# D_SilverPinewood — silver-pinewood.com (РОЗБІР, TIER 2 luxury житлова нерухомість) ✅
> Студія **Vide Infra**. Преміум-резиденції біля Срібного бору (Москва). Awwwards SOTD + Developer Award.
> ★ Цінний: ще один модерн award-RE з рецептом плавності + майстер-клас luxury-копірайту. Заміряно наживо.

## 1. СТЕК (заміряно)
- **Locomotive Scroll** (`html.has-scroll-smooth.has-scroll-init`, 15 `data-scroll`) + GSAP (bundled) + **WebGL (1 canvas)** — дозований 3D (кінематографічний рендер будівлі в hero).
- `body{overflow:hidden}`, transform-скрол контейнер Locomotive. React/Next немає (власна збірка). Та сама родина, що Springs/ERA/AIR.

## 2. ПЛАВНІСТЬ (рецепт «не пливе» — підтверджено 4-м RE-сайтом Vide Infra)
- **37 елементів `will-change`** (GPU-шари заздалегідь) + split-text (росте на скролі).
- Темп: **0.5s ×155 (домінанта, reveals/UI) + 0.8s ×29 (великі появи) + 0.4s ×27 + 0.25s ×10**. Повільно-преміально.
- Анімація лише transform/opacity на GPU → нуль reflow.

## 3. ТОКЕНИ
- Типо: **TTFors 500** (єдина родина, грос). Hero-тайтл: **76px / weight 500 / lh 70px (0.92 — щільніше за кегль!) / ls -4.56px / UPPERCASE**. Монументально-щільний — формула «дорогого» display (як ERA Decart, AIR Onest).
- Палітра: **тепла кремова база `#f0eae2`** (light luxury, як ERA paper) + темний кінематографічний hero-рендер + теплі золотисто-піщані акценти («QUIET LUXURY» написом). Інтро-прелоадер — графіт + білий.
- Рідкість: один грос у всіх ролях (дисципліна), монументальний розмір компенсує брак контрасту шрифтів.

## 4. СТРУКТУРА (luxury-RE наратив через «світи»)
Інтро-прелоадер (графіт, «SILVER PINEWOOD RESIDENCES») → Hero (тайтл поверх 3D-рендеру вежі + Живописний міст + скрол-стрілка + тег «QUIET LUXURY»).
Секції-розділи: **About · Location · Infrastructure · Courtyard · Architecture · Lobby · Team · Request a Call.**
Якорі-світи (поетичні, дрібним): «natural movement», «beauty of idle days», «tasteful life».
Нав: Contact Us · Menu (off-canvas).

## 6-7. КОПІРАЙТ (★ майстер-клас luxury-RE, фрагменти-приклади)
- Big Idea = «легендарна адреса як частина твоєї історії» (продаж належності до місця/спадку, не м²).
- Природа+резорт як цінність: «resort-style elegance», «century-old pines», «crystal-clear waters», «fresh air».
- Якорі-світи одним рядком: «natural movement / beauty of idle days / tasteful life» — емоція, не функція.
- Тег-позиція: «**QUIET LUXURY**» (стриманий статус — без крику).
- Секції описують ДОСВІД: courtyard = «miniature nature reserve», architecture = «blends water and air», lobby = «high ceilings, elegant furnishings».
- CTA стримані: «Request a Call», «Request».
- Тон: спокійний, чуттєвий, статусний; звертання неявне; нуль м²/прайсу на головній.
- ⚠️ Для НАШОГО копі: у них є «—» (em-dash) у тексті — наш _ANTISLOP_ukrainian_hard це забороняє; беремо РЕГІСТР і прийоми, не пунктуацію.

## 8. ЕМОЦІЯ: спокій, статус, належність до особливого природного місця, «тиха розкіш». Продає спосіб життя й адресу-спадок.

## 9. ВІДТВОРЮВАНІСТЬ 🟡 80%
- 🟢 Копірайт-регістр, монументальна типографіка (один грос, lh<1, від'ємний трекінг), кремова палітра, темп 0.5/0.8s, Locomotive-плавність, split reveals, інтро-прелоадер.
- 🟡 1 WebGL-canvas (кінематографічний рендер будівлі) — дозовано або відео-альтернатива (rendered fly-around .mp4).
- Наш аналог: Next + Lenis/Locomotive + GSAP ScrollTrigger + SplitText + will-change; hero-рендер як відео; антиква або один монумент-грос.

## 10. ЗБАГАЧУЄ (підтвердження + нюанси):
- **PB_scroll_smoothness:** 4-те підтвердження рецепту Vide Infra (Locomotive + split-text + will-change + transform-only + темп 0.5/0.8s). Це вже стабільний, відтворюваний стандарт luxury-RE плавності.
- **PB_typography:** монумент-грос у всіх ролях (TTFors/Onest/Decart) із lh 0.9-0.95 + від'ємний трекінг −2…−5px на великих кеглях = «дорогий» display навіть без антикви.
- **P_realestate (luxury-контур):** інтро-прелоадер з назвою ЖК → hero-рендер будівлі + тег-позиція («quiet luxury») → секції-світи (About/Location/Infrastructure/Courtyard/Architecture/Lobby) → Team → Request a Call. Якорі одним поетичним рядком. Big Idea = «адреса як частина твоєї історії».
- **PB_preloader_transitions:** прелоадер-вхід із назвою проєкту великим гросом на темному — задає тон до hero (як ритуал входу).

## ДЖЕРЕЛО
silver-pinewood.com (Vide Infra) — Awwwards SOTD + Developer Award. Розбір: Claude in Chrome (стек+стилі+структура+копірайт+візуал), черв. 2026.
