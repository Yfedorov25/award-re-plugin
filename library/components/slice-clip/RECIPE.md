---
id: slice-clip
name: "Slice-clip render reveal (spec-index)"
level: 1
kind: component
status: official
entry:
  call: "SliceClip.init(opts)  // opts all optional — defaults drive the frs7 DOM ids; the one knob that makes the 3 prototypes is dir: 'lr'|'td'|'bu'. Pass { dir, edge, slides, dwell, hold, pinFactor, lerp, ...sels } to override / author the frs7 DOM and call SliceClip.init({dir})"
  module: iife
  returns: "{ st, render, slides, destroy }  (or { static:true, slides, destroy } in the reduced-motion / narrow branch)"
meaning:
  what: "A pinned frs3 COMPOSITION — a numbered spec-RAIL on one side (38%), a BIG contained fixed-size RENDER on the other (62%), ~2cm gap, bronze accent — where each beat the render SWAPS via a CLEAN CLIP-PATH WIPE. TWO stacked <img> layers, BOTH opacity:1 (outgoing zIndex 1 underneath, incoming zIndex 2 revealed by animating its clip-path inset along ONE axis), so there is a single clean travelling edge: NO opacity ghosting, NO blank, NO cover-plate. Held current photo ~78% of each beat, then a gentle glide-eased wipe over the last ~22%; a Lenis-smoothed, pinned, scrubbed scroll drives a pure render(prog) and a continuously gliding rail marker."
  when: "An indexed gallery / route of renders (a numbered spec-list paired with one big quiet render that changes per beat) where each photo should give way to the next as a deliberate, expensive SLICE rather than a soft dissolve — material proof, day/night/terrace/aerial route, a guided tour of one house."
  lands: "Each render gives way to the next on one crisp travelling edge while the numbered rail tracks the beat — the swap reads as a deliberate cut, never a muddy crossfade; the photo is always whole, the index always honest."
  not_when: "A soft mood crossfade (use a 2-img opacity dissolve), a single hero, body copy, or content that must not be pinned. Not when there is no indexed render-deck to walk through. Never reach for video.currentTime scrubbing — that is the anti-pattern this replaces."
source:
  grammar: "QUADRO slide-lab — frs7 slice L→R clip-reveal on the frs3 spec-rail + contained-render composition (the clean-cut answer to the muddy crossfade)"
  recording: "apps/quadro/public/slide-lab/frs7-slice-lr-clip.html"
  registry_ref: []
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase + guarded Lenis 1.1.13"
webgl: false
motion_props: [clip-path, opacity, transform, color, left, top]
trigger: "one pinned scroll-scrub timeline (scrub:true), Lenis-smoothed, reversible"
timing_layer: [B-entrance, C-pinned]
owns_pin: true
page_beat: [proof, material]
combines_with: [puzzle-text, focus-render-switch]
anti_combos: [second-pin]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: [slice-top-down, slice-bottom-up]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "render swaps via a clip-path inset wipe, NEVER an opacity crossfade or video.currentTime"
  - "both <img> layers stay opacity:1 the whole time (outgoing underneath zIndex 1, incoming revealed by the clip) — zero ghosting, zero double-exposure"
  - "outside the wipe window exactly one photo fills the frame (no blank, no cover-plate)"
  - "frs3 composition: numbered spec-rail LEFT 38%, big contained fixed-size render RIGHT 62%, ~2cm gap, bronze accent"
  - "ONE smoother: Lenis 1.1.13 lerp 0.1 -> gsap.ticker -> ScrollTrigger.update, lagSmoothing(0); render(prog) pure fn; pin/pinSpacing/scrub:true"
  - "wipe holds ~hold of the beat then travels on the gentle glide ease (0.45,0.05,0.2,1), not the snappy air"
  - "transform / opacity / clip-path only — no WebGL, no mask-composite, no mix-blend / backdrop over the scrub, no video.currentTime"
  - "the bronze edge-line is kept ONLY for dir=lr; the td/bu variants ship edge:false (the edge travelled opposite the wipe = a bug)"
  - "reduced-motion / <=820px collapse to a static readable stack (no Lenis, no pin, no scrub)"
verify: "lab.html#__LAB_OK__"
---

# slice-clip — slice-clip render reveal (spec-index)

> **BASE = frs7-slice-lr-clip** (owner-approved, gate-passing). A pinned **frs3
> COMPOSITION**: a numbered spec-**RAIL** on the LEFT (38%), a **BIG contained
> fixed-size RENDER** on the RIGHT (62%), ~2cm gap, bronze accent. Each beat the
> render **SWAPS via a CLEAN CLIP-PATH WIPE** — two stacked `<img>` layers, BOTH
> `opacity:1`, the incoming one revealed by animating its `clip-path` inset along
> ONE axis. One clean travelling edge. **No opacity ghosting, no blank, no
> cover-plate.** A Lenis-smoothed, pinned, scrubbed scroll drives a pure
> `render(prog)`; the rail marker glides continuously to the active beat.
> Source recording: `apps/quadro/public/slide-lab/frs7-slice-lr-clip.html`.

## STRICT 1:1 — what frs7 shows, and nothing else
The base is **one indexed render-deck where each photo gives way to the next on a
single clean clip edge, the numbered rail tracking the beat.** There is **no
opacity crossfade, no video scrub, no second pin, no portrait take-over.** Those
are not part of this technique and must not be added.

## The move (what the eye sees)
1. **Held** — exactly one render fills the contained frame on the right; the
   active row on the left rail is bronze-lit, its one-line sub open. The current
   photo holds still for ~78% of the beat.
2. **Slice** — over the last ~22% the INCOMING photo (already painted on the
   stacked layer above, opacity:1) is revealed by a `clip-path` inset opening
   along one axis. One side of the travelling edge is the new photo, the other
   the old, meeting at a single hard edge. The wipe rides a gentle **glide**
   ease so it starts and ends softly.
3. **Seated** — the new photo fills the frame; the rail marker has glided to the
   next row, the counter and tag flip at the midpoint.
4. **Reverse** — scrubbing back runs the same pure `render(prog)` backward; the
   slice un-wipes. The section is **pinned** for `(N-1)·pinFactor` viewport
   heights; that is the whole timeline.

## Why it cannot ghost / blank (the key idea that makes it look expensive)
Both layers are **opaque images filling the same rect**; the clip only chooses
**which one paints per column / row**. There is never a moment of transparency
(no double-exposure) and never a moment of nothing (the media centre is always a
photo — the gate pixel-audit reads 0 cream). `clip-path inset` is GPU-composited
in Chromium, so the edge travels cheaply. This is the **clean-cut answer to the
muddy 2-image crossfade** and to the banned `video.currentTime` scrub.

## The one knob that makes the 3 prototypes — `dir`
`dir: 'lr' | 'td' | 'bu'` chooses the inset axis the incoming layer opens on:

| dir | wipe | closed inset | open inset | edge |
|-----|------|--------------|------------|------|
| `lr` (BASE, frs7) | left → right | `inset(0 100% 0 0)` | `inset(0 0 0 0)` | **vertical bronze line, kept** |
| `td` (frs8)       | top → down   | `inset(100% 0 0 0)` | `inset(0 0 0 0)` | removed (edge:false) |
| `bu` (frs10)      | bottom → up  | `inset(0 0 100% 0)` | `inset(0 0 0 0)` | removed (edge:false) |

Everything else — the frs3 composition, the Lenis engine, the pure `render(prog)`,
the parity-locked two-layer swap, the rail logic, the timing — is **identical**.
So `td` and `bu` are **params-over-base** (`variants/*/params.json`), not forks.

## Hard rules
- **Display = Fraunces serif**, big; rail + meta = **Inter.**
- **The swap is a CLIP, never a fade.** Both `<img>` layers stay `opacity:1`; only
  `clip-path` (and `zIndex` parity) changes. **No `video.currentTime`.**
- **ONE smoother:** Lenis 1.1.13 `lerp:0.1` → `gsap.ticker` → `ScrollTrigger.update`,
  `lagSmoothing(0)`. `render(prog)` is a **pure** fn from `onUpdate` + once at init.
- **The bronze edge-line is kept ONLY for `dir:'lr'`.** For `td` / `bu` it was
  **removed on purpose** — it travelled opposite the actual clip seam, reading as a
  stray line from the wrong side. **Do not re-add it** to the top-down / bottom-up
  variants.
- **No WebGL**, no mask-composite, no mix-blend / backdrop-filter over the scrubbed
  surface. `prefers-reduced-motion` OR `<=820px` → static readable stack (no Lenis,
  no pin, no scrub).
- Ukrainian Fedoriv copy, zero em-dashes in visible copy.

## Easing & timing
- Wipe ease `CustomEase 'glide' = 0.45,0.05,0.2,1` (gentle ease-in-out so the seam
  starts/ends softly — smoother than the snappy air).
- Rail-marker ease `CustomEase 'air' = 0.25,0.74,0.22,0.99`.
- `dwell 0.86` of progress advances the whole deck; per beat `hold 0.78` then wipe
  the last `1-hold`. Pin length `= innerHeight · (N-1) · pinFactor` (`pinFactor 1.4`).

## DOM structure (frs7)
```
.pin #pin (pinned)
  └ .stage #stage          grid-template-columns: 38% 62%
     ├ .rail               the numbered spec-rail (left)
     │  └ .railInner .list #list   → JS appends a .row per slide (num · name · sub)
     │       └ .marker #marker     the gliding bronze marker
     ├ .text .media #media         the contained fixed-size render (right)
     │  ├ .layer #layerA > img#imgA   layer A holds EVEN beats (parity-locked)
     │  ├ .layer #layerB > img#imgB   layer B holds ODD beats; revealed by the clip
     │  ├ .edge  #edge                the bronze slice edge (lr only)
     │  └ .tag   #tag                 the beat tag
     ├ .count #count                  NN / 0N (left of the media)
     ├ .progress > .progress__fill #progFill   the scaleY progress line
     └ .hint #hint                    NN / 0N (bottom-right)
```
The JS sets `media[data-dir]` so the CSS picks the vertical (lr) or horizontal
(td/bu) edge skin. No-JS / reduced-motion / narrow shows a static readable stack.

## Entry point (the truth on disk)
- `SliceClip.init(opts)` — builds the rail rows, wires the Lenis smoother, pins
  the stage, and scrubs the reversible clip-wipe deck; returns `{ st, render,
  slides, destroy }` (or `{ static:true, slides, destroy }` in the reduced-motion
  / narrow branch). `opts` are **all optional**: with `{}` it drives the frs7 DOM
  ids with `dir:'lr'`; pass `{ dir, edge, slides, dwell, hold, pinFactor, lerp,
  ...selectors }` to override.

## Gotchas
- **Keep the two layers parity-locked.** Layer A holds EVEN beats, layer B holds
  ODD, so during a wipe from beat `i` to `i+1` both `<img>` already carry the right
  photo — never swap the `src` of the layer that is mid-wipe.
- **Never set opacity on a layer.** The clip is the whole mechanism; an opacity
  fade re-introduces the ghosting this technique exists to kill.
- **Do not re-add the edge-line to `td` / `bu`.** It is removed on purpose.
- **`render(prog)` must stay pure** — drive it only from `onUpdate` (+ once at init);
  do not animate it on its own timeline, or it desyncs from the scrubbed scroll.
- **Measure the rail AFTER fonts load** (`measureRail()` on `load` + `resize`), or the
  marker snaps to the wrong row on font swap.

## Variants
- **slice-clip (base)** — this file. frs7 slice **LEFT→RIGHT**, keeps its vertical
  bronze edge-line.
- **slice-top-down** (`variants/slice-top-down/`) — from frs8. The SAME engine,
  clip wipes **TOP→DOWN** (`dir:'td'`). The bronze edge-line was **removed on
  purpose**. Ships as `params.json` over the base (data, zero code).
- **slice-bottom-up** (`variants/slice-bottom-up/`) — from frs10. The SAME engine,
  clip wipes **BOTTOM→UP** (`dir:'bu'`). The bronze edge-line was **removed on
  purpose**. Ships as `params.json` over the base.

## Files
- `lab.html` — self-contained frs7 demo (LEFT→RIGHT clip wipe, kept edge, static
  fallback, `__LAB_OK__` probe).
- `component.css` / `component.js` — drop-in canonical copies (the engine is
  parameterized over `dir` + `edge`).
- `tokens.json` — the knob contract.
