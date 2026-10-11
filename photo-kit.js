/* ==========================================================================
   CODEMARCA — PHOTO KIT
   The profile photo's extras, shared by every screen that edits a page
   (Garry, 2026-10-08 — the dashboard's Profile tab had missed what
   onboarding got on 10-07):

     · faces & zodiac — Netflix-style picks for anyone without a photo:
       six expressions and six people, twelve like the zodiac row.
       A pick is saved as a PNG: profile.html reads an SVG photo as "no
       photo". On a themed ground (Leaf's colour, the glass themes' smoked
       disc) the features turn white, the zodiac way.
     · crop — every upload passes a LinkedIn-style dialog: drag, zoom
       (slider, wheel, pinch), the circle is what is saved, 512px JPEG.

   PhotoKit.mount(opts) wires one editor:
     disc, btn, clear, input   the photo row's own elements
     after                     the faces block is inserted after this node
     get()                     → { photo, face, theme }
     set(photo, face)          store a new photo (null clears)
     leaf                      [{ t, c }] — the Leaf colours, by theme id
     root                      path prefix to assets/ ("../../" in dashboard)
   It returns { theme() } — call it whenever the theme changes.
   ========================================================================== */
(function (window) {
  "use strict";

  var FACES = [
    { k:"happy", n:"Happy", svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#FFC93C"/><circle cx="36" cy="40" r="5" fill="#101215"/><circle cx="60" cy="40" r="5" fill="#101215"/><path d="M30 56Q48 74 66 56" fill="none" stroke="#101215" stroke-width="5" stroke-linecap="round"/></svg>' },
    { k:"cool", n:"Cool", svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#4D9DE0"/><path d="M20 35h24v9a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" fill="#101215"/><path d="M52 35h24v9a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" fill="#101215"/><path d="M44 38h8" stroke="#101215" stroke-width="4"/><path d="M38 66Q52 70 62 60" fill="none" stroke="#101215" stroke-width="5" stroke-linecap="round"/></svg>' },
    { k:"nerdy", n:"Nerdy", svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#A3BF5A"/><circle cx="35" cy="42" r="10" fill="#fff" stroke="#101215" stroke-width="4"/><circle cx="61" cy="42" r="10" fill="#fff" stroke="#101215" stroke-width="4"/><path d="M45 42h6" stroke="#101215" stroke-width="4"/><circle cx="36" cy="43" r="3.5" fill="#101215"/><circle cx="62" cy="43" r="3.5" fill="#101215"/><path d="M38 64Q48 71 58 64" fill="none" stroke="#101215" stroke-width="5" stroke-linecap="round"/></svg>' },
    { k:"cheeky", n:"Cheeky", svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#FF6B5B"/><circle cx="35" cy="40" r="5" fill="#101215"/><path d="M53 41Q60 34 67 41" fill="none" stroke="#101215" stroke-width="5" stroke-linecap="round"/><path d="M51 62Q51 75 58 75Q65 75 64 60" fill="#B8203F"/><path d="M30 56Q48 72 66 56" fill="none" stroke="#101215" stroke-width="5" stroke-linecap="round"/></svg>' },
    { k:"shy", n:"Shy", svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#F4A6C0"/><circle cx="36" cy="42" r="4.5" fill="#101215"/><circle cx="60" cy="42" r="4.5" fill="#101215"/><ellipse cx="27" cy="55" rx="7" ry="4" fill="#E0577F" opacity=".55"/><ellipse cx="69" cy="55" rx="7" ry="4" fill="#E0577F" opacity=".55"/><path d="M42 60Q48 65 54 60" fill="none" stroke="#101215" stroke-width="5" stroke-linecap="round"/></svg>' },
    { k:"star", n:"Star-struck", svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#101215"/><path d="M35.0 31.0 L37.4 36.8 L43.6 37.2 L38.8 41.2 L40.3 47.3 L35.0 44.0 L29.7 47.3 L31.2 41.2 L26.4 37.2 L32.6 36.8Z" fill="#FFC93C"/><path d="M61.0 31.0 L63.4 36.8 L69.6 37.2 L64.8 41.2 L66.3 47.3 L61.0 44.0 L55.7 47.3 L57.2 41.2 L52.4 37.2 L58.6 36.8Z" fill="#FFC93C"/><path d="M32 56h32Q64 76 48 76Q32 76 32 56z" fill="#FFF"/></svg>' }
  ];
  /* people — flat busts in the faces' palette (Garry, 2026-10-08). Only the
     ground rect changes per theme; skin, hair and clothes never do, so a
     person on Leaf or glass is still the same person. */
  function person(o) {
    var INK = "#101215", s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="' + o.bg + '"/>';
    if (o.hair === "long") s += '<path d="M27 46c-3-19 8-31 21-31s24 12 21 31l3 34H24z" fill="' + o.hc + '"/>';
    if (o.hair === "bob")  s += '<path d="M28 46c-3-18 8-29 20-29s23 11 20 29l1 17H27z" fill="' + o.hc + '"/>';
    if (o.hair === "bun")  s += '<circle cx="48" cy="17" r="9" fill="' + o.hc + '"/>';
    s += '<path d="M12 96c3-17 17-25 36-25s33 8 36 25z" fill="' + o.top + '"/>';
    if (o.hair === "long") s += '<path d="M30 60c-3 8-6 13-8 20h14zM66 60c3 8 6 13 8 20H60z" fill="' + o.hc + '"/>';
    s += '<rect x="41" y="56" width="14" height="17" rx="5" fill="' + o.shade + '"/>';
    s += '<ellipse cx="48" cy="42" rx="16" ry="19" fill="' + o.skin + '"/>';
    if (o.hair === "bun") s += '<path d="M31 41c0-13 7-21 17-21s17 8 17 21c-4-6-9-9-17-9s-13 3-17 9z" fill="' + o.hc + '"/>';
    else s += '<path d="M31 42c0-13 7-22 17-22s18 8 17 22c-6-2-12-7-15-13-4 7-11 11-19 13z" fill="' + o.hc + '"/>';
    s += '<circle cx="41" cy="43" r="2.2" fill="' + INK + '"/><circle cx="55" cy="43" r="2.2" fill="' + INK + '"/>';
    s += '<path d="M42 52q6 5 12 0" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>';
    return s + "</svg>";
  }
  /* men — after the reference Garry sent (2026-10-08): a clean head with
     ears, a full head of hair, and proper clothes — shirt and tie, a suit,
     or a beard and a tee. Calm, not cartoonish. */
  function man(o) {
    var INK = "#101215", s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="' + o.bg + '"/>';
    var body = "M13 96c2-15 14-23 35-23s33 8 35 23z";
    /* the figure is drawn at the reference's scale: big head, shoulders low */
    s += '<g transform="translate(48 104) scale(1.12) translate(-48 -100)">';
    if (o.wear === "suit") {
      s += '<path d="' + body + '" fill="' + o.jacket + '"/>' +
           '<path d="M39 73.5h18l-9 18z" fill="#FFFFFF"/>' +
           '<path d="M46 76h4l1 3-1.6 12h-2.8L45 79z" fill="' + o.tie + '"/>' +
           '<path d="M39 73.5l-5 3 10 19 2-6zM57 73.5l5 3-10 19-2-6z" fill="' + o.lapel + '"/>';
    } else if (o.wear === "tie") {
      s += '<path d="' + body + '" fill="#FFFFFF"/>' +
           '<path d="M46 77h4l1.2 3-1.8 14h-2.8L44.8 80z" fill="' + o.tie + '"/>' +
           '<path d="M38.5 72.5l7.5 5-4 6zM57.5 72.5l-7.5 5 4 6z" fill="#E3E6EC"/>';
    } else {
      s += '<path d="' + body + '" fill="' + o.tee + '"/>' +
           '<path d="M40 73.5c2 4 5 6 8 6s6-2 8-6" fill="none" stroke="' + o.teeEdge + '" stroke-width="2.4"/>';
    }
    s += '<rect x="41" y="55" width="14" height="20" rx="5" fill="' + o.shade + '"/>';
    s += '<ellipse cx="32" cy="44" rx="3" ry="4.6" fill="' + o.shade + '"/><ellipse cx="64" cy="44" rx="3" ry="4.6" fill="' + o.shade + '"/>';
    s += '<path d="M32.5 40c0-11 7-18.5 15.5-18.5S63.5 29 63.5 40v4.5c0 11.5-7 19.5-15.5 19.5S32.5 56 32.5 44.5z" fill="' + o.skin + '"/>';
    if (o.beard) s += '<path d="M32.5 42v2.5c0 11.5 7 19.5 15.5 19.5s15.5-8 15.5-19.5V42c-1.5 5-3.5 7.5-6 8.5-2-1.6-5.5-2.5-9.5-2.5s-7.5.9-9.5 2.5c-2.5-1-4.5-3.5-6-8.5z" fill="' + o.hc + '"/>' +
                    '<path d="M41.5 52.2c2-1.4 4.4-1.8 6.5-.9 2.1-.9 4.5-.5 6.5.9-2 1.1-4.4 1.4-6.5 1-2.1.4-4.5.1-6.5-1z" fill="' + o.hc + '"/>';
    /* hair: volume on top, swept to one side, short at the sides */
    s += '<path d="M32.5 42C31 30 34 21 41 17c3.5-4 10-5 15-3 6 1.5 9.5 7.5 8.5 15l-.2 12c-.8-6-2.8-10-6.8-12.5-5 2.2-13 2-18.5-1.3-3 3.5-5.3 8-6.5 14.8z" fill="' + o.hc + '"/>' +
         '<path d="M32.6 38.5v6.5h1.6v-5zM63.4 38.5v6.5h-1.6v-5z" fill="' + o.hc + '"/>' +
         /* the quiff: the front lifts and sweeps up to one side */
         '<path d="M40 19c3-6 11-9 18-7 4 1 6 3 7 6-4-2-9-2-13 0-4 1-8 1-12 1z" fill="' + o.hc + '"/>' +
         '<path d="M42 21c5-3 12-4 18-2" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.6" stroke-linecap="round"/>';
    s += '<circle cx="41.5" cy="43" r="2" fill="' + INK + '"/><circle cx="54.5" cy="43" r="2" fill="' + INK + '"/>';
    s += '<path d="M44 ' + (o.beard ? 55.5 : 53.5) + 'q4 2 8 0" fill="none" stroke="' + (o.beard ? "#fff" : INK) + '" stroke-opacity="' + (o.beard ? .8 : 1) + '" stroke-width="2" stroke-linecap="round"/>';
    return s + "</g></svg>";
  }
  var SKIN = { a:["#F1C7A6","#DDAA86"], b:["#E8B48F","#D49A74"], c:["#C98E66","#B07752"], d:["#8D5A3B","#764930"] };
  var PEOPLE = [
    { k:"p-tie",   n:"Shirt and tie", o:{ bg:"#4D9DE0", wear:"tie",  tie:"#E53935", skin:SKIN.a, hc:"#6B3E22" } },
    { k:"p-suit",  n:"Suit",          o:{ bg:"#2BB3A3", wear:"suit", jacket:"#1F2430", lapel:"#14181F", tie:"#2F6FE0", skin:SKIN.b, hc:"#3A2414" } },
    { k:"p-beard", n:"Beard",         o:{ bg:"#1FA97A", wear:"tee",  tee:"#5B4636", teeEdge:"#4A382B", skin:SKIN.c, hc:"#1E1A17", beard:true } },
    { k:"p-long",  n:"Long hair",     o:{ bg:"#F4A6C0", top:"#101215", skin:SKIN.a, hair:"long", hc:"#3B2416" } },
    { k:"p-bun",   n:"Bun",           o:{ bg:"#FF6B5B", top:"#F2F2EF", skin:SKIN.d, hair:"bun",  hc:"#1E1A17" } },
    { k:"p-bob",   n:"Bob",           o:{ bg:"#A3BF5A", top:"#2B3A55", skin:SKIN.b, hair:"bob",  hc:"#1E1A17" } }
  ];
  PEOPLE.forEach(function (p) {
    var o = p.o; o.shade = o.skin[1]; o.skin = o.skin[0];
    p.person = true; p.svg = o.wear ? man(o) : person(o);
  });
  /* six expressions first, then six people: twelve, the same as zodiac,
     so the tabs swap without the form below moving (Garry, 2026-10-08) */
  FACES = FACES.concat(PEOPLE);
  /* zodiac — coloured by element: fire warm, earth green, air sky, water teal */
  var ZODIAC = [
    { k:"z-aries", n:"Aries · Mar 21 – Apr 19", g:"\u2648", c:"#FF6B5B" },
    { k:"z-taurus", n:"Taurus · Apr 20 – May 20", g:"\u2649", c:"#7FA34A" },
    { k:"z-gemini", n:"Gemini · May 21 – Jun 20", g:"\u264A", c:"#4D9DE0" },
    { k:"z-cancer", n:"Cancer · Jun 21 – Jul 22", g:"\u264B", c:"#2BB3A3" },
    { k:"z-leo", n:"Leo · Jul 23 – Aug 22", g:"\u264C", c:"#FF9F43" },
    { k:"z-virgo", n:"Virgo · Aug 23 – Sep 22", g:"\u264D", c:"#A3BF5A" },
    { k:"z-libra", n:"Libra · Sep 23 – Oct 22", g:"\u264E", c:"#6FB7EA" },
    { k:"z-scorpio", n:"Scorpio · Oct 23 – Nov 21", g:"\u264F", c:"#1F7A8C" },
    { k:"z-sagittarius", n:"Sagittarius · Nov 22 – Dec 21", g:"\u2650", c:"#E8573F" },
    { k:"z-capricorn", n:"Capricorn · Dec 22 – Jan 19", g:"\u2651", c:"#5E7D3A" },
    { k:"z-aquarius", n:"Aquarius · Jan 20 – Feb 18", g:"\u2652", c:"#3F7FD0" },
    { k:"z-pisces", n:"Pisces · Feb 19 – Mar 20", g:"\u2653", c:"#3BA7B5" }
  ];
  ZODIAC.forEach(function (z) {
    z.svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="' + z.c + '"/>' +
      '<text x="48" y="50" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="50" ' +
      'font-family="Apple Symbols, Segoe UI Symbol, Noto Sans Symbols, DejaVu Sans, sans-serif">' + z.g + "\uFE0E</text></svg>";
  });
  var GROUND = { "glass-bronze":"rgba(0,0,0,.12)", "glass-copper":"rgba(0,0,0,.12)" };

  function faceURL(f, bg) {
    var svg = f.svg;
    if (bg) {
      svg = svg.replace(/(<rect width="96" height="96" fill=")[^"]+/, "$1" + bg);
      /* people keep their own colours — only their ground moves */
      if (!/^z-/.test(f.k) && !f.person) { svg = svg.replace(/"#fff"/g, '"' + bg + '"').replace(/#101215/g, "#fff"); }
    }
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }
  function byKey(k) { return FACES.concat(ZODIAC).filter(function (x) { return x.k === k; })[0]; }

  var CROP_HTML =
    '<div class="crop" role="dialog" aria-modal="true" aria-label="Adjust your photo" hidden>' +
      '<div class="crop__scrim"></div>' +
      '<div class="crop__panel">' +
        '<div class="crop__head"><span class="crop__t">Adjust your photo</span>' +
          '<button class="crop__x" type="button" aria-label="Cancel"><svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>' +
        '<div class="crop__stage"><img alt=""><span class="crop__ring"></span></div>' +
        '<div class="crop__zoom">' +
          '<svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.7"/><path d="M13 13l4 4M6.5 9h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
          '<input type="range" min="1" max="4" step="0.01" value="1" aria-label="Zoom">' +
          '<svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.7"/><path d="M13 13l4 4M6.5 9h5M9 6.5v5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
        '</div>' +
        '<p class="crop__hint">Drag to move. Zoom with the slider or by pinching.</p>' +
        '<div class="crop__acts"><button class="btn btn--ghost" type="button" data-crop-no>Cancel</button>' +
          '<button class="btn btn--go" type="button" data-crop-ok>Use photo</button></div>' +
      '</div>' +
    '</div>';

  /* one dialog per page, built the first time it is needed */
  var dlg = null, C = { img:null, x:0, y:0, z:1, base:1, F:0, done:null };
  function crop() {
    if (dlg) { return dlg; }
    document.body.insertAdjacentHTML("beforeend", CROP_HTML);
    dlg = document.body.lastElementChild;
    var st = dlg.querySelector(".crop__stage"), zoom = dlg.querySelector("input"), pts = {}, pinch = 0;
    function clamp() {
      var w = C.img.naturalWidth * C.base * C.z, h = C.img.naturalHeight * C.base * C.z;
      var mx = Math.max(0, (w - C.F * .84) / 2), my = Math.max(0, (h - C.F * .84) / 2);
      C.x = Math.min(mx, Math.max(-mx, C.x)); C.y = Math.min(my, Math.max(-my, C.y));
    }
    C.paint = function () {
      clamp();
      var sc = C.base * C.z;
      C.img.style.width = C.img.naturalWidth * sc + "px";
      C.img.style.height = C.img.naturalHeight * sc + "px";
      C.img.style.transform = "translate(-50%,-50%) translate(" + C.x + "px," + C.y + "px)";
      zoom.value = C.z;
    };
    function zoomTo(z) { C.z = Math.min(4, Math.max(1, z)); C.paint(); }
    function close() { dlg.hidden = true; if (C.done) { C.done(null); } C.done = null; }
    function save() {
      var cv = document.createElement("canvas"), N = 512; cv.width = cv.height = N;
      var sc = C.base * C.z, ring = C.F * .84;
      var left = C.F / 2 + C.x - C.img.naturalWidth * sc / 2, top = C.F / 2 + C.y - C.img.naturalHeight * sc / 2;
      var cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, N, N);
      cx.drawImage(C.img, (C.F * .08 - left) / sc, (C.F * .08 - top) / sc, ring / sc, ring / sc, 0, 0, N, N);
      var cb = C.done; C.done = null; dlg.hidden = true;
      if (cb) { cb(cv.toDataURL("image/jpeg", .9)); }
    }
    st.addEventListener("pointerdown", function (e) { st.setPointerCapture(e.pointerId); pts[e.pointerId] = { x:e.clientX, y:e.clientY }; });
    st.addEventListener("pointermove", function (e) {
      var p = pts[e.pointerId]; if (!p) { return; }
      var ids = Object.keys(pts);
      if (ids.length === 2) {
        p.x = e.clientX; p.y = e.clientY;
        var A = pts[ids[0]], B = pts[ids[1]], d = Math.hypot(A.x - B.x, A.y - B.y);
        if (pinch) { zoomTo(C.z * d / pinch); }
        pinch = d; return;
      }
      C.x += e.clientX - p.x; C.y += e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; C.paint();
    });
    function up(e) { delete pts[e.pointerId]; pinch = 0; }
    st.addEventListener("pointerup", up); st.addEventListener("pointercancel", up);
    st.addEventListener("wheel", function (e) { e.preventDefault(); zoomTo(C.z * (e.deltaY < 0 ? 1.06 : 1 / 1.06)); }, { passive:false });
    zoom.addEventListener("input", function () { zoomTo(Number(this.value)); });
    dlg.querySelector("[data-crop-ok]").addEventListener("click", save);
    dlg.querySelector("[data-crop-no]").addEventListener("click", close);
    dlg.querySelector(".crop__x").addEventListener("click", close);
    dlg.querySelector(".crop__scrim").addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !dlg.hidden) { close(); } });
    return dlg;
  }
  function openCrop(src, done) {
    var d = crop(), im = d.querySelector(".crop__stage img");
    C.done = done;
    im.onload = function () {
      d.hidden = false;
      C.img = im; C.F = d.querySelector(".crop__stage").clientWidth;
      C.base = (C.F * .84) / Math.min(im.naturalWidth, im.naturalHeight);
      C.x = 0; C.y = 0; C.z = 1; C.paint();
    };
    im.src = src;
  }

  function mount(o) {
    var set = "faces";
    o.after.insertAdjacentHTML("afterend",
      '<div class="faces">' +
        '<div class="faces__top"><span class="faces__lbl">No photo? Pick one</span>' +
          '<div class="faces__tabs" role="group" aria-label="Faces or zodiac">' +
            '<button type="button" data-set="faces" aria-pressed="true">Faces</button>' +
            '<button type="button" data-set="zodiac" aria-pressed="false">Zodiac</button></div></div>' +
        '<div class="faces__row" role="group" aria-label="Pick a face"></div>' +
      '</div>');
    var box = o.after.nextElementSibling, row = box.querySelector(".faces__row"), tabs = box.querySelector(".faces__tabs");

    function bg() {
      var t = o.get().theme || "";
      if (GROUND[t]) { return GROUND[t]; }
      var v = (o.leaf || []).filter(function (x) { return x.t === t; })[0];
      return v ? v.c : null;
    }
    function paintRow() {
      var cur = o.get().face;
      Array.prototype.forEach.call(tabs.children, function (b) { b.setAttribute("aria-pressed", String(b.dataset.set === set)); });
      row.dataset.set = set;
      row.innerHTML = (set === "zodiac" ? ZODIAC : FACES).map(function (f) {
        return '<button class="face-btn" type="button" data-face="' + f.k + '" aria-label="' + f.n + '" data-tip="' + f.n + '"' +
          ' aria-pressed="' + (cur === f.k) + '"><img src="' + faceURL(f) + '" alt=""></button>';
      }).join("");
    }
    function ground() {
      var t = o.get().theme || "";
      o.disc.dataset.ground = o.get().face && GROUND[t] ? t : "";
    }
    /* draw the picked face for the current theme and store it as a PNG */
    function paintFace() {
      var k = o.get().face; ground();
      if (!k) { return; }
      var f = byKey(k), im = new Image();
      im.onload = function () {
        if (o.get().face !== k) { return; }
        var cv = document.createElement("canvas"); cv.width = cv.height = 384;
        cv.getContext("2d").drawImage(im, 0, 0, 384, 384);
        o.set(cv.toDataURL("image/png"), k);
      };
      im.src = faceURL(f, bg());
    }

    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) { return; }
      set = b.dataset.set; paintRow();
    });
    row.addEventListener("click", function (e) {
      var b = e.target.closest(".face-btn"); if (!b) { return; }
      o.input.value = "";
      o.set(o.get().photo, b.dataset.face);   /* mark the pick at once … */
      paintRow(); paintFace();                 /* … the PNG follows */
    });
    o.input.addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) { return; }
      var r = new FileReader();
      r.onload = function () {
        openCrop(r.result, function (url) {
          o.input.value = "";
          if (!url) { return; }
          o.set(url, null); ground(); paintRow();
        });
      };
      r.readAsDataURL(f);
    });
    if (o.get().face && !byKey(o.get().face)) { o.set(o.get().photo, null); }   /* a face that was retired */
    paintRow(); ground();
    return { theme: paintFace, repaint: function () { paintRow(); ground(); } };
  }

  window.PhotoKit = { mount: mount, FACES: FACES, ZODIAC: ZODIAC, faceURL: faceURL, openCrop: openCrop };
})(window);
