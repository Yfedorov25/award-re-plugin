# ATOM: residences-tabs — interactive tabs hero (springs Residences) [MOBILE 390×844]

## СУТЬ
Справжня springs Residences секція (не scroll-стек — той SPEC був хибний). Full-bleed hero з табами
**FLATS / TOWNHOUSES / PENTHOUSES**: тап свапає фото (crossfade), title, subtitle, кнопку і 2 стати;
активний таб має fill-підкреслення. Над hero — intro-хедер «Residences» (Victor Serif) +
«COLLECTION OF PREMIUM LIVING SPACES» на teal→green градієнті з квітучою гілкою.

## ПОХОДЖЕННЯ
Конвертовано з CD Design Component (`Residences.dc.html`, проєкт 0c628592) → self-contained атом.
CD-донор побудований коли Єгор дав live-відео секції + скріншоти (S40, [[cd-more-context-self-corrects]]).
DC-формат не влазив у конвеєр (React/omelette/x-dc/mustache, немає render(p)) → переписано на чистий
HTML+GSAP-lite: таб-стан на кліку, `window.render(p)` (p→індекс табу для скраб-борду), `__ATOM_OK__`.
DC-оригінал збережено в `dc-variant/`.

## МЕХАНІКИ
- M1 ТАБИ: 3 кнопки внизу фото; клік/тап → активний. Fill-підкреслення (`scaleX 0→1`, springs-ease).
- M2 CROSSFADE ФОТО: 3 слоти стековані; активний opacity 1, решта 0, transition .6s springs-ease.
- M3 СВАП ТЕКСТУ: title/subtitle/button + 2 стати fade-out→repaint→fade-in (translateY 10→0).
- M4 ДАНІ (точні з live): Flats 138 / 3.1m «Designer finishings» «Search flats» · Townhouses 5 / 4.1m
  «Private patios» «Available soon» · Penthouses 7 / 4.1m «Green terraces» «Available soon».
- M5 INTRO: «Residences» Victor Serif 73px + label + teal→green + квіткова гілка (dummy-фасад) + lime-glow.

## ФАСАД — РЕАЛЬНІ ФОТО (higgsfield, S40 докрутка)
CSS-градієнти НЕ малюють фото (лишались «плями») → Єгор обрав генерацію. 3 фото через higgsfield
(nano_banana_pro, 3:4, springs-настрій, промпти з tile-oracle): `_img/{flats,town,pent}.webp` —
flats=вітальня з вигнутим кремовим диваном+круглий стіл+панорама (майже як live springs), town=
приватний патіо надвечір (камінь+зелень+лаунж), pent=зелена дахова тераса з перголою+вогнище+вид.
Читаються як приміщення миттєво. webp легкі (5-23KB), відносні url (self-contained на 8879).
`.art-{flats,town,pent}` = `background: url(../_img/*.webp) center/cover`.

## ІНТЕРАКТИВ / render(p)
`window.render(p)` clamp 0..1 → індекс табу (p<0.34→Flats, <0.67→Town, →Pent) для скраб-борду;
клік/тап теж перемикає. `__ATOM_OK__` після init. springs-шрифти локальні (`_fonts/`), springs-токени.
Сторінка ~1392px (intro 560 + tabs-sec 844) — таби нижче першого екрана, скрол до них нормальний.

## ГЕЙТ
`scripts/residences-tabs-gate.mjs` — 17/17 ALL PASS: хуки, Victor Serif+TT Commons Pro застосовані,
3 таби/слоти, intro, точні дані ×3 таби, тап-свап (реальний тач після scrollIntoView), crossfade
(лише активний слот), render(p)-мапінг, детермінізм, 0 overflow, 0 console-err.

## СТАН
Конвертовано з DC ✅ · self-contained ✅ · гейт 17/17 ✅ · фасад=реальні фото (higgsfield) ✅ ·
**APPROVED ×2 (Єгор, 2026-07-18: «супер це приймаю» + «супер, приймаю» після фото-фасаду)**. 🔴 element-gate НЕ
застосовний (dummy-фасад, немає spec/frame-*.json; per-element проти live НЕ міряно — як residences-slab).
Дані/структура/токени звірені з live-кадрами оком + числами гейта проти SPEC. A=springs-точний.
