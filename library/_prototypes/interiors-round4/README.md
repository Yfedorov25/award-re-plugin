# INTERIORS - база секції: 5 фінальних варіантів (round 4, 2026-07-02)

Прийняті власником як «гіпервисокий рівень» (Claude Design, проєкт 9243ceaa, PROMPT v4:
призначені композиційні архетипи + day/night інструменти). Це БАЗА для міксування між сайтами:
один сайт бере один варіант. int-14/17/18 відхилені (корінь = F-45: архетип без фірмового морфу).

## Варіанти
| Файл | Архетип | День/ніч інструмент |
|---|---|---|
| int-11-collage-depth.html | Smarts-live grammar evolved: sticky-колонка + колаж 4:3 кадрів на глибинах + слово за ґаттерами + «+» лайтбокс-майданчик | cursor x seam ЛАСКА на головній картці кухні (rest 55%, автономна демонстрація, idle-relax 6s, touch-двійник, night eager+decoded) |
| int-12-two-columns.html | Springs C3: спліт-колонки, стрічка-handoff праворуч + рядки-маски з лагом 100-110ms | scroll x clip-seam: ніч = 4-й кадр стрічки |
| int-13-house-console.html | Springs C4/P17: персистентний serif-індекс + push-swap вікно | click x crossfade: вимикач-чип біля лампи в КОЖНІЙ кімнаті, теплі крапки в індексі, failsafe lights-on |
| int-15-hour-odometer.html | Springs C6/P15: pinned одометр, 4 механіки на крок | step x opacity: рил 01/02/03 -> 22:00, ніч приходить у ТУ Ж ноду спальні |
| int-16-editorial-spread.html | Ever P2: de-bleed розворот + mirror law (fill/handedness фліп) | drag x center-seam РИТУАЛ: commit 55%, spring-back, автономна демонстрація, хром розчиняється |

## Асети
HTML посилаються на `assets/interiors/` (SET A, apartment) та `assets/interiors-townhouse/`
(SET B, townhouse) відносними шляхами. Асети живуть у `~/Downloads/INTERIORS-design-handoff/assets/`
(локально відкривати з `INTERIORS-design-handoff/current-build/round-4/`, там symlink).
LIVE: https://deploy-kappa-five-90.vercel.app/interiors/all-prototypes.html

## Порт-фікси перед продом (з RESULTS-round4.md)
1. int-12: `img.decode()` для night-кухні і всіх кадрів стрічки (зараз лише preload).
2. int-13: питання state-memory (кімнати скидаються в день при поверненні).
3. int-16: `seamline/grip` анімуються через `left` (layout-prop) - перевести на transform;
   подвійний mousedown-лісенер на grip злити.
4. Всі: скелет vanilla rAF -> сайтовий двигун (GSAP + award-ease + Lenis), reduced-motion
   статичні end-states, мобільна гілка через gsap.matchMedia (MOBILE-REBUILD-METHOD).

Повний розбір: `~/Downloads/INTERIORS-design-handoff/RESULTS-round4.md` + FAILURES-LOG F-45.
