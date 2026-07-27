# 📘 ПЛЕЙБУК — ТИПОГРАФІКА award-сайту (майстер-клас)
> Типографіка = найшвидший сигнал рівня. 80% «дорогого» вигляду — це шрифти+шкала. З 9 розборів.

## 1. РОЛЬ: за типографікою око за 0.5с зчитує «дорого/дешево». Контраст+шрифт+трекінг = клас.

## 2. СИСТЕМА (2-3 шрифти максимум):
- **Display** (заголовки) — характерний: антиква АБО гротеск-кат. Несе ідентичність.
- **Body/UI** (текст) — чистий гротеск. Нейтральний, читабельний.
- **Mono** (опц.) — для лейблів/даних/«точності» (Lusion, Lumena B2B).
Часто 1 родина в ролях (NK FK-family, Lusion лише Aeonik) = максимальна цілісність.

## 3. ПЕРЕВІРЕНІ ШРИФТИ (з award-розборів, доступні):
- Display антиква: **PP Editorial New** (H&K!), Migra, Reckless, GT Sectra.
- Display гротеск: **PP Neue Montreal**, Aeonik (Lusion), Suisse Intl (Cuberto), Cabinet Grotesk.
- Body гротеск: PP Neue Montreal (H&K), Inter, Geist, Aeonik, BentonSans (14islands).
- Mono: IBM Plex Mono (Lusion), JetBrains Mono.
→ PP Editorial New + PP Neue Montreal (Pangram Pangram) — підтверджений award-дует (H&K).

## 4. ШКАЛА (clamp по ролях) — будуй так:
- H1/hero: clamp(40px, 7vw, 120px) [type-hero до 160px].
- H2/секції: clamp(32px, 5vw, 72px).
- H3: clamp(20px, 3vw, 40px).
- body-large: clamp(18px, 1.6vw, 24px).
- body: 16-18px (мобільний мінімум 16 щоб iOS не зумив).
- caption/label: 12-14px.
Модульна шкала: множник 1.25 (minor third) або 1.333 (perfect fourth) між рівнями.

## 5. КРИТИЧНІ ПАРАМЕТРИ (роблять «дорого»):
- **lh заголовків: 0.9-1.05** (щільний! ERA 0.93, Cuberto 1.0, H&K 0.9, NK 0.95). НІКОЛИ 1.4 на великому.
- **lh body: 1.4-1.6** (читабельність).
- **letter-spacing: великі заголовки -0.02…-0.05em** (від'ємний, ERA -5.13px/171px). Body 0 або +0.01em. Лейбли +0.05em uppercase.
- **weight:** display 300 (вишукано REF/Parallel-light) / 400 (ERA/H&K) / 500 (Cuberto/NK масивно). Body 400-500.
- **Контраст H1/body ≥ 4:1** (ERA 12:1!). Великий контраст = редакторськість.

## 6. КОД (CSS-токени):
```css
:root{
  --font-display:'PP Editorial New',serif; --font-body:'PP Neue Montreal',sans-serif;
  --h1:clamp(40px,7vw,120px); --h2:clamp(32px,5vw,72px); --body:clamp(16px,1.2vw,18px);
}
h1{font:400 var(--h1)/0.95 var(--font-display);letter-spacing:-0.03em}
body{font:400 var(--body)/1.5 var(--font-body)}
.label{font:500 13px/1 var(--font-body);text-transform:uppercase;letter-spacing:0.05em}
```

## 7. ПОМИЛКИ ДЖУНІОРА: дефолтні шрифти · lh 1.4 на H1 · слабкий контраст (H1 32px) · 4+ шрифти · додатний трекінг на великих · body <16px (iOS зум) · ігнор модульної шкали.

## 8. ПРИКЛАДИ: ERA Decart 171px/0.93/-5.13px; Cuberto Suisse 72px/1.0/-0.72px; NK FKDisplay 95px/0.95; H&K PP Editorial 55px/0.9; Parallel Haval 120px + body weight 200.

## 9. МОБІЛЬНИЙ: H1 clamp вниз до 36-40px, зберегти щільний lh, body ≥16px, перевірити переноси довгих слів (hyphens/мова).

## 10. ЧЕК: ☐ display≠body ☐ ≤3 шрифти ☐ lh заголовків 0.9-1.05 ☐ від'ємний трекінг великих ☐ контраст ≥4:1 ☐ clamp адаптив ☐ модульна шкала ☐ body≥16px ☐ лейбли uppercase+spacing.

## + ВАРІАНТ: BRUTALIST/BOLD типографіка (з Cyrillic Digital — для bold/гейм/інді):
- Надважкий гротеск: Inter/Space Grotesk **weight 900**, lh 0.8 (надщільний), ls -4…-6px (екстремальний негативний трекінг).
- Акцент піксельним/ретро-шрифтом (Press Start 2P) для гейм-вайбу.
- Ефект: сирий, потужний, бунтарський. Для: gaming, інді, streetwear, молодіжні/сміливі бренди.
- Контраст: брутальний bold display + чистий моно (JetBrains Mono) для тексту.
