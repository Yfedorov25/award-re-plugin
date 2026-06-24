# cards-swipe

> Pinned horizontal card-track. A row of full-bleed rounded cards (image + info)
> swiped sideways by vertical scroll, snapping one card per viewport, with a
> circular "stitch" handle riding the seam and optional pointer-drag fling.
> Source grammar: **Zera Studio** (zerasoftwarestudio.com), "Our Services".

| | |
|---|---|
| **id** | `cards-swipe` |
| **stack** | vanilla + GSAP 3.12.5 + ScrollTrigger (+ ScrollToPlugin for `goTo`, + CustomEase) |
| **WebGL** | no |
| **motion props** | `transform: translateX` (track) + `translateX` (inner img) + `opacity/scale` (seam) only |
| **trigger** | scroll-scrub (pinned), with optional pointer-drag override |
| **files** | `lab.html` (runnable demo), `component.js` (reusable), `component.css` (skin), this recipe |

---

## What it is (one sentence)

A section is **pinned** for `(n-1) × ~0.9` viewport-heights of scroll; during the
pin a horizontal flex-row of cards **translates on X** by exactly its overflow,
and a snap quantises the scroll so each card **clicks into place** filling the
screen — the same vertical scroll wheel becomes a horizontal pager.

This is NOT a CSS scroll-snap carousel and NOT `video.currentTime` scrubbing.
It is one `gsap.to(track,{x})` bound to a pinned ScrollTrigger with `snap`.

---

## Frame-by-frame phases (from the Zera recording, 2 fps)

The capture shows TWO things chained — note both, because the entry is part of
the grammar:

**Phase A — card intro (frames 1→4):** before the track exists, the first cream
card **slides up** from the bottom over the dark hero ("YOUR / BRAND BECOMES")
and lands filling the screen. This is a vertical mask/translate reveal that
hands the eye from the dark hero into the bright card surface. *(Optional in the
component — see `lab.html`'s preloader+lead-in for the analogous handoff.)*

**Phase B — horizontal swipe (frames 11→17):** the section is pinned. As scroll
advances:
- the active card (card 1) **slides left** out of view;
- a **dark gutter gap** opens between cards (the `--cs-gap`, ~24px, against the
  near-black page) — you can clearly see two cards and the gutter at frame 11–13;
- the next card (card 2) **slides in from the right** to centre;
- a small **circular bronze "stitch"** sits at the gap and is brightest exactly
  mid-transition (frame 13 shows it dead-centre at the seam), fading toward the
  snap points.

**Phase C — snap settle (frame 15):** motion decelerates and the incoming card
**snaps** to fill the viewport (card 2 "GROWTH SYSTEM" centred). Scroll feels
like it "caught" — that's the `snap.duration .2–.5s` on the air ease.

**Repeat B→C** for each subsequent card (frames 17→22: card 2 → card 3 "3D
EXPERIENCES"). After the last card snaps, the pin releases and the page resumes
vertical scroll.

---

## Easing + durations

- **Track translate:** `ease:"none"` — it must track the scrollbar 1:1 (scrub).
- **Scrub smoothing:** `scrub: 0.6` (≈0.6s catch-up lag) for silk. Use `scrub:true`
  (instant) only if you drop the inner-image parallax — lag + snap can fight.
- **Snap settle:** `duration:{min:0.2,max:0.5}`, `delay:0.04`, `ease:"air"`
  (`CustomEase "M0,0 C0.25,0.74 0.22,0.99 1,1"`). This is the "click".
- **Seam handle:** opacity/scale follow `sin(frac·π)` of the gap fraction — no
  duration, it's a pure function of progress (0 at snaps, 1 mid-gap).
- **`goTo(i)`:** `0.6s` `ease:"air"` scroll tween.
- **Pin length:** `+= innerHeight × 0.9 × (n-1)`. 0.9 is the "scroll budget per
  card" knob — lower = snappier/faster, higher = more deliberate.

---

## DOM structure

```
section.cs-root            ← gets PINNED, height:100vh, overflow:hidden, dark bg
  .cs-track                ← display:flex; gap; this element translateX's
    article.cs-card        ← flex:0 0 calc(100vw - gap*2); rounded; cream
      .cs-media > img      ← over-scanned (112%) full-bleed; parallax target
      .cs-body             ← z2; eyebrow / title / text / list / foot
    article.cs-card …      ← repeat per card (.is-media variant = photo-forward)
  .cs-seam                 ← ONE circular handle; JS rides its `left` across seam
.cs-dots                   ← optional progress dots (fixed, bottom-centre)
```

Key invariants:
- Card width `calc(100vw - gap*2)` and CSS `--cs-gap` **must equal** the JS `gap`.
- `.cs-root` height is exactly `100vh` so the pin holds one screen.
- Cards inset top/bottom by `--cs-inset` so the dark gutter frames them (the look).

---

## The key CSS / GSAP that creates it

```js
// CORE — pin + horizontal scrub + per-card snap
const tween = gsap.to(track, {
  x: () => -travel,                 // travel = (cardWidth+gap)*(n-1)
  ease: "none",
  scrollTrigger: {
    trigger: root, start: "top top",
    end: () => "+=" + (innerHeight * 0.9 * (n - 1)),
    scrub: 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
    snap: { snapTo: v => Math.round(v*(n-1))/(n-1),       // quantise to a card
            duration: {min:.2,max:.5}, delay:.04, ease:"air" },
    onUpdate(self){ setActive(Math.round(self.progress*(n-1)));
                    seamAt(self.progress); }
  }
});
```

```js
// inner-image parallax — driven by the SAME tween via containerAnimation
gsap.fromTo(img, {xPercent:-1.4}, {xPercent:1.4, ease:"none",
  scrollTrigger:{ trigger:card, containerAnimation:tween,
                  start:"left right", end:"right left", scrub:true }});
```

```css
.cs-card{ flex:0 0 calc(100vw - var(--cs-gap)*2);
          height:calc(100vh - var(--cs-inset)*2);
          border-radius:22px; background:var(--cs-paper); overflow:hidden; }
.cs-track{ display:flex; gap:var(--cs-gap); will-change:transform; }
```

The seam handle is positioned every frame from progress, never tweened directly:
```js
const pos=progress*(n-1), frac=pos-Math.floor(pos), vis=Math.sin(frac*Math.PI);
gsap.set(seam,{ left:(1-frac)*100+"%", autoAlpha:.25+vis*.75, scale:.86+vis*.14 });
```

---

## Gotchas (what makes it look cheap if done wrong)

1. **`scrub:true` + `snap` + parallax fight each other.** Use `scrub:0.6`. With
   hard `scrub:true` the snap yanks; with too much lag it feels mushy.
2. **Card width must match the gutter math.** If CSS `--cs-gap` ≠ JS `gap`, the
   last card under/over-shoots and the snap lands off-centre. Single source of
   truth: read `--cs-gap` from `getComputedStyle` (the lab does this).
3. **Never animate `width` or `left` of the track** — only `translateX`. Width
   tweens repaint/layout-thrash and kill 60fps.
4. **`invalidateOnRefresh:true` is mandatory** — `travel` and pin length depend on
   `innerWidth/innerHeight`; without it, resize/orientation breaks alignment.
   Also re-`measure()` and `ScrollTrigger.refresh()` on debounced resize.
5. **Pin without `anticipatePin:1`** flashes a 1-frame jump when the pin engages.
6. **Image over-scan (112%, `margin-left:-6%`)** — without it the parallax
   `xPercent` shift exposes a bare card edge.
7. **Don't `backdrop-filter`/`mix-blend` over the translating track** — it
   repaints the whole surface each frame (same lesson as quadro hero). Seam is a
   static solid circle, fine.
8. **Drag must feed the scroll, not the track.** If a drag also sets `track.x`
   directly it desyncs from ScrollTrigger and the snap snaps to the wrong card.
   The drag converts dx → `scrollTo`, leaving ST as the single source of truth.
9. **Reduced motion:** collapse to a vertical stack (`.cs-reduced`), no pin, no
   horizontal scroll, hide the seam. Built in.
10. **Mobile vertical-scroll trap:** touch handlers are `passive:true` (we feed
    `scrollTo`, we don't `preventDefault`), so the page never locks if the user
    actually wanted to scroll past. Tune if you want hard horizontal capture.

---

## Reusable parameters (component API)

`CardsSwipe.init({ ... })`:

| param | default | what it does |
|---|---|---|
| `root` | `'#cards'` | section that gets pinned |
| `track` | `'.cs-track'` | the flex row that translates |
| `cards` | `'.cs-card'` | each card selector |
| `seam` | `null` | optional stitch-handle element to ride the seam |
| `gap` | `24` | px gutter between cards — **must match CSS `--cs-gap`** |
| `scrubPerCard` | `0.9` | viewport-heights of scroll spent per card (pace) |
| `snap` | `true` | snap one card per viewport |
| `drag` | `true` | pointer/touch fling on top of scroll-scrub |
| `parallax` | `0.12` | inner-image counter-drift (0 = off) |
| `ease` | `'air'` | CustomEase name for snap settle + `goTo` |
| `onCard(i,el)` | `null` | callback when active card changes |

Returns `{ goTo(i), refresh(), kill(), get index() }`.

**Axis note:** this is the **horizontal** member of the family. Same engine with
`y`/`translateY` + a vertical card stack gives a "deck-deal" vertical pager — a
future sibling component, not this one.

---

## How to verify (1:1 check)

1. Open `lab.html` directly in a browser.
2. Scroll into the track — section pins, cards slide left, snap one per screen.
3. Mid-transition the bronze stitch is brightest at the gutter; it fades at each
   snap. Active dot tracks the centred card.
4. Grab + drag horizontally — cards fling, then snap. Resize the window — cards
   stay centred and aligned (no off-by-gap drift).
5. Toggle OS "reduce motion" — cards become a clean vertical stack, no pin.
