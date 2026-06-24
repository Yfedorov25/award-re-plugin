---
id: cards-swipe
name: "Pinned cinematic deck-swipe"
level: 1
kind: component
status: official
entry:
  call: "CardsSwipe.init(opts)"
  module: iife
  returns: "{ goTo, refresh, kill, index }"
meaning:
  what: "Pinned scrub timeline: a render dissolves, a cream card slides up over the dark hero, then becomes a horizontal deck swiped sideways by scroll."
  when: "A SHOW/services act with 3-6 equal beats that must read as ONE cinematic gesture, not a list."
  lands: "The page 'becomes a film' for one section; chapters feel authored, premium, sequential."
  not_when: "Short factual sections, conversion gates (motion must DROP there), more than half the page pinning."
source:
  grammar: "Zera Studio — zerasoftwarestudio.com / Our Services"
  recording: "rec1-cards-swipe.mov"
  registry_ref: ["T-217", "T-405"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase + guarded Lenis"
webgl: false
motion_props: [transform, opacity, clip-path, left]
trigger: "one pinned scroll-scrub timeline (scrub:1), fully reversible"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
page_beat: [show, material]
combines_with: [puzzle-text, focus-render-switch, parallax-depth, splitLines]
anti_combos: [second-pin, before-after-drag]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: [default, cinematic, editorial]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "render dissolves via 2-img crossfade, never video.currentTime"
  - "reverse-scroll replays all phases 1:1"
  - "at or below 760px (or reduce-motion) collapses to a static vertical stack, no pin"
verify: "lab.html#__LAB_OK__"
---

# cards-swipe

> Pinned cinematic sequence: a photoreal render **dissolves**, a cream card
> **slides up** over the dark hero (mask handoff), then becomes a horizontal
> **deck** of full-bleed cards swiped sideways by scroll — a thin curved bronze
> **stitch** `)(` bridges each seam, a giant ghost serif **index-letter** bleeds
> through the dark gutter, and an engraved circular **medallion** tracks progress.
> Source grammar: **Zera Studio** (zerasoftwarestudio.com), "Our Services".
> This recipe is the **1:1 / 7-phase** version (replaces the WAVE-1 placeholder).

| | |
|---|---|
| **id** | `cards-swipe` |
| **stack** | vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase + guarded Lenis |
| **WebGL** | no |
| **motion props** | `transform` (translateX/Y, scale) + `opacity` + `clip` feel only — never `width/left`, never `video.currentTime` |
| **trigger** | one pinned scroll-scrub timeline (`scrub:1`), fully reversible |
| **files** | `lab.html` (runnable 1:1 demo, real nahirna renders), `component.js`, `component.css`, this recipe |

---

## What it is (one sentence)

A single section is **pinned** and a **`scrub:1`** ScrollTrigger maps the pin
scroll onto a normalized `0..1` timeline that runs SEVEN chained phases — render
dissolve → card-up mask handoff → horizontal deck swipe with per-seam bronze
stitch + ghost index-letter + engraved medallion — so dragging the scrollbar
plays the whole cinematic forward and backward 1:1.

This is NOT a CSS scroll-snap carousel and NOT `video.currentTime` scrubbing.
Everything is `transform`/`opacity` painted per-frame from `self.progress`.

---

## The 7 phases (from the Zera recording — ALL implemented, none skipped)

Phase boundaries are positions on the normalized pin progress `p` (0..1):

**P1 · `p = 0.00` · rest frame.** Full-bleed dark hero (`#0a0a0a`). Photoreal
render intact on a dark pedestal disc. Two-line serif kicker overlaps it
(line A muted-grey left, line B cream right with an italic bronze accent), a
giant faint **ghost-echo** of line B sits behind/below, a micro tracked label
under the pedestal, vertical **edge rails** (rotated wordmark left, nav right).
Nothing of the card is visible. Pinned here.

**P2 · `0.00 → 0.30` · the render DISSOLVES.** Implemented as a **2-layer
crossfade** — a sharp `<img>` fades to a flaked/degraded `<img>` (CSS
blur+brightness+grayscale) — PLUS a particle overlay that scales `1.0→1.06` and
drifts up while its opacity follows `sin(d·π)`. Linear scrub (no ease, 1:1).
The kicker is **LOCKED** (no move); the pedestal disc + micro-label remain; the
ghost-echo dims. By the end the cream card's rounded top peeks at the bottom.
**Never scrub `video.currentTime`** — two stacked imgs only.

**P3 · `0.30 → 0.42` · card-up MASK HANDOFF.** The cream deck-wrap translates
`yPercent 100→0` (CustomEase `cards`, expo.out feel) over the dark hero. As it
passes ~70% up, the first card's inner content staggers in (`y16+opacity`,
stagger `0.06`).

**P4 · `0.42 → 0.50` · hold.** Brief no-motion hold so card 1 reads as a
destination; the engraved **medallion** fades in; the layout is now the
horizontal deck track.

**P5 · `0.50 → 0.72` · deck advance 1→2.** Track `translateX` one card-width
(each segment eased with `cards` for the snap feel). A thin **curved bronze
stitch `)(`** (inline SVG, two C-curves — NOT a circle-with-chevrons) bridges
the seam, opacity `0→1→0` peaking mid-swipe (`sin(frac·π)`). A **giant ghost
serif index-letter** (the section initial) bleeds through the dark gutter with a
**slower parallax** (`power1.out`) than the cards. Medallion number cross-fades
`1→2`, footer index `(01/03)→(02/03)`.

**P6 · `0.72 → 0.95` · deck advance 2→3.** Identical mechanic on the second
seam: stitch pulse, ghost letter ticks, medallion `2→3`, footer `→(03/03)`.

**P7 · `0.95 → 1.00` · settle.** Last card held sharp, medallion finishes its
crossfade, pin releases, normal scroll resumes. Reverse scroll replays every
phase backward 1:1 (it's all one scrubbed timeline).

> NOTE (source-truth): rec1 cards-swipe ENDS on the last settled card. There is
> NO puzzle-assembly or full-bleed-grow finale in this recording — that belongs
> to a different technique. Do not invent one here.

---

## Easing + durations (ONE project ease)

- **Project ease `cards`:** `CustomEase "M0,0 C0.16,1 0.3,1 1,1"` (expo.out feel)
  — used for the card-up handoff AND each horizontal card-snap segment.
- **Dissolve:** **linear** (no ease) — 1:1 with the scrub, like a particle scrub.
- **Ghost index-letter:** `power1.out` parallax (slower than the cards).
- **Medallion number cross-fade:** `power2.inOut`.
- **Bronze stitch:** opacity/scaleY follow `sin(frac·π)` of the seam fraction —
  pure function of progress (0 at the snap points, 1 mid-seam).
- **Global `scrub:1`** on the single pinned ScrollTrigger → every phase reversible.
- **Pin length:** generous fixed budget (`≈ innerHeight × 1.0 × 3` in the lab);
  the normalized `0..1` progress is sliced into the phase windows above. Tune the
  multiplier for pace, the phase split for emphasis.

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

## The key GSAP that creates it (1:1 architecture)

ONE pinned ScrollTrigger with `scrub:1` calls a single `paint(progress)` that
slices the normalized `0..1` into the seven phase windows. No `snap` config — the
"snap" feel comes from easing each deck SEGMENT with `cards` (expo.out).

```js
ScrollTrigger.create({
  trigger: stage, start: "top top",
  end: () => "+=" + Math.round(innerHeight * 1.0 * 3),   // generous budget
  pin: true, anticipatePin: 1, scrub: 1, invalidateOnRefresh: true,
  onRefreshInit: measure,
  onUpdate(self){ paint(self.progress); }                // all 7 phases live here
});
```

```js
// P2 dissolve — 2-layer crossfade + particle drift (NEVER video.currentTime)
const d = clamp(0,1, p/0.30);
gsap.set(flaked, {autoAlpha:d});
gsap.set(flecks, {autoAlpha:Math.sin(d*Math.PI), scale:1+0.06*d, yPercent:-22*d});
gsap.set(sharp,  {autoAlpha:1-d*0.92});

// P3 card-up mask handoff (expo.out)
const up = parseEase("cards")(clamp(0,1,(p-0.30)/0.12));
gsap.set(deckWrap, {yPercent:100-100*up});

// P5-P6 deck swipe — ease each segment for the snap feel
const deckRaw = clamp(0,1,(p-0.50)/0.50), pos = deckRaw*(n-1);
const frac = pos-Math.floor(pos), eased = Math.floor(pos)+parseEase("cards")(frac);
gsap.set(track, {x: -(eased/(n-1))*travel});

// bronze stitch ')(' : 0->1->0 at mid-seam  (NOT a circle-with-chevrons)
const vis = (deckRaw>0&&deckRaw<1) ? Math.sin(frac*Math.PI) : 0;
gsap.set(seam, {autoAlpha:vis, scaleY:0.7+0.3*vis});

// giant ghost index-letter : slower parallax in the dark gutter
gsap.set(gLetter, {x:(0.5-parseEase("power1.out")(frac))*120});
gLetter.style.opacity = deckRaw>0 ? 0.04+0.06*Math.sin(frac*Math.PI) : 0;
```

The bronze stitch is two **C-curves** forming a `)(` bracket, not a ring:
```html
<svg viewBox="0 0 34 120" preserveAspectRatio="none">
  <path d="M11 4 C2 36, 2 84, 11 116"/>
  <path d="M23 4 C32 36, 32 84, 23 116"/>
</svg>
```

```css
.cs-card{ flex:0 0 calc(100vw - var(--cs-gap)*2);
          height:calc(100vh - var(--cs-inset)*2);
          border-radius:22px; background:var(--cs-paper); overflow:hidden; }
.deck-wrap{ position:absolute; inset:0; transform:translateY(100%); }  /* P3 mask */
.deck-track{ display:flex; gap:var(--cs-gap); will-change:transform; }
```

---

## Gotchas (what makes it look cheap if done wrong)

1. **One scrubbed timeline, not a stack of triggers.** All 7 phases are painted
   from a single `onUpdate(self){ paint(self.progress) }` so they are perfectly
   reversible and never desync. Splitting the dissolve / card-up / swipe into
   separate triggers causes seams between phases on fast reverse.
2. **Dissolve is a 2-layer img crossfade — NEVER `video.currentTime`.** Two
   stacked `<img>` (sharp → flaked) with `opacity` scrub + a CSS particle
   overlay. No video decoder is spent here; budget stays ≤2 elsewhere.
3. **Card width must match the gutter math.** If CSS `--cs-gap` ≠ JS `GAP`, the
   last card under/over-shoots. Single source of truth: read `--cs-gap` from
   `getComputedStyle` (the lab does this).
4. **Never animate `width`/`left`/`top` of the track** — only `translateX/Y`.
   Layout props thrash and kill 60fps.
5. **`invalidateOnRefresh:true` + `onRefreshInit:measure`** — `travel` and pin
   length depend on the viewport; re-`measure()` + `ScrollTrigger.refresh()` on
   debounced resize too.
6. **`anticipatePin:1`** prevents a 1-frame jump when the pin engages.
7. **The bronze stitch is a curved `)(` bracket, NOT a circle-with-chevrons.**
   Two C-curve SVG paths pinned to the seam, `sin(frac·π)` opacity. The old
   chevron ring reads as a generic "next" button and is banned.
8. **No `backdrop-filter`/`mix-blend` over the translating deck** — it repaints
   the whole surface each frame (quadro-hero lesson). The particle `flecks` use
   `screen` blend but sit over the STATIC dark hero, not the moving deck — fine.
9. **Mobile + reduced-motion both collapse to a static vertical stack**
   (`.cs-static`): no pin, no dissolve, no stitch/medallion/ghost-letter,
   instant opacity. `STATIC = REDUCE || matchMedia('(max-width:760px)')`.
10. **encodeURI the cyrillic render filename** (`06-TERRACE/01-тераса…`) or it
    404s. The lab wires every `.cardimg` and the hero via `encodeURI(BASE+path)`.

---

## Content wiring (real nahirna renders)

The 1:1 lab uses real 9:16 portrait renders (encodeURI'd, relative to the lab):

| slot | render |
|---|---|
| hero (dissolves) | `01-HERO/03-villa-34-day-v1FULL.png` |
| card 1 — Фундамент | `02-ARCH/01-clinker-macro-raking-v2FULL.png` |
| card 2 — Життя | `06-TERRACE/01-тераса-вид-на-ріку-день.png` |
| card 3 — Фінал | `07-INTERIOR/02-kitchen-living-wide-day-v3.png` |
| reserve | `03-RIVER/01-…golden…`, `08-CTA/01-night-facade-wide…` |

`BASE` = `../../../../NAHIRNA-MEDIA-SITE/cinema-proto/media/DATASET/` from the
plugin lab. Copy is Ukrainian Fedoriv voice — no em-dash, no people figures.

---

## How to verify (1:1 check)

1. Open `lab.html` directly in a browser. Renders must load (not broken icons).
2. Scroll in: the villa render **dissolves** (sharp→flaked + drifting flecks)
   while the kicker stays locked — that's P2, the handoff the WAVE-1 build skipped.
3. Keep scrolling: a cream card **slides up** over the dark hero (P3 mask), holds
   (P4, medallion appears), then the deck **swipes** card by card (P5-P6).
4. Mid-seam: the bronze `)(` stitch peaks, a giant ghost serif letter (А/Б/В)
   bleeds through the gutter with slower parallax, the medallion number ticks.
5. Reverse-scroll: every phase plays backward 1:1. Resize: deck stays aligned.
6. Toggle OS "reduce motion" OR open at ≤760px: clean static vertical stack,
   no pin, no dissolve.
