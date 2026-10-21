/* ==========================================================================
   CODEMARCA — HOMEPAGE THEME REEL (Garry, 2026-10-19). Styles: theme-reel.css
   One strip, drawn twice back to back so it loops without a seam.
     · autoplay — drifts left on its own; pauses while the pointer is on it,
       while a card has focus, and while the section is off screen
     · drag — mouse, pen or finger; a flick keeps gliding and slows down
     · trackpad — a two-finger sideways swipe moves it (vertical scrolling
       of the page is left alone)
     · hover a card — its page scrolls down so the whole design shows, and
       "Use this theme" rises; on a phone a tap on the card does the same
   Each card links to sign-up with ?theme=<id>; sign-up hands it to
   onboarding, which opens on that theme.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.querySelector("[data-reel]");
  if (!root) { return; }

  /* the twelve looks, in picker order. bg = the card around the phone,
     page = the page's own ground (shows while the shot loads) */
  var T = [
    { id: "light",        n: "Light",        s: "Small business",    img: "light",       bg: "#DCE8FB", ink: "#14213D", page: "#FFFFFF" },
    { id: "light-dark",   n: "Light · Dark", s: "Property advisor",  img: "light-dark",  bg: "#2A2C33", ink: "#FFFFFF", page: "#000000" },
    { id: "glass-bronze", n: "Bronze glass", s: "Doctor",            img: "bronze",      bg: "#E9CFB4", ink: "#3D2512", page: "#2B1A10" },
    { id: "leaf",         n: "Leaf · Green", s: "Home baker",        img: "leaf-green",  bg: "#F6E7A8", ink: "#3A3510", page: "#9BC53D" },
    { id: "leaf-blue",    n: "Leaf · Blue",  s: "Trek leader",       img: "leaf-blue",   bg: "#FFD9C7", ink: "#4A1F0E", page: "#2F6BFF" },
    { id: "leaf-orange",  n: "Leaf · Orange",s: "Singer",            img: "leaf-orange", bg: "#1F1F22", ink: "#FFFFFF", page: "#FF6A2B" },
    { id: "leaf-violet",  n: "Leaf · Violet",s: "Makeup artist",     img: "leaf-violet", bg: "#F3C7DA", ink: "#4B1230", page: "#7A3DFF" },
    { id: "glass-copper", n: "Copper glass", s: "Designer",          img: "copper",      bg: "#D7A47E", ink: "#2E160A", page: "#1E1410" },
    { id: "soft",         n: "Soft",         s: "Yoga teacher",      img: "soft",        bg: "#CFE3D6", ink: "#123323", page: "#E8E7E5" },
    { id: "soft-dark",    n: "Soft · Dark",  s: "Chartered accountant", img: "soft-dark", bg: "#E4DDF7", ink: "#271B4D", page: "#1E1E1C" },
    { id: "photo",        n: "Photo",        s: "Photographer",      img: "photo",       bg: "#F4B9A6", ink: "#4A1A0D", page: "#C4CBD4" },
    { id: "photo-dark",   n: "Photo · Dark", s: "Illustrator",       img: "photo-dark",  bg: "#E3A72F", ink: "#2C1B00", page: "#191C22" }
  ];
  var ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6"/></svg>';

  function card(t, clone) {
    return '<article class="tcard"' + (clone ? ' aria-hidden="true"' : "") +
      ' style="--tc-bg:' + t.bg + "; --tc-ink:" + t.ink + "; --tc-page:" + t.page + '">' +
      '<p class="tcard__label">' + t.n + "<small>" + t.s + "</small></p>" +
      '<div class="tcard__win"><img src="assets/themes/reel/codemarca-theme-' + t.img + '.jpg" alt="' +
        (clone ? "" : "A Codemarca page in the " + t.n + " theme") + '" width="600" loading="lazy" draggable="false"></div>' +
      '<a class="tcard__go" href="signup.html?theme=' + t.id + '"' + (clone ? ' tabindex="-1"' : "") + ">Use this theme" + ARROW + "</a>" +
    "</article>";
  }

  var track = root.querySelector(".reel__track");
  track.innerHTML = T.map(function (t) { return card(t, false); }).join("") +
                    T.map(function (t) { return card(t, true); }).join("");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SPEED = reduce ? 0 : 38;          /* px per second */
  var x = 0, v = 0, setW = 1;
  var hover = false, focus = false, seen = true, holdUntil = 0;
  var drag = null, moved = false;

  function measure() {
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    setW = track.scrollWidth / 2 + gap / 2;
  }
  function wrap() { x = ((x % setW) + setW) % setW; }
  var bar = document.querySelector("[data-reel-bar]");
  var bits = bar ? bar.querySelectorAll("i") : [];
  function paint() {
    track.style.transform = "translate3d(" + (-x) + "px,0,0)";
    if (!bar) { return; }
    /* thumb = the part of one round of cards that is on screen; it wraps
       round the end of the bar the way the strip wraps round its end */
    var T = bar.clientWidth, w = Math.max(18, Math.min(T, T * root.clientWidth / setW));
    var l = T * (x / setW), r = l + w;
    bits[0].style.left = l + "px"; bits[0].style.width = (Math.min(r, T) - l) + "px";
    bits[1].style.left = "0px";    bits[1].style.width = Math.max(0, r - T) + "px";
  }

  var last = performance.now();
  function tick(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!drag) {
      if (Math.abs(v) > 4) { x += v * dt; v *= Math.pow(0.04, dt); }       /* glide after a flick */
      else {
        v = 0;
        if (seen && !hover && !focus && now > holdUntil && !document.hidden) { x += SPEED * dt; }
      }
      wrap(); paint();
    }
    requestAnimationFrame(tick);
  }

  /* — drag: mouse, pen, finger — */
  root.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) { return; }
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x0: x, lx: e.clientX, lt: performance.now(), on: false };
    moved = false; v = 0;
  });
  root.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) { return; }
    var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.on) {
      /* a finger moving mostly up/down is scrolling the page — let it go */
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      if (Math.abs(dx) < 6) { return; }
      drag.on = true; moved = true;
      root.classList.add("is-drag");
      try { root.setPointerCapture(e.pointerId); } catch (err) {}
      unpeekAll();
    }
    var now = performance.now();
    v = -(e.clientX - drag.lx) / Math.max(0.008, (now - drag.lt) / 1000);
    drag.lx = e.clientX; drag.lt = now;
    x = drag.x0 - dx; wrap(); paint();
  });
  function endDrag() {
    if (!drag) { return; }
    if (!drag.on) { v = 0; }
    v = Math.max(-2600, Math.min(2600, v));
    drag = null;
    root.classList.remove("is-drag");
    holdUntil = performance.now() + 1500;
  }
  root.addEventListener("pointerup", endDrag);
  root.addEventListener("pointercancel", endDrag);
  /* a drag is not a click on the card's link */
  root.addEventListener("click", function (e) {
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);

  /* — two-finger trackpad swipe (and shift + wheel) — */
  root.addEventListener("wheel", function (e) {
    var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (!dx) { return; }
    e.preventDefault();
    v = 0; x += dx * (e.deltaMode === 1 ? 16 : 1); wrap(); paint();
    holdUntil = performance.now() + 1200;
  }, { passive: false });

  /* — pause while pointed at or focused — */
  root.addEventListener("mouseenter", function () { hover = true; });
  root.addEventListener("mouseleave", function () { hover = false; unpeekAll(); });
  root.addEventListener("focusin", function (e) { focus = true; var c = e.target.closest(".tcard"); if (c) { peek(c, true); bringIntoView(c); } });
  root.addEventListener("focusout", function (e) { focus = false; var c = e.target.closest(".tcard"); if (c) { peek(c, false); } });

  /* — the page inside a card scrolls to its end, then back — */
  function peek(c, on) {
    if (on) {
      var img = c.querySelector("img"), win = c.querySelector(".tcard__win");
      var dy = Math.max(0, img.offsetHeight - win.clientHeight);
      c.style.setProperty("--dy", dy + "px");
      c.style.setProperty("--down", reduce ? "0s" : Math.max(1.6, dy / 260).toFixed(2) + "s");
      c.style.setProperty("--back", reduce ? "0s" : Math.max(.6, dy / 900).toFixed(2) + "s");
    }
    c.classList.toggle("is-peek", on);
  }
  function unpeekAll() { root.querySelectorAll(".tcard.is-peek").forEach(function (c) { peek(c, false); }); }
  var canHover = window.matchMedia("(hover:hover)").matches;
  root.addEventListener("mouseover", function (e) {
    if (!canHover || (drag && drag.on)) { return; }
    var c = e.target.closest(".tcard"); if (!c || c.classList.contains("is-peek")) { return; }
    unpeekAll(); peek(c, true);
  });
  root.addEventListener("mouseout", function (e) {
    var c = e.target.closest(".tcard"); if (!c || c.contains(e.relatedTarget)) { return; }
    peek(c, false);
  });
  /* phones: a tap on the card (not the pill) plays the scroll and holds the strip */
  root.addEventListener("click", function (e) {
    if (canHover || e.target.closest(".tcard__go")) { return; }
    var c = e.target.closest(".tcard"); if (!c) { return; }
    var on = !c.classList.contains("is-peek");
    unpeekAll(); peek(c, on);
    holdUntil = performance.now() + (on ? 7000 : 800);
  });
  /* keyboard: tabbing to a pill slides its card fully into view */
  function bringIntoView(c) {
    var r = c.getBoundingClientRect(), R = root.getBoundingClientRect();
    if (r.left < R.left + 24) { x -= (R.left + 24 - r.left); }
    else if (r.right > R.right - 24) { x += (r.right - (R.right - 24)); }
    wrap(); paint();
  }

  /* — the bar: grab the thumb or click anywhere on it to jump — */
  if (bar) {
    var bdrag = null;
    function barTo(e) {
      var R = bar.getBoundingClientRect(), T = R.width;
      var w = Math.max(18, Math.min(T, T * root.clientWidth / setW));
      x = ((e.clientX - R.left - w / 2) / T) * setW; v = 0; wrap(); paint();
      holdUntil = performance.now() + 1500;
    }
    bar.addEventListener("pointerdown", function (e) {
      bdrag = e.pointerId; bar.classList.add("is-grab");
      try { bar.setPointerCapture(e.pointerId); } catch (err) {}
      barTo(e);
    });
    bar.addEventListener("pointermove", function (e) { if (bdrag === e.pointerId) { barTo(e); } });
    function bend() { bdrag = null; bar.classList.remove("is-grab"); holdUntil = performance.now() + 1500; }
    bar.addEventListener("pointerup", bend);
    bar.addEventListener("pointercancel", bend);
  }

  /* — only run while the section is on screen — */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }, { rootMargin: "120px" }).observe(root);
  }
  window.addEventListener("resize", function () { measure(); wrap(); paint(); });
  track.querySelectorAll("img").forEach(function (im) { im.addEventListener("load", measure); });
  measure();
  requestAnimationFrame(tick);
})();
