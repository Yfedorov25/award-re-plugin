# SMARTS (наш) — анкета за схемою для порівняння
## 0. META
smarts-agronomichne · https://smarts-agronomichne.vercel.app · live · 2026 · ЖК (смарт+комерція)
## 1. ТИПОГРАФІКА
display: **Unbounded 400-700 (наб. 600/700 у заголовках)** — широкий декоративний гротеск ⚠️ · body: Onest 400-600 · кирилиця повна
H1 hero: clamp(3.2rem, 9vw, 9rem)=до 144px, lh 0.98, ls -0.02em, без uppercase · H2: clamp до 88px · body: до 18.9px
H1:body ≈ 7.6:1 · числа: display-родиною
## 2. КОЛІР
--ink #10131a · --night #1a1f2b · --brick #b06a4f (акцент) · --plaster #f3f1ec · scrim rgba(16,19,26,.55/.78) · теми theme-dark/light класами
## 3. СИСТЕМА
maxw 88rem · gutter clamp(1.25rem,4vw,4rem) · radius 2px · btn solid brick + ghost hairline
## 4. РУХ
Locomotive v5(Lenis) lerp .1 + GSAP · ease: CSS .25,.46,.45,.94; GSAP: power2.out ×30(!), award ×13, none ×13 — ⚠️ дрейф від єдиного ease
прийоми: 2×canvas frame-scrub (день→ніч 71к, доллі 66к) · 4 pinned · scrub-зони ×2 · FLIP drill · seam-піни ×2 + нитка · titleFill · self-draw · before/after · cursor 3 modes · liquid preloader · WebGL: 0
## 5. КОПІРАЙТ (поточний — USER: «жахливий, не людський»)
hero: «Невелика, але власна» (3 слова) · H2: «Три фасади, одна впізнавана лінія» / «24 метри, які живуть як сорок» / «Фасадний метр, який працює на тебе» / «Вінниця поруч. Ціна ні» / «Без сюрпризів і довгобудів» / «Обери свій метр» / «Під'їжджаєш. І це вже твоє»
тон: афористично-рекламний, КОЖЕН хедлайн = «розумний» слоган-парадокс ⚠️ (можлива причина «не людський»: суцільна щільність дотепів без повітря)
CTA: «Забери свою квартиру» / «Порахуй платіж замість оренди»
Big Idea: «Статус не в метрах, статус у слові власне»
## 6. СТРУКТУРА
11 секцій home (hero→manifesto→матерія→життя→інтерʼєри→комерція→карта→trust→дорога→units→cta) · 62 стор. · visual-search є
## 7. SIGNATURE
день→ніч hero-scrub · реальний план у visual-search · теракотова нитка
