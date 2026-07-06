/* ============================================================
   AIR-MENU-OVERLAY · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   A-17 меню-оверлей + A-18 themed-хедер + T-M11 моб-дзеркало.
   Механіка знята з ЖИВОГО DOM/CSS aircenter.space (2026-07-06):

   ВІДКРИТТЯ/ЗАКРИТТЯ (живі animation--modal-in/out, ДВОФАЗНІ 1.6s):
   • Фаза 1 (open): суцільний фон modal__background fade-in 0.8s
     cubic-bezier(.7,0,.3,1) — «завіса» кольору теми.
   • Фаза 2 (delay .8s): frosted-ПАНЕЛЬ меню (opacity + translateY
     30px→0, 0.8s той самий bezier) + спіраль-фон + ГІГАНТ-лого
     зліва — все разом.
   • Close ДЗЕРКАЛЬНО: панель/лого/спіраль гаснуть першими (панель
     їде до −30px), фон чекає .8s і гасне другим.
     У CSS це дві пари transition-delay: у відкритому стані delay
     на панелі, у закритому — на фоні.

   ПАНЕЛЬ (живий .menu, md-up): frosted glass (backdrop blur 20px,
   фон --t-background-alt, radius 5px), row: ліві списки 68.57% /
   праві CTA-плитки 31.43% (border-left, плитка+плитка через лінію).
   Пункти Onest-стилем UPPERCASE, великий список gap 15, малий gap 10.

   ХЕДЕР (A-18, живий data-plugin="themed"): fixed; перефарбовування
   під секцію = transition background-color 1.2s
   cubic-bezier(.25,.74,.22,.99) (живий .header/.header__background);
   секції маркуються data-amo-theme="dark|light", хедер бере тему
   секції під своєю лінією (IntersectionObserver). Меню відкрите =
   тема меню (світла) незалежно від секції.

   БУРГЕР: 2 спани, морф у хрест .6s cubic-bezier(.29,.73,.45,1)
   (живий .icon-menu span).

   МОБ (T-M11 + живий n-md CSS): панель = full-screen stack
   column-reverse (CTA-плитки НАД списками), спіраль-фон fixed
   100svh, АКТИВНИЙ пункт посірілий ([aria-current] — «ти тут»),
   CTA-плитки КОНТЕКСТНІ (наступний крок юзера — вирішує розмітка).

   РОЗМІТКА:
     <header data-amo-header> … <button data-amo-burger>
       <span data-amo-burger-lines><i></i><i></i></span></button>
     <div data-amo-modal>
       <div data-amo-bg></div>        ← фаза 1: завіса теми
       <div data-amo-bg-image></div>  ← фаза 2: спіраль
       <div data-amo-giant>…</div>    ← фаза 2: гігант-лого
       <nav data-amo-panel> …списки/плитки… </nav>
     </div>
     секції: <section data-amo-theme="dark"> …

   AirMenuOverlay.create(opts?) — все опційне:
     phaseMs: 800        // живі 0.8s фази
     headerThemeMs: 1200 // живий хедер 1.2s
     scope: document
   Повертає { open(), close(), toggle(), isOpen(), theme(), gate, destroy }

   ENGINE LAWS: увесь рух = CSS transitions (opacity/transform/
   background-color), JS тільки перемикає класи; скрол-лок на html;
   Escape закриває; __LAB_OK__ не торкається (B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(options) {
    options = options || {};
    var scope = options.scope || doc;
    var header = scope.querySelector('[data-amo-header]');
    var burger = scope.querySelector('[data-amo-burger]');
    var modal = scope.querySelector('[data-amo-modal]');
    if (!header || !burger || !modal)
      return { error: 'потрібні [data-amo-header], [data-amo-burger], [data-amo-modal]' };

    var gate = { opens: 0, closes: 0, theme: 'light' };
    var open = false;

    modal.classList.add('amo-closed');

    function setTheme(t) {
      if (gate.theme === t) return;
      gate.theme = t;
      header.classList.toggle('amo-header-dark', t === 'dark');
    }

    /* A-18: тема секції під лінією хедера (IO по смузі верхніх 12% в'юпорта) */
    var sections = Array.prototype.slice.call(scope.querySelectorAll('[data-amo-theme]'));
    var io = null;
    if (sections.length && global.IntersectionObserver) {
      io = new IntersectionObserver(function (entries) {
        if (open) return; /* меню відкрите — тема меню */
        entries.forEach(function (en) {
          if (en.isIntersecting)
            setTheme(en.target.getAttribute('data-amo-theme') === 'dark' ? 'dark' : 'light');
        });
      }, { rootMargin: '0% 0% -88% 0%', threshold: 0 });
      sections.forEach(function (s) { io.observe(s); });
    }

    var themeBeforeOpen = 'light';
    function doOpen() {
      if (open) return;
      open = true;
      gate.opens++;
      themeBeforeOpen = gate.theme;
      modal.classList.remove('amo-closed');
      modal.setAttribute('aria-hidden', 'false');
      /* reflow: закритий стан має застосуватись до transition */
      void modal.offsetWidth;
      modal.classList.add('amo-open');
      header.classList.add('amo-menu-open');
      burger.classList.add('amo-burger-x');
      doc.documentElement.classList.add('amo-lock');
      setTheme('light'); /* меню світле — хедер перефарбовується під нього */
    }
    function doClose() {
      if (!open) return;
      open = false;
      gate.closes++;
      modal.classList.remove('amo-open');
      header.classList.remove('amo-menu-open');
      burger.classList.remove('amo-burger-x');
      doc.documentElement.classList.remove('amo-lock');
      setTheme(themeBeforeOpen);
      /* сховати з дерева ПІСЛЯ двофазного хвоста (панель .8 + фон .8) */
      global.setTimeout(function () {
        if (!open) {
          modal.classList.add('amo-closed');
          modal.setAttribute('aria-hidden', 'true');
        }
      }, 1650);
    }
    function toggle() { open ? doClose() : doOpen(); }

    function onBurger(ev) { ev.preventDefault(); toggle(); }
    function onKey(ev) { if (ev.key === 'Escape' && open) doClose(); }
    burger.addEventListener('click', onBurger);
    doc.addEventListener('keydown', onKey);

    return {
      open: doOpen, close: doClose, toggle: toggle,
      isOpen: function () { return open; },
      theme: function () { return gate.theme; },
      gate: gate,
      destroy: function () {
        burger.removeEventListener('click', onBurger);
        doc.removeEventListener('keydown', onKey);
        if (io) io.disconnect();
        doc.documentElement.classList.remove('amo-lock');
        modal.classList.remove('amo-open', 'amo-closed');
        header.classList.remove('amo-menu-open', 'amo-header-dark');
        burger.classList.remove('amo-burger-x');
      }
    };
  }

  global.AirMenuOverlay = { create: create };
}(window));
