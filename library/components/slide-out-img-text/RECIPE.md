# slide-out-img-text — "deck-fan reveal"

> Source: zerasoftwarestudio.com (Zera Studio), portfolio hand-off section.
> User ask: «щоб ось так виїжали картинки і текст наприклад з якоїсь секції».
> Files: `lab.html` (standalone demo) · `component.css` · `component.js` · this recipe.

## What it is (one sentence)
A pinned, scroll-scrubbed section where a **stack of cards parked dead-centre behind a big serif headline fans OUT to the four corners** (de-rotating, slightly shrinking, dealt one-by-one), while the centre headline + faint ghost text **crossfade in place** to a second caption + CTA.

## Frame-by-frame phases (from the 35-frame teardown, 2 fps)
| scroll progress | cards | centre copy | ghost layer |
|---|---|---|---|
| **0.00 (f001–f005)** | 4 cards STACKED at centre, overlapped, fanned rotations ±3–7°, inner image zoomed ~1.12 | big serif **PORTFOLIO** + **ETERNA** sub, on top of the deck | giant faint **"E"** letterform + edge ghost words (BRAND/LED/EXPER/IENCE) at opacity ~.05 |
| **0.15–0.45 (f006–f009)** | cards travel outward to TL/TR/BL/BR, rotation → 0, scale → ~.8, inner image zoom relaxes 1.12→1.0 (counter-parallax). Dealt with a small per-card stagger | PORTFOLIO begins fading/lifting | "E" begins dimming |
| **0.50–0.75 (f010–f013)** | cards arrive at corner anchors (asymmetric: TL big ETERNA, TR ORVA, BL interior, BR laptop) | **"The proof is in the work."** + **VIEW WORK** crossfades up into the now-empty centre | faint **"Craft Systems"** word fades up at opacity ~.06 |
| **0.80–1.00 (f014–f035)** | settled corner grid, no overlap | second caption fully in, CTA underlined | scroll-dot indicator breathes in at centre-bottom |

The centre stays anchored across all 35 frames → the section is **pinned**; the dot + steady framing confirm scrub, not autoplay.

## Easing + durations
- **One ease only**, registered as `CustomEase "sofiAir" = M0,0 C0.22,0.68 0.16,0.99 1,1` (a strong-out air curve; fast lead-out, long glide-to-rest — that is what makes the cards feel *dealt* rather than *flung*).
- Because it is **scrubbed**, "duration" = a slice of the pin timeline, not wall-clock. Mapping used:
  - cards fan-out: `0.0 → 0.6` of the timeline, per-card stagger `0.05`.
  - headline crossfade: A out `0.35→0.60`, B in `0.50→0.85`.
  - ghost letter→word: `0.30→0.70`.
  - scroll-dot: `0.82→1.0`.
- Pin length `endVH = 130%` (1.3× viewport of scroll travels the whole gesture). `scrub:1` for ~1-frame smoothing.

## Trigger
**Scroll-scrub + pin.** `ScrollTrigger { start:"top top", end:"+=130%", pin:true, scrub:1, anticipatePin:1, invalidateOnRefresh:true }`.

## DOM structure
```
.sofi                         ← section, owns tokens + bg
  .sofi__eyebrow              ← top-left label
  .sofi__stage               ← 100vh, place-items:center (card origin)
    .sofi__ghost
      .sofi__ghost-letter "E" ← giant faint letterform (state A)
      .sofi__ghost-word       ← "Craft Systems" (state B, starts hidden)
    .sofi__deck
      .sofi__card ×4          ← top:50% left:50% + translate(-50%,-50%)+--tx/--ty/--rot/--scl
        img + .sofi__card-label
    .sofi__copy
      .sofi__cap-a (h + sub)  ← PORTFOLIO / ETERNA
      .sofi__cap-b (h + cta)  ← "The proof…" / VIEW WORK  (starts opacity:0)
    .sofi__dot                ← scroll indicator
```

## The key CSS / GSAP that creates it
**CSS** — each card is centred once, then offset by three custom props the JS animates (so the tween only ever touches `transform`):
```css
.sofi__card{
  top:50%; left:50%;
  --tx:0px; --ty:0px; --rot:0deg; --scl:1;
  transform:
    translate(-50%,-50%)
    translate(var(--tx),var(--ty))
    rotate(var(--rot)) scale(var(--scl));
}
```
**JS** — corner targets are computed as fractions of the stage half-box and fed via **function-based values** so `invalidateOnRefresh` recomputes them on resize:
```js
tl.to(card, {
  "--tx": () => targetFor(i).tx + "px",
  "--ty": () => targetFor(i).ty + "px",
  "--rot":() => targetFor(i).rot + "deg",
  "--scl":() => targetFor(i).scl,
  ease: sofiAir, duration: 0.6
}, i*0.05);  // the deal-out stagger
```
Headline = two stacked `.sofi__cap` crossfaded with `autoAlpha` + small `y`. Ghost letter→word is the same crossfade one layer down.

## Gotchas (what makes it look cheap if done wrong)
- **Don't `left/top` the cards** — animate transforms only. Animating offsets re-layouts every scrub tick and kills 60fps.
- **Stagger is the soul.** Move all 4 cards on the exact same keyframe and it reads as a cheap "explode"; the `0.05` deal-out is what makes it editorial.
- **De-rotate to 0 at the corners.** Cards that stay tilted look like a Pinterest collage, not a deck being laid out.
- **Counter-parallax the inner `img` (1.12→1.0)** while the card travels — without it the photos feel like flat stickers.
- **Crossfade copy in place, don't slide it sideways.** The centre is the anchor; sideways motion fights the cards.
- **Ghost text opacity ≤ .06.** Above that it stops being texture and starts competing with the headline.
- **Pin length:** too short (`<110%`) and the deal-out + crossfade collide; ~130% gives each phase room.
- **`will-change:transform` on cards + imgs only** (not the whole section) — and drop it after if you keep them mounted long-term.
- Respect **prefers-reduced-motion**: jump straight to the fanned end-state, no scrub.
- Mobile: zero the rotations and tighten to a clean 2×2; the overlapping fan is unreadable under 760px.

## Reusable parameters (the component API)
`SlideOutImgText.init(rootSelector, opts)` where `opts`:
| param | default | what it does |
|---|---|---|
| `layout` | 4 corners `[{fx,fy,rot,scl}]` | END anchor of each card as a fraction of the stage half-box (responsive). Add/remove entries to change card count. |
| `start` | fanned stack `[{tx,ty,rot,scl}]` | the stacked START pose per card |
| `travel` | `1` | 0..1 dampener on how far cards fly (0.6 = subtler) |
| `scrub` | `1` | ScrollTrigger smoothing |
| `endVH` | `130` | pin length as % of viewport = total gesture distance |

Card **count** = number of `.sofi__card` nodes (layout cycles if fewer entries). **Direction** = sign of `fx/fy`. **Axis** (corners vs left/right slide) = set all `fy:0` for a horizontal-only spread. **Headline swap** = the two `.sofi__cap` blocks. **Ghost** = `.sofi__ghost-letter` / `.sofi__ghost-word` text.

## Quality bar reached
1:1 with the Zera reference: stacked deck → staggered corner fan, de-rotate + de-scale, inner counter-parallax, in-place headline + ghost crossfade, scroll-dot settle. Transform/opacity only, pinned scrub, no-WebGL, reduced-motion + mobile handled.
