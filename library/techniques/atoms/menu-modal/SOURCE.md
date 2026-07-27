# SOURCE — menu-modal
- FILM = ЖИВЕ ВІДЕО: `Screen Recording 2026-07-17 at 11.25.09.mov` (springs.estate, меню t0-7.5s);
  копія `reference-live.mov`; beat-кадри `~/Downloads/CD-RUN-menu-modal-v1/reference/beat-1..4`.
- BUILD: Claude Design, проєкт a3c8aaf3 — 3 варіанти + збірка (за правилами [[cd-prompt-rules-v2]]:
  розкадровка з кадрами в промпті, 3 варіанти A/B/C, файл-збірка). RAW → `variants/{a,b,c,all}.html`.
- Гейти S38: інтерактив реальною мишею (клік MENU→open, hover→свап+active-bright, ✕→close,
  re-open, setActive) ALL PASS ×3, 0 console-err. Гейт-скрипт scratchpad/menu/gate.mjs.
- ФІКС Єгора S38 (1): перший пункт «Residences» налізав на кнопку меню (список центрувався
  `margin:auto` → верхній пункт у хедер). Правка: `.menu margin:auto→18vh` (список під хедером,
  зазор 110px). Перегнано — clearance OK, 0 err.
- ВЕРДИКТ Єгора 2026-07-17: «фіксуємо і рухаємось далі» → ВСІ 3 варіанти в базу
  (A panel-wipe-up=канон · B split-reveal · C designer).
- ВІДКРИТІ (SPEC §): анімація входу оверлея (3 варіанти саме про це) · навігація по кліку.
