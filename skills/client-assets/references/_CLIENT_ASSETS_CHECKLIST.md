# 📦 _CLIENT_ASSETS_CHECKLIST — що просити в клієнта (перед побудовою)
> Консолідований маніфест активів/даних для award-ЖК-сайту. Без цього фаза побудови спіткнеться. 2026-06-09.
> Джерела: [PB_media](../../re-media/references/PB_media) §9 (13 image-types) · [PB_visual_search](../../re-visual-search/references/PB_visual_search) (плити+датасет) · [PB_interactive_map](../../re-interactive-map/references/PB_interactive_map) (карта+POI) · [P_realestate](../../re-sections/references/P_realestate.md) (девелопер/legal) · [PB_forms_lead_capture](../../forms-lead-capture/references/PB_forms_lead_capture) (доставка/analytics) · [PB_discovery_strategy](../../discovery-strategy/references/PB_discovery_strategy) (бренд).
> Плагін показує цей список у ФАЗІ 0/1, позначає що є / чого бракує, ховає блоки без активів (як quadro/nahirna).

## 0. ПРИНЦИП
Сайт = реальні дані клієнта, не плейсхолдери. Що клієнт НЕ дав — блок прихований (не вигадуємо ціни/факти). Плагін веде чек-ліст: ✅ є / ⬜ чекаємо / 🚫 не буде.

## 1. БРЕНД / СТРАТЕГІЯ (фаза 0)
- ⬜ Назва, слоган/Big Idea (або виводимо в інтерв'ю — [PB_discovery_strategy](../../discovery-strategy/references/PB_discovery_strategy))
- ⬜ Палітра бренду (або пропонуємо за [PB_color](../../re-color/references/PB_color.md)) + шрифти (display + body, woff2)
- ⬜ Логотип (SVG: повний + mobile/скорочений)
- ⬜ Тон/табу, приклади що подобається (для копі)
- ⬜ Конкуренти (для research-сенсів, не візуалу)

## 2. МЕДІА (13 image-types — [PB_media](../../re-media/references/PB_media) §9)
- ⬜ **Hero** — головний екстер-рендер АБО відео-луп (muted, для hero-bg) АБО орбіта будівлі (для frame-sequence: ~120-150 кадрів)
- ⬜ Section-bg ×4-6 (full-bleed рендери)
- ⬜ Architecture/facade ×2-4 (екстер'єр, тераси, дах) + cutout-PNG будівлі (для parallax-глибини)
- ⬜ Interiors ×4-6 (інтер'єри, стелі, матеріали close-up)
- ⬜ Lobby ×3 (vertical stack)
- ⬜ Amenities/wellness/sport ×3-5
- ⬜ Courtyard/landscape/territory ×3-5
- ⬜ Gallery ×5-19 (найкращі кадри)
- ⬜ Material/detail close-ups ×2-4
- ⬜ Team/partner лого (архітектор/девелопер/підрядник) ×5+
- ⬜ Lifestyle/people (аспіраційні, опц.)
- **Вимоги:** WebP+JPEG, високої роздільності АЛЕ шрінкнуті (НЕ 8-16MB JPG — [PB_performance](../../perf-doctrine/references/PB_performance.md) §2), реальні рендери не стоки.

## 3. VISUAL-SEARCH (вибір квартир — якщо ЖК, [PB_visual_search](../../re-visual-search/references/PB_visual_search))
- ⬜ **SVG-плити:** генплан (вибір будинку) + фасад-по-поверхах (вибір поверху) + план КОЖНОГО поверху. 1 path = 1 unit, художник малює у Figma з `data-nr`=код-квартири.
- ⬜ **Датасет квартир** (JSON/CRM/таблиця): для КОЖНОЇ — `{code, building, floor, square м², price, rooms, status: available/sold/reserved, planSrc}`. Статус — джерело істини (CRM-експорт або статика).
- ⬜ Плани квартир (зображення/SVG, furnished+unfurnished опц.)
- ⬜ 3D-обліт будівлі (опц., для no-WebGL frame-sequence) — 3D-модель або pre-render.

## 4. ЛОКАЦІЯ / КАРТА ([PB_interactive_map](../../re-interactive-map/references/PB_interactive_map))
- ⬜ **Намальований SVG-план району** (artwork) — художник, у кольорах бренду (НЕ Google-скрін).
- ⬜ **POI-список:** для КОЖНОЇ точки — `{назва, категорія (метро/парк/школа/ресторан/...), позиція на плані, відстань ТЕКСТОМ ("5 хв пішки"/"11 хв авто")}`. Відстані hardcoded (VI так роблять — без live-routing).
- ⬜ Адреса об'єкта.

## 5. КОНВЕРСІЯ / TRUST ([PB_forms_lead_capture](../../forms-lead-capture/references/PB_forms_lead_capture), [P_realestate](../../re-sections/references/P_realestate.md))
- ⬜ **Ціна** (anchor «від $X» — або блок прихований)
- ⬜ **Телефон** (tap-to-call — або кнопка text-only поки нема, як nahirna)
- ⬜ **Telegram** доставка лідів: bot-token + chat-id (env) — бойовий патерн quadro/nahirna
- ⬜ Забудовник: назва, 1-2 речення досвіду/регалії, лого
- ⬜ Архітектор/бюро (ім'я для цитати-довіри — VI завжди називають)
- ⬜ Дата здачі / статус будівництва (+ фото прогресу по кварталах якщо є)
- ⬜ **Юр-дисклеймер** текст («не оферта, рендери можуть відрізнятись») — обов'язково ([PB_footer](../../re-sections/references/PB_footer.md))
- ⬜ Privacy-policy текст (для PDPL-consent)
- ⬜ Документи (PDF: дозволи, плани — опц.)
- ⬜ Mortgage-програми (ставки/строки — якщо калькулятор)

## 6. ANALYTICS / ТЕХ
- ⬜ GA4 ID, Microsoft Clarity ID (вимірювання конверсій)
- ⬜ Домен / хостинг (Vercel project)
- ⬜ Мови (UA / +EN?) — для i18n
- ⬜ favicon / OG-image (або генеруємо)

## 7. ЯК ПЛАГІН ЦЕ ВЕДЕ
- Фаза 0/1: показати цей чек-ліст, позначити ✅/⬜/🚫.
- Для ⬜ — або зібрати в інтерв'ю, або запланувати блок як прихований (lib/conversion.ts-патерн: порожнє → блок не рендериться).
- НІКОЛИ не вигадувати ціни/факти/дати — краще прихований блок (правило з quadro/nahirna).
- Перед лончем: пройти чек-ліст, що ще ⬜ → список клієнту.

## 8. ЧЕК ГОТОВНОСТІ ДО ПОБУДОВИ
☐ бренд (назва/палітра/шрифти/лого) ☐ hero-медіа + section-медіа (13 types скільки є) ☐ visual-search плити+датасет (якщо ЖК) ☐ SVG-карта+POI з часами ☐ ціна/телефон/Telegram (або свідомо приховані) ☐ забудовник+архітектор+дисклеймер ☐ analytics IDs ☐ домен/мови ☐ список ⬜ переданий клієнту.
