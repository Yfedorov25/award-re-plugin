---
id: architecture--flyaround-scrub
name: "Обліт"
level: 2
kind: section-variant
status: base
section: architecture
meaning:
  what: "The ARCHITECTURE chapter as a cinematic FLY-AROUND of the building. 120 sequential arrival frames are scrubbed by ONE pinned scroll so the scroll IS the camera turning around the house. A single on-screen <img> swaps its .src to the frame nearest scroll progress (every frame decode()'d off-DOM up front, rAF-throttled, idx-deduped) so the move is one continuous camera arc, not a slideshow of cuts. On the rails: a held eyebrow, a serif section title that settles in the first beat, a single line of body about the materials, and a chapter index (фасад / тераси / скління / покрівля) that advances as each face turns into view, plus a thin progress rail. The render is the hero; type holds on the rails with generous air."
  when: "The architecture/exterior beat of a ЖК or villa site when you have a real pre-rendered fly-around sequence and want the scroll to BE the camera. The 'this building is worth turning over in your hands' moment: sell form, materials, terraces, glazing and roofline in one unbroken move, no WebGL orbit needed."
  lands: "As you scroll one pinned section, the house turns under one continuous camera, every frame crisp and full-bleed, the motion tracking scroll 1:1 and playing back on scroll-up. A serif title settles in, the chapter index ticks through the four faces of the building, and a hairline rail fills. It reads like a film clip you are scrubbing, authored and expensive, not a carousel."
source:
  grammar: "ERA era.estate /architecture intro, a 149-frame scroll-scrub data-sequence (data-sequence-frame-count=149). Ever ever-live-here.com /progress, a ~1333-frame scrubbed timeline. Both: scroll position -> frame index, one decoded raster on screen, 0 canvas / 0 WebGL / SEO-safe DOM. The film-advance lineage (a few authored stills with zero-overlap geometry + per-slide parallax) is vertical-slide; this variant extends that grammar to the continuous-camera case. See D_ERA_architecture (§2.3) + D_Ever_architecture (§3 /progress)."
  recording: null
  registry_ref: ["T-frame-sequence-scrub"]
uses:
  - { atom: frame-scrub-img, job: "ENGINE + RENDER + PIN: scrubs the 120 arrival frames (img.src swap, no canvas) on its OWN pinned scroll; owns the one pin; exposes onUpdate(p) so the rail/title/index couple to the SAME pin" }
# lineage only (NOT loaded, NOT a second pin owner): vertical-slide is the film-advance sibling
# this variant's frame-scrub grammar extends. It lives in source.grammar, not uses (one pin owner).
pin:
  owner: frame-scrub-img
  count: 1
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers, R_one_scroll_owner]
acceptance:
  - "exactly ONE pin, owned by frame-scrub-img (owns_pin TRUE); the harness creates no section pin; __LAB_OK__ true on desktop (not the static path)"
  - "the scrub is a PURE fn of progress: p 0.00 -> f_001, ~0.35 -> ~f_046, ~0.62 -> ~f_080, ~0.90 -> ~f_116; scroll-up reverses to the earlier frame"
  - "the [data-render-surface] (#combo) holds the decoded <img class=fsi-frame> at non-zero size; the <img> box never reflows (object-fit:cover fixed box, zero CLS); NO canvas, NO video.currentTime, NO WebGL"
  - "the chapter index advances with the camera off the SAME pin (фасад 01 -> тераси 02 -> скління 03 -> покрівля 04); the rail fills scaleY 0->1; the title settles opacity 0.35->1 over the first ~14% then holds"
  - "motion is transform/opacity only; Lenis 1.1.13 lerp 0.1 -> gsap.ticker -> ScrollTrigger.update; NO mix-blend / NO backdrop over the frame; 0 real console errors"
  - "reduced-motion / <=820px -> the arrived (final) frame shown statically, no pin; Ukrainian copy, built on OUR QUADRO arrival-frames"
webgl: false
ease: air
---

# architecture--flyaround-scrub, "Обліт"

The architecture chapter is one continuous camera move around the house. Scroll IS the
camera: 120 arrival frames scrubbed by a single pinned scroll, one decoded raster on screen
at a time. ERA turns its /architecture intro with 149 frames; Ever scrubs ~1333 over
/progress. This is that grammar, on OUR 120 frames, with the type living on the rails.

## The engine (one pin, owned by the atom)
`frame-scrub-img` owns_pin:true, so THE ATOM owns the one pin, the harness does not call
`SectionHarness.pin`. The atom maps scroll progress to a frame index
(`idx = round(t * (N-1))`, with the last 7% holding the final frame), swaps `img.src` to the
already-decoded frame, and exposes `onUpdate(p)` so the captions, chapter index and rail can
couple to the SAME pin without a second one. `set(p)` is pure and reversible.

## Why this and not vertical-slide here
vertical-slide is the film-ADVANCE sibling: a few authored stills with a 200vh/76vh
zero-overlap geometry and per-slide parallax, perfect for a small set of hero frames. The
creative intent here is a TRUE 120-frame fly-around, one unbroken camera arc, so the
load-bearing engine is the continuous-CAMERA sibling, `frame-scrub-img`. vertical-slide is
cited as the lineage and the honest fallback when only discrete frames exist. No WebGL,
no canvas: an `<img>.src` swap between equal-size pre-decoded WebP frames is GPU-blitted with
no main-thread raster; the off-DOM `decode()` up front removes the only jank source.

## The rails (coupled to the same pin)
- Eyebrow upper-left, held: `QUADRO · архітектура`.
- Serif title lower-left, the heroic line, settling opacity 0.35 -> 1 over the first ~14%
  then holding: `Дім, який обходиш очима`.
- One line of body about the building: warm brick, deep terraces, floor-to-ceiling glazing.
- Chapter index lower-right that advances as each face turns in: фасад / тераси / скління /
  покрівля (01..04). A hairline bronze rail on the right edge fills scaleY 0 -> 1.

## Copy (exact)
- eyebrow: `QUADRO · архітектура`
- title:  `Дім, який обходиш очима` (italic emphasis on `обходиш очима`)
- body:   `Тепла цегла, глибокі тераси, скління від підлоги. Один поворот камери, і видно кожну грань.`
- faces:  `фасад · тераси · скління · покрівля`

Ukrainian, Fedoriv voice, sparse, proof not promises, zero em-dash / zero en-dash.

## Gate
Open `combo-lab.html` in a real browser. `__LAB_OK__` true once the engine is wired and the
first frame decoded (one pin, the cited atom ran, the render surface painted, 0 errors).
Scroll the pinned range: the building turns under one continuous camera, frame index tracks
scroll, the index ticks through the four faces, the rail fills, scroll-up plays it back.
PASS = 0 blank, fps>=50, jank<8%, 0 CLS.
