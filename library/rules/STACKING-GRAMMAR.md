# STACKING-GRAMMAR — how Vide Infra layers 4-5 moves into ONE section

> Derived from the Ever (ever-live-here.com) section anatomy, cross-referenced
> against `_TECHNIQUE_REGISTRY.md`. An award VI section is **never one technique**
> — it is 3-5 primitives stacked, some firing **at once**, some in **sequence**
> on scroll. This file is the RULES layer: what combines with what, the timing
> layers, the pin budget, the theme flow, the perf limits.
> Companion seed recipes: `library/combos/ever-*.md`.

---

## 0. The mental model — three timing layers per section

Every VI section runs on THREE layers that coexist. When you "stack 5 moves,"
you are really filling these three slots:

| Layer | When it fires | Examples | Driver |
|---|---|---|---|
| **A. Ambient** (always-on) | runs the whole time the section is in view, independent of exact scroll | parallax-depth, deco-layer drift, custom-cursor, background video autoplay, theme tint | `precisescroll`/Lenis rAF, mouse |
| **B. Entrance** (one-shot, on inview) | fires ONCE as the section crosses the reveal line, then done | `appear` decode-gate, text-line-stagger, clip-reveal, counter count-up, image-clip-in | IntersectionObserver |
| **C. Interaction** (user-driven, repeatable) | fires on demand, any time, as many times as the user wants | tabs/tab-synced media swap, before/after drag, Owl carousel, hover popover, focus-render-switch | click/hover/drag |

**The grammar rule:** a rich section picks **one Ambient + one Entrance + one
Interaction**, then optionally adds a **theme-flip** at the seam and a **second
Ambient** (deco) for depth. That is the 4-5 stack. You are not inventing five
unrelated animations — you are filling A+B+C and decorating the seam.

```
SECTION = [Ambient parallax] + [Entrance reveal] + [Interaction control]
          + [theme-flip at the seam-in]  (+ optional 2nd Ambient: deco/cursor)
```

---

## 1. What combines with what (the compatibility matrix)

Read as: ROW technique stacks WITH column technique? ✅ yes / ⚠️ careful / ❌ avoid.

|                         | parallax-depth | pin (scroll-takeover) | clip-reveal | text-line-stagger | tabs/media-swap | before/after drag | counter | carousel | theme-flip |
|-------------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **parallax-depth**      | — | ✅ | ✅ | ✅ | ✅ | ⚠️¹ | ✅ | ✅ | ✅ |
| **pin (takeover)**      | ✅ | — | ✅ | ✅ | ✅ | ⚠️² | ✅ | ✅ | ✅ |
| **clip-reveal**         | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **text-line-stagger**   | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| **tabs/media-swap**     | ✅ | ✅ | ✅ | ✅ | — | ❌³ | ✅ | ⚠️⁴ | ✅ |
| **before/after drag**   | ⚠️¹ | ⚠️² | ✅ | ✅ | ❌³ | — | ✅ | ❌³ | ✅ |
| **counter**             | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| **carousel**            | ✅ | ✅ | ✅ | ✅ | ⚠️⁴ | ❌³ | ✅ | — | ✅ |
| **theme-flip**          | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |

Footnotes (the real lessons):
1. **parallax + before/after**: the drag handle must NOT move under parallax or
   the cursor/handle desync. Park the comparison frame on a pinned, parallax-
   FROZEN sub-element (`js-scroll-controller-ignore` in Ever). Parallax the
   surroundings, freeze the interactive plate.
2. **pin + before/after**: while pinned, vertical scroll = section progress, but
   the slider needs vertical-ish drag too → Ever sets `js-scroll-controller-ignore`
   on the slider so a drag does NOT scroll the section. Decide who owns the gesture.
3. **two Interaction widgets in one section** (tabs+drag, carousel+drag,
   tabs+carousel-on-same-axis): ❌ gesture collision + cognitive overload. One
   Interaction per section. This is the strongest rule.
4. **tabs driving a carousel**: only if the tab SELECTS which carousel, not if
   both swipe. Ever's Interior does tab→image-swap (a 1-frame carousel), not a
   free Owl under tabs. Keep one swipe axis.

---

## 2. Simultaneity rules — what fires AT ONCE vs in SEQUENCE

### Fire AT ONCE (same trigger frame)
- **Ambient layer is always parallel** to everything. Parallax never waits.
- On the **entrance frame**, fire together: `appear` decode-gate → (gates) →
  clip-reveal of the hero image **+** text-line-stagger **+** theme-flip tint.
  They share ONE IntersectionObserver crossing. The stagger inside text is the
  only sequencing; image and theme are instant-parallel.
- **theme-flip is always simultaneous with the seam-in** — the new background
  color is already correct before the section's content reveals. Never flip theme
  AFTER content (causes a visible re-tint flash).

### Fire IN SEQUENCE (chained, one after another)
- **Within a pin**: the takeover unfolds as scrubbed beats — e.g. Architecture
  pins, then beat1 carousel-advance, beat2 counter ticks, beat3 next pane. These
  are sequenced ALONG the pinned scroll distance (B-layer stretched over scroll).
- **text-line-stagger is internally sequenced** (60ms/line) but the whole block
  is one entrance event.
- **Interaction is always "later"** — it only exists after entrance completes.
  Never auto-fire a tab/drag during the entrance reveal.

### The ordering law (from CLAUDE.md 3-tier / Ever)
Reveal order within an entrance: **theme tint → frame/clip → media decode-in →
text lines → counter/accent**. Background context first, foreground detail last.

---

## 3. The PIN BUDGET (the scarcest resource)

Pinning (scroll-takeover) is expensive: it freezes the page, eats scroll
distance, and stacks badly. Ever's home has **7 sections** and pins **sparingly**.

**Rules:**
- **Max ~half the sections pin.** On a 7-section home, 2-3 pinned MAX. The rest
  are flow sections (entrance reveal + ambient parallax only, no pin).
- **Never two adjacent pins of the same kind.** Alternate: pinned-takeover →
  flow section → pinned-takeover. Back-to-back pins read as the page "sticking."
- **A pin must EARN its scroll cost** with a real multi-beat payload (carousel +
  counter + tab walk = yes; a single image + caption = no, that's a flow section).
- **One pin = one takeover gesture.** Don't pin AND horizontal-takeover AND
  before/after in the same section. Pick the section's hero gesture.
- **pinSpacing math**: `end:'+=Nvh'` where N ≈ (number of beats × ~80). Budget
  the scroll length to the payload; over-long pins feel broken.
- **Flow-section default**: if unsure whether to pin, DON'T. Default to a flow
  section (sticky-clip stacking gives the "premium hold" feel without a true pin
  — see SP `sticky--under-next`, pure CSS, zero pin cost).

---

## 4. THEME FLOW (the cold/warm/green rhythm)

Ever themes EVERY section: `ui-cold-3 → ui-cold-3 → ui-warm-2 → ui-green →
ui-warm-1 → ui-cold-2 → ui-background`. This is a **deliberate temperature wave**,
not random. It is what makes 7 recombined section-blocks feel like a composed film.

**Rules:**
- **Theme is a property of the SECTION, set at the seam.** A `changeTheme`
  IntersectionObserver flips CSS vars (`--bg`, `--fg`, `--accent`) the instant the
  section's top crosses ~50% viewport. Simultaneous with seam-in (§2).
- **Plan the wave before building.** Assign each section cold/warm/green in the
  motion-score. Aim for a contour like: cold open → warm middle → green nature
  beat → warm → cold close → neutral footer. Never >3 identical themes in a row.
- **Temperature carries meaning**: cold = architecture/structure/spec; warm =
  interior/living/lifestyle; green = territory/nature; neutral/background =
  news/footer/utility. Match theme to section content semantics.
- **The transition itself**: cross-fade `--bg` over ~0.8s (luxury reveal
  duration) on the house ease. Foreground content does its own entrance ON TOP of
  the already-settled new background. Two layers, background leads by a hair.
- **One accent per theme** keeps it from looking like a paintbox. Ever's terracotta
  `#AC7E65` is the through-line accent; themes shift the bg/fg around it.

---

## 5. PERF LIMITS (the hard ceilings — vanilla GSAP+ScrollTrigger+Lenis, NO WebGL)

These are non-negotiable for the no-WebGL stack:

- **Animate ONLY `transform` + `opacity` + `clip-path`.** Never animate
  `left/top/width/height/margin` (layout thrash). Home cells are static; tiles
  translate. (puzzle-image lesson.)
- **Max 2 video decoders alive at once.** Hero may run 2 autoplay videos; any
  section beyond that must pause/teardown offscreen video. Ever home has 2 videos
  total in the hero and reuses them.
- **NEVER scrub `video.currentTime`** on scroll (seek-stutter). Scroll scrubs the
  TEXT/clip/parallax; video stays autoplay-cinema underneath. (scroll-driven-hero-law.)
- **For "frame-sequence" looks** (Ever progress ~1333-2628 img): do NOT canvas-
  scrub thousands of decoded images. Use **horizontal-takeover pin** (translateX
  a strip) OR a small canvas-2D scrub of a curated ~60-frame set. Decode-ahead the
  next few frames only.
- **One IntersectionObserver per concern, reference-counted** (`addClassCounted`)
  — overlapping observers (appear + reveal + theme) must not fight. Don't spawn an
  observer per element; batch.
- **Decode-gate everything heavy** with `appear` (IO + `img.decode()` +
  rootMargin 600px preload) so reveals never fire on an undecoded image (white
  flash). This is the single most-used VI primitive for a reason.
- **`will-change` only on the actively-animating element, removed after.** Don't
  blanket `will-change:transform` — it blows GPU memory.
- **Pinned section perf**: keep the pinned subtree shallow; heavy DOM under a pin
  repaints every frame. Move decorative deco-layers OUT of the pinned container.
- **deco/cursor parallax** runs on mouse + rAF lerp; cap to transform-only and a
  single rAF loop shared across all deco elements (not one loop each).

---

## 6. The recombination principle (why this is cheap depth)

Ever's "infinite depth" (home=7, /about=10, /territory=10 sections) is an
**illusion from a small block-set recombined**: `{pinned-takeover, Owl-carousel,
parallax/reveal, counter, before/after, tabbed-media-swap}` × `{cold/warm/green
theme}`. Variety is the PERMUTATION, not new code.

**For the plugin:** a section spec = pick a COMBO recipe (§combos) + assign a
theme + drop in the data. Six combos × the theme wave = a full "bespoke-feeling"
site from a fixed library. That is the grammar. Build the six well; recombine
forever.

---

## 7. Quick-reference: the canonical 5-stack

When in doubt, this is the default award section:

```
1. AMBIENT   parallax-depth on the media (data-parallax 0-50 / 100-50, token calc)
2. AMBIENT   deco-layer drift OR custom-cursor (depth, optional 5th)
3. ENTRANCE  appear decode-gate → clip-reveal media + text-line-stagger (60ms/line)
4. INTERACTION  ONE of: tabs+media-swap | before/after drag | carousel | focus-switch
5. SEAM      theme-flip (cold/warm/green) simultaneous with seam-in, 0.8s bg crossfade
```
Fire order on scroll: theme(at once with seam) → clip+parallax(at once) →
text(staggered) → [interaction available after settle]. One pin MAX, and only if
the interaction is a true multi-beat takeover.
