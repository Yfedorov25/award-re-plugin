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
  what: "bydorr's text reveal — a multi-line passage that, on scroll, reveals CHARACTER BY CHARACTER left to right as a SMOOTH BASELINE-LOCKED WAVE: the settled head is solid while the chars at the reveal EDGE are a translucent horizontal SMEAR (extra letter-spacing + slight rightward x-drift + slight shrink + fade) that COLLAPSES to settled as the wave passes. NO vertical move, NO rotation -> stable + liquid. A scroll-scrubbed per-glyph collapse-settle (deterministic seeds, no jitter). set(p) is a PURE scrub."
  when: "A short, emotive passage you want READ slowly and deliberately — a poem, a manifesto line, a mission statement — where the act of assembling the words IS the experience. Use it on a quiet, near-empty section (lots of white space) as a breath between heavier beats; the per-character tumble makes a simple sentence feel composed, intentional, hand-set. Best for a few lines, centred, with room around them."
  lands: "You scroll into an almost-empty screen and a sentence begins to assemble itself: the first words are already crisp, but toward the end the letters trail off into a faint, loosely-spaced smear that drifts in from the right — and as you keep scrolling the spacing tightens and each letter locks onto the line, left to right, until the whole passage stands clean. It reads as a smooth liquid wave settling along the baseline, never jumping."
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
  - "on a pinned scroll-scrub each char i collapses over a window [i/N*spread .. +charWin], left-to-right (spread = 1-charWin), power3.out"
  - "inside its window a char does a BASELINE-LOCKED HORIZONTAL COLLAPSE: opacity 0.10->1, letterSpacing (inv^2)*(0.08+0.20k)em->0, translate3d X = inv*(chaos*0.13+chaos*0.32k)px->0, scale 1-inv*(0.06+0.05k)->1"
  - "STABILITY GATE: NO translateY and NO rotation at any p (maxVerticalMove == 0) — this is the fix over the original scatter+rotate build that teleported letters vertically"
  - "seeds (c.__k in [0,1]) are deterministic (PRNG seeded once at init) — NOT Math.random per frame (no jitter); scale magnitude only, never motion direction"
  - "set(p 0..1) is a PURE scrub (0 edge-smear, 1 all settled); transform(translate3d X, scale) + opacity + letterSpacing per char only"
  - "NO translateY / NO rotation / NO filter / NO mix-blend; NO WebGL; owns_pin (one pin); reduced-motion or <=820px -> all settled, no pin"
  - "asset-substitution gate: a calm passage on a near-empty field, warm/neutral palette; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the pinned passage: the words assemble character by character, left to right — the head settles while the edge glyphs are still tumbling (rotated/offset/fading) and the tail is invisible. owns_pin scroll-scrub. Verify the left-to-right edge (head settled + edge scrambled + tail hidden at a mid p) + that seeds are stable (no per-frame jitter) + fps with the full char count."
note: |
  The single harvested prico from bydorr.com — a scroll-scrubbed per-glyph reveal. Distinct
  from our other text reveals: blur-reveal-stagger-title (blur by word), mask-up-title /
  stroke-draw-title, content-stage-cascade — this is per-CHARACTER, settling left-to-right on
  scroll. MODEL = BASELINE-LOCKED HORIZONTAL COLLAPSE (extra letter-spacing + slight rightward
  x + slight shrink + fade), NO translateY, NO rotation -> a smooth liquid wave, never a jump.
  IMPORTANT FIX HISTORY: the first build used random +/-chaos dx/dy + rotation, which made
  letters teleport vertically (user flagged it as unstable vs the reference); a 4-agent fidelity
  workflow vs the bydorr frames converged on this collapse model (collapse-tracking won over
  scatter/rise/blur). Deterministic seeds (PRNG once) keep it jitter-free. transform + opacity +
  a small letterSpacing reflow = GPU-cheap (0.2% jank @ 59.9fps, 62 chars/frame). owns_pin.
  Keep it to a few lines on a calm field — a breath beat, not body copy. Verified: maxVerticalMove
  0.00px, no rotation, clean settle; 1:1 with bydorr's horizontal-smear reveal edge.
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
A 4-line UA passage (62 chars) on white paper. STABILITY verified: maxVerticalMove = 0.00px,
anyRotation = false across p ∈ {0, 0.25, 0.5, 0.75}; every char settles to opacity 1 + scale(1) +
letter-spacing 0 at p=1. The reveal edge advances left-to-right (head settled while the tail is a
translucent rightward smear with extra tracking). Mid-reveal screenshot: lines 1-2 solid, line 3
"Де ра[н о к — це вікн о]" as a baseline-locked translucent smear collapsing in — 1:1 with bydorr's
"Feel because yo[u h a v e]" horizontal smear, NO vertical jump (the earlier scatter build did jump;
fixed via a 4-agent fidelity workflow). Probe (4× CPU throttle, 62 chars/frame incl. letterSpacing
reflow): 1/618 long frames (0.2%), 59.9fps → PASS. Zero console errors.
