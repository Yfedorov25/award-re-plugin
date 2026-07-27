# SOURCE — звідки взято закон атома slider-cycle

## 1. Жива плівка (акцептанс-оракул)
`~/Downloads/Screen Recording 2026-07-14 at 21.17.25.mov`, Nature-слайдер ≈ **19.5–28.5s** (покадрово S36):
- 19.5–20.5: слайдер-композиція заходить (картка ~44vw зліва, caption справа-внизу + 2 круглі стрілки)
- ~23.5–24.5: T1 — слайд 2 (тінистий сад) wipe-up ВСЕРЕДИНІ картки; caption свапається («Shady leafy coniferous garden…»)
- ~26–27: T2 — слайд 3 (зони відпочинку); caption («Artfully designed recreation areas…»)
- 28.5+: Place накриває сцену (wipe-up атом, окремий)
Картка-маска нерухома весь цикл; слайди накривають один одного знизу вгору.

## 2. Live markup (декларативне, сегмент l-nature)
- **Ken Burns на утримуваному слайді — прямим текстом**: `data-parallax--620-0 scale(1.0) op0 →
  -700-0 scale(1.05) op1 → -920-0 scale(1.2)` (слайд входить на 1.05 і повзе до 1.2 весь hold).
- Вхід/вихід текстів: `translateY(20%) → 0` (вхід), `→ translateY(-20%) + opacity 0` (вихід угору) —
  закон caption swap.
- Clip-виходи вгору: `polygon full → polygon(0% 0%,100% 0%,100% 0%,0% 0%)` (колапс до верхнього краю).
- Поруч у секції: webglNature/webglTree/mouseAnimation (WebGL-фони — НЕ частина цього атома).

## 3. Конвеєр
BUILD = Claude Design (CD-RUN #3, після PASS тріалів 1/2 і 2/2). Пакет: `~/Downloads/CD-RUN-slider-cycle/`.
Уроки минулого тріалу вшиті в SPEC/PROMPT: **overlap виходу/входу обовʼязково прописаний** (дірка SPEC v1
reveal-sequence), Ken Burns з markup, темп = довгі hold-и.

## Відомі дірки (закрити наративом Єгора)
вікно caption-overlap · синхронність межі слайда і caption · швидкість зуму на живому.
