---
name: higgsfield-craft
description: "Operational media-generation doctrine: Higgsfield 4K photo/i2i/i2v with geometry+color locks, honest macro crops from masters, frame-QA, compression budgets, RESULT+REFERENCE review. Executes constitution section G."
disable-model-invocation: true
license: MIT
---

# higgsfield-craft — виконання законів G

Агент-власник: media-director. Закони G1-G13 у `../../CLAUDE.md`. Робочі рецепти:

## ФОТО (nano-banana-pro, resolution:"4k" ЗАВЖДИ)
- День→ніч: i2i від РЕАЛЬНОГО денного кадру, «change ONLY the lighting to ...; keep
  geometry, materials, camera identical; no extra windows or doors; walls stay solid».
- Матеріал-макро: спершу ffmpeg-кроп реального матеріалу з рендера → референсом в
  i2i + текстовий color-lock («the brick is dark burgundy-brown, NOT orange») →
  після — звірка кольору і СУСІДСТВА матеріалів проти рендера (F-23).
- Заборони в кожен промпт: no people faces, no text/signage (кирилиця ламається — G11).

## ВІДЕО (i2v)
- День→ніч: start_image = день, end_image = ЗАТВЕРДЖЕНА ніч ТОГО Ж кадру (G4).
- Рух камери пояснюється кадром (anti-morph): «slow lateral orbit, nothing enters
  or leaves the frame»; обліт вбік > dolly > walkthrough; cinemagraph-штори — бан (G5).
- Тривалість 6s (хвіст 7-8s пливе → або обрізати ffmpeg, G6).

## ПІСЛЯ КОЖНОЇ ГЕНЕРАЦІЇ
1. Frame-QA покадрово (scripts/frames.sh для відео): вивіски, анатомія, бренди, drift (I5).
2. Пара РЕЗУЛЬТАТ + REF-референс у ~/Downloads, відкрити обидва (G10).
3. media-plan.md рядок: слот · пропорція РАХУНКОМ · вага після пережиму · QA-вердикт.
4. Пережим: ffmpeg/sharp до бюджету (full-bleed ≤400KB, картка ≤250KB, кадр-скраб q≈55).
