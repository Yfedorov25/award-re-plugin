# PB_microinteractions — МІКРОВЗАЄМОДІЇ award-RE (VI-grounded) ★★
> Поглиблено з sweep 5 VI. 2026-06-09. Споріднено: [_TECHNIQUE_REGISTRY](../../variants-prototyping/references/_TECHNIQUE_REGISTRY.md) §7 [PB_visual_search](../../re-visual-search/references/PB_visual_search) [PB_interactive_map](../../re-interactive-map/references/PB_interactive_map) [PB_forms_lead_capture](../../forms-lead-capture/references/PB_forms_lead_capture) [PB_nav](../../re-sections/references/PB_nav.md).

## 0. РОЛЬ
Дрібні реакції = відчуття якості й «живого» інтерфейсу. У RE це ще й конверсійні (favourite, plan-marker, filter). Усі — з реальних VI, no-WebGL, на проєктному ease ([PB_motion_score](../../motion-score/references/PB_motion_score)).

## 1. VI-МІКРОВЗАЄМОДІЇ (реальні, з registry)
- **Custom cursor** (всі: Ever 77×, ERA 15×) — spring/lerp-follow (strength .25, .9 коли clickable), режими: ring-trail / label-disc / directional zoom-in/left/right (карусель) / clickable-grow / button-morph / hidden-spots. Той самий spring-примітив живить курсор + mouse-slider + (де є) webgl-orbit. ✅ (наш Cursor — додати режими).
- **button** ★ — `data-button-clone-content` клонує лейбл (hover text-swap/slide); **btn__outline** = 2×SVG-rect + svgLength draw-on hover (стрейк малюється) + pseudo-fill slide. Варіанти `--square/--border/--underline/--rotation`.
- **plan-marker hover** (visual-search/map) — popover №·м²·ціна, статус-кольори (available warm / sold grey / reserved). Popper/Floating-UI, animation popover-bottom-in/top-out. → [PB_visual_search](../../re-visual-search/references/PB_visual_search) [PB_interactive_map](../../re-interactive-map/references/PB_interactive_map).
- **favourite toggle** — серце active↔inactive + counter-badge bump + hide-if-empty. Cross-page. → [PB_forms_lead_capture](../../forms-lead-capture/references/PB_forms_lead_capture).
- **filter-chip** — active (білий) ↔ inactive (сірий), fade .6s; категорія toggle `state.hidden` маркерів.
- **cardHover/cardsHover** — групований hover (карти offices/units), `data-card-hover-active-classname`.
- **underline-draw links** — dual-pseudo sweep / svgLength.
- **range-slider** (власний `range`, не noUiSlider) — handle+connector drag, money-formatter live.
- **tabs** — image-clip-in-left/right свопає контент; counter «01/12».
- **input** — floating-label (inputState/inputBear), mask (phone), focus/filled/error стани.

## 2. ПОБУДОВА
1. Custom cursor (desktop+fine-pointer only) — режими під контекст (label над медіа «дивитися», directional у каруселі).
2. Усі CTA/links/cards reagують на hover (рух, не миттєво) на проєктному ease, 0.3-0.4s.
3. plan-marker/favourite/filter — конверсійні мікро (RE-специфіка), не декор.
4. Усі стани: hover/focus/active/disabled (focus = a11y!).
5. spring-примітив (GSAP quickTo) для курсора/слайдерів — один на проєкт.

## 3. ДЕРЕВО
luxury-RE → spring-cursor з label-режимами + btn__outline draw + plan-marker popover. Стримано (НЕ цирк ефектів). Усе на ОДНОМУ ease.

## 4. МОБІЛЬНИЙ ([PB_responsive](../../re-sections/references/PB_responsive.md))
Custom-cursor + магніт + hover ПРИБРАТИ (нема курсора/hover). Лишити: tap-feedback, active-стани, range-drag (touch), favourite-tap, тап-зони ≥44px.

## 5. ПОМИЛКИ
миттєвий hover (0s) · нема focus-станів (a11y) · custom-cursor що ламає UX/лишається на мобілі · мікро на чужому ease (не проєктному) · цирк ефектів (не VI-стриманість) · plan-marker без popover-даних · favourite без counter-feedback · filter-chip без чіткого active/inactive.

## 6. ЧЕК
☐ custom cursor spring-режими (desktop only) ☐ усі інтерактивні reagують, рух 0.3-0.4s на проєктному ease ☐ btn clone-content/outline-draw ☐ plan-marker popover №·м²·ціна ([PB_visual_search](../../re-visual-search/references/PB_visual_search)) ☐ favourite toggle+counter ☐ filter-chip active/inactive ☐ усі стани incl. focus (a11y) ☐ desktop-only ефекти прибрані на мобілі ☐ один spring-примітив.
