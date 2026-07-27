# mobile-residencies — DC-variant (Design Component, ІНШИЙ формат)

## Що це
`Residences.dc.html` — результат S40-заходу, де Єгор дав CD БІЛЬШЕ КОНТЕКСТУ (live-відео
`ScreenRecording_07-18-2026 10-35-50_1.MP4` + 8 скріншотів springs Residences) і CD **сам розпізнав**,
що ми будували НЕ ту секцію. Справжня springs Residences ≠ scroll-стек фото-плиток (наш v1/v2 SPEC).
Вона = **інтерактивний full-bleed hero з табами FLATS / TOWNHOUSES / PENTHOUSES**: тап свапає
фото (crossfade), title, subtitle, кнопку і 2 стати; + intro-хедер «Residences».

CD побудував це як **Design Component** (не наш self-contained атом).

## 🔴 ЧОМУ ЦЕ НЕ В `variants/` (архітектурний конфлікт з конвеєром)
DC-формат НЕ self-contained:
- залежить від `support.js` (68KB DC-рантайм) + потребує `window.React`/`ReactDOM` ЗЗОВНІ
  (`throw "dc-runtime: window.React is not available yet"`) — не рендериться простим відкриттям HTML;
- `image-slot.js` (63KB omelette-рантайм) — фото = ПОРОЖНІ drop-слоти (треба кинути реальні рендери);
- `{{mustache}}` + `<x-dc>` + `<script type="text/x-dc">` — потребує DC-хост/omelette для інтерполяції;
- НЕМАЄ `window.render(p)` / `__ATOM_OK__` → наші гейти (mobile-*-gate.mjs) його НЕ проженуть;
- сервер 8879 подає чистий HTML → DC там = порожньо/помилка.

Тобто це ЦІННИЙ дизайн-донор, але НЕ атом нашого конвеєра в наявному вигляді.

## Що з нього ЦІННЕ (дизайн-донор)
- Точна структура справжньої Residences: intro-хедер + full-bleed hero + таби + свап-логіка.
- РЕАЛЬНІ дані з live (звірено з відео): Flats 138 / 3.1m · Townhouses 5 / 4.1m · Penthouses 7 / 4.1m;
  subtitles «Designer finishings / Private patios / Green terraces»; кнопки «Search flats / Available soon».
- springs-токени використані правильно (Victor Serif + TT Commons Pro + #e0d1b6/#0e241d/#16322a +
  ease cubic-bezier(.25,.74,.22,.99)) — CD взяв їх з нашого пакета tokens/.
- Композиція/паддінги/розміри шрифтів — гарний стартовий референс.

## Опції далі (рішення Єгора)
1. **Конвертувати в self-contained атом** `residences-tabs`: переписати DC → чистий HTML+GSAP+Lenis,
   таб-стан на кліку (не React), `window.render(p)` (p→index карусель) + `__ATOM_OK__`, фото = наші
   градієнт-фото-плитки (FACADE RECIPE) або реальні асети. ТОДІ гейти проходять, лягає в базу.
2. Лишити як DC-донор і будувати атом з нуля за цією структурою.

## Файли (стягнути з CD-проєкту 0c628592 при потребі)
`Residences.dc.html` (тут) · `support.js` · `image-slot.js` · `fonts/` — у CD-проєкті
`0c628592-3c69-4a6a-85d7-40ae7df2e2fd`.
