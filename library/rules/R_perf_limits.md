# Perf limits — декодери, blend, GPU при стакінгу

Hard limits for combining techniques without dropping below 60fps. Every rule is a budget you cannot exceed when stacking effects in one section or across the site. Violating any one of these is the documented root cause of scroll-jank in our builds.

- **MAX 2 video decoders site-wide, ever.** Gate every video with an IntersectionObserver play/pause — only the 1–2 elements in view may play, the rest stay paused. ERA ships 7 videos (§04) and 34 sources (§09) yet stays smooth because `videoInview` autoplay-gates them; Springs spends its single decoder on the ONE peak section. Total simultaneously-decoding videos never exceeds 2.

- **NEVER scrub `video.currentTime`.** Hard rule across both VI sites and all primitives. Seek-scrubbing causes seek-stutter. Instead scrub a frame-array (canvas-2D drawImage; ERA §03 = 149 frames) OR let the video autoplay-loop on its own clock. Both `focus-render-switch` and `media-step-switch` RECIPEs restate this.

- **Blur is the FPS killer — only during motion, never on a held surface.** `puzzle-image` caps `blurFrom ≤ 20px`, then on `onComplete` drops `filter:none` + removes `will-change` from seated tiles, and caps tile count N at 8–24 (not 60). Never leave a blur on a pinned/held surface — animate it down and clear it the instant motion ends.

- **No `mix-blend-mode` or `backdrop-filter` over a scrubbing/repainting surface.** This was the QUADRO scroll-lag root cause, echoed in the `focus-render-switch` gotcha (no animated `border-radius` on a pinned repainting surface either). On any scrub, animate composite-only properties — nothing that forces the compositor to re-blend or re-filter every tick.

- **Transform / opacity / clip-path only for all motion.** Never animate `left/top/width/height` — homes are static; tiles and cards only `translate`. Enforced by `puzzle-image`, `slide-out-img-text`, and `cards-swipe`. Animating layout re-flows on every scrub tick and kills 60fps.

- **MAX 3 WebGL-equivalent emotional beats, all faked.** Translate each to ONE animated-gradient plane (CSS or canvas-2D value-noise), NOT real geometry — Springs' tree / nature / wellness beats are all one re-tinted plane. Every 🔴 registry item goes through no-WebGL translation; self-drawing lines become SVG `stroke-dashoffset` (~70% of the effect, NW-safe).

- **Decode-gate everything.** The `appear` plugin (IntersectionObserver + `img.decode()`, `rootMargin: 600px` preload) gates ALL other plugins until the image decodes — otherwise tiles flash empty and the scrub starts before frames exist. Mandatory before any `puzzle-image`, frame-scrub, or carousel.
