# puzzle-text — word-assembly reveal

> A paragraph whose **words start scattered** (displaced in x/y, scaled up, gray)
> and **converge into their natural flow positions** as the section scrolls.
> Word-level (not per-character). Scroll-scrubbed and reversible.
> Observed on Zera (`portfolio6.zerasoftwarestudio.com`) statement section.

User brief: *«по пазлах збирається текст десь в секції»*.

## What it is (one sentence)
Each word of a copy block is wrapped in an `inline-block` span and animated **from**
a seeded random offset (translate + scale + gray tint) **to** `transform:none`, so the
browser-authored paragraph snaps together like puzzle pieces locking into pre-cut slots.

## Frame-by-frame (from the 2fps teardown)
1. **Start (scattered):** every word sits off its resting spot — different x/y, several
   words enlarged (~1.3–1.6×) and lighter gray, varied opacity. Reads as loose type.
2. **Mid:** words slide back along their own vectors; scale eases to 1; gray darkens to
   ink; opacity → 1. All on **one ease**, staggered in reading order (TL→BR) so it reads
   as a single gesture, not confetti.
3. **Settled:** clean, perfectly wrapped paragraph, full ink. No layout shift — the final
   line breaks were the browser's all along.
4. **Reverse (scroll up):** words re-spread (small gaps reappear) — confirms scrub, not
   one-shot.

## The key idea that makes it look expensive
**Never animate layout.** The paragraph is laid out normally; we only ever apply
`transform`/`opacity`/`color` relative to each word's resting box. So wrapping, kerning,
and line breaks are pixel-perfect at the end, and there is zero reflow during motion.
The "from" state is a **seeded PRNG** (mulberry32) so the scatter is stable across reloads
and tweakable via `seed`.

## Easing & timing
- Ease: `CustomEase 'puzzleAir' = 0.22,1,0.36,1` (expo-out settle); falls back to `power3.out`.
- Per-word duration ~0.9s; stagger ~0.045–0.05s in DOM/reading order.
- **Scrub mode:** stagger becomes the timeline **position param**, mapping each word onto
  scroll distance → fully reversible. `scrub:0.6`, `start:'top 78%'`, `end:'top 28%'`.
- **In-view mode:** a paused timeline played `onEnter`, reversed `onLeaveBack`.

## DOM structure
```
<p class="puzzle-text" data-puzzle-text> …copy… </p>
   → JS splits into:  <span class="pt-word">Pick</span><span class="pt-space"> </span>…
```
Spaces are their own `pt-space` inline-blocks so gaps never collapse mid-translate.
No-JS / SSR shows the finished readable paragraph (progressive enhancement).

## Core CSS / GSAP
```css
.pt-word{ display:inline-block; white-space:pre; will-change:transform,opacity; }
```
```js
// scrub: each word from scatter -> rest, offset along timeline by i*stagger
words.forEach((w,i)=>{ gsap.set(w, fromVars[i]);
  tl.to(w,{x:0,y:0,scale:1,opacity:1,color:ink,ease}, i*stagger); });
// fromVars[i] = seeded {x:±maxX, y:±maxY, scale:scaleFrom±jitter, color:ghost}
```

## Trigger
`scrub` (canonical, reversible) or `inview` (one-shot). Bound with ScrollTrigger.

## Gotchas
- **Measure resting boxes AFTER fonts load.** Init in `load` / after preloader and call
  `ScrollTrigger.refresh()`, or words snap to wrong slots when the web font swaps.
- **Word-level only.** Per-character looks like a different (scramble) effect and kills
  legibility on long copy.
- **Keep scatter coherent.** Big `maxX`/rotate + no shared ease = confetti, reads cheap.
  One ease + reading-order stagger = one gesture.
- **`will-change` only while animating** to avoid a permanent compositor layer per word.
- **prefers-reduced-motion:** skip scatter entirely; just `opacity:1`.
- **No WebGL.** Pure transform/opacity/color.
- Don't justify the paragraph with real `text-align:justify` *and* animate — use
  `text-wrap:balance` for nice breaks without inter-word space stretching.

## Reusable params (data-* or init opts)
`trigger` (scrub|inview), `maxX`, `maxY`, `scaleFrom`, `scaleJitter`, `rotate`,
`opacityFrom`, `ghostColor`, `inkColor`, `duration`, `stagger`, `ease`, `seed`,
`start`, `end`, `scrub`, `once`.

## Usage
```html
<link rel="stylesheet" href="component.css">
<script src="gsap.min.js"></script><script src="ScrollTrigger.min.js"></script>
<script src="CustomEase.min.js"></script>
<script src="component.js"></script>

<p data-puzzle-text data-trigger="scrub"
   data-ghost-color="#B9B6AE" data-ink-color="#14130F"
   data-max-x="150" data-max-y="92" data-stagger="0.05" data-seed="7">
   Pick the toolchain after the behavior is defined…
</p>
```
`PuzzleText.auto()` wires every `[data-puzzle-text]`; or `PuzzleText.init(el, opts)`.

## Files
- `lab.html` — self-contained demo (preloader ritual, 2 instances: scrub + inview).
- `component.css` / `component.js` — drop-in canonical copies.
