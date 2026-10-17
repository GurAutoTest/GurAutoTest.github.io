/* ==========================================================================
   CODEMARCA — THE PAGE, FULL SCREEN
   Shared by My QR and Home (Garry, 2026-10-10). Two things:

     CM.pageDevice(iframe, url, opt)  the iPhone / browser-window frame
                                      around one iframe (My QR's card)
     CM.openPage({ src, url, profile, onClose })
                                      the page full screen — on a phone the
                                      mobile page edge to edge with a dock
                                      (Theme · ×); from 600px a slim top bar
                                      (× Close preview · Mobile | Web · Theme),
                                      Web at full size, Mobile in its frame.

   A theme picked in there is only a try until the person says yes; yes
   writes profile.theme. The onboarding and profile-tab previews do the same
   thing with their own live frames.
   ========================================================================== */

(function () {
  "use strict";

  var FULL_IC = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 7.5v-4h4M16.5 7.5v-4h-4M3.5 12.5v4h4M16.5 12.5v4h-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ── the two devices, around one iframe ─────────────────────────── */
  function smallScreen() { return !window.matchMedia("(min-width:600px)").matches; }
  function device(iframe, urlText, opt) {
    opt = opt || {};
    var el = document.createElement("div");
    el.className = "dv";
    el.innerHTML =
      '<div class="dv__lid">' +
        '<div class="dv__scr"><span class="dv__island"></span>' +
          '<div class="dv__bar"><i></i><i></i><i></i>' +
            '<button class="dv__url" type="button" aria-label="Copy page link"><span class="dv__u"></span>' +
            '<span class="dv__ok" aria-hidden="true">Copied \u2713</span></button>' +
            /* ⤢ — Web only: open the page full size (Garry, 2026-10-10) */
            (opt.onFull ? '<button class="dv__full" type="button" aria-label="Open full screen">' + FULL_IC + "</button>" : "") +
            "</div>" +
          '<div class="dv__view"></div></div></div>';
    /* the address in the bar copies on a tap, says so, and fades back */
    var url = el.querySelector(".dv__url"), t = null;
    url.querySelector(".dv__u").textContent = urlText;
    url.addEventListener("click", function () {
      if (navigator.clipboard) { navigator.clipboard.writeText("https://" + urlText).catch(function () {}); }
      url.dataset.copied = "true";
      clearTimeout(t);
      t = setTimeout(function () { url.dataset.copied = "false"; }, 1400);
    });
    var view = el.querySelector(".dv__view");
    view.appendChild(iframe);
    var kind = "phone";
    function fit() {
      if (!view.clientWidth) { return; }
      var vw = kind === "web" ? 1280 : 390;
      /* full screen, wherever the page fills the screen it is drawn at the
         screen's own width — real size, not a scaled copy */
      if (opt.full && (kind === "web" || smallScreen())) { vw = view.clientWidth; }
      var s = view.clientWidth / vw;
      iframe.style.width = vw + "px";
      iframe.style.height = Math.ceil(view.clientHeight / s) + "px";
      iframe.style.transform = "scale(" + s + ")";
    }
    if (opt.onFull) { el.querySelector(".dv__full").addEventListener("click", opt.onFull); }
    if (window.ResizeObserver) { new ResizeObserver(fit).observe(view); }
    window.addEventListener("resize", fit);
    return { el: el, fit: fit, set: function (k) { kind = k; el.dataset.dev = k; fit(); } };
  }

  /* ── Open: the full-screen preview, built the first time ─────────── */
  var full = null, P = null, CUR = {};
  function openPage(opts) {
    CUR = opts; P = opts.profile || null;
    var src = opts.src, urlText = opts.url;
    if (!full) {
      var o = document.createElement("div");
      o.className = "pvx";
      o.setAttribute("role", "dialog");
      o.setAttribute("aria-modal", "true");
      o.setAttribute("aria-label", "Your page, full screen");
      /* the page itself, full screen (Garry, 2026-10-10) — the same as
         onboarding: on a phone the mobile page edge to edge with a dock at
         the bottom; on a laptop a slim top bar, Web at full size and Mobile
         in its frame */
      o.innerHTML =
        '<div class="pvx__stage"></div>' +
        '<div class="pvx__ctl">' +
          '<button class="pvx__close" type="button" aria-label="Close preview">' + CM.icon("close") + "<span>Close preview</span></button>" +
          '<div class="pvx__devs" role="group" aria-label="Preview size">' +
            '<button type="button" data-d="phone" aria-pressed="true">Mobile</button>' +
            '<button type="button" data-d="web" aria-pressed="false">Web</button></div>' +
          /* the theme, as one line under the device; tap Change and the
             swatches open in a tray — same as the profile tab's preview
             (Garry, 2026-10-09). Only when there is a page to theme. */
          (P ? '<div class="pvx__themes" data-open="false">' +
            '<button class="pvx__tt" type="button" aria-expanded="false"><span class="pvx__th">Theme \u00b7 <b></b></span>' +
              '<span class="pvx__chg">Change</span></button>' +
            '<div class="pvx__tray">' +
              '<div class="pvx__tray-top"><span class="pvx__th">Theme \u00b7 <b></b></span>' +
                '<button class="pvx__tc" type="button" aria-label="Close themes">' + CM.icon("close") + "</button></div>" +
              '<div class="pvx__sws" role="group" aria-label="Page theme"></div>' +
              '<div class="pvx__subs" role="group" aria-label="Theme version"></div></div></div>' : "") +
        "</div>";
      document.body.appendChild(o);
      var f = document.createElement("iframe");
      f.title = "Your page, as a scan opens it";
      var d = device(f, urlText, { full: true });
      o.querySelector(".pvx__stage").appendChild(d.el);
      var setFull = function (k) {
        Array.prototype.forEach.call(o.querySelectorAll(".pvx__devs [data-d]"), function (x) {
          x.setAttribute("aria-pressed", String(x.dataset.d === k));
        });
        o.dataset.dev = k;
        d.set(k);
      };
      o.querySelector(".pvx__devs").addEventListener("click", function (e) {
        var b = e.target.closest("[data-d]"); if (b) { setFull(b.dataset.d); }
      });
      var thm = P ? themes(o, f) : null;
      function close() {
        /* a theme tried in here is only a try until they say so */
        if (thm) { thm.settle(shut); } else { shut(); }
      }
      function shut() {
        o.dataset.open = "false"; document.body.style.overflow = "";
        if (CUR.onClose) { CUR.onClose(); }
      }
      o.querySelector(".pvx__close").addEventListener("click", close);
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && o.dataset.open === "true") { close(); } });
      full = { el: o, frame: f, dev: d, set: setFull };
    }
    /* a phone shows the phone page; a laptop opens on Web */
    full.set(smallScreen() ? "phone" : "web");
    if (full.frame.getAttribute("src") !== src) { full.frame.src = src; }
    full.el.dataset.open = "true";
    document.body.style.overflow = "hidden";
    requestAnimationFrame(full.dev.fit);
  }

  /* ── Theme, inside Open ────────────────────────────────────────────
     The same six tiles and versions as the profile tab's Theme card, in the
     same order (final 2026-10-06). Picking one re-points the frame, and the
     small preview card on this screen follows when Open closes. */
  var THEMES = [
    { t:"light", n:"Light" }, { t:"glass-bronze", n:"Bronze glass" }, { t:"leaf", n:"Leaf" },
    { t:"glass-copper", n:"Copper glass" }, { t:"soft", n:"Soft" }, { t:"photo", n:"Photo" }
  ];
  var SUBS = {
    leaf:  { label:"Colour", list:[
      { t:"leaf", n:"Green", c:"#A3BF5A" }, { t:"leaf-blue", n:"Blue", c:"#0062FE" },
      { t:"leaf-orange", n:"Orange", c:"#F45C30" }, { t:"leaf-violet", n:"Violet", c:"#6741FF" } ] },
    light: { label:"Mode", list:[ { t:"light", n:"Light", c:"#F2F2F7" }, { t:"light-dark", n:"Dark", c:"#000000" } ] },
    soft:  { label:"Mode", list:[ { t:"soft", n:"Light", c:"#E8E7E5" }, { t:"soft-dark", n:"Dark", c:"#1E1E1C" } ] },
    photo: { label:"Mode", list:[ { t:"photo", n:"Light", c:"#C4CBD4" }, { t:"photo-dark", n:"Dark", c:"#191C22" } ] }
  };
  function withTheme(u, t) {
    return /[?&]theme=/.test(u) ? u.replace(/([?&]theme=)[^&]*/, "$1" + encodeURIComponent(t))
                                : u + "&theme=" + encodeURIComponent(t);
  }
  function themeBase(t) { var m = /^(light|leaf|soft|photo)/.exec(t || ""); return m ? m[1] : t; }
  function themes(o, f) {
    var box = o.querySelector(".pvx__themes"), sws = o.querySelector(".pvx__sws"), subs = o.querySelector(".pvx__subs");
    var cur = (P.theme || "light").toLowerCase(), lastSub = {}, asking = false;
    sws.innerHTML = THEMES.map(function (x) {
      return '<button class="pvx__sw" type="button" data-theme="' + x.t + '" title="' + x.n + '" aria-label="' + x.n + ' theme">' +
             '<span class="theme__sw" data-t="' + x.t + '"></span><i aria-hidden="true">' + CM.icon("check") + "</i></button>";
    }).join("");
    function tray(open) {
      box.dataset.open = String(open);
      box.querySelector(".pvx__tt").setAttribute("aria-expanded", String(open));
    }
    function nameOf(t) {
      var base = themeBase(t), n = t, v = SUBS[base] && SUBS[base].list.filter(function (x) { return x.t === t; })[0];
      THEMES.forEach(function (x) { if (x.t === base) { n = x.n; } });
      return n + (v && v.n !== n ? " \u00b7 " + v.n : "");
    }
    function paint() {
      var base = themeBase(cur), s = SUBS[base], on = null, ver = null;
      THEMES.forEach(function (x) { if (x.t === base) { on = x; } });
      Array.prototype.forEach.call(sws.children, function (b) { b.setAttribute("aria-pressed", String(b.dataset.theme === base)); });
      subs.dataset.on = s ? "true" : "false";
      subs.innerHTML = s ? "<span>" + s.label + "</span>" + s.list.map(function (x) {
        if (x.t === cur) { ver = x; }
        return '<button type="button" data-theme="' + x.t + '" aria-label="' + x.n + '" title="' + x.n +
               '" aria-pressed="' + (x.t === cur) + '" style="--dot:' + x.c + '"></button>';
      }).join("") : "";
      Array.prototype.forEach.call(o.querySelectorAll(".pvx__th b"), function (b) {
        b.textContent = nameOf(cur);
      });
    }
    function pick(t, exact) {
      var base = themeBase(t);
      /* a tile keeps whichever version was picked last; a dot names it exactly */
      if (SUBS[base] && !exact) { t = themeBase(cur) === base ? cur : (lastSub[base] || base); }
      if (SUBS[base]) { lastSub[base] = t; }
      if (t === cur) { return; }
      show(t);
    }
    function show(t) {
      cur = t;
      paint();
      f.src = withTheme(f.getAttribute("src"), t);
    }
    /* Picking only previews (Garry, 2026-10-09). Folding the tray or
       closing the preview with a different theme showing asks first —
       yes keeps it, no puts the page back. Esc / tapping outside the
       question just leaves them where they were. */
    function settle(done) {
      var saved = (P.theme || "light").toLowerCase();
      if (cur === saved) { done(); return; }
      if (asking) { return; }
      asking = true;
      CM.dialog({
        title: "Switch your page to " + nameOf(cur) + "?",
        body: "It\u2019s on " + nameOf(saved) + " right now. Switching changes it for everyone who scans your code.",
        actions: [
          { id: "yes", label: "Yes, switch", kind: "go" },
          { id: "no",  label: "Keep " + nameOf(saved), kind: "quiet" }
        ],
        onPick: function (id) {
          asking = false;
          if (!id) { return; }
          if (id === "yes") { P.theme = cur; CM.toast("Theme updated"); }
          else { show(saved); }
          done();
        }
      });
    }
    box.querySelector(".pvx__tt").addEventListener("click", function () { tray(true); });
    box.querySelector(".pvx__tc").addEventListener("click", function () { settle(function () { tray(false); }); });
    sws.addEventListener("click", function (e) { var b = e.target.closest(".pvx__sw"); if (b) { pick(b.dataset.theme); } });
    subs.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { pick(b.dataset.theme, true); } });
    paint();
    return { settle: function (done) { settle(function () { tray(false); done(); }); } };
  }


  CM.pageDevice = device;
  CM.openPage = openPage;
  CM.withTheme = withTheme;
})();
