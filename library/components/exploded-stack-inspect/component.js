/* ============================================================
   ExplodedStackInspect  —  interactive EXPLODED AXONOMETRIC of a building
   ------------------------------------------------------------
   An architect pulls a model apart. N component planes (roof -> top volume ->
   facade -> base/terrace) sit collapsed in an axon-skewed stack; on entry they
   SEPARATE vertically with depth (translateY + scale + a small parallax x).
   Hover/click a plane -> it ISOLATES: the chosen layer lifts forward and
   brightens, the others recede (push back + down) and DIM, and a spec panel
   reveals that component's material + role. Release -> the deck re-assembles.

   Deps (global): gsap. (ScrollTrigger optional — only if you scroll-drive the
   separation from a host pin via the returned set(p).) No build step. No WebGL,
   no canvas, no mix-blend, no backdrop. Motion ONLY transform / opacity / filter.

     window.ExplodedStackInspect.create(target, options) -> { set, isolate, destroy }

   target   CSS selector or Element of the stage that holds the layers.
   options  see DEFAULTS. options.layers = [{ img, label, spec }] (top -> bottom).

   It BUILDS its own DOM inside `target` from options.layers (or, if the markup
   already carries .esi__layer children, it adopts them). Each layer:
     .esi__layer > .esi__plane (img) + .esi__tag (label) ; a side .esi__panel per layer.

   Returns:
     set(p)        0..1 separation amount (0 = collapsed, 1 = fully exploded).
                   Wire to a host scroll pin if you want scroll-driven separate;
                   otherwise the entry tween drives it once to 1.
     isolate(i|null)  focus one layer (or null to release).
     destroy()
   ============================================================ */
(function (global) {
  "use strict";

  var DEFAULTS = {
    layers: null,            // [{img,label,spec}] top->bottom; required unless markup pre-seeded
    gap: 168,                // px between adjacent exploded planes — >= plane height
                             // so the deck reads as separated slabs (no fanned-pile overlap)
    skewX: -22,              // axon shear (deg) applied to the whole rig
    rotX: 8,                 // slight tip-back for the exploded-axon read
    parallaxX: 22,           // px sideways drift per layer as it separates (depth)
    scaleStep: 0.045,        // each lower plane sits slightly larger (foreground)
    isolateLift: 56,         // px the chosen layer lifts toward the viewer
    recede: 0.9,             // scale others shrink to when one is isolated
    dim: 0.3,                // opacity others fall to when one is isolated
    blurOthers: 1.6,         // px filter blur on receded layers — kept low so the
                             // filter tween stays cheap on the compositor (GPU)
    entry: true,             // play the separation once on create
    entryDur: 1.15,          // seconds for the entry separation
    stagger: 0.09,           // seconds between layers in the entry
    ease: "air",             // CustomEase name or any gsap ease
    accent: "#b56a4a",
  };

  // house ease, registered once (soft expo-out)
  var easeReady = false;
  function ensureEase() {
    if (easeReady) return;
    if (global.CustomEase && global.CustomEase.create) {
      try { if (!global.gsap || !global.gsap.parseEase("air")) global.CustomEase.create("air", "0.16,1,0.3,1"); } catch (e) {}
    }
    easeReady = true;
  }

  function el(tag, cls, parent) {
    var n = global.document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }

  function build(root, layersData) {
    // adopt existing .esi__layer markup if present, else build from data
    var existing = Array.prototype.slice.call(root.querySelectorAll(".esi__layer"));
    var rig, panelWrap;
    if (existing.length) {
      rig = root.querySelector(".esi__rig") || root;
      panelWrap = root.querySelector(".esi__panels");
      return { rig: rig, layers: existing, panels: panelWrap ? Array.prototype.slice.call(panelWrap.querySelectorAll(".esi__panel")) : [] };
    }
    root.classList.add("esi");
    rig = el("div", "esi__rig", root);
    var layers = [];
    layersData.forEach(function (d, i) {
      var L = el("div", "esi__layer", rig);
      L.setAttribute("data-i", String(i));
      L.setAttribute("role", "button");
      L.setAttribute("tabindex", "0");
      L.setAttribute("aria-label", d.label || ("шар " + (i + 1)));
      var plane = el("div", "esi__plane", L);
      var img = el("img", null, plane);
      img.src = d.img; img.alt = d.label || ""; img.loading = "eager"; img.decoding = "async";
      var tag = el("div", "esi__tag", L);
      var idx = el("span", "esi__tag-idx", tag);
      idx.textContent = String(i + 1).padStart(2, "0");
      var name = el("span", "esi__tag-name", tag);
      name.textContent = d.label || "";
      layers.push(L);
    });
    // the spec panel column (one panel per layer; only the focused one shows)
    var panelWrapEl = el("div", "esi__panels", root);
    var panels = [];
    layersData.forEach(function (d, i) {
      var P = el("div", "esi__panel", panelWrapEl);
      P.setAttribute("data-i", String(i));
      var pIdx = el("div", "esi__panel-idx", P); pIdx.textContent = String(i + 1).padStart(2, "0");
      var pLabel = el("div", "esi__panel-label", P); pLabel.textContent = d.label || "";
      var pSpec = el("div", "esi__panel-spec", P); pSpec.textContent = d.spec || "";
      panels.push(P);
    });
    return { rig: rig, layers: layers, panels: panels };
  }

  function create(target, options) {
    var root = typeof target === "string" ? global.document.querySelector(target) : target;
    if (!root) return null;
    var o = Object.assign({}, DEFAULTS, options || {});
    var data = o.layers || [];
    var built = build(root, data);
    var rig = built.rig, layers = built.layers, panels = built.panels;
    var N = layers.length;
    if (!N) return null;

    root.style.setProperty("--esi-accent", o.accent);

    var g = global.gsap;
    var reduce = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // collapsed centre index so the deck explodes symmetrically about its middle
    var mid = (N - 1) / 2;

    // ---------- reduced motion / no-gsap: static labelled stack ----------
    if (reduce || !g) {
      root.classList.add("esi--static");
      layers.forEach(function (L, i) {
        var off = (i - mid) * o.gap;
        L.style.transform = "translate3d(" + ((i - mid) * o.parallaxX) + "px," + off + "px,0) scale(" + (1 + (i - mid) * -o.scaleStep) + ")";
        L.style.opacity = "1";
      });
      if (panels[0]) panels[0].classList.add("is-on");
      try { root.setAttribute("data-esi-ready", "1"); } catch (e) {}
      return { set: function () {}, isolate: function () {}, destroy: function () {} };
    }

    ensureEase();

    var focused = null;       // index currently isolated, or null
    var sep = 0;              // current separation 0..1

    // base resting transform for a layer at separation `s` (no isolate)
    function place(i, s) {
      var d = i - mid;                       // signed distance from centre
      var y = d * o.gap * s;                 // vertical explode
      var x = d * o.parallaxX * s;           // sideways depth drift
      var sc = 1 + d * -o.scaleStep * s;     // lower planes grow forward
      return { y: y, x: x, scale: sc };
    }

    // paint the whole rig for separation `s` and the current focus
    function paint(s, animate, dur) {
      sep = s;
      layers.forEach(function (L, i) {
        var b = place(i, s);
        var t = { x: b.x, y: b.y, scale: b.scale, opacity: 1, filter: "blur(0px) brightness(1)", zIndex: 10 + i };
        if (focused != null) {
          if (i === focused) {
            t.y = b.y - o.isolateLift;       // lift toward viewer
            t.scale = b.scale + 0.06;
            t.zIndex = 60;
            t.filter = "blur(0px) brightness(1.06)";
            L.classList.add("is-focus");
            L.classList.remove("is-receded");
          } else {
            t.scale = b.scale * o.recede;    // others recede + dim + soften
            t.x = b.x + (i < focused ? -18 : 18);
            t.y = b.y + (i < focused ? -10 : 10);
            t.opacity = o.dim;
            t.filter = "blur(" + o.blurOthers + "px) brightness(0.82)";
            L.classList.add("is-receded");
            L.classList.remove("is-focus");
          }
        } else {
          L.classList.remove("is-focus", "is-receded");
        }
        if (animate) {
          // promote to a compositor layer ONLY for the duration of this motion,
          // then drop it so we never leave 4 permanent layers parked at rest.
          L.style.willChange = "transform, opacity, filter";
          g.to(L, Object.assign({
            duration: dur || 0.4, ease: o.ease, overwrite: "auto",
            onComplete: function () { this.targets()[0].style.willChange = "auto"; }
          }, t));
        } else {
          g.set(L, t);
        }
      });
      // panels
      panels.forEach(function (P, i) { P.classList.toggle("is-on", focused === i); });
      root.classList.toggle("is-isolating", focused != null);
    }

    // public: scroll-driven separation 0..1 (host pin can call this)
    function set(p) {
      p = Math.max(0, Math.min(1, p || 0));
      paint(p, false);
    }

    // public: isolate layer i (or null to release)
    function isolate(i) {
      focused = (i == null ? null : i);
      paint(sep, true, focused == null ? 0.45 : 0.4);
    }

    // ---------- interaction wiring ----------
    function onEnter(i) { return function () { if (sep > 0.6) isolate(i); }; }
    function onLeaveRig() { if (focused != null) isolate(null); }
    layers.forEach(function (L, i) {
      L.addEventListener("mouseenter", onEnter(i));
      L.addEventListener("focus", onEnter(i));
      L.addEventListener("click", function () { isolate(focused === i ? null : i); });
      L.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); isolate(focused === i ? null : i); }
        if (e.key === "Escape") isolate(null);
      });
    });
    rig.addEventListener("mouseleave", onLeaveRig);

    // ---------- entry: collapsed -> exploded, once ----------
    paint(0, false);                          // start collapsed
    if (o.entry) {
      layers.forEach(function (L, i) {
        var b = place(i, 1);
        L.style.willChange = "transform, opacity, filter";
        g.fromTo(L,
          { y: 0, x: 0, scale: 1, opacity: i === Math.round(mid) ? 1 : 0.0 },
          { y: b.y, x: b.x, scale: b.scale, opacity: 1,
            duration: o.entryDur, ease: o.ease,
            delay: i * o.stagger,
            onComplete: function () { L.style.willChange = "auto"; } });
      });
      sep = 1;
    } else {
      paint(0, false);
    }

    try { root.setAttribute("data-esi-ready", "1"); } catch (e) {}

    return {
      set: set,
      isolate: isolate,
      destroy: function () {
        g.killTweensOf(layers);
        rig.removeEventListener("mouseleave", onLeaveRig);
        // listeners on layers are GC'd with the nodes when the lab tears down;
        // for surgical reuse the host can simply drop `root`.
      },
    };
  }

  global.ExplodedStackInspect = { create: create, DEFAULTS: DEFAULTS };
})(typeof window !== "undefined" ? window : this);
