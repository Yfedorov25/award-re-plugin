---
id: menu-tracked-stagger
name: "Menu tracked-stagger (a full-screen overlay nav: big condensed items ghost by default, solid on hover, current page red, staggered in; a contact column on the right; Close pill + Escape)"
level: 2
kind: component
status: official
entry:
  call: "MenuTrackedStagger.create(target, opts)  // target = .mts-overlay > .mts-nav(.mts-item xN, one .is-current) + .mts-aside; page has trigger(s) + .mts-close. opts: { trigger, closeSelector, stagger, duration, ease }."
  module: iife
  returns: "{ open(), close(), toggle(), set(p), isOpen(), destroy }"
meaning:
  what: "gapsystudio's overlay menu — a FULL-SCREEN overlay (not a sliding panel) on the studio field. LEFT: a big condensed nav whose items are GHOST-GREY by default and go SOLID on hover, with the current page kept RED. RIGHT: a contact column (socials, email/phone, download presentation). On open the nav items STAGGER in (fade + rise); a Close pill + Escape close it; the logo persists."
  when: "The primary site menu for a studio / agency / portfolio where the menu itself is a STATEMENT — big type, lots of air, a contact column doing double duty as a footer. Use it when you want the navigation to feel like a designed page, not a dropdown; the ghost->solid hover gives a confident, restrained interaction and the current-page red orients the visitor."
  lands: "You tap Menu and the whole screen turns into a quiet near-white page: a column of huge faded words on the left, the one you're on glowing red, the rest dim until you point at them — then they snap to solid black. On the right, the studio's socials and contact sit ready. The words ladder in from the top as it opens. It reads as the menu being a destination, not a utility."
  not_when: "A small site with 2-3 links (use an inline nav). When you can't spare a full-screen takeover (a compact dropdown is honest). A content-heavy mega-menu with sub-items (this is a flat list). Two sliding coloured panels (use dual-panel-menu). When the brand type isn't bold enough to carry giant ghost words."
source:
  grammar: "gapsy overlay menu: a full-screen near-white overlay; left = big condensed nav, ghost-grey default, the current page (HOME) red, hovered item solid; right = OUR SOCIAL + GET IN TOUCH + DOWNLOAD COMPANY PRESENTATION; a dark 'Close' pill top-right; the logo persists."
  recording: "apps/quadro/.award-re/teardowns/D_gapsy_video.md (B overlay menu; gapsystudio.com, NO-WebGL basket A)"
  registry_ref: ["B-menu-tracked-stagger-gapsy"]
stack: "vanilla (CSS-driven reveal; JS toggles classes + sets per-item delay; no GSAP)"
webgl: false
motion_props: [transform, opacity]
trigger: "triggered overlay (open / close / Escape), not scroll"
timing_layer: [T-overlay, D-interaction]
owns_pin: false
owns_scroll: false
page_beat: [primary-nav, menu]
combines_with: [drag-tab-reveal, script-overline-display-pair, avatar-card-carousel, coords-corner-frame]
anti_combos: [dual-panel-menu, second-overlay]
gated_by: [R_anti_combos, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a full-screen overlay (.mts-overlay) on the studio field; opens via the trigger(s), closes via the Close control(s) and Escape; <html> overflow locked while open"
  - "LEFT: a big condensed nav (.mts-item); items ghost-grey by default, solid on hover/focus, the .is-current item red"
  - "on open the nav items stagger in (opacity 0->1 + translateY 24px->0, per-item transition-delay = index * stagger); the contact aside fades + lifts after"
  - "RIGHT: a contact column (.mts-aside) — socials, email/phone, a download link"
  - "transform(translateY) + opacity only; CSS-driven via .is-open; JS sets --mts-delay + toggles classes; NO mix-blend / NO backdrop; NO WebGL; reduced-motion -> instant"
  - "focus moves into the menu on open and returns to the trigger on close"
  - "the Close control out-ranks the page header (z-index) so its click is not intercepted (F-10); window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Click the trigger -> a full-screen near-white overlay; the nav items ladder in from the top; the current page is RED, the rest ghost until hover (then solid); a contact column sits right; Close pill + Escape close it. Triggered (NOT scroll) -> verify the stagger delays + ghost/solid/current colours + that the Close click LANDS (z above the header, F-10), and run the smoothness probe over open/close cycles."
note: |
  Brick 4 of the gapsystudio harvest (NO-WebGL basket A). A full-screen overlay menu: big
  condensed nav, ghost->solid hover, current-page red, staggered in, with a contact column.
  Confirmed DISTINCT from Saisei dual-panel-menu (two sliding coloured panels) — this is one
  flat overlay. transform + opacity = GPU-cheap, CSS-driven via .is-open. owns_pin false.
  FOUND + FIXED F-10: the Close control was z-ranked below the page header trigger, so the
  header button intercepted the close click — fixed by --mts-close-z 200 (above the header).
  Proven 1:1 on the studio field: item delays 0..420ms (7*60), HOME red, hover solid, Escape
  + Close both work, 0.4% jank @ 59.9fps, zero console errors. Display stand-in = Anton
  (condensed grotesque). gapsy palette = studio #f2f2f0 + warm-black ink + red #f0473e current.
---

# menu-tracked-stagger — a full-screen overlay nav: ghost→solid hover, current red, staggered in

gapsystudio's overlay menu: a full-screen overlay on the studio field. Left — a big condensed
nav whose items are ghost-grey by default and go solid on hover, the current page kept red.
Right — a contact column. On open the nav items stagger in (fade + rise); a Close pill + Escape
close it. Distinct from a sliding dual-panel menu — this is one flat takeover.

## Markup + call
```html
<button id="menu-open">Menu</button>
<nav class="mts-overlay" id="menu" aria-hidden="true">
  <div class="mts-nav">
    <a class="mts-item is-current" href="#">Home</a>
    <a class="mts-item" href="#">Services</a>
    <!-- … -->
  </div>
  <div class="mts-aside">… socials / contact / download …</div>
</nav>
<button class="mts-close">Close</button>
```
```js
MenuTrackedStagger.create('#menu', { trigger:'#menu-open', closeSelector:'.mts-close', stagger:60 });
```

## Proven (the lab)
A full-screen overlay over the studio field. Measured live: closed overlay opacity 0; open →
overlay 1, item0 delay 0ms / item7 delay 420ms (=7×60 stagger), current HOME = rgb(240,71,62)
red, ghost items rgba(22,21,15,.26), hover → rgb(22,21,15) solid, Close pill shown; Escape →
closed. Real Close-pill click verified working AFTER the z-index fix (close-z 200 above the
header) — before, the header "Menu" button intercepted it (logged F-10). Screenshot: red HOME,
solid INDUSTRIES on hover, ghost rest, right contact column, Close pill (matches gapsy). Probe
(4× CPU throttle, 5 open/close cycles): 2/508 long frames (0.4%), 59.9fps → PASS. Zero console errors.
