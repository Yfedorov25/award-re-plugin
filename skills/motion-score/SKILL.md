---
name: motion-score
description: "Director's pass: fix ONE motion score for the whole site (single constants + technique-per-section + theme flow) BEFORE building sections. Cures 'every section built differently'."
disable-model-invocation: true
license: MIT
---

# motion-score

ЗАФІКСУЙ ЄДИНІ константи (ОДИН ease ПІД ПРОЄКТ — не глобальний; токени з brand; scroll; reveal; медіа; типо) + розклади партитуру СТЕКІВ ШАРІВ на секцію (рядок T-ID з _REGISTRY_TID) + ПАРТИТУРУ ДИСТАНЦІЙ (закон C3/C4). Ключові секції → variants-prototyping. → .award-re/motion-score.md. Секції будуються СТРОГО за цим.

## References
- [PB_motion_score](./references/PB_motion_score) — єдині константи + партитура прийомів + звʼязність.
- [_TECHNIQUE_REGISTRY](./references/_TECHNIQUE_REGISTRY.md) — 100% VI-прийомів (меню).

Підкоряйся `../../CLAUDE.md`. Усі прийоми — з reference-файлів, не вигадані. NO WebGL (🔴 → no-WebGL переклад).

## v1: партитура = СТЕКИ + ДИСТАНЦІЇ
Кожна секція в motion-score.md отримує: (1) рядок стека шарів T-ID-ами (≥5 flagship /
≥3 службова, закон C1; довідник: ../grammar/references/_REGISTRY_TID.md), (2) рядок у
таблиці дистанцій, (3) шов-вхід/вихід (не повторювати спосіб двічі, C10). Шаблон:
templates/motion-score.md.
