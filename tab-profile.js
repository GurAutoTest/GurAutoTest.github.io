/* CODEMARCA — PROFILE TAB. Shared by every flow folder. */
(function () {
  "use strict";

  var a = CM.shell({ page: "profile", title: "Your page" });

  /* a mouse or a trackpad — not a finger */
  var FINE_POINTER = !window.matchMedia || window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ══ 1. STATE GATE ════════════════════════════════════════════════════
     Folders 1 and 3 ship the empty state ONLY — there is no editor in
     their profile.html, because nobody in those flows has a page. So the
     gate runs, the icons get painted, and the rest of this file, which is
     all editor, is skipped. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-when]"), function (el) {
    if (el.getAttribute("data-when").split(" ").indexOf(a.state) === -1) { el.hidden = true; }
  });

  if (!a.profile) { icons(); return; }

  /* ══ 2. FILL ══════════════════════════════════════════════════════════ */
  var derived = {
    "user.initial": (a.user.name || "?").charAt(0).toUpperCase(),
    "profile.at":   a.profile ? a.profile.handle : ""
  };
  Array.prototype.forEach.call(document.querySelectorAll("[data-fill]"), function (el) {
    var k = el.getAttribute("data-fill");
    var v = (k in derived) ? derived[k]
          : k.split(".").reduce(function (o, p) { return o == null ? o : o[p]; }, a);
    if (v !== undefined && v !== null && v !== "") { el.textContent = v; }
  });

  /* ══ 3. THEME PICKER ══════════════════════════════════════════════════ */
  var themes = document.querySelectorAll(".theme");
  function paintTheme() {
    Array.prototype.forEach.call(themes, function (o) {
      o.setAttribute("aria-pressed", String(o.dataset.theme === S.theme));
    });
  }
  Array.prototype.forEach.call(themes, function (b) {
    b.addEventListener("click", function () {
      S.theme = b.dataset.theme;
      paintTheme();
      dirty();
    });
  });

  /* ══ 4. CONTACT, LINKS, ORDER ═══════════════════════════════════════
     A port of onboarding.html step 2, minus the phone preview. The icons,
     the platform list and the rules for what counts as live are copied
     across unchanged; when both screens are rebuilt as one app, this is
     the component they share. */
  var $  = function (id) { return document.getElementById(id); };
  var esc = function (v) {
    return String(v).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  var G_PATHS =
    '<path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.62z"/>' +
    '<path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.95-2.18l-2.9-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"/>' +
    '<path fill="#FBBC05" d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33z"/>' +
    '<path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"/>';

  var GLYPH = {
    instagram : '<rect x="5" y="5" width="14" height="14" rx="4.2" fill="none" stroke="#fff" stroke-width="1.9"/><circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" stroke-width="1.9"/><circle cx="16.5" cy="7.6" r="1.15" fill="#fff"/>',
    youtube   : '<path d="M9.9 8.4 16.2 12l-6.3 3.6z" fill="#fff"/>',
    facebook  : '<path d="M13.4 20v-7.1h2.4l.36-2.78H13.4V8.34c0-.8.23-1.35 1.39-1.35h1.48V4.5a19.7 19.7 0 0 0-2.16-.11c-2.13 0-3.59 1.3-3.59 3.69v2.04H8.1v2.78h2.42V20z" fill="#fff"/>',
    snapchat  : '<path d="M12 4.7c2.16 0 3.83 1.68 3.83 3.83 0 .6-.05 1.27-.1 1.77.2.1.5.15.79.05.3-.1.6-.05.74.2.15.3 0 .64-.34.79-.3.15-.99.34-1.19.74-.15.3.15.89.69 1.53.5.6 1.19 1.04 1.83 1.19.25.05.35.25.3.5-.1.44-.99.74-1.83.89-.15.25-.2.6-.3.89-.05.2-.2.3-.44.25-.35-.05-.79-.15-1.34-.05-.5.1-.99.54-1.68.89-.44.2-.94.3-1.39.3s-.94-.1-1.39-.3c-.69-.35-1.19-.79-1.68-.89-.54-.1-.99 0-1.34.05-.25.05-.4-.05-.44-.25-.1-.3-.15-.64-.3-.89-.84-.15-1.73-.45-1.83-.89-.05-.25.05-.45.3-.5.64-.15 1.34-.6 1.83-1.19.54-.64.84-1.24.69-1.53-.2-.4-.89-.6-1.19-.74-.35-.15-.5-.5-.34-.79.15-.25.44-.3.74-.2.3.1.6.05.79-.05-.05-.5-.1-1.17-.1-1.77C8.17 6.38 9.84 4.7 12 4.7z" fill="#101215"/>',
    telegram  : '<path d="M19.2 6.2 5.5 11.5c-.7.28-.7.78.02.98l3.44 1.07 7.98-5.03c.38-.23.72-.11.44.14l-6.46 5.84-.25 3.5c.29 0 .42-.13.58-.29l1.4-1.35 2.9 2.14c.53.3.92.14 1.05-.5l1.9-8.94c.19-.86-.31-1.25-.9-1.02z" fill="#fff"/>',
    linkedin  : '<rect x="6" y="9.9" width="2.6" height="8.1" rx=".5" fill="#fff"/><circle cx="7.3" cy="7" r="1.55" fill="#fff"/><path d="M10.7 18v-8.1h2.5v1.1c.42-.72 1.24-1.3 2.44-1.3 2 0 3.06 1.24 3.06 3.5V18h-2.6v-4.2c0-1.1-.42-1.76-1.4-1.76-1 0-1.5.68-1.5 1.76V18z" fill="#fff"/>',
    x         : '<path d="M6 5.4h3.3l3 4.1 3.5-4.1h2.9l-5 5.8 5.4 7.4h-3.3l-3.3-4.5-3.8 4.5H5.8l5.3-6.2z" fill="#fff"/>',
    threads   : '<path d="M15.9 11.4c-.13-2-1.36-3.16-3.42-3.16-1.4 0-2.5.5-3.16 1.5l1.2.83c.44-.64 1.08-.93 1.96-.93 1.13 0 1.78.58 1.94 1.72-.5-.1-1.05-.13-1.64-.08-1.98.15-3.22 1.24-3.08 2.82.13 1.4 1.35 2.28 2.93 2.18 1.44-.1 2.42-.85 2.92-2.13.5.5.7 1.14.55 1.83-.3 1.34-1.68 2.18-3.8 2.18-3.03 0-4.66-1.93-4.66-5.55 0-3.62 1.63-5.55 4.66-5.55 2.08 0 3.52.84 4.3 2.48l1.54-.74C16.98 6.5 15.06 5.2 12.2 5.2 7.94 5.2 5.7 7.78 5.7 12.54s2.24 7.34 6.5 7.34c2.97 0 4.95-1.39 5.45-3.47.4-1.73-.4-3.31-1.75-4.02zm-3.27 3.32c-.74.05-1.24-.3-1.29-.84-.05-.6.5-1.04 1.49-1.11.5-.04.99 0 1.44.1-.2 1.09-.85 1.78-1.64 1.85z" fill="#fff"/>',
    spotify   : '<path d="M7.9 15.4c2.4-.7 4.9-.5 7 .6" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><path d="M7.3 12.5c3-1 6.3-.7 8.9.9" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><path d="M6.8 9.5c3.6-1.2 7.7-.8 10.7 1.1" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/>',
    pinterest : '<path d="M12.3 5.4c-3.7 0-5.7 2.4-5.7 5 0 1.2.45 2.28 1.44 2.68.16.07.3 0 .35-.18l.14-.55c.05-.18.03-.25-.1-.4-.3-.36-.5-.83-.5-1.5 0-1.9 1.44-3.6 3.78-3.6 2.06 0 3.19 1.25 3.19 2.9 0 2.2-.97 4.05-2.42 4.05-.8 0-1.4-.66-1.2-1.47.23-.97.68-2 .68-2.7 0-.62-.34-1.14-1.03-1.14-.82 0-1.47.84-1.47 1.97 0 .72.24 1.2.24 1.2l-.97 4.1c-.29 1.2-.04 2.7-.02 2.85.01.09.13.11.18.04.08-.1 1.1-1.36 1.45-2.6.1-.36.57-2.2.57-2.2.28.53 1.1.99 1.97.99 2.6 0 4.36-2.37 4.36-5.54 0-2.4-2.03-4.64-5.12-4.64z" fill="#fff"/>',
    soundcloud: '<rect x="5" y="12.2" width="1.4" height="4.6" rx=".7" fill="#fff"/><rect x="7.4" y="10.8" width="1.4" height="6" rx=".7" fill="#fff"/><rect x="9.8" y="9.7" width="1.4" height="7.1" rx=".7" fill="#fff"/><path d="M12.7 16.8V9.4c.5-.45 1.16-.72 1.9-.72 1.63 0 2.97 1.24 3.15 2.85.95.2 1.65.98 1.65 1.93 0 1.13-.98 2.04-2.15 2.04z" fill="#fff"/>',
    website   : '<circle cx="12" cy="12" r="6.2" fill="none" stroke="#fff" stroke-width="1.7"/><ellipse cx="12" cy="12" rx="2.6" ry="6.2" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M6.1 10h11.8M6.1 14h11.8" stroke="#fff" stroke-width="1.7"/>',
    directions: '<path d="M12 4.9c-2.65 0-4.8 2.15-4.8 4.8 0 3.55 4.8 9.3 4.8 9.3s4.8-5.75 4.8-9.3c0-2.65-2.15-4.8-4.8-4.8z" fill="#fff"/><circle cx="12" cy="9.6" r="1.85" fill="#EA4335"/>'
  };

  var DISC = {
    instagram:"url(#igGrad)", youtube:"#FF0000", facebook:"#1877F2", snapchat:"#FFFC00",
    telegram:"#229ED9", linkedin:"#0A66C2", x:"#101215", threads:"#101215",
    spotify:"#1DB954", pinterest:"#E60023", soundcloud:"#FF5500",
    website:"#6E27E6", directions:"#EA4335"
  };

  /* Instagram's fill is url(#igGrad). onboarding.html and profile.html
     carry that gradient in their markup; the dashboard pages did not, so
     the icon painted as nothing. Put it in once, from here. */
  if (!document.getElementById("igGrad")) {
    document.body.insertAdjacentHTML("afterbegin",
      '<svg aria-hidden="true" focusable="false" style="position:absolute; width:0; height:0; overflow:hidden">' +
        '<defs><linearGradient id="igGrad" x1="0" y1="1" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#FEDA75"/><stop offset=".35" stop-color="#FA7E1E"/>' +
          '<stop offset=".62" stop-color="#D62976"/><stop offset="1" stop-color="#962FBF"/>' +
        "</linearGradient></defs></svg>");
  }

  /* one round icon, brand colour, any size the CSS asks for */
  function ic(key) {
    if (key === "review") {
      return '<svg class="ic" viewBox="0 0 24 24" role="img" aria-hidden="true">' +
             '<circle cx="12" cy="12" r="12" fill="#fff"/><circle cx="12" cy="12" r="11.2" fill="none" stroke="rgba(16,18,21,.14)" stroke-width="1.2"/>' +
             '<g transform="translate(7.5 7.5) scale(.5)">' + G_PATHS + '</g></svg>';
    }
    if (key === "custom") {
      return '<svg class="ic" viewBox="0 0 24 24" role="img" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#6E27E6"/>' +
             '<path d="M10.4 13.6a2.9 2.9 0 0 0 4.3.3l2-2a2.9 2.9 0 1 0-4.1-4.1l-1 1" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>' +
             '<path d="M13.6 10.4a2.9 2.9 0 0 0-4.3-.3l-2 2a2.9 2.9 0 1 0 4.1 4.1l1-1" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>';
    }
    return '<svg class="ic" viewBox="0 0 24 24" role="img" aria-hidden="true">' +
           '<circle cx="12" cy="12" r="12" fill="' + DISC[key] + '"/>' + GLYPH[key] + '</svg>';
  }

  var EYE =
    '<svg class="on" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M1.8 10S4.9 4.8 10 4.8 18.2 10 18.2 10 15.1 15.2 10 15.2 1.8 10 1.8 10Z" stroke="currentColor" stroke-width="1.7"/><circle cx="10" cy="10" r="2.4" stroke="currentColor" stroke-width="1.7"/></svg>' +
    '<svg class="off" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.2 5.6C2.6 7.1 1.8 10 1.8 10S4.9 15.2 10 15.2c1.5 0 2.8-.45 3.9-1.1M16.4 12.4c1.2-1.3 1.8-2.4 1.8-2.4S15.1 4.8 10 4.8c-.7 0-1.35.1-1.95.27M3 3l14 14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  var LINKS = [
    { k:"instagram",  n:"Instagram",  ph:"@username",             kind:"social" },
    { k:"youtube",    n:"YouTube",    ph:"@channel",              kind:"social" },
    { k:"facebook",   n:"Facebook",   ph:"facebook.com/you",      kind:"social" },
    { k:"snapchat",   n:"Snapchat",   ph:"@username",             kind:"social" },
    { k:"telegram",   n:"Telegram",   ph:"@username",             kind:"social" },
    { k:"linkedin",   n:"LinkedIn",   ph:"linkedin.com/in/you",   kind:"social" },
    { k:"x",          n:"X",          ph:"@username",             kind:"social" },
    { k:"threads",    n:"Threads",    ph:"@username",             kind:"social" },
    { k:"website",    n:"Website",    ph:"yoursite.com",          kind:"row", label:"Website" },
    { k:"review",     n:"Google",     ph:"Google Business link",  kind:"row", label:"Review on Google" },
    { k:"directions", n:"Directions", ph:"Google Maps link",      kind:"row", label:"Directions" },
    { k:"spotify",    n:"Spotify",    ph:"Profile link",          kind:"social" },
    { k:"pinterest",  n:"Pinterest",  ph:"@username",             kind:"social" },
    { k:"soundcloud", n:"SoundCloud", ph:"@username",             kind:"social" }
  ];
  var BY = {}; LINKS.forEach(function (l) { BY[l.k] = l; });

  var BY = {}; LINKS.forEach(function (l) { BY[l.k] = l; });

  var X_SVG = '<svg viewBox="0 0 16 16" fill="none"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  /* WHAT IS SAVED TODAY — read off the account, not kept here (Garry,
     2026-09-24). This file used to hold its own fixture, so the editor and
     the rest of the dashboard described two different pages. Now the flow's
     state.js is the only copy, and Discard goes back to it. The defaults
     below only fill gaps in an older saved page. */
  var SAVED = merge({
    live:true, theme:"light",
    photo:null, name:"", handle:"", bio:"",
    phone:"", phoneOn:true,
    waSame:true, wa:"", waOn:true,
    email:"", emailOn:true,
    links:{}, customs:[],
    order:["call","wa","email","vcard","socials","website","directions","review"],
    socialOrder:[]
  }, a.profile || {});

  if (SAVED.name === "Garry Singh" || SAVED.name === "Garry" || SAVED.name === "Gurdeep Singh" || SAVED.name === "Your Name" || SAVED.name === "User") {
    SAVED.name = (a.user && a.user.name && a.user.name !== "Garry Singh" && a.user.name !== "Garry") ? a.user.name : (SAVED.handle && SAVED.handle !== "garry" ? SAVED.handle : "");
  }
  if (!SAVED.name && a.user && a.user.name && a.user.name !== "Garry Singh" && a.user.name !== "Garry") {
    SAVED.name = a.user.name;
  }

  function merge(base, extra) {
    var out = JSON.parse(JSON.stringify(base)), k;
    for (k in extra) { if (extra[k] !== undefined) { out[k] = extra[k]; } }
    return out;
  }

  var S, cid = 0;
  function load(from) { S = JSON.parse(JSON.stringify(from)); }
  load(SAVED);

  /* any change the person made — repaint what depends on it, raise the bar */
  function changed() { paintOrder(); recount(); dirty(); }

  /* — photo, name, bio — the builder's step 1, field for field — */
  function initial() { return (S.name.trim()[0] || S.handle[0] || "?").toUpperCase(); }

  function paintPhoto() {
    var disc = $("photoDisc");
    if (disc) disc.innerHTML = S.photo ? '<img src="' + S.photo + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">' : esc(initial());
    var clear = $("photoClear");
    if (clear) clear.hidden = !S.photo;
    var btn = $("photoBtn");
    if (btn) btn.textContent = S.photo ? "Change photo" : "Add photo";
  }
  function paintBasics() {
    if ($("name")) $("name").value = S.name;
    if ($("bio")) $("bio").value = S.bio;
    if ($("bioCount")) {
      $("bioCount").textContent  = S.bio.length + "/100";
      $("bioCount").dataset.over = String(S.bio.length >= 100);
    }
    paintPhoto();
  }

  var photoBtn = $("photoBtn");
  if (photoBtn) photoBtn.addEventListener("click", function () { var pi = $("photoInput"); if (pi) pi.click(); });
  var photoInput = $("photoInput");
  if (photoInput) photoInput.addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () { S.photo = r.result; paintPhoto(); dirty(); };
    r.readAsDataURL(f);
  });
  var photoClear = $("photoClear");
  if (photoClear) photoClear.addEventListener("click", function () {
    S.photo = null; var pi = $("photoInput"); if (pi) pi.value = ""; paintPhoto(); dirty();
  });

  /* the name feeds the initial in the disc and whether Save contact is live */
  if ($("name")) $("name").addEventListener("input", function () { S.name = this.value; paintPhoto(); paintOrder(); dirty(); });
  if ($("bio")) $("bio").addEventListener("input", function () {
    S.bio = this.value.slice(0, 100);
    if ($("bioCount")) {
      $("bioCount").textContent  = S.bio.length + "/100";
      $("bioCount").dataset.over = String(S.bio.length >= 100);
    }
    dirty();
  });

  /* — handle. Same check as the builder, with one difference: the handle
       you already own is not "taken". — */
  var RESERVED = ["admin","codemarca","hello","support","help","api","about","login","signup","app","www","shop","blog"];
  var TAKEN    = ["garry","nikk","nancy","amit","gill"];
  var hTimer   = null;

  function cleanHandle(v) { return String(v).toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 24); }
  function checkHandle(v) {
    if (v === SAVED.handle) return { ok:true, mine:true };
    if (v.length < 3) return { ok:false, why:"Pick a link with at least 3 characters." };
    if (RESERVED.indexOf(v) > -1) return { ok:false, why:"<b>" + esc(v) + "</b> is reserved. Try another." };
    if (TAKEN.indexOf(v) > -1) return { ok:false, why:"<b>" + esc(v) + "</b> went to someone else. <b>" + esc(v) + "01</b> is free." };
    return { ok:true };
  }
  /* The handle field was taken off this screen on 2026-09-24 (Garry): the
     link is shown, whole, on the card at the top, and nobody came here to
     rename it. The check stays — a later screen can reuse it — but every
     hook below no-ops when the field is not on the page. */
  var handleEl = $("handle");

  function sayHandle(state, html) {
    if (!handleEl) return;
    $("handleNote").dataset.state = state; $("handleNote").innerHTML = html;
  }
  function paintHandle() {
    if (!handleEl) return;
    handleEl.value = S.handle;
    $("handleWrap").dataset.state = "";
    sayHandle("idle", "This is your current link.");
  }

  if (handleEl) $("handle").addEventListener("input", function () {
    var v = cleanHandle(this.value);
    if (v !== this.value) this.value = v;
    S.handle = v;
    clearTimeout(hTimer);
    if (!v) { sayHandle("idle", ""); $("handleWrap").dataset.state = ""; return; }
    sayHandle("idle", "Checking…");
    hTimer = setTimeout(function () {
      var r = checkHandle(v);
      $("handleWrap").dataset.state = r.ok ? "" : "bad";
      if (r.mine)    sayHandle("idle", "This is your current link.");
      else if (r.ok) sayHandle("ok", "<b>codemarca.com/" + esc(v) + "</b> is free.");
      else           sayHandle("bad", r.why);
    }, 380);
  });

  /* — contact — */
  function digits(v) { return v.replace(/[^0-9]/g, "").slice(0, 10); }

  function paintContact() {
    if ($("phone")) $("phone").value = S.phone;
    if ($("wa")) $("wa").value    = S.wa;
    if ($("email")) $("email").value = S.email;
    if ($("waSame")) $("waSame").checked = S.waSame;
    if ($("waWrap")) $("waWrap").hidden  = S.waSame;
    [["phoneEye","phoneOn","phone"],["waEye","waOn","WhatsApp"],["emailEye","emailOn","email"]]
      .forEach(function (e) {
        var b = $(e[0]);
        if (!b) return;
        b.innerHTML = EYE;
        b.setAttribute("aria-pressed", String(S[e[1]]));
        b.setAttribute("aria-label", (S[e[1]] ? "Hide " : "Show ") + e[2] + " on your page");
      });
  }

  [["phoneEye","phoneOn","phone"],["waEye","waOn","WhatsApp"],["emailEye","emailOn","email"]]
    .forEach(function (e) {
      var b = $(e[0]);
      if (!b) return;
      b.addEventListener("click", function () {
        S[e[1]] = !S[e[1]];
        this.setAttribute("aria-pressed", String(S[e[1]]));
        this.setAttribute("aria-label", (S[e[1]] ? "Hide " : "Show ") + e[2] + " on your page");
        changed();
      });
    });

  if ($("phone")) $("phone").addEventListener("input", function () { this.value = digits(this.value); S.phone = this.value; changed(); });
  if ($("wa")) $("wa").addEventListener("input",    function () { this.value = digits(this.value); S.wa = this.value; changed(); });
  if ($("email")) $("email").addEventListener("input", function () { S.email = this.value.trim(); changed(); });
  if ($("waSame")) $("waSame").addEventListener("change", function () {
    S.waSame = this.checked;
    if ($("waWrap")) $("waWrap").hidden = this.checked;
    changed();
  });

  /* — the grid — */
  function paintPicks() {
    if (!$("picks")) return;
    $("picks").innerHTML = LINKS.map(function (l) {
      var on = !!S.links[l.k];
      return '<button class="pick" type="button" data-k="' + l.k + '" data-on="' + on + '" aria-pressed="' + on + '">' +
             ic(l.k) + "<span>" + esc(l.n) + "</span></button>";
    }).join("");
  }

  if ($("picks")) $("picks").addEventListener("click", function (e) {
    var b = e.target.closest(".pick"); if (!b) return;
    var k = b.dataset.k;
    if (S.links[k]) { delete S.links[k]; }
    else {
      S.links[k] = { v:"", on:true };
      if (BY[k].kind === "row" && S.order.indexOf(k) < 0) S.order.push(k);
    }
    var added = !!S.links[k];
    paintPicks(); paintAdded(); changed();

    if (added && $("added")) {
      var row = $("added").querySelector('[data-k="' + k + '"]');
      if (row) {
        var field = row.querySelector("input");
        if (field && FINE_POINTER) field.focus({ preventScroll: true });
        var r = row.getBoundingClientRect();
        if (r.top < 8 || r.bottom > window.innerHeight - 8) {
          row.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  });

  /* — added rows — */
  var MV_UP   = '<svg viewBox="0 0 14 14" fill="none"><path d="M3 9l4-4 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var MV_DOWN = '<svg viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function paintAdded() {
    if (!$("added")) return;
    var socialKeys = socialsAdded();
    var rowKeys = LINKS.filter(function (l) { return l.kind !== "social"; })
                       .map(function (l) { return l.k; })
                       .filter(function (k) { return !!S.links[k]; });
    var keys = socialKeys.concat(rowKeys);

    $("added").innerHTML = keys.map(function (k, n) {
      var l = BY[k], v = S.links[k];
      var mv = l.kind === "social"
        ? '<span class="lrow__move">' +
            '<button type="button" data-smv="up" aria-label="Move ' + esc(l.n) + ' left"' +
              (n === 0 ? " disabled" : "") + ">" + MV_UP + "</button>" +
            '<button type="button" data-smv="down" aria-label="Move ' + esc(l.n) + ' right"' +
              (n === socialKeys.length - 1 ? " disabled" : "") + ">" + MV_DOWN + "</button>" +
          "</span>"
        : "";
      return '<div class="lrow" data-k="' + k + '">' + mv + ic(k) +
        '<div class="inp"><input type="text" value="' + esc(v.v) + '" placeholder="' + esc(l.ph) + '" aria-label="' + esc(l.n) + '">' +
        '<button class="eye" type="button" aria-pressed="' + v.on + '" aria-label="' + (v.on ? "Hide " : "Show ") + esc(l.n) + ' on your page">' + EYE + "</button></div>" +
        '<button class="kill" type="button" aria-label="Remove ' + esc(l.n) + '">' + X_SVG + "</button></div>";
    }).join("");
  }

  if ($("added")) {
    $("added").addEventListener("input", function (e) {
      var row = e.target.closest(".lrow"); if (!row) return;
      S.links[row.dataset.k].v = e.target.value.trim();
      changed();
    });
    $("added").addEventListener("click", function (e) {
      var row = e.target.closest(".lrow"); if (!row) return;
      var k = row.dataset.k;
      var mv = e.target.closest("[data-smv]");
      if (mv) { moveSocial(k, mv.dataset.smv === "up" ? -1 : 1); return; }
      if (e.target.closest(".kill")) { delete S.links[k]; paintPicks(); paintAdded(); changed(); return; }
      var b = e.target.closest(".eye");
      if (b) {
        S.links[k].on = !S.links[k].on;
        b.setAttribute("aria-pressed", String(S.links[k].on));
        b.setAttribute("aria-label", (S.links[k].on ? "Hide " : "Show ") + BY[k].n + " on your page");
        changed();
      }
    });
  }

  /* — custom links, capped at five so the page stays a page, not a list — */
  if ($("addCustom")) $("addCustom").addEventListener("click", function () {
    if (S.customs.length >= 5) return;
    var id = "c" + (++cid);
    S.customs.push({ id:id, title:"", url:"", on:true });
    S.order.push(id);
    paintCustoms(); changed();
    var f = document.querySelector('[data-c="' + id + '"] input'); if (f) f.focus();
  });

  function paintCustoms() {
    if (!$("customs")) return;
    if ($("addCustom")) $("addCustom").hidden = S.customs.length >= 5;
    $("customs").innerHTML = S.customs.map(function (c) {
      return '<div class="lrow" data-c="' + c.id + '">' + ic("custom") +
        '<div class="inp"><input type="text" data-f="title" value="' + esc(c.title) + '" placeholder="Button text" aria-label="Custom link text"></div>' +
        '<button class="kill" type="button" aria-label="Remove custom link">' + X_SVG + "</button></div>" +
        '<div class="lrow" data-c="' + c.id + '" style="padding-left:38px">' +
        '<div class="inp"><input type="url" data-f="url" value="' + esc(c.url) + '" placeholder="https://" aria-label="Custom link address">' +
        '<button class="eye" type="button" aria-pressed="' + c.on + '" aria-label="Show link on your page">' + EYE + "</button></div></div>";
    }).join("");
  }

  function findCustom(id) {
    for (var i = 0; i < S.customs.length; i++) if (S.customs[i].id === id) return S.customs[i];
    return null;
  }
  if ($("customs")) {
    $("customs").addEventListener("input", function (e) {
      var row = e.target.closest("[data-c]"); if (!row) return;
      var c = findCustom(row.dataset.c); if (!c) return;
      c[e.target.dataset.f] = e.target.value;
      changed();
    });
    $("customs").addEventListener("click", function (e) {
      var row = e.target.closest("[data-c]"); if (!row) return;
      var id = row.dataset.c, c = findCustom(id); if (!c) return;
      if (e.target.closest(".kill")) {
        S.customs = S.customs.filter(function (x) { return x.id !== id; });
        S.order = S.order.filter(function (x) { return x !== id; });
        paintCustoms(); changed(); return;
      }
      var b = e.target.closest(".eye");
      if (b) { c.on = !c.on; b.setAttribute("aria-pressed", String(c.on)); changed(); }
    });
  }

  /* — what is live on the page. The eye being off must OMIT the field from
       the response on the real page, never CSS-hide it. — */
  function waNumber() { return S.waSame ? S.phone : S.wa; }
  function hasContact() { return !!(S.phone || (!S.waSame && S.wa) || S.email); }
  var SOCIAL_KEYS = LINKS.filter(function (l) { return l.kind === "social"; })
                         .map(function (l) { return l.k; });

  /* the owner's order, with anything it does not mention falling in behind */
  function socialOrder() {
    var seen = {}, out = [];
    (S.socialOrder || []).concat(SOCIAL_KEYS).forEach(function (k) {
      if (!seen[k] && BY[k] && BY[k].kind === "social") { seen[k] = 1; out.push(k); }
    });
    return out;
  }
  function socials() {
    return socialOrder().filter(function (k) {
      return S.links[k] && S.links[k].v && S.links[k].on;
    }).map(function (k) { return BY[k]; });
  }
  function socialsAdded() {
    return socialOrder().filter(function (k) { return !!S.links[k]; });
  }
  function moveSocial(k, dir) {
    var live = socialsAdded();
    var i = live.indexOf(k), j = i + dir;
    if (i < 0 || j < 0 || j >= live.length) return;
    live.splice(j, 0, live.splice(i, 1)[0]);
    var rest = socialOrder().filter(function (x) { return live.indexOf(x) < 0; });
    S.socialOrder = live.concat(rest);
    paintAdded(); changed();
    var again = document.querySelector('.lrow[data-k="' + k + '"] [data-smv="' + (dir < 0 ? "up" : "down") + '"]');
    if (again && !again.disabled) again.focus();
  }
  function rowLive(k) {
    if (k === "call")    return !!(S.phone && S.phoneOn);
    if (k === "wa")      return !!(waNumber() && S.waOn);
    if (k === "email")   return !!(S.email && S.emailOn);
    if (k === "vcard")   return !!(S.name.trim() && hasContact());
    if (k === "socials") return socials().length > 0;
    if (BY[k])           return !!(S.links[k] && S.links[k].v && S.links[k].on);
    var c = findCustom(k);
    return !!(c && c.title && c.on);
  }
  function rowName(k) {
    if (k === "call")    return "Call";
    if (k === "wa")      return "WhatsApp";
    if (k === "email")   return "Email";
    if (k === "vcard")   return "Save contact";
    if (k === "socials") return "Socials";
    if (BY[k])           return BY[k].label || BY[k].n;
    var c = findCustom(k);
    return c ? (c.title || "Custom link") : "";
  }

  function recount() {
    var linkCount = $("linkCount");
    if (!linkCount) return;
    var n = Object.keys(S.links).filter(function (k) { return S.links[k].v && S.links[k].on; }).length +
            S.customs.filter(function (c) { return c.title && c.on; }).length;
    linkCount.textContent = n + " shown";
  }

  /* — order — */
  var GRIP = '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="6" cy="4" r="1.3"/><circle cx="10" cy="4" r="1.3"/><circle cx="6" cy="8" r="1.3"/><circle cx="10" cy="8" r="1.3"/><circle cx="6" cy="12" r="1.3"/><circle cx="10" cy="12" r="1.3"/></svg>';
  var UP   = '<svg viewBox="0 0 14 14" fill="none"><path d="M3 9l4-4 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var DOWN = '<svg viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function paintOrder() {
    var orderEl = $("order");
    if (!orderEl) return;
    var live = S.order.filter(rowLive);
    if (!live.length) {
      orderEl.innerHTML = '<li class="order__empty">Fill something in above and it shows up here.</li>';
      return;
    }
    orderEl.innerHTML = live.map(function (k, i) {
      var n = esc(rowName(k));
      return '<li class="ord" draggable="true" data-k="' + k + '">' +
        '<span class="ord__grip" aria-hidden="true">' + GRIP + "</span>" +
        '<span class="ord__name">' + n + "</span>" +
        '<span class="ord__move">' +
        '<button type="button" data-mv="up" aria-label="Move ' + n + ' up"' + (i === 0 ? " disabled" : "") + ">" + UP + "</button>" +
        '<button type="button" data-mv="down" aria-label="Move ' + n + ' down"' + (i === live.length - 1 ? " disabled" : "") + ">" + DOWN + "</button>" +
        "</span></li>";
    }).join("");
  }

  /* moves work on the visible list, then write back into the full order
     so hidden keys keep their relative place */
  function writeBack(live) {
    var rest = S.order.filter(function (x) { return live.indexOf(x) < 0; });
    S.order = live.concat(rest);
    paintOrder(); dirty();
  }
  function move(k, dir) {
    var live = S.order.filter(rowLive);
    var i = live.indexOf(k), j = i + dir;
    if (i < 0 || j < 0 || j >= live.length) return;
    live.splice(j, 0, live.splice(i, 1)[0]);
    writeBack(live);
  }

  if ($("order")) {
    $("order").addEventListener("click", function (e) {
      var b = e.target.closest("[data-mv]"); if (!b) return;
      var k = b.closest(".ord").dataset.k, dir = b.dataset.mv;
      move(k, dir === "up" ? -1 : 1);
      /* the list was rebuilt — hand focus to the new copy of the button */
      var again = document.querySelector('.ord[data-k="' + k + '"] [data-mv="' + dir + '"]');
      if (again && !again.disabled) {
        try { again.focus({ preventScroll:true }); } catch (err) { again.focus(); }
      }
    });

    var dragKey = null;
    $("order").addEventListener("dragstart", function (e) {
      var li = e.target.closest(".ord"); if (!li) return;
      dragKey = li.dataset.k; li.dataset.drag = "true";
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", dragKey); } catch (err) {}
    });
    $("order").addEventListener("dragover", function (e) {
      var li = e.target.closest(".ord"); if (!li || !dragKey) return;
      e.preventDefault(); li.dataset.over = "true";
    });
    $("order").addEventListener("dragleave", function (e) {
      var li = e.target.closest(".ord"); if (li) li.dataset.over = "false";
    });
    $("order").addEventListener("drop", function (e) {
      var li = e.target.closest(".ord"); if (!li || !dragKey) return;
      e.preventDefault();
      var live = S.order.filter(rowLive);
      var from = live.indexOf(dragKey), to = live.indexOf(li.dataset.k);
      if (from > -1 && to > -1 && from !== to) {
        live.splice(to, 0, live.splice(from, 1)[0]);
        writeBack(live);
      }
      dragKey = null;
    });
    $("order").addEventListener("dragend", function () { dragKey = null; paintOrder(); });
  }

  if ($("pageLive")) $("pageLive").addEventListener("change", function () { S.live = this.checked; });

  function paintAll() {
    if ($("pageLive")) $("pageLive").checked = S.live;
    paintTheme();
    paintHandle(); paintBasics(); paintContact(); paintPicks(); paintAdded(); paintCustoms(); paintOrder(); recount();
  }
  paintAll();

  /* ══ 5. DIRTY / SAVE ══════════════════════════════════════════════════
     No persistence — this is a handoff. The bar exists so the save
     pattern is unambiguous when the page is rebuilt for real. */
  var bar = document.getElementById("savebar");
  function dirty() {
    bar.setAttribute("data-on", "");
    document.body.setAttribute("data-editing", "");   /* parks the demo toy */
  }
  function clean() {
    bar.removeAttribute("data-on");
    document.body.removeAttribute("data-editing");
  }

  document.addEventListener("input", function (e) {
    if (e.target.closest(".view")) { dirty(); }
  });
  Array.prototype.forEach.call(document.querySelectorAll(".sw input"), function (i) {
    i.addEventListener("change", dirty);
  });

  function save() {
    var h = checkHandle(S.handle);
    if (handleEl && (!S.handle || !h.ok)) {
      handleEl.focus();
      CM.toast("Fix your link before saving");
      return false;
    }
    SAVED = JSON.parse(JSON.stringify(S));
    paintLive();
    clean();

    try {
      var customAccount = JSON.parse(window.localStorage.getItem("cm.account.custom") || "{}");
      customAccount.profile = customAccount.profile || {};
      customAccount.user = customAccount.user || {};

      customAccount.profile.handle = S.handle;
      customAccount.profile.name = S.name;
      customAccount.profile.title = S.name || S.handle;
      customAccount.profile.bio = S.bio;
      customAccount.profile.photo = S.photo;
      customAccount.profile.theme = S.theme;
      customAccount.profile.phone = S.phone;
      customAccount.profile.phoneOn = S.phoneOn;
      customAccount.profile.waSame = S.waSame;
      customAccount.profile.wa = S.wa;
      customAccount.profile.waOn = S.waOn;
      customAccount.profile.email = S.email;
      customAccount.profile.emailOn = S.emailOn;
      customAccount.profile.links = S.links;
      customAccount.profile.customs = S.customs;
      customAccount.profile.order = S.order;
      customAccount.profile.socialOrder = S.socialOrder;
      customAccount.profile.live = S.live;

      customAccount.user.name = S.name || S.handle;
      customAccount.user.email = S.email || (S.handle ? S.handle + "@gmail.com" : "");
      if (S.phone) customAccount.user.phone = "+91 " + S.phone;

      window.localStorage.setItem("cm.account.custom", JSON.stringify(customAccount));
      if (S.handle) window.localStorage.setItem("cm.username", S.handle);
      if (S.name && S.name !== "Garry Singh" && S.name !== "Gurdeep Singh") {
        window.localStorage.setItem("cm.name", S.name);
      } else {
        window.localStorage.removeItem("cm.name");
      }
      if (S.phone) window.localStorage.setItem("cm.phone", S.phone);
      if (S.email) window.localStorage.setItem("cm.email", S.email);
      if (S.photo) {
        try { window.localStorage.setItem("cm.photo", S.photo); } catch(e) {}
      } else {
        try { window.localStorage.removeItem("cm.photo"); } catch(e) {}
      }
    } catch(e) {}

    try {
      fetch("/api/auth/claim-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: S.handle,
          display_name: S.name.trim() || S.handle,
          bio: S.bio,
          avatar_url: S.photo,
          phone: S.phone,
          whatsapp: S.wa,
          email: S.email,
          theme: S.theme,
          links: S.links,
          customs: S.customs,
          is_live: S.live
        })
      }).catch(function () {});
    } catch(e) {}

    CM.toast("Page updated");
    return true;
  }
  function discard() {
    load(SAVED);
    paintAll();
    clean();
  }

  document.getElementById("save").addEventListener("click", save);
  document.getElementById("undo").addEventListener("click", function () {
    discard();
    CM.toast("Changes discarded");
  });

  /* ══ 6. YOU, LIVE (the dark "me" card) ═══════════════════════════════════════════════════════
     Shows what is saved, not what is being typed. */
  function liveUrl() { return "https://codemarca.com/" + SAVED.handle; }
  /* the owner's view of their own page — profile.html with its edit bar */
  function ownerUrl() {
    return CM.ROOT + "profile.html?view=owner&handle=" + encodeURIComponent(SAVED.handle) +
           "&theme=" + encodeURIComponent(SAVED.theme);
  }
  function paintLive() {
    $("meHandle").textContent = SAVED.handle;
    $("meName").textContent = SAVED.name || SAVED.handle;
    var init = (SAVED.name.trim()[0] || SAVED.handle[0] || "?").toUpperCase();
    if (SAVED.photo) {
      $("meAv").innerHTML = '<img src="' + SAVED.photo + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">';
    } else {
      $("meAv").textContent = init;
    }
    $("meCopy").setAttribute("data-copy", liveUrl());
    $("meView").setAttribute("href", ownerUrl());
  }
  $("meMark").innerHTML = CM.mark();
  /* the same sheet a visitor gets from the share icon on profile.html */
  $("meShare").addEventListener("click", function () {
    CM.shareSheet({ title: "Share your page", url: liveUrl(), name: SAVED.name });
  });
  /* the QR — seeded on the code id, so it matches Home, My QR and the stickers */
  if (a.code) {
    $("meQr").innerHTML = CM.qr(a.code.id);
    $("meQr").addEventListener("click", function () {
      CM.showCode({ title: SAVED.name, sub: "codemarca.com/" + SAVED.handle, url: liveUrl(), seed: a.code.id });
    });
  }
  paintLive();

  /* ══ 7. LEAVING WITH UNSAVED CHANGES ══════════════════════════════════
     Two ways out. A link inside the app — the tabs, the sidebar, the logo,
     the avatar — is caught here and asked about in our own dialog, with
     Save offered first. Closing the tab or reloading cannot be caught
     like that: browsers only allow their own generic "leave site?" prompt,
     so that is what beforeunload asks for. Links that open a new tab are
     let through, because nothing is lost by them. */
  function isDirty() { return bar.hasAttribute("data-on"); }

  document.addEventListener("click", function (e) {
    if (!isDirty() || e.defaultPrevented) return;
    var link = e.target.closest("a[href]");
    if (!link || link.target === "_blank") return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;

    e.preventDefault();
    CM.dialog({
      title: "Save your changes?",
      body:  "You changed your page but have not saved it. Leave now and those changes are gone.",
      actions: [
        { id:"save", label:"Save and leave",       kind:"go"    },
        { id:"drop", label:"Leave without saving", kind:"bad"   },
        { id:"stay", label:"Keep editing",         kind:"quiet" }
      ],
      onPick: function (id) {
        if (id === "save" && save()) { window.location.href = link.href; }
        if (id === "drop") { discard(); window.location.href = link.href; }
      }
    });
  });

  window.addEventListener("beforeunload", function (e) {
    if (!isDirty()) return;
    e.preventDefault();
    e.returnValue = "";
  });

  /* ══ 8. ICON SLOTS ════════════════════════════════════════════════════ */
  icons();

  /* ══ OPENED FROM THE CHECKLIST ════════════════════════════════════════
     Home's "Finish your page" rows link here as ?add=photo|bio|links|
     contact (Garry, 2026-09-23). Land on the field itself, not the top of
     a long editor — the whole point of the row was that it is a way in. */
  (function () {
    var want = new URLSearchParams(location.search).get("add");
    if (!want) { return; }
    var AT = { photo:"photoBtn", bio:"bio", contact:"phone", links:"linksCard" };
    var el = document.getElementById(AT[want]);
    if (!el) { return; }
    el.scrollIntoView({ behavior:"smooth", block: want === "links" ? "start" : "center" });
    /* a card is not focusable; a field is, and focusing it opens the keyboard
       on a phone, which is exactly what someone who tapped "Add a bio" wants */
    if (want !== "links") { setTimeout(function () { el.focus({ preventScroll:true }); }, 300); }
  })();

  function icons() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-ic]"), function (el) {
      el.insertAdjacentHTML("afterbegin", CM.icon(el.getAttribute("data-ic")));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-ic-in]"), function (el) {
      el.outerHTML = CM.icon(el.getAttribute("data-ic-in"));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-ic-btn]"), function (el) {
      el.insertAdjacentHTML("beforeend", CM.icon(el.getAttribute("data-ic-btn")));
    });
  }
})();
