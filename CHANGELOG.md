# 0.3.0-dev — REBUILD Етап 0 (2026-06-12)
## 0.3.0-dev · ingestion #2-3 (2026-06-13)
- D_AIR_video.md (235 кадрів): ЖИВИЙ Vide Infra сайт — повний visual-search дріл
  (floor-plates → драбинка+план → юніт+ізометрія → similar з планами-превʼю),
  кінетика карти = підтвердження нашого F-24 рішення як VI-канону, spread-row
  заголовки, бренд-3D-обʼєкт, color-zone аеро.
- D_11TANJUNG_video.md (81 кадр): rounded-canvas секції, фразова естафета глав,
  кільця-тріо, types-карусель, facilities-акордеон, sound-шар, blur-reveal.
- Граматика: +8 прийомів у шари, +2 архетипи, visual-search/карта архетипи
  деталізовані живою механікою.

## 0.3.0-dev · ingestion #1 (2026-06-13)
- Перший відео-тірдаун: D_SAISEI_video.md (195 кадрів з 2 записів юзера) —
  драматургія + інтеракції + дельти граматики.
- Граматика-стрес-тест ПРОЙДЕНО з 1 розширенням моделі: новий клас швів
  **page-transition** (брендовий ритуал прелоадер=перехід=повернення) + next-handoff;
  нові L3 (scatter→assemble, text-photo interleave, тришарові лейбли), новий L1
  (повноекранний дек), 3 нові архетипи.

- CLAUDE.md → КОНСТИТУЦІЯ v1: ~120 законів у 10 розділах (0 + A-I), кожен з
  першоджерелом (F-01..F-28 + бойові рішення smarts/quadro/nahirna). Старі хард-правила
  v0.2 збережені й влиті в §0.
- 235 wiki-лінків [[…]] у references мігровано на реальні відносні шляхи (агенти
  тепер можуть переходити за зв'язками).
- templates/: обовʼязковий скелет .award-re/ проєкту (FAILURES-LOG, CLIENT-BACKLOG,
  motion-score-факт, media-plan, ROLLBACK, state/) + onboarding scaffold у award.md.
- План перебудови: REBUILD-PLAN-v1.md (6 стовпів, етапи 0-7), CONSTITUTION-v1-draft.md.

# Changelog

## 0.2.0 — Art-direction gate (the Phoenix fix)
First live test (agro-phoenix.vercel.app) produced a "correct but cheap" site: right engine, ease, copy, no-WebGL — but composition 4/10 vs Vide Infra 9 (assets marooned in voids, no full-bleed, text separate from media, centered-column brochure, cream+orange). Postmortem + a full 6-site metric comparison (POSTMORTEM-phoenix.md, COMPARISON-vi-vs-phoenix.md) showed the gap is almost entirely **composition / art-direction**, which the plugin described but never *enforced*.

Added (adapted-and-RE-tuned from the design-engineer plugin's aesthetic layer):
- **skill `re-art-direction`** + references `_ANTISLOP_design.md` (design anti-slop catalog — names Phoenix's exact failures: cream+orange, centering, framed thumbnails, infra-fonts, display-without-cyrillic) and `_COMPOSITION_CRITIQUE.md` (4 lenses + 4 named tests + composition score).
- **design-grounding hook** (`hooks/design-grounding.js`, PreToolUse Write|Edit) — HARD-BLOCKS writing site `.css/.html/.tsx`… until `.award-re/design-intent.md` exists. Forces full-bleed/text-on-media/anti-slop intent per section before any code. Fail-open.
- **build.md** — new mandatory phase 3.5 ART-DIRECTION GATE (writes design-intent.md).
- **eval-brain** — separate COMPOSITION LENS (full-bleed count / text-on-media / pin / asymmetry / hard-bans), <6/10 = P0. (Phoenix passed 45/50 technical but failed composition — this lens catches it.)
- **PB_media** §11.0 — FULL-BLEED as the #1 rule (100vw/100vh default, no media-in-column-box).
- **CLAUDE.md** §5b — art-direction rule + design hard-bans.

## 0.1.0 — Initial
7 commands, 22 skills, 4 agents, 79 reference files. Strategy-first pipeline, motion-score, variants-prototyping, no-WebGL, Fedoriv copy, 50 award criteria. Knowledge distilled from live teardowns of ERA/AIR/Springs/Silver Pinewood/Ever + quadro/nahirna build lessons.
