---
id: oval-mask
name: "Portrait oval mask with parallax-within media (EVER hero oval)"
level: 1
kind: component
status: official
entry:
  call: "OvalMask.init(target, opts)  // target = .ovm wrap el/selector(s). Markup: <div class='ovm' data-oval-mask><video|img class='ovm__media'>…</div>. opts: { ratio, scale, parallax, drive }. The wrap's aspect-ratio sets the oval; the engine sets the ellipse clip + parallaxes the inner media."
  module: iife
  returns: "{ masks, destroy }"
meaning:
  what: "EVER's portrait OVAL with media inside — the hero 'eveR' oval (a looping muted video between the wordmark letters), the ARCHITECTURE/INTERIOR ovals. A fixed-shape ellipse clip-path on a wrap; the media INSIDE parallaxes (over-scaled ~1.1 and drifting a few px on pointer/scroll) while the MASK ITSELF never deforms (no morph). The mask is static; only the content moves — that subtle life inside a still frame is the luxury detail. Config-driven: any ratio, scale, parallax amount, and drive (pointer/scroll/both)."
  when: "A hero or editorial beat that wants a single piece of media held in an elegant portrait oval with quiet life inside — EVER's right-hero oval between the letters, an interior render in an oval beside copy, a portrait clip in a dark panel. The 'a window into the world, alive but framed' detail; pairs with a giant wordmark (the oval sits between/over letters) or a split panel."
  not_when: "Full-bleed media (use a plain cover image / section-pager pane). A rectangle frame is wanted (just use overflow:hidden, not an ellipse). Many tiles (rotated-mosaic-hero / a grid). When the mask must change shape or morph (this mask is deliberately static — morphing masks read gimmicky and were not how EVER does it). Touch-only with no pointer (set drive:'scroll' or 'none')."
source:
  grammar: "EVER hero right-half oval (clip-path ellipse ~0.62-0.69 portrait, a looping muted video inside, parallax-within on pointer; mask static) + the ARCHITECTURE/INTERIOR ovals. Live-measured."
  recording: "ever-live-here.com hero (live) + apps/quadro/.award-re/teardowns/EVER-MOTION-SPEC-live.md"
  registry_ref: ["T-ovalmask-ever"]
stack: "vanilla JS only (no libs). clip-path ellipse + a single rAF lerp for the inner drift."
webgl: false
motion_props: [transform]
trigger: "pointer (and/or scroll) drives the INNER media drift via a rAF lerp; the clip shape is static. reduced-motion / drive:none -> static."
timing_layer: [A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [hero, chapter, material]
combines_with: [bleeding-wordmark, fluid-type-sizing, section-pager, parallax-collage, theme-tween]
anti_combos: []
gated_by: [R_perf_limits, R_reduced_motion_fallback]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a STATIC portrait ellipse clip-path on the wrap (the shape NEVER animates/morphs); the wrap's aspect-ratio sets the oval (~0.62-0.69)"
  - "the inner media is over-scaled (~1.1) so the parallax drift never reveals an edge; a <video> inside autoplays muted/looped/playsinline"
  - "the inner media PARALLAXES WITHIN the static mask (drifts a few px toward the pointer and/or on scroll) via a rAF lerp — proven: clip identical as the pointer moves, media tx -11 -> +11"
  - "transform-only on the inner media (GPU layer); NO mix-blend / NO backdrop; the clip-path shape is static"
  - "reduced-motion / drive:'none' -> static (media centred, no drift); window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR clip-river video in a portrait oval on an EVER-style dark panel"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Confirm: the media sits in a clean portrait oval; moving the pointer drifts the media INSIDE while the oval shape stays IDENTICAL (mask static, not morphing); a video inside plays. NOTE: the standard blank/solid-<img> gate does NOT apply (a single decorative oval on a panel is mostly panel + a <video>, which the solid-<img> check reads as blank — a false fail). The real gate = clip-stable + parallax-within (tx differs) + fps>=50, eye-checked in a real browser."
note: |
  First of the 7 smaller remaining bricks. A decorative/hero detail, not a section.
  Pairs with bleeding-wordmark (the oval sits between/over the giant letters, EVER's
  hero) and section-pager. Gate caveat logged: a single oval+video reads as blank to
  the solid-<img> check — use the clip-stable + parallax-within eye-check instead.
---

# oval-mask — portrait oval with parallax-within media (EVER hero oval)

EVER's portrait oval with a looping clip inside: a static ellipse clip-path, the
media parallaxing within while the mask never deforms. The 'window into the world,
alive but framed' detail.

## Markup + call
```html
<div class="ovm" data-oval-mask style="aspect-ratio:0.66/1">
  <video class="ovm__media" src="clip.mp4" autoplay loop muted playsinline></video>
</div>
```
```js
OvalMask.init('[data-oval-mask]', { ratio:0.66, scale:1.12, parallax:12, drive:'pointer' });
```

## Proven (the lab)
OUR clip-river video in a 0.66 portrait oval on a dark EVER-panel. Clip stable
(ellipse identical as the pointer moves = mask never deforms); media drifts tx −11
→ +11 = parallax-within; video playing; 59.9fps. Gate = clip-stable + parallax-within
eye-check (the blank/solid-<img> gate doesn't apply to a single oval on a panel).
