# SOURCE — звідки взято закон атома wipe-up (cover-scroll)

> ✅ **APPROVED** Єгором 2026-07-16 («так все окей, можемо йти далі») — build.html на dummy-фасаді.

## 1. Live markup springs.estate (декларативно, S36)
Механіка = локомотив-стайл sticky-емуляція, ×37 інстансів site-wide:
- `.sticky.sticky--full-height.sticky--under-next` — контейнер; шар `.sticky__layer--sticky`
  (`data-scroll data-scroll-sticky data-scroll-target="#<container>"`) запінюється на 100vh.
- `sticky--under-next` (×16 home+infra+about) = запінена база лишається ПІД наступною секцією.
- `sticky--under-previous` (×21) = ця секція їде ПОВЕРХ попередньої запіненої. Той самий закон, дзеркальна декларація.
- `sticky--under-previous--after-next` (×1, infrastructure) — рідкісний варіант, у v1 не кодуємо.
- Приклад з бази: одометр-контейнер `#l-place-content` сам є `sticky--under-next` — карта накриває його цим законом.
- На шві НЕМАЄ clip/opacity-keyframes (parallax-плагін на шов не вішається) → твердий край, чиста геометрія потоку.

## 2. Жива плівка (акцептанс-оракул)
`~/Downloads/Screen Recording 2026-07-14 at 21.17.25.mov`:
- 38.0–38.8s: odometer-сцена накриває runner-сцену (шов ≈0.7s, твердий край, runner-відео ГРАЄ до повного покриття)
- 44.3–44.9s: leaf/map-сцена накриває odometer (16-сцену) — те саме
- впродовж плівки той самий патерн на кожному стику секцій.
Порядок зникнення контенту бази: знизу вгору (межа = топ-край cover) — емерджентний, як в odometer.

## 3. Спорідненість
Атом #1 odometer = ТОЙ САМИЙ принцип «одна межа, емерджентний порядок», але всередині ОДНОГО pinned band'а
через clip-polygon. Wipe-up = між СЕКЦІЯМИ через потік документа. Разом вони покривають і внутрішньо-сценні,
і між-сценні переходи springs.

## Відомі дірки (закрити наративом Єгора)
M3-drift величина · M4 yPercent · чи всі шви строго 1:1 · after-next варіант.
