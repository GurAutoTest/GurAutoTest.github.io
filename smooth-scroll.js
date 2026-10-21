/* CODEMARCA — SMOOTH SCROLL
   Garry, 2026-10-20. Replaces the section snap the site used to have: the
   page now glides and eases to a stop under a mouse wheel or trackpad, the
   way oreo.com does (same library, Lenis, at its default feel). Phones and
   tablets keep their own native touch scroll, which is already smooth.
   Every marketing page loads this file once; it loads Lenis itself.
     · Same-page links (#faq, #app…) glide too and stop below the sticky nav.
     · When the menu or the photo lightbox locks the page, the wheel pauses.
     · Lists that scroll on their own (menu panel, chat…) keep their wheel.
     · Reduced motion → nothing here runs; the browser scrolls as before. */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var me = document.currentScript;
  var src = me ? me.src.replace(/smooth-scroll\.js.*$/, "assets/vendor/lenis.min.js")
               : "assets/vendor/lenis.min.js";

  /* Lenis's own stylesheet, the parts this site needs */
  var css = document.createElement("style");
  css.textContent =
    "html.lenis,html.lenis body{height:auto}" +
    ".lenis.lenis-stopped{overflow:clip}" +
    ".lenis.lenis-smooth iframe{pointer-events:none}";
  document.head.appendChild(css);

  var s = document.createElement("script");
  s.src = src;
  s.onload = start;
  document.head.appendChild(s);

  function start() {
    if (!window.Lenis) return;

    var lenis = new window.Lenis({ autoRaf: true, allowNestedScroll: true });
    window.siteScroll = lenis;

    var root = document.documentElement;

    /* The menu locks <body>, the lightbox locks <html> — pause while either does */
    function locked() {
      return getComputedStyle(document.body).overflowY === "hidden" ||
             root.style.overflow === "hidden";
    }
    function sync() {
      if (locked()) { if (!lenis.isStopped) lenis.stop(); }
      else if (lenis.isStopped) lenis.start();
    }
    var watch = new MutationObserver(sync);
    watch.observe(root, { attributes: true, attributeFilter: ["style"] });
    watch.observe(document.body, { attributes: true, attributeFilter: ["style", "class", "data-menu"] });

    /* Same-page links: glide there and land below the sticky nav, the same
       spot the native jump used (scroll-padding-top + the target's margin). */
    function navOffset(el) {
      var pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      var margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      return -(pad + margin);
    }
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target === "_blank") return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;

      var id = decodeURIComponent(url.hash.slice(1));
      var el = id === "top" ? null : document.getElementById(id);
      if (id !== "top" && !el) return;

      e.preventDefault();
      sync(); /* the menu closes on this same click — let the page move again */
      lenis.scrollTo(el || 0, { offset: el ? navOffset(el) : 0, force: true });
      if (history.pushState) history.pushState(null, "", url.hash);
    });

    /* Arriving from another page with a #hash: the browser has already
       jumped there, so leave it — Lenis picks up from the current spot. */
    sync();
  }
})();
