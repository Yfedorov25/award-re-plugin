# ATOM: air-blur-reveal — word-by-word проява тексту фокусуванням

> Закон руху, НЕ сніпет. Роль абстрактна: text-block (будь-який шрифт/регістр/мова/колір).
> Джерело: AIR /about `animation--text` (знято з живого DOM 2026-07-06). Пазл: air-rv-1.
> ✅ TRANSFER-ГЕЙТ (числовий) ПРОЙДЕНО 2026-07-16: serif lowercase укр. на теракоті/зелені ≠ Onest UPPERCASE AIR — усі закони M1-M5 відтворились (playwright PASS). APPROVE-око Єгора: ⬜ попереду.

## СУТЬ (одне речення)
Абзац входить у в'юпорт — і кожне слово окремо «наводиться на різкість» (`blur(10px)→0` + `opacity 0→1`) з каскадом 60ms/слово, при цьому лейаут НЕ рухається взагалі (слова стоять на місцях від початку — нуль CLS).

## ЧОМУ ЦЕ ПРАЦЮЄ
Blur-проява імітує фокусування погляду: слово стає різким саме тоді, коли читач до нього доходить; stagger веде око по рядку зліва-направо як рядок читання. Відсутність translateY = преміум-спокій (нічого не «стрибає»).

## МЕХАНІКИ
- **M1 split**: текст розбивається на слова `span.rv-w` (inline-block, white-space:pre), зберігаючи вкладені елементи (`<strong>` тощо); кожне слово отримує індекс `--rv-i`.
- **M2 armed-стан**: до тригера всі слова `filter:blur(10px); opacity:0` (клас `rv-armed` на контейнері).
- **M3 закон каскаду**: transition `filter 1s + opacity 1s`, ease `cubic-bezier(.25,.74,.22,.99)`, `transition-delay: calc(var(--rv-i) * 60ms)`. Зняття `rv-armed` запускає ВСІ слова одночасно — каскад створюється лише delay-ами.
- **M4 тригер**: IntersectionObserver `threshold 0.25`, one-shot (unobserve після спрацювання).
- **M5 reduced-motion**: armed-стан не ставиться — текст одразу видимий.

## COUPLING / SCROLL-WINDOW
Тригерний (подієвий), НЕ scrub: вікно = момент перетину 25% висоти блока з в'юпортом. Темп фіксований у durations (1s + 60ms·N слів), не залежить від швидкості скролу.

## ІНВАРІАНТИ ЗАКОНУ (що НЕ можна міняти)
blur 10px; dur 1s; stagger 60ms; ease `.25,.74,.22,.99`; нуль layout-руху (транзиції ТІЛЬКИ filter/opacity). Все інше (шрифт, регістр, колір, розмір, strong-акцент) = фасад.

## TRANSFER-ДОКАЗ (2026-07-16)
`_transfer-tests/rv-terra.html` (порт 8820): 3 абзаци serif/lowercase/укр/теракота. Playwright-гейт: armed 3→0 по скролу; слово: blur(10px)/op 0 → none/1; delay слова #5 = 0.3s (5·60ms ✓); transitionProperty = `filter, opacity` (нуль CLS ✓).

## ФАЙЛИ
`build.html` = transfer-білд (TERRA-фасад). Оригінальний пазл: `KAI/GALLERY-DRAFT/02-section-compositions/about-air-batch1/air-reveal-text.html`.
