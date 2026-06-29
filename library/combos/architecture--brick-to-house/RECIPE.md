---
id: architecture--brick-to-house
name: "Від фактури до дому"
level: 2
kind: section-variant
status: base
section: architecture
mode: scroll
meaning:
  what: "An editorial architecture beat that reads the building from its material outward. ONE pinned scroll drives a two-beat film inside a single clipping frame: BEAT 1 holds on the MATERIAL macro (the QUADRO terrace pergola junction up close, timber soffit + dark aluminium posts, renders/macro-pergola.webp), scroll-scrubbed Ken-Burns inside the frame (scale 1.0 -> 1.14) while a held serif line says what it is made of; at the SEAM (p .42 -> .58) the macro recedes and the whole facade (renders/day-front.webp, white plaster + dark glazing) rises in by opacity; BEAT 2 the facade continues a gentler zoom while the serif line crossfades to what it became. The frame never goes blank, the read is from the material in the hand to the whole house. COPY-TO-FRAME TRUTH: the copy names ONLY what each frame shows (timber, dark aluminium, plaster, glazing); there is no clinker brick in any QUADRO render, so no brick is ever claimed."
  when: "The ARCHITECTURE chapter of a residential page, when the building should be sold by its substance, not its mood. The one section that earns trust by showing the material first and the form second: a craft argument, not a hero shot. Use where one held render + one big poetic sentence per beat reads richer than a gallery."
  lands: "You scroll one section. A close crop of warm timber and dark aluminium slowly fills its frame while a serif line tells you what the house is made of, then the crop dissolves into the whole facade and the line answers what it became. Two renders, one frame, one sentence per beat, gliding off one scroll. It reads authored and expensive, a craft statement, not a slideshow."
source:
  grammar: "crownd.at/projekte/finest F3 (scroll-zoom-image-pair): a portrait render in a fixed clipping frame scroll-zooms beside held serif copy. Springs (springs.estate) architecture grammar: ONE big poetic sentence per section, named choreography, restrained reveal on a single ease family (cubic-bezier .25,.74,.22,.99 register), the counter-parallax L/R pair (designMoveLeftImage / RightImage) and WebGL used for only a few emotional beats, never the read."
  recording: null
  registry_ref: ["T-finest-F3-scroll-zoom-pair", "T-springs-architecture-restraint"]
uses:
  - { atom: scroll-zoom-image-pair, job: "supplies the clipping-frame contract (.szp-stage / .szp-figure / .szp-frame / .szp-copy[data-zoomcopy]) and its PURE apply/set(p) frame-bound Ken-Burns (scale 1.0 -> 1.14). The variant kills the atom's own auto ScrollTrigger so the harness pin is the single scroll driver, then calls set(p) for BEAT 1 (the macro) and drives the facade zoom + the macro->facade opacity seam + the copy crossfade manually off the SAME pin." }
pin:
  owner: none
  count: 1
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase (cdn cloudflare) + scroll-zoom-image-pair atom; Lenis managed by the atom layer (manageLenis:false here, harness owns scroll)"
webgl: false
ease: air
motion_props: [transform, opacity]
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "Exactly ONE pin: the HARNESS owns it (SectionHarness.pin('#combo', {start:'top top', end:'+=200%', scrub:0.7})); the cited atom's own ScrollTrigger is killed at init so it adds no second pin and no competing scroll driver. expectPins:1, pinOwner:'harness'."
  - "BEAT 1 (p 0 -> .50): the MATERIAL macro (renders/macro-pergola.webp, timber soffit + dark aluminium) scroll-zooms inside its clipping frame via the atom's PURE set(p/0.5), scale 1.0 -> 1.14, reversible; copy holds 'Тепла фактура', body names only what the frame shows (тимбер перголи, темний алюміній)."
  - "SEAM (p .42 -> .58): a CustomEase (.65,0,.35,1) crossfade hands the frame from macro to the whole facade (renders/day-front.webp) by OPACITY; the macro recedes to 0.18 and never goes fully blank; the serif title crossfades 'Тепла фактура' -> 'Цілий дім' and the body, index (01->02, фактура->фасад) and legend swap at the seam midpoint."
  - "BEAT 2 (p .50 -> 1): the facade continues a gentler Ken-Burns (scale 1.0 -> 1.10, tiny settle rise) off the same pin; a hairline progress rail tracks p with a scaleX fill."
  - "Engine laws: transform (scale/translateY) + opacity + overflow-clip (the frame) only; NO WebGL, NO mix-blend, NO backdrop-filter, NO width/height/top/left; will-change cleared after the one-shot copy lift; reduced-motion / <=820px show both renders, copy revealed, no transform driving."
  - "The extended __LAB_OK__ passes: 1 pin, scroll-zoom-image-pair ran without throwing, [data-render-surface] (the macro frame) painted a decoded image, 0 console errors; verified mid-scroll p=.50 shows macro 0.59 / facade 0.5 / titles 0.5/0.5 / index 02 (the seam genuinely mid-sweep)."
---

# architecture--brick-to-house — "Від фактури до дому"

The architecture section that argues the building from its material. One pinned scroll
runs a two-beat film inside a single clipping frame: the material first, the house second.

> COPY-TO-FRAME TRUTH (jury fix): `macro-pergola.webp` shows the QUADRO terrace pergola
> junction up close, dark TIMBER soffit slats + matte DARK ALUMINIUM posts, and the facade
> (`day-front.webp`) is white plaster + dark glazing. There is NO clinker brick in any
> QUADRO render, so the copy names ONLY timber + dark aluminium (BEAT 1) and plaster + the
> assembled facade (BEAT 2). The named material is always the dominant subject of the frame.

## The two beats (one scroll)
- **BEAT 1 — фактура.** The MATERIAL macro (`renders/macro-pergola.webp`, timber soffit +
  dark aluminium posts) is the hero. The `scroll-zoom-image-pair` atom's pure `set(p)` scrubs a
  frame-bound Ken-Burns, scale `1.0 -> 1.14`, mapped to the pin's first half (`set(p/0.5)`).
  The held serif line reads "Тепла фактура", the body names the materials actually shown
  (тимбер перголи, темний алюміній, тепла фактура під рукою).
- **SEAM — p .42 -> .58.** A `CustomEase('.65,0,.35,1')` crossfade hands the frame from the
  macro to the whole facade (`renders/day-front.webp`) by OPACITY. The macro recedes to `0.18`
  (never blank, so the frame never flickers); the facade rises in. The serif title crossfades
  to "Цілий дім", the body / index (`01 -> 02`, фактура -> фасад) / legend swap at the midpoint.
- **BEAT 2 — фасад.** The facade continues a gentler Ken-Burns (scale `1.0 -> 1.10`, a small
  settle rise of `14px -> -0`) off the same pin. A hairline accent rail tracks `p`.

The read: *from what it is made -> what it became.*

## Why the atom's own trigger is killed
`scroll-zoom-image-pair.create` always builds its own `top bottom / bottom top` scrub
ScrollTrigger. For a SUSTAINED pinned two-beat read the harness must be the single scroll
driver (pin budget = 1, one scroll owner). So at init the variant calls `create(...)` for the
frame contract + the pure `apply`, then `szp.trigger.kill()` / `szp.reveal.kill()`, and drives
`set(p)` from `SectionHarness.pin(...).onUpdate`. The atom still paints the macro into the
`[data-render-surface]` frame and supplies the verified zoom math; the choreography is the
variant's (CONTRACT law: combos cite ids and orchestrate by hand).

## Type / color / motion (concrete)
- Display = Fraunces italic 300, H2 `clamp(40px, 5.2vw, 92px)`, `line-height .96`,
  `letter-spacing -.03em`; one word per line accented in terracotta `#b56a4a`.
- Body Inter 400 `clamp(15px,1.05vw,18px)/1.7` at `.78` cream; eyebrow + index + legend
  uppercase Inter 500/600 `11-12px`, `letter-spacing .14-.2em`.
- Field `#14110d` warm-dark (not `#000`); foreground cream `#f4efe6`; single accent terracotta.
- Air: section padding `clamp(80px,12vh,200px)` y / `clamp(20px,5vw,80px)` x; figure
  `box-shadow 0 40px 120px -40px rgba(0,0,0,.7)`; asymmetric `1.32fr / 1fr` grid (render-led).
- Motion: copy lift once on enter (`air` = cubic-bezier(0.22,1,0.36,1), `1.0s`), seam crossfade
  on `CustomEase('.65,0,.35,1')`, scrub `0.7`. Transform/opacity only. One heroic moment: the
  macro-to-facade seam. `will-change` cleared after the copy lift.

## Gate
Open `combo-lab.html` (served, not file://). `__LAB_OK__` true on init: 1 pin (harness),
`scroll-zoom-image-pair` ran, the macro frame painted a decoded image, 0 errors. Scroll the
pinned range and confirm the macro zooms and fills, then dissolves into the whole facade as the
serif line answers "Цілий дім", reversible on scroll-up. Verified mid-scroll p=.50: macro 0.59 /
facade 0.5 / both titles 0.5 / index 02 — the seam genuinely mid-sweep on OUR QUADRO renders +
Ukrainian copy. Re-verified after the copy-to-frame fix: __LAB_OK__ true, 1 pin, 0 errors;
4x-equivalent CPU probe across the full 90-step pinned range = 59.9 fps, jank 0%.
