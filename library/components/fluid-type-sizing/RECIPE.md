---
id: fluid-type-sizing
name: "Giant-word fill-width sizing (EVER hero-word engine)"
level: 1
kind: utility
status: official
entry:
  call: "FluidType.fit(el, opts)  // size live TEXT so its ink fills (containerWidth - 2*gutter)*fill. Also FluidType.fitAll(selector, opts), FluidType.vector(el, opts) for a fixed-ratio svg/img word mark, FluidType.refit(). opts: { gutter, fill, maxFontPx, minFontPx, probePx, container }. gutter = number(px) or fn(viewportWidth)->px (default = EVER's clamp(20px,3.6vw,70px))."
  module: iife
  returns: "the computed font-size (px) for fit/fitAll; the element for vector. All fits auto-track and re-fit on resize (rAF-debounced) and font load."
meaning:
  what: "The giant-word SIZING ENGINE harvested from the live EVER site. Measured live at 3 viewports: EVER's hero word is ALWAYS (viewport - 2*gutter) wide (gutter ramps 20px@768 -> 50px@1440 -> 70px@1920 ≈ clamp(20px,3.6vw,70px)); it is an SVG logo (fixed viewBox ratio) stretched to that width, height following the ratio. The reusable MECHANISM (not EVER's specific letter): a single line is sized so it FILLS the container width minus gutters, at any viewport, for ANY word length. EVER did it with a vector logo (one fixed word); this engine offers the same fill behaviour for live TEXT (mode 'fit') so DIFFERENT words each fill the same width with their own font-size, plus a passthrough 'vector' mode for a fixed-ratio brand mark."
  when: "A giant bleeding wordmark / chapter title that must span the full width edge-to-edge and read at the same authority no matter the word — EVER/Springs-grade section words (АРХІТЕКТУРА / ТЕРАСА / a brand name). Whenever a headline must FILL its line rather than sit at a guessed font-size that clips long words or floats small for short ones. Pairs with bleeding-wordmark (the clip/parallax) and section-pager (the sections)."
  lands: "Every section word, whatever its length, lands flush from gutter to gutter at a confident giant scale — the short word large, the long word smaller, both filling the line exactly. It reads designed and intentional (like EVER's vector logo) instead of an arbitrary px size that breaks on the next word or viewport."
  not_when: "Body copy or multi-line paragraphs (this fits a SINGLE line). Type that should stay a fixed legible size (nav, captions, UI). When a true brand LOGO exists as a vector — then use mode 'vector' (or just an <svg> at width:100%-gutters), not text fitting. Anything where the font-size must be authored exactly rather than computed."
source:
  grammar: "Harvested from the LIVE EVER site (ever-live-here.com): the hero wordmark measured at 768/1440/1920 -> width = viewport - 2*gutter every time; the word itself is an SVG logo (viewBox 0 0 141 40, ratio 3.525) filled to that width. Generalised to live text via a two-pass off-screen-clone fit."
  recording: "ever-live-here.com hero (live measured); spec in apps/quadro/.award-re/teardowns/EVER-MOTION-SPEC-live.md"
  registry_ref: ["T-fluidtype-ever"]
stack: "vanilla JS only (no libs). Off-screen clone measurement + two-pass fit + rAF-debounced refit."
webgl: false
motion_props: []
trigger: "none — a SIZING utility, not an animation. Re-fits on resize + font load."
timing_layer: []
owns_pin: false
owns_scroll: false
page_beat: [hero, chapter, material]
combines_with: [bleeding-wordmark, section-pager, section-curtain-riseover, theme-tween]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "mode 'fit': any single-line word is sized so its INK width fills (containerWidth - 2*gutter)*fill; DIFFERENT words of different lengths each reach the SAME target width with their OWN font-size"
  - "measurement uses an OFF-SCREEN CLONE (copying font-family/weight/style/letter-spacing/text-transform), NOT scrollWidth of the in-flow element (which is clamped by the container — the classic text-fit trap that makes every word read the same)"
  - "two-pass: estimate from a probe, set the size, then re-measure the REAL rendered ink (em letter-spacing scales with size) and correct once -> converges <0.5% (proven 100.0% on three words)"
  - "gutter is config-driven (number px or fn(viewportWidth)->px); default = EVER's measured ramp clamp(20px,3.6vw,70px)"
  - "re-fits on resize (rAF-debounced, no layout thrash) and on document.fonts.ready"
  - "mode 'vector': a fixed-ratio <svg>/<img> word mark fills calc(100% - 2*gutter) with height:auto (EVER's actual hero-logo behaviour)"
  - "asset-substitution gate: the lab proves it on OUR words (quadro/архітектура/тераса) at 3 viewports, not EVER's single logo; window.__LAB_OK__ set once a fit completes"
gate:
  probe: "Open lab.html in a real browser. __LAB_OK__ true after fit. Confirm all three words fill the same target width (gutter to gutter) each at its own font-size; resize the window and confirm all three re-fit to 100%. No DOM-pixel-audit needed (no media); this is a sizing utility — eye-check the fill + a width-ratio check (ink width ≈ viewport - 2*gutter) is the gate."
note: |
  Second harvested primitive per the 2026-06-26 council verdict (harvest the
  MECHANISM, prove config-driven on OUR content, bank, move on). This is the engine
  behind 'the giant word is the wrong scale' problem: EVER's word is a vector logo
  filled to width; replicating it as fixed-px text never matches because different
  words have different widths at one size. fluid-type-sizing makes ANY word fill the
  line. It SIZES only — the clip/parallax/fill (outline vs solid) is bleeding-wordmark;
  the sections are section-pager. Compose the three for an EVER-grade section word.
---

# fluid-type-sizing — giant-word fill-width sizing (EVER hero-word engine)

The sizing engine behind EVER's giant hero/section words. Measured live: EVER's
word always spans `viewport - 2*gutter`; it is a vector logo filled to that width.
This primitive generalises that to live TEXT so ANY word (any length) fills the
line at its own font-size — solving the "the word is the wrong scale" problem that
fixed-px text can never solve.

## The mechanism (measured live)
- EVER hero word width: 728@768, 1340@1440, 1780@1920 = `viewport - 2*gutter` every time.
- gutter ramp: 20 -> 50 -> 70 px ≈ `clamp(20px, 3.6vw, 70px)`.
- The word is an SVG logo (viewBox ratio 3.525) stretched to that width; height follows.

## Why fixed-px text failed (the lesson)
A giant `font-size: 108px` makes "ever" (4 letters) span the screen but "архітектура"
(11) overflow and "quadro" sit small — different words have different widths at one
size. EVER sidesteps this with a vector logo (one fixed word). For OUR varying words
we must COMPUTE the size per word so each fills the line. That is mode 'fit'.

## How fit works (two-pass, clone-measured)
1. Measure the word's natural width at a probe size via an OFF-SCREEN clone (copying
   font-family/weight/style/letter-spacing/text-transform). NOT `scrollWidth` of the
   in-flow element — that is clamped by the container, so every word reads the same
   width (the trap that first broke this).
2. `size = probe * target / natural`; set it.
3. Re-measure the REAL ink width (em letter-spacing scales with size) and correct
   once: `size *= target / actual`. Converges <0.5% (proven 100.0% on 3 words).
4. Re-fit on resize (rAF-debounced) and `document.fonts.ready`.

## Markup + call
`<div class="word" data-fluid-fit>архітектура</div>` then
`FluidType.fitAll('[data-fluid-fit]', { gutter: vw => Math.max(20, Math.min(70, vw*0.036)), fill: 1 })`.
For a vector brand mark: `<svg data-fluid-vector>…</svg>` + `FluidType.vector(el, {gutter})`.

## Asset-substitution gate (the lab)
lab.html fits THREE Ukrainian words of different lengths (quadro 6 / архітектура 11 /
тераса 6) — each to 100% of the same target width, re-fitting at 768/1440/1920 —
proving the engine is config-driven on OUR content, not a trace of EVER's one logo.
