---
id: scramble-settle-text
name: "Scramble-settle text (a passage that reveals character by character on scroll — settled head solid, edge glyphs scrambled (rotated + offset + faded) tumbling into place left-to-right)"
level: 2
kind: component
status: official
entry:
  call: "ScrambleSettleText.create(target, opts)  // target = .sst-stage wrapping .sst-text (plain text or [data-line] blocks). opts: { chaos, charWin, pinFactor, ease, seed, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), chars, destroy }"
meaning:
  what: "bydorr's text reveal — a multi-line passage that, on scroll, reveals CHARACTER BY CHARACTER left to right: the settled head is solid while the chars at the reveal EDGE are SCRAMBLED (each glyph rotated + offset + faded) and tumble into place as the scroll advances. A scroll-scrubbed per-glyph scramble-settle (deterministic seeds, no jitter). set(p) is a PURE scrub."
  when: "A short, emotive passage you want READ slowly and deliberately — a poem, a manifesto line, a mission statement — where the act of assembling the words IS the experience. Use it on a quiet, near-empty section (lots of white space) as a breath between heavier beats; the per-character tumble makes a simple sentence feel composed, intentional, hand-set. Best for a few lines, centred, with room around them."
  lands: "You scroll into an almost-empty screen and a sentence begins to assemble itself: the first words are already crisp, but toward the end the letters are still tumbling — rotated, scattered, fading up — and as you keep scrolling each one rights itself and locks into place, left to right, until the whole passage stands clean. It feels like watching the words settle out of noise, slow and deliberate."
  not_when: "Long body copy (the per-char animation on hundreds of glyphs is heavy and tiring to read). UI/labels/nav (use plain text). When the reader needs the text instantly (this gates it behind scroll). A loud, busy section (the effect needs calm + space). Headlines where a cleaner reveal fits (blur-reveal-stagger-title / mask-up-title)."
source:
  grammar: "bydorr: 'Feel because you have a heart / And let it guide you through the dark / For it's the well of emotions deep / That helps you laugh, love, and sleep.' — head solid, edge characters jumbled/rotating into place, revealed left-to-right as you scroll."
  recording: "apps/quadro/.award-re/teardowns/D_bydorr_video.md (bydorr.com — single harvested prico)"
  registry_ref: ["bydorr-scramble-settle-text"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity]
trigger: "owns_pin scroll-scrub (pinned for innerHeight*pinFactor)"
timing_layer: [B-reveal, C-content]
owns_pin: true
owns_scroll: false
page_beat: [manifesto, poem, quiet-statement]
combines_with: [coords-corner-frame, script-overline-display-pair, panel-rise-over]
anti_combos: [long-body-copy, second-pin, reveal-over-scrubbed-surface]
gated_by: [R_perf_limits, R_owns_pin]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "the text is split into per-character spans (spaces + [data-line] breaks preserved); the JS does the splitting"
  - "on a pinned scroll-scrub each char i settles over a window [i/N*spread .. +charWin], left-to-right (spread = 1-charWin)"
  - "inside its window a char eases from a SEEDED scrambled state (translate +/-chaos px, rotate chaos*0.7 deg, opacity 0) to settled (0,0,0deg,1), power3.out"
  - "scramble seeds are deterministic (PRNG seeded once at init) — NOT Math.random per frame (no jitter); same seed => same scramble"
  - "set(p 0..1) is a PURE scrub (0 all scrambled, 1 all settled); transform(translate,rotate) + opacity per char only"
  - "NO filter / NO mix-blend; NO WebGL; owns_pin (one pin); reduced-motion or <=820px -> all settled, no pin"
  - "asset-substitution gate: a calm passage on a near-empty field, warm/neutral palette; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the pinned passage: the words assemble character by character, left to right — the head settles while the edge glyphs are still tumbling (rotated/offset/fading) and the tail is invisible. owns_pin scroll-scrub. Verify the left-to-right edge (head settled + edge scrambled + tail hidden at a mid p) + that seeds are stable (no per-frame jitter) + fps with the full char count."
note: |
  The single harvested prico from bydorr.com — a scroll-scrubbed per-glyph scramble-settle
  text reveal. Distinct from our other text reveals: blur-reveal-stagger-title (blur by word),
  mask-up-title / stroke-draw-title, content-stage-cascade — this is per-CHARACTER physical
  scramble (translate+rotate+fade) settling left-to-right on scroll. Deterministic seeds
  (PRNG once) keep it from jittering. transform + opacity = GPU-cheap (0.1% jank @ 59.9fps
  with 62 chars/frame). owns_pin. Keep it to a few lines on a calm field — it's a breath beat,
  not body copy. Proven 1:1 on a UA passage: head solid + edge glyphs tumbling + tail hidden
  at p=0.5; matches bydorr's poem assembling frame.
---

# scramble-settle-text — a passage assembles character by character on scroll (scramble → settle)

bydorr's text reveal: a short passage that, on scroll, reveals character by character left to
right — the settled head is solid while the edge glyphs are scrambled (rotated, offset, faded)
and tumble into place as you scroll. Deterministic per-char seeds, GPU-cheap, one pin.

## Markup + call
```html
<section class="sst-stage" id="poem">
  <div class="sst-text">
    <span data-line>Live, because you have a home,</span>
    <span data-line>where silence makes sense.</span>
  </div>
</section>
```
```js
ScrambleSettleText.create('#poem', { chaos:38, charWin:0.10, pinFactor:1.2, ease:'power3.out', seed:7, manageLenis:false });
```

## Proven (the lab)
A 4-line UA passage (62 chars) on white paper. Curve measured live (p / first-char / mid-char /
last-char): 0 / scrambled,op0 / scrambled,op0 / scrambled,op0 → 0.5 / settled,op1 /
settling,op0.88 / scrambled,op0 → 1 / settled / settled / settled. The reveal edge advances
left-to-right (first settled while last still scrambled at p=0.5). Mid-reveal screenshot: lines
1-2 solid, line 3 "Дер а н о" with the edge glyphs rotated/offset/fading into place (matches
bydorr b_006/b_014). Probe (4× CPU throttle, 62 chars transforming/frame): 1/684 long frames
(0.1%), 59.9fps → PASS. Zero console errors.
