---
id: clean-floor-hover-select
name: "Clean floor-hover select (pick a floor on a static building render; each floor is a hand-traced PERSPECTIVE polygon — a corner-wrapping two-quad chevron in a viewBox-locked SVG — so the terracotta highlight RIDES the building instead of floating flat; one tooltip card y-tracks the hovered floor)"
level: 2
kind: component
status: official
entry:
  call: "CleanFloorHoverSelect.create(target, opts)  // target = .cfh-stage > .cfh-render( img.cfh-img + svg.cfh-floors ) + .cfh-card( .cfh-card__num + .cfh-card__lab + .cfh-card__sub ). opts: { imgW, imgH, bands:[{floor,label,sub,status,points,anchor}], fit, fillOn, hoverDur, cardDur, ease, onSelect }."
  module: iife
  returns: "{ set(floor), select(floor), clear(), bands, destroy }"
meaning:
  what: "EVER visual-search LEVEL 1 — pick a FLOOR on a static near-elevation building render, with the razor-clean floor highlight EVER has. THE ANTI-CROOKED CORE: one <svg> over the <img> with viewBox LOCKED to the render's intrinsic pixel size + preserveAspectRatio MATCHING the img fit (so SVG units == image pixels at every screen size); each floor is a hand-traced PERSPECTIVE polygon (corner-wrapping chevron of two quads) so the highlight RIDES the building's perspective. Hover -> terracotta fill + dark top-edge stroke; ONE tooltip card whose y tweens to the hovered floor."
  when: "The floor-pick step of a visual-search / unit-selector on a real building render (elevation or 3/4) — when you want the floor highlight to sit FLUSH on the building's perspective, not as a crooked flat bar. This is the fix for the crooked floor-hover lines in smarts/towns. Use it as Level 1 of a building→floor→unit drill-down (pairs with numbered-floorplate-select for Level 2). Any premium RE site whose hero is a building render and needs an elegant floor selector."
  lands: "A lit tower on a dark field; as the cursor moves up the building a clean terracotta band lights exactly on a floor's window row — and it bends at the building's near corner, sloping down the front face and up the side face, sitting flush like it's painted on the glass. A small card glides alongside naming the floor and its offer. It reads as precise and architectural, never a sticker floating over a photo."
  not_when: "Axis-aligned hotspots over a flat/orthographic plan (use isometric-building-unit-selector). A site/aerial plan with building pills + POI (that's Level 0 — out of this brick's scope). When you have no per-floor traced geometry (you MUST trace the polygons over the render once — guessed coords land between window rows and look amateur). A scroll-driven reveal (this is hover/click). Live 3D (banned + worse than a well-traced SVG)."
source:
  grammar: "EVER /visual-search/5: chosen building full-color (others dimmed), giant HOUSING N terracotta wordmark, Back-to-plan pill; hovering a floor lights a clean terracotta band that bends at the building corner + a left tooltip card that tracks the band's Y; sold floors highlight but show 'Apartments not on sale'."
  recording: "apps/quadro/.award-re/teardowns/D_ever_visualsearch_video.md (§2; Brick A / Level 1 of the EVER visual-search harvest). Smarts retrofit: SMARTS_VS_UPGRADE_ever-model.md (FIX 1)."
  registry_ref: ["ever-clean-floor-hover-select"]
stack: "vanilla + GSAP 3.12.5 (no ScrollTrigger)"
webgl: false
motion_props: [fill-opacity, stroke-opacity, transform, opacity]
trigger: "hover/click (no scroll)"
timing_layer: [I-interactive, T-visual-search]
owns_pin: false
owns_scroll: false
page_beat: [visual-search, floor-select, unit-selector]
combines_with: [numbered-floorplate-select, veil-flat-detail-reveal, isometric-building-unit-selector]
anti_combos: [scroll-driven, webgl-3d]
gated_by: [R_no_webgl, R_perf_limits]
variants: [isometric-building-unit-selector]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ONE svg.cfh-floors over the render with viewBox LOCKED to the render's intrinsic px + preserveAspectRatio matching the img fit (NOT 'none' over object-fit:cover)"
  - "each floor = a hand-traced 6-point PERSPECTIVE polygon (corner-wrapping chevron: front face + side face sharing the near-corner edge), top/bottom edges parallel to each face's floor-lines"
  - "adjacent floors SHARE vertices (floor N bottom == floor N+1 top) -> zero gaps/overlap"
  - "hover -> band fill 0->~0.45 terracotta + a darker-red top-edge stroke (~1.5-2px); fast (~150ms), subtle, no flash"
  - "ONE tooltip card whose y GSAP-tweens to the hovered floor's anchor/centroid Y + swaps text (never re-mounted); CSS ::after triangle pointer aimed at the band"
  - "sold / not-on-sale floors highlight cooler (grey-blue) + show a card with no buy CTA; geometry lives in bands[] DATA, not hand-typed HTML"
  - "SVG fill/stroke + transform + opacity only; NO mix-blend / NO WebGL; reduced-motion or <=820px -> a floor button-list; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Hover up the building: a clean terracotta band lights on each floor's window row and BENDS at the building corner (rides the perspective — not a flat horizontal bar); the one tooltip card glides to the hovered floor + swaps text; a sold floor highlights cooler with 'not on sale'; click fires onSelect. Verify the locked viewBox, the chevron bands (sloped + shared vertices), the y-tracking tooltip, + fps. Drive hover via real mouseenter on .cfh-band; screenshot a mid-building floor to see the corner bend."
note: |
  Brick A of the EVER visual-search harvest (Level 1) — the user's #1 complaint: smarts/towns floor-hover
  lines look CROOKED, EVER's are razor-clean. THE FIX (and the whole technique): the SVG overlay's
  viewBox is LOCKED to the render's intrinsic pixels + preserveAspectRatio MATCHES the img fit, so the
  overlay can never desync from the render at any size; AND each floor is a hand-traced PERSPECTIVE
  polygon (a corner-wrapping chevron of two quads) so the band rides the building's slope + bends at the
  near corner — never an axis-aligned <rect> (which can't sit flush on a receding facade — that IS the
  crookedness). Adjacent floors share vertices (no gaps). Geometry is DATA (bands[]), traced once over
  the real render — never guessed. The ONE tooltip card y-tweens (not re-mounted = no flicker). Marked
  relative (in `variants`): isometric-building-unit-selector (axis-aligned rect hotspots, preserveAspect
  'none', filter bar, cursor card) — THIS is its anti-crooked sibling. Proven: locked viewBox, 6-pt
  chevron bands frontSloped + sharedVerts, hover fill .45 + stroke .9, tooltip y-track 232px, sold-state,
  onSelect; 0.60% jank; zero console errors. The lab's "render" is a synthetic perspective tower built
  from the same geometry as the bands (so they provably ride it); in production = a real <img> + bands[]
  traced over it. This is the direct fix for smarts units.js FIX 1 (kill the crooked floor-hover).
  Serif = Playfair Display; accent terracotta #c2724e / deep #9a3b2e; ground slate #2b343b.
---

# clean-floor-hover-select — a floor highlight that RIDES the building's perspective (the anti-crooked fix)

EVER visual-search Level 1: pick a floor on a static building render; each floor is a hand-traced
perspective polygon (a corner-wrapping two-quad chevron) in a viewBox-locked SVG, so the terracotta
highlight bends at the corner and sits flush instead of floating flat. One tooltip card y-tracks the
hovered floor. The fix for smarts/towns crooked floor-hover lines.

## Markup + call
```html
<section class="cfh-stage" id="vs">
  <h2 class="cfh-housing">Housing 5</h2>
  <div class="cfh-back"><span class="cfh-back__o">←</span> Back to plan</div>
  <div class="cfh-render">
    <img class="cfh-img" src="renders/housing-5-elevation.webp" alt="">
    <svg class="cfh-floors"></svg>   <!-- engine locks viewBox + builds polygons from bands[] -->
  </div>
  <div class="cfh-card"><div class="cfh-card__num">28</div><div class="cfh-card__lab">FLOOR</div><div class="cfh-card__sub">—</div></div>
</section>
```
```js
CleanFloorHoverSelect.create('#vs', {
  imgW: 2400, imgH: 1500, fit: 'contain',
  bands: [ { floor:28, label:'FLOOR', sub:'2 apartments from 31.4 mln', status:'live',
             points:'360,250 820,150 1180,300 1180,382 820,275 360,347', anchor:{x:360,y:298} }, /* … */ ],
  onSelect: floor => openFloorplate(floor)
});
```
Trace `points` ONCE over the real render in a vector editor / point-picker (image-space, 6-pt chevron). Never guess.

## Proven (the lab)
A synthetic 2-point-perspective tower (inline SVG, built from the SAME geometry as the bands so they
provably ride it) + 6 floor bands (28..23, 4 live + 2 sold). STRUCT: viewBox `0 0 1400 1000` (locked) +
`xMidYMid meet`; 6 bands, each a 6-pt chevron, frontSloped=true (rides perspective, NOT axis-aligned),
sharedVerts=true (band28 bottom == band27 top). HOVER (real mouseenter band26): is-hover, fill-opacity
0.45 + stroke-opacity 0.9 (terracotta fill + dark top stroke). TOOLTIP y-track: card moves 232px between
floor 26 and 23, text swaps (one card). SOLD: floor 23 cooler grey-blue + 'Apartments not on sale', no
CTA. SELECT 27 fires onSelect. Zero console errors. Smoothness (4× CPU throttle, hover sweep): 166
frames, 0.60% long → PASS. Screenshots: floor 26 = terracotta band bending at the corner across both
faces + tooltip; floor 23 = sold-state cooler band.
