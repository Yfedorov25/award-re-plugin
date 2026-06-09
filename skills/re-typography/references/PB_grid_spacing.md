# PB_grid_spacing — СІТКА І ПРОСТІР award-RE (VI-grounded) ★★
> Поглиблено VI-grounded. 2026-06-09. Споріднено: [[PB_media]] [[PB_typography]] [[PB_color]] [[D_SilverPinewood_architecture]].

## 0. РОЛЬ
Простір + вирівнювання = «редакторськість» (дорого). Щільність = дешево. VI-luxury: багато повітря, асиметричні зсуви, КОЖЕН слот має фіксований розмір.

## 1. VI-СИСТЕМА (з sweep)
- **Spacing з design-токенів, НЕ magic-px** ★: VI рахують відступи через `calc()` від токенів сітки — `translateY(calc(var(--spacing)/30*-105 + var(--spacing-layout)))`, `padding:calc((var(--padding-top)*-1 + var(--spacing-layout)))`. Parallax-дистанція теж з токенів. → один масштаб тримає все.
- **aspect-ratio-слот дисципліна** ★ (з [[PB_media]]): кожен медіа-слот має locked `aspect-ratio` → плейсхолдер тримає місце (0 CLS) + сітка передбачувана.
- 12-колонкова сітка + max-width 1200-1440 + бічні clamp.

## 2. СИСТЕМА ТОКЕНІВ
```css
:root{
  --spacing: clamp(16px, 2vw, 32px);          /* базовий крок (8pt-сумісний) */
  --spacing-layout: clamp(80px, 12vh, 200px); /* вертикальний ритм секцій */
  --pad-x: clamp(20px, 5vw, 80px);            /* бічні поля (мобіл→16-20px) */
  --gap: 2vw; --col: calc((100% - 11*var(--gap))/12);
  --max-w: 1440px;
}
.section{ padding: var(--spacing-layout) var(--pad-x); }
.container{ max-width: var(--max-w); margin: 0 auto; }
.grid{ display:grid; grid-template-columns:repeat(12,1fr); gap:var(--gap); }
.media-slot{ aspect-ratio: 4/3; }  /* locked → 0 CLS */
```
Усі відступи кратні базовому кроку (8/16/24/32/48/64/96/128). Parallax/transform значення — теж calc() від токенів (узгодженість з [[PB_motion_score]]).

## 3. РИТМ І АСИМЕТРІЯ
- Багато повітря МІЖ секціями (luxury = пауза). Vertical-rhythm `--spacing-layout`.
- **Асиметрія навмисна** ★: контент зсунутий у сітці (`offset--md-4`, як SP `col col--md-6 offset--md-4`), не все по центру. Editorial.
- Чергування media-left/media-right слайд-до-слайду (з [[P_realestate]] rhythm).
- Stat-strip («Стеля 5.9м») — компактна пунктуація між великими блоками.

## 4. МОБІЛЬНИЙ ([[PB_responsive]])
12→1-2 колонки, бічні clamp вниз до 16-20px, ритм зберегти (не злипати), aspect-ratio-слоти лишаються (0 CLS і на мобілі).

## 5. ПОМИЛКИ
magic-px замість calc()-токенів (масштаб розсинхронюється) · щільно без повітря · усе по центру (нудно, не editorial) · відступи не від токена · нема max-width (4K-розтяг) · медіа без aspect-ratio (CLS) · контент прилипає до країв.

## 6. ЧЕК
☐ spacing з calc()-токенів (не magic-px) ☐ 12-кол + max-width ☐ aspect-ratio на КОЖНОМУ медіа-слоті (0 CLS) ☐ багато повітря між секціями ☐ навмисна асиметрія (offset) ☐ бічні clamp ☐ кратність базовому кроку ☐ мобіл зберігає ритм+слоти.
