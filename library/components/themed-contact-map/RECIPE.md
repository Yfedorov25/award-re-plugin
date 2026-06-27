---
id: themed-contact-map
name: "Themed contact-map (the drawn district map dialect stripped to a single sales-office pin that drops + pulses, the residence disc, beside a contact panel — address / phone / hours / CTA)"
level: 2
kind: component
status: official
entry:
  call: "ThemedContactMap.create(target, opts)  // target = .tcm-stage > .tcm-map( svg + .tcm-disc[data-disc] + .tcm-pin[data-pin]( .tcm-pin-ring + .tcm-pin-dot + .tcm-pin-lbl ) ) + .tcm-panel( .tcm-panel-h + .tcm-line x N + .tcm-cta ). opts: { start, pulse, pulseDur, duration, ease, once, pin, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), play(), destroy }"
meaning:
  what: "r1864's /contacts map — the river-tinted-poi-map DIALECT stripped to a SINGLE destination: the warm-taupe drawn district map (river + parks + roads + a few orienting landmark glyphs) carries ONE pin — the 'ОФИС ПРОДАЖ' (sales office) — that DROPS + PULSES on enter, the '1864' disc marks the residence, beside a CONTACT PANEL (address / phone / hours / a framed CTA). The 'where to find us' map."
  when: "The contacts / find-us section, when you already have the drawn district map dialect (river-tinted-poi-map) and want a FOCUSED version: not the full atlas of landmarks, but one destination — the sales office — with the contact details beside it. Use it as the closing beat: the hand-styled map keeps the brand's craft, a single pulsing pin says 'come here', and the panel carries address / phone / hours / a booking CTA."
  lands: "The same hand-drawn district map you saw earlier returns, calmer now — and instead of a constellation of landmarks there's a single marker pulsing gently over the sales office, the residence disc nearby for orientation. Beside it, a quiet column: the address, the phone, the hours, and a single framed button to book a viewing. It reads as 'here is where to find us', not 'here is everything around'."
  not_when: "You need the full neighbourhood atlas of many POIs (use river-tinted-poi-map). The map should dim to a backdrop for a card rail (use map-dim-carousel-announce). A real interactive/zoomable map is required (this is a drawn static SVG). When there's no single destination to feature (the one-pin focus is the point)."
source:
  grammar: "r1864 /contacts: the same drawn district map as /location but focused on the sales office — a single ОФИС ПРОДАЖ marker + the address / phone / hours and a 'записаться на показ' CTA. The full POI atlas (many pins) is the /location view; this is the contact view."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (Brick 12 of the r1864 harvest; the /contacts map variant)"
  registry_ref: ["r1864-themed-contact-map"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity]
trigger: "scroll-into-view reveal (once; optionally pinned) + a looping pin pulse"
timing_layer: [B-reveal, T-section-announce]
owns_pin: optional
owns_scroll: false
page_beat: [contacts, find-us, location, map]
combines_with: [river-tinted-poi-map, map-dim-carousel-announce, compass-rose-section-divider, conversion-quiet-gate]
anti_combos: [pin-conflict, mix-blend-over-scroll]
gated_by: [R_perf_limits]
variants: [river-tinted-poi-map, map-dim-carousel-announce]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "the drawn river-tinted district map (svg) as the field, with a residence .tcm-disc + a SINGLE .tcm-pin (the sales office), positioned by css vars"
  - "on scroll-into-view: map fade 0->1 + scale 1.03->1 (0..0.5); disc fade + scale 0.6->1 (0.30..0.6); the pin DROPS (translateY -22->0) + fades (0.45..0.75); the contact panel lines + CTA fade + translateY 24->0 staggered (0.55..1.0)"
  - "once revealed the pin's ring runs a looping PULSE (scale 1->1.8 + opacity 0.5->0)"
  - "set(p 0..1) is a PURE scrub of the reveal; transform + opacity only; NO mix-blend / NO WebGL"
  - "reduced-motion or <=820px -> shown (no pulse, grid stacks to 1 col); window.__LAB_OK__ on init"
  - "asset-substitution gate: the drawn district map (ideally river-tinted-poi-map) + ONE sales-office pin + a contact block (address/phone/hours/CTA)"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the section in: the map fades in, the '1864' disc scales in, the single ОФИС-ПРОДАЖ pin drops + then pulses, the contact panel (address/phone/hours/CTA) staggers in. Verify the single-pin focus + drop + pulse, the disc, the panel stagger, + fps (incl. the running pulse). Split layout — scroll so the stage fills the frame to screenshot it."
note: |
  Brick 12 of the r1864 harvest (the LAST variation — closes r1864) — the /contacts map. The
  river-tinted map dialect stripped to ONE focused destination: a single ОФИС-ПРОДАЖ pin that
  drops + pulses + the residence disc, beside a contact panel (address / phone / hours / CTA).
  Marked relatives (in `variants`): river-tinted-poi-map (the FULL POI atlas — many pins + disc)
  and map-dim-carousel-announce (the map DIMMED as a card-rail backdrop). This is the CONTACT
  variant: one pin + a contact block, map at full presence. The lab embeds the river-tinted-poi-map
  SVG as the map (asset-independent + proves the dialect reuse). transform + opacity = GPU-cheap;
  the pulse is one GSAP repeat tween. owns_pin OPTIONAL. Proven: map->disc->pin-drop->panel
  stagger, pin pulse animating; 0.00% jank @ 4x throttle; zero console errors. Serif = Playfair
  Display (Didot/Bodoni class).
---

# themed-contact-map — the drawn map, one pulsing sales-office pin, a contact panel beside it

r1864's /contacts map: the river-tinted district map dialect stripped to a single ОФИС-ПРОДАЖ pin
that drops + pulses (the residence disc nearby), beside a contact panel — address, phone, hours,
a booking CTA. The contact variant of the drawn-map dialect.

## Markup + call
```html
<section class="tcm-stage" id="contacts">
  <div class="tcm-map">
    <svg class="rtm-map">…river-tinted-poi-map drawn district…</svg>
    <div class="tcm-disc" data-disc>1864</div>
    <div class="tcm-pin" data-pin>
      <span class="tcm-pin-ring"></span><span class="tcm-pin-dot"></span><span class="tcm-pin-lbl">Офис продаж</span>
    </div>
  </div>
  <div class="tcm-panel">
    <h2 class="tcm-panel-h">Контакты</h2>
    <div class="tcm-line"><strong>Адрес</strong>Москва, Софийская набережная, 36</div>
    <div class="tcm-line"><strong>Офис продаж</strong>+7 (495) 280-70-70</div>
    <div class="tcm-line"><strong>Часы работы</strong>Ежедневно 10:00 – 21:00</div>
    <a class="tcm-cta" href="#">Записаться на показ →</a>
  </div>
</section>
```
```js
ThemedContactMap.create('#contacts', { pulse:true, manageLenis:false });
```
Position the disc + pin with `--tcm-disc-x/y` and `--tcm-pin-x/y`.

## Proven (the lab)
The drawn district map (roads/parks/landmark glyphs Кремль/Храм Христа Спасителя/ГЭС-2/Третьяковская
+ street-name italics) with the copper '1864' disc + a single 'ОФИС ПРОДАЖ' pin (terracotta dot +
pulsing ring), beside a contact panel (АДРЕС / ОФИС ПРОДАЖ +7 495 280-70-70 / ЧАСЫ РАБОТЫ /
'ЗАПИСАТЬСЯ НА ПОКАЗ' CTA). REVEAL curve measured live (p / map / disc / pin / cta): 0 / 0 / 0 / 0 /
0 → 0.4 / 0.99 / 0.70 / 0 / 0 → 0.6 / 1 / 1 / 0.88 / 0 → 0.8 / 1 / 1 / 1 / 0.59 → 1 / 1 / 1 / 1 / 1.
PULSE: ring opacity animating (0.313 → 0.121 over 600ms). Zero console errors. Smoothness (4× CPU
throttle, scroll-enter + pulse running): 306 frames, 0.00% long → PASS. Map = the embedded
river-tinted-poi-map SVG (Brick 3 dialect).
