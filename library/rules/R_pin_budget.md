---
id: R_pin_budget
kind: rule
gates: [owns_pin, pin, trigger]
severity: hard
---

# Pin budget — скільки пінів, вкладеність, ланцюги

Pins are the site's scarcest resource. Spend them on the anchor moment(s) only — everything else carries length with depth, not pin. Use this rule when combining the six section primitives so ScrollTriggers never fight each other.

- **MAX 2–3 pinned sections per homepage.** ERA pins exactly 2 of its 9 sections (§01 hero intro-sticky, §03 frame-scrub). Springs pins almost nothing — its pins are reserved for the map + gallery scrollers. Treat every pin as a budget line item, not a default.

- **One pin-owner per section.** Five of the six primitives — puzzle-image, puzzle-text, slide-out-img-text, cards-swipe, focus-render-switch, media-step-switch — each grab `pin` + `scrub` + `pinSpacing`. NEVER place two pin-owners in one section: the second ScrollTrigger fights the first's `pinSpacing` and the layout jumps.

- **Non-pinned sections carry length with DEPTH, not pin.** ERA §05 is the largest section (27 parallax layers, 23 reveals, a carousel, a custom cursor) and uses ZERO pin — depth plus reveal stagger carry the tall scroll. Default every section to no-pin; promote to pin only if the move literally requires holding the frame still (assemble, frame-scrub, horizontal-takeover, stepper).

- **Pin-then-release chains are allowed; nested pins are not.** AIR's `sectionToSticky` → `sectionFromSticky` is a sequential hand-off — one pin releases before the next pins. NEVER nest a pinned ScrollTrigger inside another pinned section.

- **`pinSpacing: true` on every pin-owner.** Without it the following section jumps when the pin releases (the focus-render-switch RECIPE gotcha). Recompute on resize: `invalidateOnRefresh: true` and `anticipatePin: 1`.

- **Budget drops to ZERO at the conversion gate.** ERA §08 (apartments handoff) and Springs §09 (callback) deliberately strip pin and most motion so the decision reads cleanly. NEVER pin the form section.
