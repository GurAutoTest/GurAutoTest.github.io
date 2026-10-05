/* CODEMARCA — FUN LAYER (about.html, how-it-works.html)
   Reveals, the rotating word, the typing link, stand-in QR squares, the
   size picker and the claim field. Everything degrades to static text. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ── reveals: .up .slap .chat .build .scan .hl get .in on sight ───── */
  var watch = all(".up, .slap, .chat, .build, .scan, .hl, [data-flip]");
  if (!("IntersectionObserver" in window) || reduce) {
    watch.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    /* what is already on screen at load plays at once — waiting on the
       observer left the hero blank for a beat */
    requestAnimationFrame(function () {
      watch.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add("in");
        else io.observe(el);
      });
    });
  }

  /* ── stand-in QR squares, seeded so each one is stable ───────────── */
  function qr(seed) {
    var n = 21, s = 0, i, cells = "";
    for (i = 0; i < seed.length; i++) { s = (s * 31 + seed.charCodeAt(i)) >>> 0; }
    function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
    function finder(x, y) {
      return '<path d="M' + x + ' ' + y + 'h7v7h-7z M' + (x + 1) + ' ' + (y + 1) + 'v5h5v-5z" fill-rule="evenodd"/>' +
             '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>';
    }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var inF = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (!inF && rnd() > 0.52) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    }
    return '<svg viewBox="0 0 21 21" shape-rendering="crispEdges" fill="#101215" aria-hidden="true">' +
      finder(0, 0) + finder(14, 0) + finder(0, 14) + cells + "</svg>";
  }
  all("[data-qr]").forEach(function (el) { el.innerHTML = qr(el.getAttribute("data-qr") || "codemarca"); });

  /* ── the rotating word ───────────────────────────────────────────── */
  all(".swap").forEach(function (sw) {
    var words = all("span", sw), i = 0;
    if (!words.length) return;
    words[0].setAttribute("data-on", "");
    if (reduce || words.length < 2) return;
    setInterval(function () {
      var cur = words[i];
      cur.removeAttribute("data-on"); cur.setAttribute("data-out", "");
      setTimeout(function () { cur.removeAttribute("data-out"); }, 450);
      i = (i + 1) % words.length;
      words[i].setAttribute("data-on", "");
    }, 1900);
  });

  /* ── the link typing itself, then the green tick ─────────────────── */
  all("[data-type]").forEach(function (box) {
    var out = box.querySelector(".type__txt");
    var names = box.getAttribute("data-type").split(",");
    if (reduce) { out.textContent = names[0]; box.setAttribute("data-ok", ""); return; }
    var n = 0;
    function word() {
      var w = names[n % names.length], k = 0;
      box.removeAttribute("data-ok");
      out.textContent = "";
      var t = setInterval(function () {
        out.textContent = w.slice(0, ++k);
        if (k >= w.length) {
          clearInterval(t);
          setTimeout(function () { box.setAttribute("data-ok", ""); }, 250);
          setTimeout(function () { n++; word(); }, 2200);
        }
      }, 110);
    }
    word();
  });

  /* ── the number on the card that changes itself ──────────────────── */
  all("[data-flip]").forEach(function (f) {
    if (reduce) { f.setAttribute("data-n", "1"); return; }
    var on = false;
    setInterval(function () { on = !on; f.setAttribute("data-n", on ? "1" : "0"); }, 2400);
  });

  /* ── the scan → found → page → update loop (homepage) ────────────────────── */
  all("[data-demo]").forEach(function (d) {
    var steps = [["scan", 1900], ["found", 1300], ["page", 1700], ["upd", 3200]], k = 0;
    if (reduce) { d.setAttribute("data-s", "upd"); return; }
    function next() {
      d.setAttribute("data-s", steps[k][0]);
      setTimeout(function () { k = (k + 1) % steps.length; next(); }, steps[k][1]);
    }
    next();
  });

  /* ── the size picker ─────────────────────────────────────────────── */
  var SIZES = {
    S:   { inch: 1.5, where: "Phone case, laptop, bottle, wallet, diary.", free: true },
    M:   { inch: 3,   where: "Backpack, helmet, suitcase, guitar case." },
    L:   { inch: 4,   where: "Car glass, bike, scooty, shop shutter.", free: true },
    XL:  { inch: 5,   where: "Shop counter, reception desk, stall board." },
    XXL: { inch: 6,   where: "Shop front, gate, the back of a food truck." }
  };
  all("[data-sizes]").forEach(function (box) {
    var stk = box.querySelector(".sizes__stk");
    var big = box.querySelector(".sizes__big");
    var where = box.querySelector(".sizes__where");
    var free = box.querySelector(".sizes__free");
    var btns = all("[data-size]", box);
    function pick(k) {
      var s = SIZES[k];
      stk.style.setProperty("--in", s.inch);
      big.textContent = s.inch + "″";
      where.textContent = s.where;
      free.hidden = !s.free;
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-size") === k)); });
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { pick(b.getAttribute("data-size")); }); });
    pick("L");
  });

  /* ── claim field → signup with the handle already in ─────────────── */
  all("[data-claim]").forEach(function (f) {
    var inp = f.querySelector("input");
    inp.addEventListener("input", function () {
      var v = inp.value.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 24);
      if (v !== inp.value) inp.value = v;
    });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = inp.value.trim();
      location.href = "signup.html" + (v ? "?handle=" + encodeURIComponent(v) : "");
    });
  });
})();
