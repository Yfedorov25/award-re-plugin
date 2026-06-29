---
id: architecture--element-strip
name: "Стрічка деталей — a horizontal centre-focus STRIP of the building's own elements (no markers on a photo); each panel IS its element with a caption + material spec, the centre one in focus, the sides dimmed peek-insets, ‹ › / drag rotate the focus"
role: architecture
section: architecture
status: base
kind: combo
entry:
  call: "Markup-first. One .cfc-stage (.es-stage skin) > .cfc-viewport( .cfc-rail > .cfc-panel( .cfc-panel-img + .cfc-panel-cap ) x5 ) + .cfc-nav( .cfc-prev + .cfc-counter + .cfc-next ). Boot the harness, then CenterFocusCarousel.create('#strip', { start, sideScale, sideDim, slideDur, ease, loop, once, manageLenis:false }). A pure-skin MutationObserver mirrors the centred index onto .is-focus for the focus-frame read."
  module: iife
  returns: "{ trigger, set(p), play(), next(), prev(), go(i), destroy } (or { static:true } under reduced-motion / <=820px)"
uses:
  - { atom: center-focus-carousel, job: "the load-bearing engine — a row of tall element panels, the CENTRE in focus (scale 1 + brightness 1 + caption + spec lit) and the sides dimmed peek-insets (scale .9 + brightness .46 + caption 0); scroll-into-view stagger up (once); ‹ › / drag / side-click rotate which element is centred, the rail re-centring on it, counter NN/NN updating, loop wrap" }
pin:
  owner: none
  count: 0
meaning:
  what: "The ARCHITECTURE chapter built as a horizontal STRIP of the building's own elements rather than numbered hotspots on one photo. Five big element renders sit in a rail; the centre one is in focus (full size, full brightness, its name + material spec lit) and the neighbours are dimmed, pulled-back peek-insets with the next just showing at the edge. You drag, press ‹ ›, or click a side panel and the focus rotates along the row, the rail re-centring on the new element which brightens and names itself while the others recede. Each panel is one element and only that element: фасад / скління / пергола / вінець / покрівля, one caption + one spec per panel. NO furniture posing as architecture, and each caption names ONLY what its render actually shows."
  when: "When the architecture section must SELL the building's materials and exterior elements one at a time, with care, and you want to sidestep the marker-on-a-photo correspondence trap entirely. Best where there are five to eight genuinely distinct element renders so there is always a peek either side. The 'turn the cases in a vitrine' beat — considered, museum-grade, no risk of a number landing on the wrong surface."
  lands: "A row of tall photographs of the building's parts, the middle one bright and a touch larger with its name and material spec lit at the foot, the ones either side darkened and pulled back, the next just peeking in. A round arrow (or a drag) rotates the focus along; whichever element moves to centre brightens, names itself, and shows its spec while the others recede and dim. It reads like inspecting the building element by element, never like a slideshow and never like a quiz with a wrong answer."
source:
  grammar: "center-focus-carousel grammar (r1864 /comfort feature carousel, frame-by-frame): a row of vertical panels, the centre in focus + sides dimmed peek-insets, ‹ N/TOTAL › rotation; the rail re-centres on the active panel which brightens + names itself. Re-pointed from amenities to ARCHITECTURE elements, with a per-panel material-spec line and a focus-frame skin added on top (pure class toggle, transform/opacity/filter only). Correspondence is structural: one element per panel, one caption per element, so a panel cannot name a surface it does not show."
  recording: null
  registry_ref: ["r1864-center-focus-carousel"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase (Lenis not managed here — non-pinned section)"
webgl: false
motion_props: [transform, opacity, filter]
ease: air
gated_by: [R_perf_limits, R_anti_combos, R_one_scroll_owner, R_timing_layers]
acceptance:
  - "NO markers on a photo: every element lives in its OWN panel with its OWN caption + material spec. Correspondence is structural AND truthful — фасад panel = day-34 frontal facade plane, скління = terrace-02 glazed corner volume (3/4, distinct angle from the flat frontal 01), пергола = macro-pergola timber-soffit macro (zero furniture), вінець = terrace-05 top-down roof volume (white parapet box + flat membrane, roof geometry not its furnishing), покрівля = macro-roof rooftop deck surface (board meets white parapet meets the water edge). macro-table (dining chairs + table) was DROPPED as furniture-as-architecture. No two near-identical renders; no caption can name a surface it does not show."
  - "the CENTRE panel is in focus (scale 1 + brightness 1 + its caption + es-cap-spec lit, .is-focus frame drawn); the sides are scale .9 + brightness .46 + caption 0 with edge-peek of the neighbour"
  - "on scroll-into-view the five panels stagger fade + translateY 40->0 (once), then the focus geometry applies; set(p 0..1) is a PURE scrub of the enter"
  - "‹ › arrows, drag (F-08 law), and side-panel click rotate the centred index: the rail re-centres on the active element, it brightens + names itself + shows its spec, the others recede, counter NN/05 updates, loop wraps; the .is-focus frame follows via a pure-skin MutationObserver on the counter. will-change is armed transiently around each rotation and cleared on settle (no permanently-held GPU layers; the atom's permanent will-change is overridden to auto at idle in the variant wiring)"
  - "NO scroll pin (owns_pin false; expectPins 0; ScrollTrigger pin count = 0). Interactive rotation, not a pinned scrub. transform + opacity + filter(brightness) only; NO WebGL / mix-blend / backdrop-filter / canvas / video.currentTime / animating width|height|top|left|margin"
  - "reduced-motion / <=820px -> native overflow-x rail, all panels shown + captions visible; [data-render-surface] on the focused element's image paints a decoded render at non-zero size; harness probe sets __LAB_OK__ (we never set it ourselves); built on OUR QUADRO renders + Ukrainian Fedoriv copy, ZERO em/en-dash"
gate:
  probe: "Serve library/ on a fresh port, open combos/architecture--element-strip/combo-lab.html headless. __LAB_OK__ true; ScrollTrigger pin count = 0. Scroll the strip into view: the five element panels stagger up and the centre is in focus (bright + larger + name + spec lit), the sides dimmed insets with edge-peek. Press ‹ › / drag / click a side: the focus rotates, the rail re-centres, the new element brightens + names itself + shows its spec, counter NN/05 updates, loop wraps. CORRESPONDENCE CHECK (do by clicking each element to centre + screenshotting): the lit caption ALWAYS names the render shown — frontal facade reads фасад, glazed corner volume reads скління, timber soffit macro reads пергола, top-down roof volume reads вінець, rooftop deck surface reads покрівля. No caption names a surface its render does not show, and no panel shows furniture as its subject. fps>=55, jank<8%."
note: |
  Replaces a weak 'anatomy' architecture variant that failed marker-content correspondence
  (a number on the GLAZING revealed a TERRACE). This variant removes markers-on-a-photo
  altogether: each element is its own panel, so correspondence is structural and cannot
  drift. Visual strength comes from BIG distinct element renders (no crops, no duplicates):
  day-34 (frontal facade) / terrace-02 (glazed corner volume) / macro-pergola (timber soffit
  macro) / terrace-05 (top-down roof volume) / macro-roof (rooftop deck surface). macro-table
  (dining chairs + a table) was DROPPED as furniture-as-architecture and a correspondence lie.
  The engine is center-focus-carousel verbatim; the only additions are skin (material-spec
  line, focus frame), a class-toggle observer, and a transient will-change manager.
  owns_pin false -> expectPins 0. Built on QUADRO renders + Fedoriv-voice Ukrainian copy.
---

# architecture--element-strip — «Стрічка деталей»

The architecture chapter as a horizontal STRIP of the building's own elements, not numbered
hotspots on one photo. Five big element renders in a rail; the centre one in focus (full size,
full brightness, name + material spec lit), the neighbours dimmed peek-insets. Drag / ‹ › /
side-click rotates the focus along the row.

## Why this sidesteps the correspondence trap
The old anatomy variant failed because a marker sat on one surface but revealed another.
Here there are NO markers: each element is its own panel with its own caption. A panel
cannot name a surface it does not show. Correspondence is structural, not wired.

## The five elements (one render each, all distinct, each honestly captioned)
- 01 фасад — `renders/day-34.webp` (clean frontal facade plane: white render band, glazing bands, grey plinth, recessed entrance)
- 02 скління — `renders/terrace-02.webp` (the glazed corner VOLUME at 3/4: panoramic windows wrap two storeys; distinct angle from the flat frontal 01)
- 03 пергола — `renders/macro-pergola.webp` (tight timber-soffit macro against sky, a pure element close-up, zero furniture)
- 04 вінець — `renders/terrace-05.webp` (top-down of the whole roof volume: white parapet box + flat membrane, the roof geometry)
- 05 покрівля — `renders/macro-roof.webp` (the rooftop deck SURFACE: terrace board meets white parapet meets the water edge, an honest junction read)

`macro-table.webp` (outdoor dining chairs + a table) was DROPPED: it is furniture, not a building element, and captioning it as a "material junction" was the exact correspondence lie this variant exists to prevent.

## Markup + call
```html
<section id="strip" class="cfc-stage es-stage">
  <header class="es-head"> eyebrow + display title + note </header>
  <div class="cfc-viewport"><div class="cfc-rail">
    <div class="cfc-panel"><div class="cfc-panel-img" data-render-surface><img src="renders/day-34.webp"></div>
      <div class="cfc-panel-cap"><span class="es-cap-idx">01 · фасад</span>Тиха площина
        <span class="es-cap-spec">…material spec…</span></div></div>
    <!-- 4 more element panels -->
  </div></div>
  <div class="es-controls"><p class="es-hint">тягни · або стрілки</p>
    <div class="cfc-nav"><button class="cfc-prev">‹</button><span class="cfc-counter">01 / 05</span><button class="cfc-next">›</button></div></div>
</section>
```
```js
SectionHarness.boot();
SectionHarness.ranOK('center-focus-carousel', function () {
  CenterFocusCarousel.create('#strip', { sideScale:0.9, sideDim:0.46, loop:true, manageLenis:false });
});
SectionHarness.declare({ pinOwner:'none', expectPins:0, atomsCited:['center-focus-carousel'] });
```

## Gate (interactive, NO pin)
__LAB_OK__ true; pin count 0. Centre in focus (bright + named + spec), sides dimmed insets
with edge-peek; ‹ › / drag / side-click rotate, rail re-centres, counter NN/05, loop wraps.
Correspondence: the lit caption always names the render shown.
