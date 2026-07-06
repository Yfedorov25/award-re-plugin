---
id: theme-tween
name: "Per-section color engine (chrome recolors across seams; modals inherit)"
level: 2
kind: utility
status: official
entry:
  call: "ThemeTween.init(opts)  // opts: { root, sectionSelector, vars, ease, attrPrefix }. Each section: <section data-theme data-theme-bg='#313E48' data-theme-ink='#DCC5B7' data-theme-accent='#AC7E65'>. The engine tweens the root CSS vars toward the centred section's theme."
  module: iife
  returns: "{ activeIndex(), destroy() }"
meaning:
  what: "EVER's per-section COLOR ENGINE — the slate -> brown -> green identity where the whole chrome (background, ink, accent, header, and any modal) recolors as each section comes on screen, TWEENED across the seam (not a hard class flip). Implemented as CSS custom properties (--bg/--ink/--accent…) on a root scope: an IntersectionObserver picks the centred section and the engine lerps the root vars from the current color toward that section's theme in LINEAR-RGB every rAF. Anything that reads var(--*) — the page, the header, a modal — recolors for free, so modals inherit the active section's theme automatically. The other half of the EVER/Springs section identity (bleeding-wordmark is the visible half)."
  when: "Any multi-section page that should carry a per-section palette / mood (day->night, warm->cool, one chapter color per section) where the whole chrome shifts as you move — the thing that makes EVER feel like distinct rooms rather than one flat theme. Whenever the header / accents / a persistent modal must always match the section currently on screen."
  lands: "As you scroll, the entire page mood drifts from one section's palette to the next — background, text ink, accent, the header, even an open modal — smoothly across the boundary, never a jarring flip. Each section reads as its own room; the chrome always belongs to where you are."
  not_when: "A single-palette site (one theme throughout — just set the vars once). A site whose colors must be authored exactly per element rather than tweened. When nothing in the chrome should react to the section (then plain per-section CSS is simpler). Heavy use with dozens of vars on a weak device (keep the var list small)."
source:
  grammar: "EVER per-section palette (slate/brown/green) with the header tinting to the incoming theme across each seam and modals inheriting the active theme; live-read."
  recording: "ever-live-here.com (live) + apps/quadro/.award-re/teardowns/EVER-MOTION-SPEC-live.md"
  registry_ref: ["T-501", "T-M07", "x:T-themetween-ever legacy slug"]
stack: "vanilla JS only (IntersectionObserver + rAF lerp; no libs). Linear-RGB interpolation."
webgl: false
motion_props: [color]
trigger: "IntersectionObserver picks the centred section (ratio>0.5); a single rAF lerp tweens the root CSS vars toward it. NOT scroll-scrubbed, NOT a pin."
timing_layer: [A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [hero, chapter, proof, material]
combines_with: [bleeding-wordmark, section-pager, section-curtain-riseover, parallax-collage, dual-slicer]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "per-section themes via data-theme + data-theme-<var> attrs; the engine tweens the root CSS custom-props (--bg/--ink/--accent…) toward the centred section's theme"
  - "the tween is SMOOTH across the seam (linear-RGB lerp), NOT a hard flip — proven: a mid-transition value sits between the start and settled colors"
  - "the active section is chosen by IntersectionObserver (ratio>0.5); chrome (header) and a modal reading the same vars recolor for free = inherit the active theme"
  - "tweens COLOR custom-properties ONLY (no layout, no transform); linear-RGB (gamma 2.2) interpolation for perceptual smoothness"
  - "reduced-motion -> snap to the active theme (no tween); works WITHOUT GSAP (own rAF lerp)"
  - "window.__LAB_OK__ set on init; asset-substitution gate: OUR day-arc themes (ранок/день/вечір/ніч)"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll between sections and confirm the page bg + ink + accent + header + the floating modal chip all recolor smoothly toward the centred section's theme (a tween, not a snap — a mid value lands between two themes). No DOM-pixel/curtain gate needed (no media swap); the gate is the tween-between check + eye-check."
note: |
  Critical brick #2 of the 4 remaining. With bleeding-wordmark it completes the
  EVER/Springs SECTION IDENTITY (visible giant word + per-section color). A utility
  (color-only), composes with everything; sync it to section-pager so the theme tween
  rides the curtain. Built per the catalog re-count (23 primitives; this + bleeding-
  wordmark done, persistent-index-menu + rotated-mosaic-hero remain of the 4 critical).
---

# theme-tween — per-section color engine

EVER's slate→brown→green identity: the whole chrome recolors as each section comes
on screen, tweened across the seam, and modals inherit the active theme — all via
CSS custom properties lerped toward the centred section.

## Markup + call
```html
<section data-theme data-theme-bg="#313E48" data-theme-ink="#DCC5B7" data-theme-accent="#AC7E65">…</section>
```
```js
ThemeTween.init({ vars: ['--bg','--ink','--accent'], ease: 0.10 });
```
Bind chrome to the vars (`background: var(--bg); color: var(--ink)`); a modal reading
the same vars inherits the active theme for free.

## Proven (the lab)
OUR day-arc themes (ранок warm / день slate / вечір amber / ніч blue-black). Tween
proven: section1→2 bg start rgb(42,33,26) → MID rgb(46,52,58) → settled rgb(49,62,72)
— the mid is between, so it's a tween not a snap. Header + a modal chip recolor via
the same vars = inherit the active theme.
