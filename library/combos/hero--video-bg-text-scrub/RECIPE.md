---
id: hero--video-bg-text-scrub
name: "Ріка тече, слова приходять"
level: 2
kind: section-variant
section: hero
status: base
meaning:
  what: "A PINNED hero where an AUTOPLAY river video plays ON ITS OWN as cinema (loop, muted, playsinline, poster) while the section scroll-LOCKS and ONE pinned scroll scrubs the TEXT story: pin-story-text owns the single pin and reveals three sparse lines ONE AT A TIME, each anchored in a different corner of the frame (left -> lower-left -> center), settling, holding alone, then lifting away as the next arrives; corner-frame-meta fades four authored labels into the four corners so the running video reads as a framed plate; theme-tween cools the whole page field from river-day into dusk across the section seam. The scroll never touches the video (the scroll-hero LAW): the picture runs free, the words arrive on scroll."
  when: "The opener of a residential project whose strongest single asset is a LIVE moving frame (river, water, light through trees) you want to keep flowing while the message lands in sequence. Use it when the owner wants the OTHER oblit approach: media that plays itself as cinema, with one pinned scroll sequencing sparse copy over it, rather than scrubbing the picture frame-by-frame (its sibling, scroll-scrub-video, does that)."
  lands: "You land on a river that is already moving and a cool daylight page. The page stops and holds. One line settles in the corner, you read it, it lifts away, the next arrives in a different considered spot, and a third invites you to stay; meanwhile the river keeps flowing and the whole canvas cools toward dusk. Nothing collides, nothing crowds the screen, and the hero never dumps its elements down toward a section that does not exist. It reads authored and slow on purpose, cinema with words placed over it."
source:
  grammar: "Owner feedback on hero pass 1 (the second oblit attempt): the hero MUST pin and hold while its mechanic plays (the first pass dumped elements down toward a non-existent next section); multiple texts must arrive AS A SEQUENCE, one settling then the next, each cleanly composed and NEVER overlapping or full-screen; go deeper than primitive. The owner asked for BOTH oblit approaches across the variants: this one is the autoplay-video-bg / scroll-scrubs-the-TEXT dialect of the scroll-hero LAW (never scrub video.currentTime), the lag-free counterpart to the canvas-2d frame-scrub sibling."
  recording: null
  registry_ref: []
uses:
  - { atom: pin-story-text, job: "OWNS the one pin (pin:true, pinSpacing:true) over #hero and builds the text stage into it. Reveals three sparse UA blocks ONE AT A TIME in distinct corners (left -> lower-left -> center) off the single pinned scrub; settle/HOLD/lift so exactly one block is fully visible at any progress (no overlap, no full-screen wall). Background-agnostic: never touches the video. manageLenis:true so the lab owns its smoother." }
  - { atom: corner-frame-meta, job: "Fades the four corner labels (QUADRO HOUSE / над рікою / резиденція 2026 / 01) in once with a small stagger, turning the running video into an authored framed plate. Pin-less (opacity + tiny transform), so the pin budget stays at one." }
  - { atom: theme-tween, job: "Owns the page FIELD colour across the hero -> post seam: hero carries the river-day theme (--bg #d9ddda), the post-section the dusk theme (--bg #11161a); theme-tween lerps the root --bg/--ink/--accent toward the centred section so the whole canvas cools as the words finish. Colour custom-properties only, pin-less." }
pin:
  owner: pin-story-text
  count: 1
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "pins===1, scroll-locks, no text overlap: EXACTLY one pinned ScrollTrigger, owned by pin-story-text (probe: ScrollTrigger pins === 1; expectPins:1; the harness creates NO section pin). The section pins (pin:true, pinSpacing:true) and HOLDS while the three lines play, then releases — it does NOT dump elements down toward a next section."
  - "The three text blocks arrive ONE AT A TIME and never overlap: at any sampled progress exactly one .pst__block is fully visible (opacity>=0.9) while the others are hidden; each block is width-constrained (<=46ch / <=52vw — never a full-screen wall) and anchored to a DISTINCT corner (left / lower-left / center)."
  - "The video is a plain AUTOPLAY loop, never currentTime-scrubbed (scroll-hero LAW): clip-river-lite.mp4 (+ .webm) loop/muted/playsinline with a decoded poster (clip-river-poster.webp) so the [data-render-surface] is never black. Scroll drives ONLY the text + the field tint."
  - "The whole page field cools across the seam: theme-tween lerps --bg river-day #d9ddda -> dusk #11161a (and --ink/--accent) toward the centred section; colour custom-properties only, no layout, no transform."
  - "Motion is transform/opacity + CSS-var colour ONLY; NO video.currentTime scrub, NO mix-blend, NO backdrop-filter, NO WebGL, NO width/height/top/left animation; will-change cleared by the atoms. reduced-motion -> pin-story-text static stacked list (no pin), the video still autoplays, corner labels shown, field snapped."
  - "Asset-truth: the running clip + poster are the real building / its river, the same view, cars-free (no day-front/dn-ext/portrait crops). Ukrainian copy, Fedoriv voice, sparse, ZERO em/en-dash."
webgl: false
ease: air
class: "scroll (autoplay video bg + pinned text scrub)"
---

# hero--video-bg-text-scrub — "Ріка тече, слова приходять"

The OTHER oblit dialect: the picture runs by itself, the words arrive on scroll. An
autoplay river video plays as cinema behind a section that PINS and scroll-locks;
ONE pinned scroll scrubs only the TEXT — three sparse lines arriving one at a time,
each in its own corner — while the whole page field cools from river-day into dusk.
The river never stops; the scroll never touches it. This is the scroll-hero LAW kept
to the letter: never scrub video.currentTime, let the media run free and scrub the
story instead.

## The mechanic root (what makes it unmistakable on screen)
A LIVE moving video that runs ITSELF under a PINNED text sequence. No other hero in
the family lets the media play free while one pinned scroll places sparse words over
it one at a time. The signal in a single frame: water visibly flowing while a single
considered line holds in a corner and the canvas cools.

## The one scroll beat, one pin owner
- `pin-story-text` OWNS the pin. It builds its text stage into `#hero`, pins the
  normal-flow section (pinSpacing extends the document), and reveals three blocks
  ONE AT A TIME off the single pinned scrub: each settles, HOLDS alone, then lifts
  away as the next enters (transform/opacity only, set(p) pure + reverse-safe).
- The autoplay `<video>` is the host's sibling layer — its OWN clock, never
  currentTime-scrubbed.
- `corner-frame-meta` fades four authored labels in once (the framed plate).
- `theme-tween` cools the page field `--bg/--ink/--accent` across the hero -> post
  seam (river-day -> dusk). Both are pin-less, so the budget stays at one.

## Markup + call (shape)
```html
<section id="hero" data-theme data-theme-bg="#d9ddda" data-theme-ink="#1a2228" data-theme-accent="#9c7d57">
  <div class="hv__bg" data-render-surface>
    <video autoplay loop muted playsinline poster="renders/clip-river-poster.webp">
      <source src="renders/clip-river-lite.webm" type="video/webm">
      <source src="renders/clip-river-lite.mp4" type="video/mp4">
    </video>
  </div>
  <div class="hv__scrim"></div>
  <div data-corner="tl">QUADRO HOUSE</div> ... <div data-corner="rc">01</div>
</section>
<section class="combo-post" data-theme data-theme-bg="#11161a" data-theme-ink="#e9eef0" data-theme-accent="#cdb89a"></section>
```
```js
PinStoryText.create('#hero', { end:'+=260%', scrub:1, hold:0.46, ease:'air', manageLenis:true,
  blocks:[ {align:'left',...}, {align:'lower-left',...}, {align:'center',...} ] }); // OWNS the pin
CornerFrameMeta.create('#hero', { stagger:0.1 }).reveal();
ThemeTween.init({ sectionSelector:'[data-theme]', vars:['--bg','--ink','--accent'], ease:0.1 });
```

## Gate
Open `combo-lab.html`. `__LAB_OK__` true once ready (1 pin, all three cited atoms
ran, the `[data-render-surface]` painted — the video frame or its decoded poster —
0 console errors). Scroll the pin: the section HOLDS while three lines arrive one at
a time in different corners (never two at once, never a wall), the river keeps
flowing, and the page field cools river-day -> dusk; all reversible on scroll-up.

## Anti
NO `video.currentTime` scrub (the video is a free autoplay loop). NO mix-blend, NO
backdrop-filter, NO WebGL. ONE pin only (pin-story-text). Never crowd the frame: one
block visible at a time, each width-constrained. Cars-free, same-view asset. ZERO
em/en-dash in any visible copy.
