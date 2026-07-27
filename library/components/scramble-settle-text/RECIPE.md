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
  what: "bydorr's text reveal — a TYPEWRITER FRONT that advances left-to-right on scroll: a SOLID settled head, a NARROW scramble EDGE (3-5 chars: a translucent baseline smear — extra letter-spacing + slight rightward x + slight shrink + fade — collapsing to settled), and the ENTIRE REST OF THE PASSAGE AHEAD IS INVISIBLE (opacity 0, never a grey floor — the whole text is never shown at once). NO vertical move, NO rotation -> stable + liquid. A scroll-scrubbed per-glyph reveal; unrevealed chars don't exist on screen yet. set(p) is a PURE scrub."
  when: "A short, emotive passage you want READ slowly and deliberately — a poem, a manifesto line, a mission statement — where the act of assembling the words IS the experience. Use it on a quiet, near-empty section (lots of white space) as a breath between heavier beats; the per-character tumble makes a simple sentence feel composed, intentional, hand-set. Best for a few lines, centred, with room around them."
  lands: "You scroll into a blank screen and a sentence TYPES itself into being: the words you've passed are crisp and solid, right at the writing edge a few letters are still a faint loosely-spaced smear drifting in from the right, and everything ahead simply isn't there yet — plain white. As you scroll the front advances, letters tightening onto the line one after another, until the passage stands complete. It reads like watching it be written, calm and deliberate — never a wall of grey text fading in."
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
  - "FORMAT: a char AHEAD of its window is opacity 0 = INVISIBLE (never a grey floor); the whole passage is never shown at once. The window is SHORT (charWin ~0.07) so only ~3-5 chars are mid-flight = a narrow typewriter front; everything ahead is blank"
  - "on a pinned scroll-scrub each char i reveals over a window [i/N*spread .. +charWin], left-to-right (spread = 1-charWin), power3.out"
  - "inside its window a char does a BASELINE-LOCKED HORIZONTAL COLLAPSE: opacity sqrt(lp) 0->1 (faster than the spatial collapse), letterSpacing (inv^2)*(0.08+0.20k)em->0, translate3d X = inv*(chaos*0.13+chaos*0.32k)px->0, scale 1-inv*(0.06+0.05k)->1"
  - "STABILITY GATE: NO translateY and NO rotation at any p (maxVerticalMove == 0) — the fix over the original scatter+rotate build that teleported letters vertically"
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
A 4-line UA passage (62 chars) on white paper. FORMAT verified: at p=0.4 → 35 chars invisible
(ahead, opacity 0) / 24 settled (solid head) / 3 in-flight (the narrow edge); hiddenAt0 = true
(blank before scroll). STABILITY: maxVerticalMove = 0.00px, no rotation across p. SETTLE: every
char opacity 1 + scale 1 + letter-spacing 0 at p=1. Mid screenshot: "Живи, бо маєш дім, / де тиша
має с[е][н]" — solid head + a 2-3 char faint edge, lines 3-4 NOT shown at all (1:1 with bydorr
d_012 "Feel because you hav[e a h]" + blank ahead, NOT a grey wall of text). Probe (4× CPU
throttle, 62 chars/frame incl. letterSpacing reflow): 1/618 long frames (0.2%), 59.9fps → PASS.
Zero console errors.
