---
id: hero-video-render-rotator
name: "Hero video+render rotator (a full-bleed hero background that crossfades a slideshow of video clips and render stills, with a big serif wordmark fixed and persistent over all of them)"
level: 2
kind: component
status: official
entry:
  call: "HeroVideoRenderRotator.create(target, opts)  // target = .hvr-stage > .hvr-media(.hvr-slide (each: .hvr-frame > img|video) xN) + .hvr-title(.mark) + optional .hvr-dot list. opts: { interval, fade, kenburns, hoverPause, auto }."
  module: iife
  returns: "{ go(i), next(), index(), count, play(), stop(), destroy }"
meaning:
  what: "crownd/finest's hero — a full-bleed hero whose BACKGROUND is a crossfading SLIDESHOW that mixes VIDEO clips and RENDER stills, while a big serif WORDMARK stays FIXED and persistent over all of them (the title never moves or swaps; only the media rotates). Video slides autoplay muted+loop while active and pause when off; a slow Ken-Burns on the active media gives it life."
  when: "A project / property / brand HERO where you have a few hero-grade assets (a drone clip, a couple of renders) and want them to play as one cinematic loop under a single, calm wordmark — instead of one static hero image or a busy carousel with chrome. Ideal for a real-estate flagship-project top: the name holds while the place reveals itself in motion behind it. Mix at least one video for life."
  lands: "You land and the project's name sits large and still in the centre while behind it the place comes alive — a drone shot drifting over the rooftops dissolves into a render of the building, then the pool, each slowly pushing in. The title never flinches; the world behind it keeps turning. It reads as a cinematic title card, premium and unhurried."
  not_when: "A single definitive hero image (no rotation needed). A content carousel the user should drive (use a media-carousel). When you have no video and no second render (the rotation needs >=2 assets, ideally one moving). Heavy pages where autoplaying video hurts load (lazy/poster it, or drop video). When the title must change per slide (that's editorial-act-crossfade)."
source:
  grammar: "finest hero: a big serif 'finest' wordmark centred + fixed, with the background crossfading drone aerial video -> building render -> pool/terrace render; persistent nav + a bottom search-pill."
  recording: "apps/quadro/.award-re/teardowns/D_finest_video.md (F1; crownd.at/projekte/finest)"
  registry_ref: ["F1-hero-video-render-rotator-finest"]
stack: "vanilla (no GSAP; CSS crossfade + IntersectionObserver-gated video)"
webgl: false
motion_props: [opacity, transform]
trigger: "auto / triggered rotator (not scroll)"
timing_layer: [A-hero]
owns_pin: false
owns_scroll: false
page_beat: [hero, project-top]
combines_with: [fullscreen-media-carousel, scroll-zoom-image-pair, line-art-location-map, coords-corner-frame]
anti_combos: [second-hero, editorial-act-crossfade]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "slides are stacked full-bleed (.hvr-slide, each .hvr-frame > img|video); exactly one is .is-active (opacity 1), the rest opacity 0; crossfade over `fade` ms"
  - "auto-advances every `interval` ms; pauses on hover (hoverPause) and when the hero is off-screen (IntersectionObserver)"
  - "a video slide play()s on activate and pause()s on deactivate (no currentTime scrub); videos are muted+loop+playsinline; play only while active AND on-screen"
  - "the active media's .hvr-frame does a slow ken-burns scale 1.02 -> 1.12 (~6s); off when kenburns false / reduced-motion"
  - "the .hvr-title layer is ABOVE all media and FIXED — it never animates with the rotation; finest has NO dots/controls (pure auto-rotate); dots are an OPTIONAL extra, omitted for the finest look"
  - "opacity + transform scale only; NO mix-blend over the media; NO WebGL; reduced-motion -> no auto-advance, no ken-burns, first slide, video paused"
  - "asset-substitution gate: OUR QUADRO video clip + renders rotating under a serif wordmark; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The hero background crossfades through a video clip + several renders while the serif wordmark stays put; there are NO dots on finest (it just auto-rotates under the fixed title until you scroll). Triggered/auto (NOT scroll) -> verify exactly one active slide, the video PLAYS when active / PAUSES when off, the title is fixed, and probe JANK DURING CROSSFADES (force slide changes) — steady video playback is not jank. A static screenshot shows one slide only."
note: |
  First crownd/finest harvest (F1). A hero whose background is a crossfading video+render
  slideshow under a fixed serif wordmark. Distinct from editorial-act-crossfade (there the
  centre WORD swaps per act over a still; here ONE fixed title over a rotating video/render
  background — the media is the show). Video is IntersectionObserver-gated (plays only active +
  on-screen) for battery/perf. opacity + scale = GPU-cheap; ken-burns adds life. owns_pin false.
  Proven on QUADRO media (a real .webm clip + 4 renders): one active slide, video play/pause
  correct, title fixed, 1.8% jank @ 59.9fps across crossfades, zero console errors. Serif
  stand-in = Playfair Display italic (Canela / PP-Editorial class). Real use: lazy-load /
  poster the video and keep clips short + compressed.
---

# hero-video-render-rotator — a hero background that crossfades video + renders under a fixed serif title

crownd/finest's hero: a full-bleed background that crossfades a slideshow of video clips and
render stills, while a big serif wordmark stays fixed and persistent over all of them. Video
slides autoplay muted+loop while active (and on-screen), pause when off; a slow ken-burns on the
active media. The title never moves — only the world behind it turns.

## Markup + call
```html
<section class="hvr-stage" id="hero">
  <div class="hvr-media">
    <div class="hvr-slide is-video"><div class="hvr-frame"><video src="clip.webm" muted loop playsinline></video></div></div>
    <div class="hvr-slide"><div class="hvr-frame"><img src="render-a.webp"></div></div>
    <!-- … more slides … -->
  </div>
  <div class="hvr-title"><div class="mark">finest</div></div>
  <div class="hvr-dots"><button class="hvr-dot"></button>…</div>
</section>
```
```js
HeroVideoRenderRotator.create('#hero', { interval:4200, fade:1100, kenburns:true });
```

## Proven (the lab)
5 slides on OUR QUADRO media (clip-river-lite.webm video + aerial / day-front / terrace / night
renders) under a fixed "finest" serif wordmark. Measured live: exactly 1 slide active (opacity 1,
rest 0); the video slide (idx 0) playing=true when active, paused on a render slide, resumes on
return; title fixed across all; NO dots (finest has none); clip loads (200, 10.9MB). Screenshot (aerial
render active): the "finest" italic serif centred + persistent over the QUADRO render, nav + dots
(matches finest hero). Probe (4× CPU throttle, 6 forced crossfades): 6/333 long frames (1.8%),
59.9fps → PASS. Zero console errors.
