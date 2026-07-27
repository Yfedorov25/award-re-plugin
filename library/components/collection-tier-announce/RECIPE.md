---
id: collection-tier-announce
name: "Collection tier-announce (a vertical stack of product-tier bands — giant serif title + stat-row + framed CTA + dual-image split — each announcing on enter while the page ground theme tweens dark-green → taupe → cream across tiers)"
level: 3
kind: component
status: official
entry:
  call: "CollectionTierAnnounce.create(target, opts)  // target = .cta-stage > .cta-tier[data-theme='{bg,ink,dim,line}'] x N, each = .cta-head( .cta-title + .cta-cta ) + .cta-body + .cta-stats( .cta-stat[ .cta-num + .cta-lab ] ) + .cta-split( .cta-img x2 ). opts: { start, themeStart, revealDur, themeDur, ease, clipFrom, once, manageLenis }."
  module: iife
  returns: "{ triggers, setTier(i,p), play(), setTheme(theme), destroy }"
meaning:
  what: "r1864's /collection — a vertical STACK of TIER bands, each announcing a product tier with a giant serif TITLE + a small body + a STAT-ROW (big serif numerals + small labels: высота / спальни / площадь / терраса) + a framed CTA + a DUAL-IMAGE split (interior + city-view). As each tier enters it announces (title → body → stat-row → the two images stagger in) AND the page GROUND theme tweens to that tier's palette (dark-green → taupe → cream). The 'browse the collection by tier' chapter."
  when: "The product / collection page of a tiered offering — where the same project is sold in escalating grades (historic → private → terraced → villa → penthouse) and each grade deserves its own statement, stats and imagery. Use it as a long scroll where each tier is a self-contained band that announces itself, and let the ground colour climb with the tiers (darkest at the entry grade, lightest/most precious at the top grade) so the THEME itself signals the ascent. Best when the stats genuinely differ per tier (ceiling height, bedrooms, area, terrace)."
  lands: "You scroll into a grade and it announces itself — a large serif name, a quiet line of copy, a row of big numerals (height, bedrooms, area), a single framed button, and two photographs that wipe up into place. Keep going and the next grade arrives, and the whole page has quietly changed colour — from a deep forest green at the historic grade up through warm taupes to a pale cream at the penthouses. The ground tells you you're climbing."
  not_when: "A single product with no tiers (use one announce — masked-heritage-split / a plain stat band). Tiers that don't differ in stats (the stat-row is the point). A brand where a colour-climbing ground reads gimmicky (keep one theme). When the images can't be a clean pair (the dual split wants interior + a contrasting view)."
source:
  grammar: "r18643 /collection: each tier = giant serif title top-left + framed 'ВЫБРАТЬ АПАРТАМЕНТЫ' CTA top-right + a small body in the left margin + a stat-row (ИСТОРИЧЕСКАЯ: 3,4-4 / 1-2 / 105-165) + a dual-image split (interior + heritage exterior / city-view). Grounds: ИСТОРИЧЕСКАЯ dark-green → ЧАСТНАЯ / С ТЕРРАСАМИ / ВИЛЛА taupe ladder → ПЕНТХАУСЫ cream."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (Brick 7 of the r1864 harvest; the /collection tier ladder)"
  registry_ref: ["r1864-collection-tier-announce"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [clip-path, transform, opacity, "--css-var-theme"]
trigger: "a stack of scroll-into-view tier announces + a per-tier ground theme-shift"
timing_layer: [B-reveal, T-section-announce, E-theme]
owns_pin: false
owns_scroll: false
page_beat: [collection, product-tiers, section-announce, stat-band, theme-ladder]
combines_with: [masked-heritage-split, compass-rose-section-divider, stat-odometer, numeral-frame-expand-hero]
anti_combos: [pin, mix-blend-over-scroll, scrubbed-theme-over-media]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a vertical stack of N tier bands, each = serif title + framed CTA + a left body + a stat-row (big numerals + labels) + a dual-image split"
  - "on enter each tier announces: title fade+translateY 30→0 (0..0.4); body (0.15..0.5); stats staggered (0.30..0.7); cta (0.40..0.7); the two images clip-reveal (inset 100%→0) + scale 1.06→1 staggered (0.45..1.0)"
  - "a per-tier theme-shift tweens the stage css-vars (--cta-bg/ink/dim/line) to that tier's data-theme palette as it crosses centre; ground travels dark-green → taupe → cream"
  - "setTier(i, p 0..1) is a PURE scrub of tier i's announce; clip-path + transform + opacity + a short css-var tween only; NO mix-blend / NO scrubbed-theme-over-media / NO WebGL"
  - "reduced-motion or <=820px → shown (each tier static at its own theme, grid collapses to 1 col); window.__LAB_OK__ on init"
  - "asset-substitution gate: escalating product tiers with real per-tier stats + a green→cream ground ladder + a dual interior/view image per tier"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll through the tiers: each announces (title → body → stat-row → dual-image clip-reveal stagger) and the ground colour travels dark-green → taupe → cream. Verify the per-tier announce order, the dual-image clip-reveal, the theme-shift (top vs bottom ground differs), + fps. Tall multi-tier section — scroll so a tier fills the frame to screenshot it."
note: |
  Brick 7 of the r1864 harvest (first of the 6 VARIATIONS) — the /collection tier ladder. A stack
  of product-tier bands, each a self-contained announce (serif title + body + stat-row + framed CTA
  + dual-image split), with the page GROUND theme climbing dark-green → taupe → cream across the
  tiers so the colour signals the ascent. Level 3 (composite). Relatives, marked: stat-odometer
  (the numerals), masked-heritage-split / map-dim-carousel-announce (sibling announces),
  center-seam-split (the split) — this is the distinct TIER-LADDER-with-theme-shift. clip-path +
  transform + opacity + a SHORT css-var theme tween (NOT scrubbed, NOT over media) = the perf law.
  owns_pin false. Proven: tier-1 announce title→body→stat→cta→dual-image clip-reveal; ground
  rgb(39,48,42) green → rgb(231,224,210) cream; 0.52% jank @ 4x throttle; zero console errors.
  Split photos = quadro renders (honest demo assets; engine takes any photos). Serif = Playfair
  Display (Didot/Bodoni class). The lab carries the real r1864 numerals per tier.
---

# collection-tier-announce — a stack of product-tier bands, the ground colour climbing green → cream

r1864's /collection: a vertical stack of tier bands (giant serif title + stat-row + framed CTA +
dual-image split), each announcing on enter while the page ground theme tweens dark-green → taupe
→ cream across the tiers.

## Markup + call
```html
<section class="cta-stage" id="collection">
  <div class="cta-tier" data-theme='{"bg":"#27302a","ink":"#e7e2d6","dim":"#a6ab9d","line":"rgba(231,226,214,.22)"}'>
    <div class="cta-head"><h2 class="cta-title">Историческая коллекция</h2><a class="cta-cta" href="#">Выбрать апартаменты →</a></div>
    <p class="cta-body">…</p>
    <div class="cta-stats">
      <div class="cta-stat"><div class="cta-num">3,4–4</div><div class="cta-lab">Высота сводов, м</div></div>
      <!-- … -->
    </div>
    <div class="cta-split"><div class="cta-img"><img src="…interior…"></div><div class="cta-img"><img src="…view…"></div></div>
  </div>
  <!-- … N tiers, each with its own data-theme … -->
</section>
```
```js
CollectionTierAnnounce.create('#collection', { start:'top 72%', themeStart:'top 55%', clipFrom:'bottom', manageLenis:false });
```

## Proven (the lab)
5 tiers (ИСТОРИЧЕСКАЯ green → ЧАСТНАЯ → С ТЕРРАСАМИ → ВИЛЛА taupe ladder → ПЕНТХАУСЫ cream), each
with title + body + stat-row (real r1864 numerals: 3,4-4/1-2/105-165 … 3,4-7,5/5-7/623-987/558-664)
+ framed CTA + dual-image split. Tier-1 announce curve measured live (p / title / body / stat /
cta / img-clip-inset-bottom): 0 / 0 / 0 / 0 / 0 / 100% → 0.30 / 0.98 / 0.81 / 0 / 0 / 100% →
0.50 / 1 / 1 / 0.88 / 0.70 / 70.2% → 0.75 / 1 / 1 / 1 / 1 / 3.7% → 1 / 1 / 1 / 1 / 1 / 0%.
THEME-SHIFT: stage bg tier-1 `rgb(39,48,42)` green → tier-5 `rgb(231,224,210)` cream. Zero console
errors. Smoothness (4× CPU throttle, scroll through all 5 tiers): 576 frames, 0.52% long → PASS.
NO mix-blend (perf law). Split photos = quadro renders (honest demo assets; engine takes any photos).
