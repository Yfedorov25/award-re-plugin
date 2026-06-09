---
name: re-art-direction
description: "The DESIGN-QUALITY gate — turns a 'correct' build into a 'crafted' one. Enforces full-bleed media, text-on-media, asymmetry, pin-scrollytelling; kills AI-slop (cream+orange, centering, framed thumbnails, infra-fonts). MANDATORY before building any section. Borrowed-and-RE-tuned from design-engineer's aesthetic layer."
disable-model-invocation: true
license: MIT
---

# Re-Art-Direction (design-quality gate)

Це шар, якого бракувало (провал Phoenix = correct інженерно, мертвий композиційно). Підкоряйся `../../CLAUDE.md`. ОБОВʼЯЗКОВО ПЕРЕД побудовою КОЖНОЇ секції з медіа.

## References (ПРОЧИТАТИ перед будь-яким site-CSS/HTML)
- [_ANTISLOP_design](./references/_ANTISLOP_design.md) — каталог «чому дешево» + хард-бани + AI-Slop Test.
- [_COMPOSITION_CRITIQUE](./references/_COMPOSITION_CRITIQUE.md) — 4 лінзи + 4 іменні тести + композиційна оцінка.

## DESIGN INTENT (БЛОКУЮЧИЙ — вивести ПЕРЕД кодом)
design-grounding hook блокує Write/Edit site-CSS/HTML поки ти не вивів цей блок. Для КОЖНОЇ секції заповни:
```
### Design Intent — <section>
- Хто людина в кадрі: <конкретна людина, не «користувач», що в неї на думці зараз>
- Медіа full-bleed? <ТАК (100vw/100vh) / НІ + явна причина чому ні>
- Текст відносно медіа: <НА медіа з scrim / поруч + чому / нема медіа + чому>
- Композиція: <фокус / асиметрія-як / ритм відносно сусідніх секцій>
- Прийом (з motion-score): <...>
- Анти-слоп чек: <НЕ cream+orange / НЕ центровано-все / НЕ рамка-замість-full-bleed / шрифт+кирилиця ОК>
```
Без цього блоку — НЕ писати код секції.

## ПРАВИЛА (хардові, з дельти Phoenix↔VI)
1. **FULL-BLEED за замовчуванням** — секція з медіа = `100vw/100vh` edge-to-edge, НЕ `max-width`-колонка-бокс. Виняток лише зі ЯВНОЮ причиною в Design Intent.
2. **Текст НА медіа** — hero + ≥2-3 ключові секції: headline ВПЕЧЕНИЙ у full-bleed зображення з градієнт-scrim. Заборонити «фото-колонка + текст-колонка» як дефолт.
3. **≥3 pinned scrollytelling-секції** — медіа розкривається на скролі (як VI 8-89), не статичні картки.
4. **Асиметрія/overlap** — не `1fr 1fr`, не центрування body. Динамічний баланс.
5. **Порожнеча лише навколо ВЕЛИКОГО** — нема вузької колонки в великій секції.
6. **Анти-слоп хард-бани** — НЕ cream+orange (без доменної причини), НЕ чисті #000/#fff, НЕ інфра-шрифт, display МАЄ кирилицю для UA, один primary CTA.

## ПОТІК
1. ПЕРЕД motion-score фіналізацією / побудовою: прочитати обидва references.
2. Для кожної секції: вивести Design Intent блок (розблоковує hook).
3. Будувати/керувати section-builder СТРОГО за Intent + правилами.
4. ПІСЛЯ: прогнати 4 іменні тести (Squint/Full-bleed/Text-on-media/AI-Slop). Композиція <6 → переробити.

## ЧЕК
☐ обидва references прочитані ☐ Design Intent на КОЖНУ секцію ☐ full-bleed default ☐ текст-на-медіа ≥3 ☐ ≥3 pin-scrollytelling ☐ асиметрія ☐ 0 хард-банів ☐ 4 тести пройдено ☐ композиція ≥6/10.
