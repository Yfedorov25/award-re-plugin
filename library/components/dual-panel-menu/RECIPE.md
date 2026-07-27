---
id: dual-panel-menu
name: "Dual-panel menu (cream nav from the left + dark identity from the right meet at a centre seam)"
level: 2
kind: component
status: official
entry:
  call: "DualPanelMenu.create(target, opts)  // target = .dpm-root with .dpm-left (cream nav, .dpm-item rows) + .dpm-right (dark identity, .dpm-item). opts: { duration, ease, split, contentDelay, contentStagger, scrim }."
  module: iife
  returns: "{ open(), close(), toggle(), isOpen(), destroy }"
meaning:
  what: "Saisei's overlay menu — two panels of OPPOSITE colour slide in from opposite edges to a centre seam: a CREAM nav panel from the LEFT and a DARK identity/contact panel from the RIGHT, meeting at a 50/50 split. The colour pairing IS the meaning: cream = navigation, dark = identity. The nav rows + identity fade up after the panels land; close reverses."
  when: "The site's main menu / navigation overlay. When opening navigation should feel like the page splitting into two authored halves — the routes on one side, the studio's identity + contact on the other — rather than a plain drawer or dropdown. Saisei's nav. Pairs with a hamburger/CONTACT toggle and (optionally) a page-recede scrim."
  lands: "You tap the menu and the screen splits: a warm cream panel glides in from the left carrying the numbered routes in serif, and a dark panel glides in from the right with the studio monogram and contact details, the two meeting cleanly down the middle. The colour split itself reads — light for where you can go, dark for who they are. The rows settle up a beat after the panels land."
  not_when: "A simple link list (use a plain menu). A small site with few routes (the split is for a navigation + identity pairing). When there's no identity/contact half to fill the dark panel (it would read empty). A content overlay (this is navigation chrome)."
source:
  grammar: "Saisei menu open: cream panel from the left + dark panel from the right slide to a centre seam (50/50); left = numbered serif nav (1-7), right = 木 monogram + contact list; the outgoing page recedes behind a scrim."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (S7 / dual-panel-curtain; v2 f035-048)"
  registry_ref: ["S7-dual-panel-menu-saisei"]
stack: "vanilla (GSAP optional — built-in inOut tween fallback)"
webgl: false
motion_props: [transform, opacity]
trigger: "triggered (toggle / hamburger)"
timing_layer: [T-transition]
owns_pin: false
owns_scroll: false
page_beat: [chrome, menu]
combines_with: [page-recede-scrim, row-wipe-hover, circular-ui-language, theme-tween, center-seam-split]
anti_combos: [second-overlay]
gated_by: [R_anti_combos, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "open() slides .dpm-left (cream) translateX(-100%->0) + .dpm-right (dark) translateX(100%->0) to a centre seam; panels sized from `split` (0.5 = 50/50)"
  - "nav rows + identity (.dpm-item) fade up (translateY 10->0 + opacity) AFTER the panels land, staggered; an optional scrim fades the page back"
  - "close()/toggle() reverse the panels the way they came; isOpen() reports state"
  - "the colour pairing carries meaning: cream = navigation, dark = identity (not a cosmetic choice)"
  - "transform(translateX) + opacity only; GPU; NO mix-blend / NO backdrop / NO WebGL"
  - "GSAP used if present (the _from* helper fields are filtered out of the gsap call -> no warnings), else a built-in tween; reduced-motion -> instant; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR routes + identity/contact, Saisei cream/ink palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Tap меню (or autoplay): the cream nav panel slides in from the left and the dark identity panel from the right, meeting at a 50/50 seam; the nav rows fade up; tap again to close (panels retract). Triggered overlay (not scroll) — the wheel gate doesn't apply; verify the split, the row fade-up, the close reverse, and smoothness (fps>=50, jank<8%)."
note: |
  Brick S7 of the Saisei harvest — the navigation overlay. The opposing-colour split is
  the signature: cream = where you can go, dark = who they are. Pairs with row-wipe-hover
  (the per-row hover) and page-recede-scrim (the page receding behind it). GSAP path
  filters the built-in _from* helper fields so there are no "Invalid property" warnings
  (a bug caught and fixed). Proven 1:1 on QUADRO: 50/50 split, rows fade up, 0% jank, 0
  warnings.
---

# dual-panel-menu — cream nav + dark identity meet at a centre seam

Saisei's overlay menu: a cream nav panel slides in from the left and a dark identity panel
from the right, meeting at a 50/50 centre seam — cream for the routes, dark for the
studio's identity + contact. The nav rows fade up after the panels land; close reverses.

## Markup + call
```html
<div class="dpm-scrim"></div>
<div class="dpm-root" id="menu">
  <div class="dpm-left">  <!-- cream nav -->
    <div class="dpm-item nav"><span class="num">01</span>Головна</div> …
  </div>
  <div class="dpm-right"> <!-- dark identity -->
    <div class="dpm-item mono">再生</div>
    <div class="contact"><div class="dpm-item">…email/phone…</div></div>
  </div>
</div>
```
```js
var menu = DualPanelMenu.create('#menu', { duration: 0.7, split: 0.5, contentStagger: 0.07 });
toggleBtn.addEventListener('click', function () { menu.toggle(); });
```

## Proven (the lab)
OUR QUADRO menu: the cream nav panel (01 Головна … 05 Контакти, serif + ordinals) slides
from the left and a dark identity panel (再生 + contact list with tracked labels) from the
right, meeting at a 50/50 seam; scrim to 0.5; nav rows fade up. Probe (4× CPU throttle):
0/132 long frames (0.0%), 59.9fps, 0 gsap warnings.
