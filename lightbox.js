/* CODEMARCA — PHOTO LIGHTBOX (website pages)
   Tap a photo and it opens full screen, with the rest of its group beside
   it. Swipe on a phone, arrows or the keyboard on a desktop, Esc or the
   cross to close. The dashboard has its own (CM.lightbox in dashboard.js);
   this one is for the marketing and order pages, which don't load that.

   Two ways in:
     - markup: any element with data-lightbox is a group; every <img>
       inside it opens. Bound on load.
     - script: Lightbox.bind(box, "img") for rows built after load
       (onboarding's places, the checkout slider).

   Styles are injected once from here, so a page needs only this file. It
   draws its own dark overlay and reads no page tokens. */
(function (root) {
  "use strict";

  var CSS =
    ".lbx{position:fixed;inset:0;z-index:200;display:grid;place-items:center}" +
    ".lbx__scrim{position:absolute;inset:0;background:rgba(8,9,11,.9);animation:lbxFade .22s ease}" +
    ".lbx__track{position:relative;width:100%;height:100%;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none}" +
    ".lbx__track::-webkit-scrollbar{display:none}" +
    ".lbx__slide{flex:0 0 100%;scroll-snap-align:center;display:grid;place-items:center;padding:72px 16px 56px}" +
    ".lbx__slide{height:100%;box-sizing:border-box}" +   /* padding inside the height, or the track scrolls */
    /* capped by the viewport, not the slide, so a tall photo never needs a scroll */
    ".lbx__slide img{max-width:min(94vw,1400px);max-height:calc(100vh - 128px);max-height:calc(100svh - 128px);width:auto;height:auto;object-fit:contain;border-radius:24px;animation:lbxPop .26s cubic-bezier(.16,1,.3,1)}" +
    ".lbx__x,.lbx__go{position:absolute;z-index:2;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;transition:background .14s ease}" +
    ".lbx__x:hover,.lbx__go:hover{background:rgba(255,255,255,.24)}" +
    ".lbx__x{top:16px;right:16px}" +
    ".lbx__go{top:50%;transform:translateY(-50%);display:none}" +
    ".lbx__go--prev{left:16px}.lbx__go--next{right:16px}" +
    ".lbx__x svg,.lbx__go svg{width:20px;height:20px}" +
    ".lbx__count{position:absolute;z-index:2;bottom:18px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.72);font:600 13px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14px}" +
    "@media (min-width:720px){.lbx__go{display:grid}}" +
    "@keyframes lbxFade{from{opacity:0}}@keyframes lbxPop{from{opacity:0;transform:scale(.96)}}" +
    "[data-lbx]{cursor:pointer}" +
    "@media (prefers-reduced-motion:reduce){.lbx__scrim,.lbx__slide img{animation:none}}";

  var ICON = {
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>'
  };

  function injectCss() {
    if (document.getElementById("lbxCss")) return;
    var s = document.createElement("style");
    s.id = "lbxCss";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function bind(box, sel) {
    if (!box) return;
    injectCss();
    var imgs = [].slice.call(box.querySelectorAll(sel || "img"));
    if (!imgs.length) return;

    imgs.forEach(function (img, i) {
      if (img.hasAttribute("data-lbx")) return;
      img.setAttribute("data-lbx", "");
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); open(imgs, i); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(imgs, i); }
      });
    });
  }

  function open(imgs, start) {
    var many = imgs.length > 1;
    var el = document.createElement("div");
    el.className = "lbx";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Photos");
    el.innerHTML =
      '<div class="lbx__scrim" data-close></div>' +
      '<div class="lbx__track"></div>' +
      '<button class="lbx__x" type="button" data-close aria-label="Close">' + ICON.x + "</button>" +
      (many
        ? '<button class="lbx__go lbx__go--prev" type="button" data-go="-1" aria-label="Previous photo">' + ICON.prev + "</button>" +
          '<button class="lbx__go lbx__go--next" type="button" data-go="1" aria-label="Next photo">' + ICON.next + "</button>" +
          '<span class="lbx__count"></span>'
        : "");

    var track = el.querySelector(".lbx__track");
    imgs.forEach(function (src) {
      var slide = document.createElement("div");
      slide.className = "lbx__slide";
      slide.setAttribute("data-close", "");
      var img = document.createElement("img");
      /* the full file, not whatever <picture> source a small screen chose */
      img.src = src.getAttribute("data-full") || src.currentSrc || src.src;
      img.alt = src.alt || "";
      slide.appendChild(img);
      track.appendChild(slide);
    });

    /* The showing slide is held here, not read back off scrollLeft: with
       smooth scrolling, two quick presses of → used to read a position
       mid-animation and land on the same photo or skip one. Fixed
       2026-09-29, same as the dashboard's copy. */
    var idx = start;
    function clamp(n) { return Math.max(0, Math.min(imgs.length - 1, n)); }
    function at() { return idx; }
    function go(n) {
      idx = clamp(n);
      track.scrollTo({ left: idx * track.clientWidth, behavior: "smooth" });
      count();
    }
    function count() {
      var c = el.querySelector(".lbx__count");
      if (c) c.textContent = (idx + 1) + " / " + imgs.length;
    }
    function close() {
      var i = at();
      el.remove();
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", key);
      if (imgs[i] && imgs[i].focus) imgs[i].focus({ preventScroll: true });
    }
    function key(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
      else if (e.key === "ArrowLeft")  { e.preventDefault(); go(idx - 1); }
    }

    el.addEventListener("click", function (e) {
      var g = e.target.closest("[data-go]");
      if (g) { go(idx + Number(g.getAttribute("data-go"))); return; }
      /* a click on the photo itself does nothing; anywhere else closes —
         the scrim, the padding around it, all of it. It said that already
         but only honoured [data-close]; fixed 2026-09-29. */
      if (e.target.tagName !== "IMG") { close(); }
    });
    /* a swipe moves it too — read that back once the track settles */
    var settle;
    function sync() {
      if (!track.clientWidth) return;
      idx = clamp(Math.round(track.scrollLeft / track.clientWidth));
      count();
    }
    track.addEventListener("scroll", function () {
      clearTimeout(settle);
      settle = setTimeout(sync, 90);
    }, { passive: true });
    track.addEventListener("scrollend", sync);

    document.body.appendChild(el);
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", key);
    track.scrollLeft = start * track.clientWidth;
    count();
    el.querySelector(".lbx__x").focus();
  }

  function auto() {
    [].forEach.call(document.querySelectorAll("[data-lightbox]"), function (g) { bind(g, "img"); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto);
  else auto();

  root.Lightbox = { bind: bind, open: open };
})(window);
