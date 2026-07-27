# SOURCE — звідки взято закон атома odometer

> ✅ **APPROVED** Єгором 2026-07-16: запис прогону білда `~/Downloads/Screen Recording 2026-07-16 at 11.20.35.mov`
> (весь beat 5→12→48 на dummy-фасаді) + вердикт «все правильно, добре вийшло». Transfer-гейт пройдено.

## 1. Жива плівка (акцептанс-оракул)
`~/Downloads/Screen Recording 2026-07-14 at 21.17.25.mov`, одометр-beat ≈ **38.2–44.7s** (не 31–43 як у нотатці — уточнено покадрово).
Beat-таймкоди (4fps + 10fps аналіз, S36):
- 38.2–38.8: вхід секції (wipe-up над runner-сценою), сцена «3» (bg листя/парк, card: дівчина з собакою)
- 40.0–41.8: T1 3→9 — bg wipe-up 40.0→40.8 (швидше), digit+label swap ~40.25, фото картки ~41.3→41.8 (wipe всередині маски картки)
- 42.1–43.4: T2 9→16 — bg (вода→місто) 42.1→43.4, digit roll 42.3→42.9, фото ~43.1→43.3
- 44.3+: наступна сцена (лист/мапа) накриває — вихід.
Порядок «digit перший, фото останнє» = емерджентний від позицій елементів відносно межі, що йде знизу.

## 2. Live markup springs.estate (декларативне підтвердження закону)
Секція `#l-place-content` = `.l-place-video-container.sticky.sticky--under-next.sticky--full-height` (h=3600px @900vh = hold 3vh), шар `.l-place-video.sticky__layer--sticky` (locomotive-style `data-scroll-sticky`).
Каптіон-колонка + 3 caption-item (стек, absolute, однакова геометрія) з **scroll-scrub клипами** через їхній плагін `parallax` (measure=`.sticky`, clamp):
- колонка: `data-parallax-60-0` collapsed → `data-parallax-0-0` open (wipe-in перед pin)
- item«9»: `0-0` collapsed → `-100-0` open (вікно [0..1vh band'а])
- item«16»: `-100-0` → `-200-0` (вікно [1vh..2vh])
- медіа: `100-0 scale(1.2)` → `-100-0 scale(1.0)` (повільний settle)
Колапс = `polygon(0% 100%,100% 100%,100% 100%,0% 100%)`; open = `polygon(0% 100%,100% 100%,100% 0%,0% 0%)`. Wipe-up знизу, нуль opacity/x-твінів.
Асети карток: `place-caption-1/3/…@xxl.webp`. Цифри: `p.h0.leading-trim` (serif). Лейбли: «minute walk to Nature Park» / «minute walk to the embankment» / «minutes by car to the MIBC».
Bg-відео: у served HTML `<video>`/`.mp4` ВІДСУТНІ — інжект JS-ом у рантаймі (headless їх не бачить; закон bg-wipe знято з плівки).

## 3. capture.json (CDP wheel, S36)
Per-rAF прогін band'а: contY (вісь sticky) + at-rest clip-стани item-ів. Обмеження: плагін parallax у Playwright-оточенні не арм-иться (reveal-и не фаєряться навіть headed + чесна wheel-подорож від верху) — криві reveal зняти не вдалось, вікна взято з markup-ключів + плівки.

## Відомі дірки (закрити наративом Єгора / новою плівкою з голосом)
- старт W1 відносно pin (hold перед T1 — закон чи темп скролу Єгора?)
- точна частка швидкості bg-wipe відносно item-wipe (оцінка 0.55)
- drift картки: величина/наявність на живому (виміряно 155px на ~5600px wheel)
