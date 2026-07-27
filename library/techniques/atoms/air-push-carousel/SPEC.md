# ATOM: air-push-carousel (B13) — пін-слайди push-up під фіксованою glass-панеллю з лічильником

> Закон = T-119. Джерело: `AIR-REF--about-carousel-desktop.mp4` (live /about: слайди push-up,
> панель праворуч свапить 1→2→3). BUILD: CD batch-4, 3 варіанти (MERIDIAN/FRAME/VELVET). ✅~ блоково С33-5.
> Розкадровка: `CD-RUN-air-batch-4/reference-frames/b13-carousel-*`.

## СУТЬ
Пін-band track 340vh; N=3 слайди. Скрол push-ить наступний слайд translateY 100%→0 ЦІЛИМ аркушем
(ease:none, cover-грамар wipe-up) поверх утримуваного; фіксована glass-панель праворуч свапить
гігантський номер+копі; Ken-Burns 1.03→1.00 на held-слайді; release у потік (spread-title).

## ІНВАРІАНТИ
Push твердий край, scrub-реверсивний; held-слайд НЕ рухається; панель-бокс Δ0px; **свап caption =
ЧИСТИЙ HANDOFF (стара повністю гасне ПЕРШ ніж нова заходить) — НІКОЛИ overlap-fade двох текстів**;
телепорт = точний стан. Палітра, сцени — фасад.

## 🔴 УРОК (С33-5, баг знайдено оком, виправлено): overlap-cross-fade двох absolute-inset caption-панелей
з РІЗНИМ текстом = колізія в overlap-вікні («1»/«2»+копі налазять = каша). Правило: чистий handoff
або маска. Детектор: min(op1,op2)>0.12 по push-вікну = fail. Було 1/21 → 0/21. Див. [[gate-green-not-done]].

## ГЕЙТИ (С33-5, 12/12 по всіх 3): holds по 1 caption · no-collision 0/21 обидва push-вікна · панель Δ0px · push монотонний · телепорт детермінований · 0 err.

## ФАЙЛИ
`build.html` = MERIDIAN (робочий канон за ОКОМ, з фіксом caption — НЕ піксель-parity; фінал = вердикт Єгора). `variant-frame.html` · `variant-velvet.html` = банк.
