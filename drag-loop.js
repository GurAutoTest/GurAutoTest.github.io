/* ==========================================================================
   CODEMARCA — DRAG LOOP (Garry, 2026-10-19)
   Turns a row that loops on its own into one people can also move:
     · it keeps drifting by itself (speed px/s, dir 1 = right, -1 = left)
     · mouse or pen: grab and drag left / right; let go and a flick glides
     · phone: slide it with a thumb; up/down still scrolls the page
     · press and hold (mouse or thumb) stops it where it is
     · trackpad: a two-finger sideways swipe moves it
   A drag never counts as a click (so the lightbox does not open).

   Markup: the row's children must be drawn TWICE, back to back, so the
   seam is invisible — same as the old CSS `translateX(-50%)` loop.

       DragLoop(rowEl, { speed: 40, dir: -1 })

   Wires every photo river (.river__row) on the page by itself — homepage,
   how-it-works.html and about.html.
   ========================================================================== */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.DragLoop = function (row, o) {
    o = o || {};
    var speed = reduce ? 0 : (o.speed || 40), dir = o.dir || -1;
    var hit = o.hit || row;                 /* the element that takes the pointer */
    var x = 0, v = 0, setW = 1, holdTill = 0, seen = true;
    var drag = null, moved = false;

    row.style.animation = "none";
    hit.style.touchAction = "pan-y";
    hit.style.cursor = "grab";
    hit.style.userSelect = "none";

    function measure() { setW = row.scrollWidth / 2 || 1; }
    function wrap() { x = ((x % setW) + setW) % setW; }
    function paint() { row.style.transform = "translate3d(" + (-x) + "px,0,0)"; }

    hit.addEventListener("dragstart", function (e) { e.preventDefault(); });
    hit.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) { return; }
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x0: x, lx: e.clientX, lt: performance.now(), on: false };
      v = 0; moved = false;
    });
    hit.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) { return; }
      var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.on) {
        if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
        if (Math.abs(dx) < 6) { return; }
        drag.on = true; moved = true; hit.style.cursor = "grabbing";
        try { hit.setPointerCapture(e.pointerId); } catch (err) {}
      }
      var now = performance.now();
      v = -(e.clientX - drag.lx) / Math.max(.008, (now - drag.lt) / 1000);
      drag.lx = e.clientX; drag.lt = now;
      x = drag.x0 - dx; wrap(); paint();
    });
    function end() {
      if (!drag) { return; }
      if (!drag.on) { v = 0; }
      v = Math.max(-2600, Math.min(2600, v));
      drag = null; hit.style.cursor = "grab";
      holdTill = performance.now() + 1200;
    }
    hit.addEventListener("pointerup", end);
    hit.addEventListener("pointercancel", end);
    hit.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
    hit.addEventListener("wheel", function (e) {
      var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (!dx) { return; }
      e.preventDefault();
      v = 0; x += dx * (e.deltaMode === 1 ? 16 : 1); wrap(); paint();
      holdTill = performance.now() + 1200;
    }, { passive: false });

    /* rest while the row is off screen */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }, { rootMargin: "120px" }).observe(hit.parentNode || hit);
    }
    window.addEventListener("resize", function () { measure(); wrap(); paint(); });
    row.querySelectorAll("img").forEach(function (im) { im.addEventListener("load", measure); });

    var last = performance.now();
    function tick(now) {
      var dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!drag) {
        if (Math.abs(v) > 4) { x += v * dt; v *= Math.pow(.04, dt); }
        else { v = 0; if (seen && !document.hidden && now > holdTill) { x -= dir * speed * dt; } }
        wrap(); paint();
      }
      requestAnimationFrame(tick);
    }
    measure();
    /* a row running right starts half-way through, so it never shows a gap */
    if (dir > 0) { x = setW / 2; }
    paint();
    requestAnimationFrame(tick);
  };

  /* "Seen in the wild" — the photo river on the homepage, How it works and
     About: the same two rows everywhere, the top one drifting left, the
     back one right (Garry, 2026-10-19) */
  function rivers() {
    document.querySelectorAll(".river__row").forEach(function (row) {
      var back = row.classList.contains("river__row--back");
      window.DragLoop(row, { speed: back ? 26 : 30, dir: back ? 1 : -1 });
    });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", rivers); } else { rivers(); }
})();
