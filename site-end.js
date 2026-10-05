/* CODEMARCA — SITE END (homepage, about, how-it-works, contact)
   Fills <div data-site-end></div> with the two bands every marketing page
   ends on: GET THE APP, then THE CLOSE ("Your name is probably still
   free"). One source, so the four pages cannot drift. Styles: site-end.css.

   APP_URL is a placeholder (Garry, 2026-09-30): one link that sends an
   iPhone to the App Store and anything else to Google Play. The developer
   builds that redirect; the store buttons use the same link until the
   real store URLs exist. The QR drawn here is a stand-in pattern, not a
   scannable code — swap it for a real QR of APP_URL. */
(function () {
  "use strict";

  var APP_URL = "https://codemarca.com/app";
  var host = document.querySelector("[data-site-end]");
  if (!host) return;

  /* stand-in QR, seeded so it is stable (same drawing as fun.js) */
  function qr(seed) {
    var n = 21, s = 0, i, x, y, cells = "";
    for (i = 0; i < seed.length; i++) { s = (s * 31 + seed.charCodeAt(i)) >>> 0; }
    function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
    function finder(fx, fy) {
      return '<path d="M' + fx + ' ' + fy + 'h7v7h-7z M' + (fx + 1) + ' ' + (fy + 1) + 'v5h5v-5z" fill-rule="evenodd"/>' +
             '<rect x="' + (fx + 2) + '" y="' + (fy + 2) + '" width="3" height="3"/>';
    }
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
      var inF = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (!inF && rnd() > 0.52) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    }
    return '<svg viewBox="0 0 21 21" shape-rendering="crispEdges" fill="#101215" aria-hidden="true">' +
      finder(0, 0) + finder(14, 0) + finder(0, 14) + cells + "</svg>";
  }

  var ICON = {
    apple: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.74 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.08 2.65-2.14.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.3-.88-2.33-3.5zM14.19 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.55 1.31-.56.65-1.05 1.68-.92 2.68.97.07 1.96-.49 2.57-1.23z"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.6 2.3c-.25.26-.4.67-.4 1.2v17c0 .53.15.94.4 1.2l.06.05 9.53-9.52v-.23L4.66 2.25zM17.36 15.4l-3.17-3.18v-.23l3.17-3.18.07.04 3.76 2.14c1.07.61 1.07 1.6 0 2.21l-3.76 2.14zM17.43 15.36 14.19 12.1 4.6 21.7c.36.38.94.42 1.6.05l11.23-6.39M17.43 8.85 6.2 2.46c-.66-.37-1.24-.33-1.6.05l9.59 9.59z"/></svg>',
    pen:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 3.5 16.5 6.5 7 16H4v-3z"/></svg>',
    qr:    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="12" y="3" width="5" height="5" rx="1"/><rect x="3" y="12" width="5" height="5" rx="1"/><path d="M12 12h2v2h-2zM15 15h2v2h-2z"/></svg>',
    box:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 6.5 10 3l7 3.5v7L10 17l-7-3.5z"/><path d="M3 6.5 10 10l7-3.5M10 10v7"/></svg>'
  };

  host.innerHTML =
    /* ── GET THE APP ── */
    /* a fold only on pages that are built of folds — contact scrolls plainly */
    '<section class="se-app' + (document.querySelector("main .fold") ? " fold" : "") + '" id="app" aria-labelledby="seAppH">' +
      '<div class="shell se-app__in">' +
        '<div class="se-app__copy">' +
          '<span class="se-kick">Get the app</span>' +
          '<h2 class="se-h" id="seAppH">Codemarca, <span>in your pocket.</span></h2>' +
          '<p class="se-lede">Everything you do on the website, one tap away on your phone.</p>' +
          '<ul class="se-feats">' +
            '<li><i>' + ICON.pen + '</i>Edit your page on the go</li>' +
            '<li><i>' + ICON.qr + '</i>Pull up your QR full screen in one tap</li>' +
            '<li><i>' + ICON.box + '</i>Track your stickers to your door</li>' +
          '</ul>' +
          '<div class="se-stores">' +
            '<a class="se-store" href="' + APP_URL + '" target="_blank" rel="noopener">' + ICON.apple +
              '<span><small>Download on the</small><b>App Store</b></span></a>' +
            '<a class="se-store" href="' + APP_URL + '" target="_blank" rel="noopener">' + ICON.play +
              '<span><small>Get it on</small><b>Google Play</b></span></a>' +
          '</div>' +
        '</div>' +
        '<div class="se-app__show">' +
          '<div class="se-phone" aria-hidden="true"><div class="se-phone__scr">' +
            '<div class="se-ui">' +
              '<div class="se-ui__top"><span><i></i>codemarca</span>' +
                '<span class="se-ui__bell"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 1.5h-13zM8.5 17.5a1.6 1.6 0 0 0 3 0"/></svg><b></b></span></div>' +
              '<p class="se-ui__hi">Hi Nancy \uD83D\uDC4B</p>' +
              '<div class="se-ui__card"><span class="se-ui__mini">' + qr("app-nancy") + '</span>' +
                '<span><b>Nancy Kaur</b><small>Page is live</small></span></div>' +
              '<div class="se-ui__btn">Show my QR</div>' +
              '<div class="se-ui__row">Edit my page<em></em></div>' +
              '<div class="se-ui__row">Orders<span>On the way</span></div>' +
            '</div>' +
            '<div class="se-ui__toast"><i>\uD83D\uDCE6</i>Your stickers are out for delivery \u2014 arriving today</div>' +
            '<div class="se-ui__full"><span class="se-ui__big">' + qr("app-nancy") + '</span>' +
              '<b>Nancy Kaur</b><small>codemarca.com/nancy</small><span>Scan to save my contact</span></div>' +
          '</div></div>' +
          '<div class="se-qr">' +
            '<div class="se-qr__code">' + qr("codemarca.com/app") + '</div>' +
            '<b>Scan to get the app</b>' +
            '<small>iPhone or Android</small>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    /* ── THE CLOSE ── */
    '<section class="se-close" aria-labelledby="seCloseH">' +
      '<div class="se-tags" aria-hidden="true">' +
        '<span class="se-tag" style="top:18%; left:6%; --r:-10deg">free page</span>' +
        '<span class="se-tag se-tag--live" style="top:62%; left:9%; --r:7deg; --d:.15s">1 code for life</span>' +
        '<span class="se-tag" style="top:22%; right:7%; --r:9deg; --d:.3s">first 100 free</span>' +
        '<span class="se-tag" style="top:64%; right:9%; --r:-6deg; --d:.45s">made in india</span>' +
      '</div>' +
      '<div class="shell se-close__in">' +
        '<h2 class="se-h" id="seCloseH">Your name is probably still free.</h2>' +
        '<p class="se-lede">Take it before someone else does. It costs nothing to find out.</p>' +
        '<form class="se-claim" autocomplete="off">' +
          '<div class="se-claim__field">' +
            '<span class="se-claim__pre">codemarca.com/</span>' +
            '<input class="se-claim__in" type="text" placeholder="yourname" spellcheck="false" maxlength="24" aria-label="Choose your Codemarca link">' +
            '<button class="se-claim__btn" type="submit">Claim profile</button>' +
          '</div>' +
          '<p class="se-claim__st" role="status" aria-live="polite"></p>' +
        '</form>' +
      '</div>' +
    '</section>';

  /* ── the claim field: same demo check as the homepage hero ─────────── */
  var RESERVED = ["admin", "codemarca", "hello", "support", "help", "api",
                  "about", "login", "signup", "app", "www", "shop", "blog"];
  var TAKEN = ["gurdeep", "garry", "nikk", "nancy", "amit", "gill"];
  var form = host.querySelector(".se-claim");
  var input = host.querySelector(".se-claim__in");
  var st = host.querySelector(".se-claim__st");
  var t = null;
  function say(state, html) { st.dataset.state = state; st.innerHTML = html; }
  input.addEventListener("input", function () {
    var clean = input.value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (clean !== input.value) input.value = clean;
    clearTimeout(t);
    if (!clean) { say("idle", ""); return; }
    if (clean.length < 3) { say("idle", "Keep going — 3 characters or more."); return; }
    say("idle", "Checking…");
    t = setTimeout(function () {
      if (RESERVED.indexOf(clean) > -1) say("bad", "<b>" + clean + "</b> is reserved. Try another.");
      else if (TAKEN.indexOf(clean) > -1) say("bad", "<b>" + clean + "</b> is taken — <b>" + clean + "01</b> and <b>the" + clean + "</b> are free.");
      else say("ok", "<b>codemarca.com/" + clean + "</b> is yours. Claim it.");
    }, 420);
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var clean = input.value.trim();
    if (clean.length < 3) { input.focus(); say("bad", "Pick a link with at least 3 characters."); return; }
    say("idle", "Opening signup…");
    location.href = "signup.html?next=build&handle=" + encodeURIComponent(clean);
  });

  /* ── the tags slap in when the close comes into view ─────────────── */
  var close = host.querySelector(".se-close");
  if (!("IntersectionObserver" in window)) { close.classList.add("in"); return; }
  var io = new IntersectionObserver(function (es) {
    if (es[0].isIntersecting) { close.classList.add("in"); io.disconnect(); }
  }, { threshold: 0.3 });
  io.observe(close);
})();
