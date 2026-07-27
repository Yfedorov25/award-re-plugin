# SOURCE — mobile-menu [MOBILE 390×844]
- FILM = ЖИВЕ ВІДЕО: `ScreenRecording_07-17-2026 16-01-25_1.MP4` (mobile springs.estate, portrait
  1170×2532); меню t≈4-6s+32s (×2); копія `reference-live.mov`; beat-кадри
  `~/Downloads/CD-RUN-mobile-menu-v1/reference/`.
- BUILD: Claude Design, проєкт fd18662e — 3 варіанти + збірка (правила [[cd-prompt-rules-v2]],
  viewport 390×844). RAW → `variants/{a,b,c,all}.html`. Спільний HTML/CSS, різняться JS-timeline
  (A slide-down / B bloom+blossom-unfurl / C sway+light-sweep). Орхідея = SVG (12 суцвіть + 6
  бутонів + скляна ваза + тінь), будується buildFlorets().
- Гейти S39: тач реальним tap на 390×844 (isMobile+hasTouch) — open/orchid-visible/highlight/
  close(hook)/re-open ALL PASS ×3, 0 console-err (`scratchpad/mob/gate2.mjs`). Прапорець
  list-orchid-collide = ХИБНИЙ (гейт міряв SVG-обгортку 264px з невидимою aura; реальні квіти
  ~265px, список закінчується 173px — оком проміжок великий, підтверджено GMc-open.png).
- ВЕРДИКТ Єгора 2026-07-17: «B і C більше подобаються» → ЗБЕРЕГТИ ВСІ 3 (B/C = фаворити Єгора;
  A = чистий базовий). Всі 3 передають закон живого меню.
- ВІДКРИТІ (SPEC §): анімація входу (3 варіанти саме про це) · орхідея static vs sway (C=sway) ·
  тап=навігація в live.
