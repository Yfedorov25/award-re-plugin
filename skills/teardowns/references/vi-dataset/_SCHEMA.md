# VI-DATASET SCHEMA — єдина анкета на кожен сайт (заповнювати ТІЛЬКИ з живих сирців; нема даних → "n/a", НЕ вигадувати)

## 0. META
site_slug · live_url (чи мертвий → fallback videinfra.com/work/«slug») · liveness (live/dead/redirect) · рік · тип (ЖК/офіс/готель/корп)

## 1. ТИПОГРАФІКА (з @font-face + computed у CSS)
display_font (родина, ім'я файлу, кирилиця?) · body_font · third_font? · ваги в наявності
H1: font-size (px/clamp), line-height, letter-spacing, text-transform, вага
H2 / H3 / body / caption-label: те саме
fluid-формула (clamp/vw?) · СПІВВІДНОШЕННЯ H1:body · uppercase-стратегія · числа (tabular? окремий шрифт?)

## 2. КОЛІР (з :root/CSS vars + частотний аналіз hex)
повна палітра hex (всі змінні) · база/фон(и) · текст · 1-й акцент · 2-й? · теми секцій (ui-dark/light/...класи) · scrim/overlay формули · чи чисті #000/#fff

## 3. ДИЗАЙН-СИСТЕМА
container max-width · gutters · radius · border/hairline колір+товщина · кнопки (форма, hover-механіка) · іконки (stroke?) · spacing-ритм (база px)

## 4. РУХ/СКРОЛ (з JS-бандла: grep easing/lib/data-атрибути)
scroll-движок (Locomotive/custom/Lenis) + lerp · ease-криві (всі cubic-bezier + частоти!) · durations-сітка · reveal-патерн · parallax-механіка (inline keyframes? named?) · pin/sticky кількість і де · унікальні WOW-прийоми (3-5, як named) · WebGL так/ні і ДЕ · prefers-reduced-motion?

## 5. КОПІРАЙТ/СЕНС (всі H1/H2 сторінки + hero дослівно)
hero H1 дослівно (мова) · довжина hero (слів) · усі section-headlines дослівно · тон (поетичний/прямий/статусний...) · Big Idea одним рядком · прийоми мови (метафора? наказовий? питання?) · цифри-в-копі (де факти/ROI) · CTA-дієслова дослівно
ВИСНОВОК-сенс: ЩО продають насправді (статус/спокій/мистецтво/природа/інвестицію)?

## 6. СТРУКТУРА
к-сть секцій home + список одним рядком (hero→...→cta) · к-сть сторінок · nav-пункти дослівно · є visual-search/каталог?

## 7. SIGNATURE (3 рядки)
Чим сайт впізнається за 5 секунд · найкрутіший момент · що вкрасти
