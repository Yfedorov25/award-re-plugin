# SOURCE — mobile-hero (M2)

## Джерело RAW
- Claude Design проєкт: `977b862d-b77f-4548-8786-4bc8c89caf96`, файл `mobile-hero-all.html` (+ a/b/c).
- Стягнуто через DesignSync `get_file` (S40, 2026-07-18) → `variants/{a,b,c,all}.html` дослівно.
- CD-RUN пакет-джерело: `~/Downloads/CD-RUN-mobile-hero-v1/` (00-READ-FIRST + 01-PROMPT + SPEC-NOTES
  + reference/{beat-1-hero.jpg, beat-2-drift.jpg}). SPEC мій: `SPEC.md`.

## FILM (live oracle)
`ScreenRecording_07-17-2026 16-01-25_1.MP4` (mobile springs.estate, portrait 1170×2532), hero t≈0-4s.
Beat-кадри в пакеті reference/. Живе: грид ~-6°, «Splendor of Renewal» серифом внизу-справа, абзац
mid-left, hint bottom-left, хедер Springs+RESIDENCES+♡+burger; плитки = реальні фото/скло (наш dummy
= зелені градієнти — свій фасад за задумом атома).

## Стек (як CD віддав)
GSAP 3.12.5 (+ScrollTrigger +CustomEase) + Lenis 1.1.14, inline CSS+JS, CDN jsdelivr. Хук
`window.render(p)` clamp 0..1, split@0.42 (≤0.42 = intro, >0.42 = scroll parallax). `__ATOM_OK__`
після init. Сторінка 142vh, `.hero{position:fixed;overflow:hidden}`.

## Механіка (спільна для A/B/C)
- Мозаїка: `.mosaic-rotate`(CSS rotate -6°, статичний) → `.mosaic-parallax`(GSAP y на скрол) →
  `.kenburns`(C) → `.grid`(2 колонки flex, overscan 152%×162%, center translate) → 8 `.tile` з
  `.tile-inner` (радіальні зелені градієнти + fractalNoise grain).
- idle-дрейф: нескінченні GSAP yoyo на `.tile-inner` (off-clock, sine). hint-arrow bob.
- scroll: `.mosaic-parallax` їде вгору, тексти fade+y, `.next` (peek наступної секції) виїжджає.

## Варіанти (діляться лише entry + характером дрейфу; settled-композиція однакова)
- A reveal-as-one · B tile-cascade (+column-split) · C designer/ken-burns (+light-shift, line-mask).

## Гейти
`scripts/mobile-hero-gate.mjs` 14/14 ALL PASS ×3, `scripts/mobile-hero-coll.mjs` 0 ×3. 0 фіксів у
білді (всі «фейли» були дефектами гейтів — див. SPEC §ГЕЙТИ, §УРОК ГЕЙТА).
