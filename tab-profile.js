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

  /* ══ 3. THEME PICKER ══════════════════════════════════════════════════
     Some themes come in versions (Garry, 2026-10-05/06): Leaf in four
     colours, Soft and Photo in light and dark. Each stays ONE tile in the
     grid; choosing it shows a row of dots under the grid for its versions.
     The version is part of the theme id (leaf-blue, soft-dark…), so the page
     and the payload need nothing new. The row's space is always kept, so
     nothing below it jumps when it appears. */
  var SUBS = {
    leaf:  { label:"Colour", list:[
      { t:"leaf", n:"Green", c:"#A3BF5A" }, { t:"leaf-blue", n:"Blue", c:"#0062FE" },
      { t:"leaf-orange", n:"Orange", c:"#F45C30" }, { t:"leaf-violet", n:"Violet", c:"#6741FF" } ] },
    light: { label:"Mode", list:[ { t:"light", n:"Light", c:"#F2F2F7" }, { t:"light-dark", n:"Dark", c:"#000000" } ] },
    soft:  { label:"Mode", list:[ { t:"soft", n:"Light", c:"#E8E7E5" }, { t:"soft-dark", n:"Dark", c:"#1E1E1C" } ] },
    photo: { label:"Mode", list:[ { t:"photo", n:"Light", c:"#C4CBD4" }, { t:"photo-dark", n:"Dark", c:"#191C22" } ] }
  };
  function themeBase(t) { var m = /^(light|leaf|soft|photo)/.exec(t || ""); return m ? m[1] : t; }
  function subOf(t) {
    var s = SUBS[themeBase(t)]; if (!s) { return null; }
    return s.list.filter(function (x) { return x.t === t; })[0] || null;
  }
  var lastSub = {};   /* the version picked last, per family */
  function chooseTheme(t, exact) {
    var base = themeBase(t);
    /* a tile keeps whichever version was picked last; a dot names it exactly */
    if (SUBS[base] && !exact) { t = themeBase(S.theme) === base ? S.theme : (lastSub[base] || base); }
    if (SUBS[base]) { lastSub[base] = t; }
    S.theme = t;
    paintTheme();
    try { window.localStorage.setItem("cm.theme", t); } catch (e) {}
    try {
      var ca = JSON.parse(window.localStorage.getItem("cm.account.custom") || "{}");
      ca.profile = ca.profile || {};
      ca.profile.theme = t;
      window.localStorage.setItem("cm.account.custom", JSON.stringify(ca));
    } catch (e) {}
    dirty();
  }
  var themes = document.querySelectorAll(".theme");
  var grid = document.querySelector(".themes");
  if (grid) { grid.insertAdjacentHTML("afterend", '<div class="subs" role="group" aria-label="Theme version"></div>'); }
  function paintSubs(row) {
    var s = SUBS[themeBase(S.theme)];
    row.dataset.on = s ? "true" : "false";
    row.innerHTML = s ? "<span>" + s.label + "</span>" + s.list.map(function (x) {
      return '<button type="button" data-theme="' + x.t + '" aria-label="' + x.n + '" title="' + x.n +
             '" aria-pressed="' + (x.t === S.theme) + '" style="--dot:' + x.c + '"></button>';
    }).join("") : "<span>&nbsp;</span>";
  }
  function paintTheme() {
    var base = themeBase(S.theme);
    if (typeof kit !== "undefined" && kit) { kit.theme(); }   /* a picked face follows the theme's colour */
    Array.prototype.forEach.call(themes, function (o) {
      o.setAttribute("aria-pressed", String(o.dataset.theme === base));
    });
    Array.prototype.forEach.call(document.querySelectorAll(".subs, .pp__subs"), paintSubs);
  }
  Array.prototype.forEach.call(themes, function (b) {
    b.addEventListener("click", function () { chooseTheme(b.dataset.theme); });
  });
  document.addEventListener("click", function (e) {
    var d = e.target.closest && e.target.closest(".subs button, .pp__subs button"); if (!d) { return; }
    chooseTheme(d.dataset.theme, true);
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

  /* Socials: the official marks (Simple Icons, CC0), drawn as onboarding
     and profile.html's fillIc draw them (2026-10-11). */
  var GLYPH = {
    instagram : '<path fill="#fff" transform="translate(6 6) scale(.5)" d="M7.0301.084c-1.2768.0602-2.149.264-2.9096.5602-.7868.307-1.4542.72-2.1192 1.384-.664.665-1.077 1.332-1.384 2.119-.296.761-.5 1.633-.56 2.91-.06 1.287-.074 1.7-.074 4.943s.014 3.656.074 4.943c.06 1.277.264 2.149.56 2.91.307.787.72 1.454 1.384 2.119.665.664 1.332 1.077 2.119 1.384.761.296 1.633.5 2.91.56 1.287.06 1.7.074 4.943.074s3.656-.014 4.943-.074c1.277-.06 2.149-.264 2.91-.56.787-.307 1.454-.72 2.119-1.384.664-.665 1.077-1.332 1.384-2.119.296-.761.5-1.633.56-2.91.06-1.287.074-1.7.074-4.943s-.014-3.656-.074-4.943c-.06-1.277-.264-2.149-.56-2.91-.307-.787-.72-1.454-1.384-2.119-.665-.664-1.332-1.077-2.119-1.384-.761-.296-1.633-.5-2.91-.56-1.287-.06-1.7-.074-4.943-.074s-3.656.014-4.943.074zm.24 2.162c1.265-.058 1.644-.07 4.73-.07 3.085 0 3.464.012 4.73.07 1.17.054 1.805.249 2.227.413.56.218.96.477 1.38.897.42.42.679.82.897 1.38.164.422.36 1.057.413 2.227.058 1.266.07 1.645.07 4.73s-.012 3.465-.07 4.73c-.054 1.17-.249 1.806-.413 2.228-.218.56-.477.96-.897 1.38-.42.42-.82.679-1.38.897-.422.164-1.057.36-2.227.413-1.266.058-1.645.07-4.73.07s-3.465-.012-4.73-.07c-1.17-.054-1.806-.249-2.228-.413-.56-.218-.96-.477-1.38-.897-.42-.42-.679-.82-.897-1.38-.164-.422-.36-1.057-.413-2.227-.058-1.266-.07-1.645-.07-4.73s.012-3.465.07-4.73c.054-1.17.249-1.806.413-2.228.218-.56.477-.96.897-1.38.42-.42.82-.679 1.38-.897.422-.164 1.057-.36 2.227-.413zm8.93 1.942a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44zm-4.2 1.643a6.17 6.17 0 1 0 6.17 6.17 6.17 6.17 0 0 0-6.17-6.17zm0 2.16a4.01 4.01 0 1 1-4.01 4.01 4.01 4.01 0 0 1 4.01-4.01z"/>',
    youtube   : '<path d="M9.7 7.6 16.6 12l-6.9 4.4z" fill="#fff"/>',
    facebook  : '<circle cx="12" cy="12" r="12" fill="#fff"/><path fill="#0866FF" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.09.043 1.611.104v3.298h-1.644c-1.547 0-2.091.956-2.091 2.378v1.778h3.813l-.619 3.667h-3.194v7.98z"/>',
    snapchat  : '<path fill="#fff" stroke="#000" stroke-width="1.3" stroke-linejoin="round" transform="translate(6 6) scale(.5)" d="M12.065 0C8.156 0 5.48 2.87 5.48 5.922c0 .94.314 1.83.393 2.146-.393.235-1.02.705-1.02 1.647 0 .55.393.942.864.942.235 0 .47-.079.706-.157.078.627.47 1.803 1.647 2.352-.392.314-.941.706-1.568.784-.393.079-.706.393-.706.785 0 .47.47.784.863.784.47 0 .94-.078 1.411-.235.392.705 1.02 1.254 1.882 1.49-.627.548-1.568.862-2.51.862-.313 0-.627.235-.627.549 0 .392.314.627.706.627.784 0 1.568-.157 2.274-.392.628.627 1.49 1.02 2.51 1.02 1.02 0 1.882-.393 2.51-1.02.705.235 1.49.392 2.274.392.392 0 .706-.235.706-.627 0-.314-.314-.55-.628-.55-.94 0-1.882-.313-2.509-.862.862-.236 1.49-.785 1.882-1.49.47.157.94.235 1.411.235.393 0 .863-.314.863-.784 0-.392-.314-.706-.706-.785-.627-.078-1.176-.47-1.568-.784 1.176-.549 1.568-1.725 1.647-2.352.235.078.47.157.705.157.471 0 .863-.392.863-.942 0-.941-.627-1.412-1.02-1.647.079-.314.393-1.206.393-2.146C18.65 2.87 15.973 0 12.065 0z"/>',
    telegram  : '<circle cx="12" cy="12" r="12" fill="#fff"/><path fill="#26A5E4" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>',
    linkedin  : '<rect x="6.3" y="9.9" width="2.6" height="7.9" rx=".4" fill="#fff"/><circle cx="7.6" cy="7.1" r="1.55" fill="#fff"/><path d="M10.9 17.8V9.9h2.5V11c.42-.72 1.24-1.3 2.44-1.3 2 0 3.06 1.24 3.06 3.5v4.6h-2.6v-4.2c0-1.1-.42-1.76-1.4-1.76-1 0-1.5.68-1.5 1.76v4.2z" fill="#fff"/>',
    x         : '<path fill="#fff" transform="translate(6 6) scale(.5)" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>',
    threads   : '<path fill="#fff" transform="translate(6 6) scale(.5)" d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/>',
    spotify   : '<circle cx="12" cy="12" r="12" fill="#fff"/><path fill="#1ED760" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>',
    pinterest : '<circle cx="12" cy="12" r="12" fill="#fff"/><path fill="#E60023" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>',
    soundcloud: '<path fill="#fff" transform="translate(6 6) scale(.5)" d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z"/>',
    website   : '<circle cx="12" cy="12" r="6.2" fill="none" stroke="#fff" stroke-width="1.7"/><ellipse cx="12" cy="12" rx="2.6" ry="6.2" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M6.1 10h11.8M6.1 14h11.8" stroke="#fff" stroke-width="1.7"/>',
    directions: '<path d="M12 4.9c-2.65 0-4.8 2.15-4.8 4.8 0 3.55 4.8 9.3 4.8 9.3s4.8-5.75 4.8-9.3c0-2.65-2.15-4.8-4.8-4.8z" fill="#fff"/><circle cx="12" cy="9.6" r="1.85" fill="#EA4335"/>'
  };

  var DISC = {
    instagram:"url(#igGrad)", youtube:"#FF0000", facebook:"#0866FF", snapchat:"#FFFC00",
    telegram:"#26A5E4", linkedin:"#0A66C2", x:"#111214", threads:"#111214",
    spotify:"#1ED760", pinterest:"#E60023", soundcloud:"#FF5500",
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
  var savedTheme = window.localStorage.getItem("cm.theme") || (a.profile && a.profile.theme) || "light";
  var SAVED = merge({
    live:true, theme: savedTheme,
    photo:null, name:"", handle:"", bio:"",
    phone:"", phoneOn:true,
    waSame:true, wa:"", waOn:true,
    email:"", emailOn:true,
    links:{}, customs:[],
    order:["call","wa","email","vcard","socials","website","directions","review"],
    socialOrder:[]
  }, a.profile || {});
  SAVED.theme = savedTheme;

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
    $("photoDisc").innerHTML = S.photo ? '<img src="' + S.photo + '" alt="">' : CM.FACE;
    $("photoClear").hidden = !S.photo;
    $("photoBtn").textContent = S.photo && !S.face ? "Change photo" : "Add photo";
  }
  function paintBasics() {
    $("name").value     = S.name;
    $("bio").value      = S.bio;
    $("bioCount").textContent  = S.bio.length + "/100";
    $("bioCount").dataset.over = String(S.bio.length >= 100);
    paintPhoto();
    if (typeof kit !== "undefined" && kit) { kit.repaint(); }
  }

  $("photoBtn").addEventListener("click", function () { $("photoInput").click(); });
  /* faces, zodiac and the crop dialog — the same kit onboarding uses
     (photo-kit.js, 2026-10-08). An upload is cropped before it lands. */
  var kit = window.PhotoKit ? PhotoKit.mount({
    disc: $("photoDisc"), input: $("photoInput"),
    after: document.querySelector(".photo"),
    leaf: SUBS.leaf.list,
    get: function () { return { photo: S.photo, face: S.face || null, theme: S.theme }; },
    set: function (photo, face) {
      var changedPhoto = photo !== S.photo || (face || null) !== (S.face || null);
      S.photo = photo; S.face = face || null; paintPhoto();
      if (changedPhoto) { dirty(); }
    }
  }) : null;
  $("photoClear").addEventListener("click", function () {
    S.photo = null; S.face = null; $("photoInput").value = ""; paintPhoto(); dirty();
    if (kit) { kit.repaint(); }
  });

  /* the name feeds the initial in the disc and whether Save contact is live */
  $("name").addEventListener("input",     function () { S.name = this.value; paintPhoto(); paintOrder(); });
  $("bio").addEventListener("input", function () {
    S.bio = this.value.slice(0, 100);
    $("bioCount").textContent  = S.bio.length + "/100";
    $("bioCount").dataset.over = String(S.bio.length >= 100);
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
    $("phone").value = S.phone;
    $("wa").value    = S.wa;
    $("email").value = S.email;
    $("waSame").checked = S.waSame;
    $("waWrap").hidden  = S.waSame;
    [["phoneEye","phoneOn","phone"],["waEye","waOn","WhatsApp"],["emailEye","emailOn","email"]]
      .forEach(function (e) {
        var b = $(e[0]);
        b.innerHTML = EYE;
        b.setAttribute("aria-pressed", String(S[e[1]]));
        b.setAttribute("aria-label", (S[e[1]] ? "Hide " : "Show ") + e[2] + " on your page");
      });
  }

  [["phoneEye","phoneOn","phone"],["waEye","waOn","WhatsApp"],["emailEye","emailOn","email"]]
    .forEach(function (e) {
      $(e[0]).addEventListener("click", function () {
        S[e[1]] = !S[e[1]];
        this.setAttribute("aria-pressed", String(S[e[1]]));
        this.setAttribute("aria-label", (S[e[1]] ? "Hide " : "Show ") + e[2] + " on your page");
        changed();
      });
    });

  $("phone").addEventListener("input", function () { this.value = digits(this.value); S.phone = this.value; changed(); });
  $("wa").addEventListener("input",    function () { this.value = digits(this.value); S.wa = this.value; changed(); });
  $("email").addEventListener("input", function () { S.email = this.value.trim(); changed(); });

  /* business WhatsApp numbers are often different — so the box is a
     checkbox, not an assumption */
  $("waSame").addEventListener("change", function () {
    S.waSame = this.checked;
    $("waWrap").hidden = this.checked;
    changed();
  });

  /* — the grid — */
  function paintPicks() {
    $("picks").innerHTML = LINKS.map(function (l) {
      var on = !!S.links[l.k];
      return '<button class="pick" type="button" data-k="' + l.k + '" data-on="' + on + '" aria-pressed="' + on + '">' +
             ic(l.k) + "<span>" + esc(l.n) + "</span></button>";
    }).join("");
  }

  $("picks").addEventListener("click", function (e) {
    var b = e.target.closest(".pick"); if (!b) return;
    var k = b.dataset.k;
    if (S.links[k]) { delete S.links[k]; }
    else {
      S.links[k] = { v:"", on:true };
      if (BY[k].kind === "row" && S.order.indexOf(k) < 0) S.order.push(k);
    }
    var added = !!S.links[k];
    paintPicks(); paintAdded(); changed();

    /* The row a chip opens takes the cursor, same as onboarding (Garry,
       2026-09-23) — tap the icon, start typing. Only where there is a real
       pointer, though: on a phone focus opens the keyboard between taps and
       pushes the grid away. preventScroll keeps the browser from jumping
       there; the row is moved into view only when it is actually off screen,
       so picking several in a row leaves the grid where the finger is. */
    if (added) {
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
    /* socials first, in the row's own order and with the arrows that set
       it; the full-width rows after, arranged in "Order on your page" */
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

  /* — custom links, capped at five so the page stays a page, not a list — */
  $("addCustom").addEventListener("click", function () {
    if (S.customs.length >= 5) return;
    var id = "c" + (++cid);
    S.customs.push({ id:id, title:"", url:"", on:true });
    S.order.push(id);
    paintCustoms(); changed();
    var f = document.querySelector('[data-c="' + id + '"] input'); if (f) f.focus();
  });

  function paintCustoms() {
    $("addCustom").hidden = S.customs.length >= 5;
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

  var linkCount = $("linkCount");
  function recount() {
    var n = Object.keys(S.links).filter(function (k) { return S.links[k].v && S.links[k].on; }).length +
            S.customs.filter(function (c) { return c.title && c.on; }).length;
    linkCount.textContent = n + " shown";
  }

  /* — order — */
  var GRIP = '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="6" cy="4" r="1.3"/><circle cx="10" cy="4" r="1.3"/><circle cx="6" cy="8" r="1.3"/><circle cx="10" cy="8" r="1.3"/><circle cx="6" cy="12" r="1.3"/><circle cx="10" cy="12" r="1.3"/></svg>';
  var UP   = '<svg viewBox="0 0 14 14" fill="none"><path d="M3 9l4-4 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var DOWN = '<svg viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* Call, WhatsApp, Email and Add Contact always lead the page, in every
     theme (Garry, 2026-10-05) — so they are not in the reorder list. Only the
     socials block, the link rows and custom buttons move. */
  var FIXED = ["call", "wa", "email", "vcard"];
  function orderable() {
    return S.order.filter(rowLive).filter(function (k) { return FIXED.indexOf(k) < 0; });
  }
  var FIXED_NOTE = '<li class="order__empty">Call, WhatsApp, Email and Add Contact always stay at the top.</li>';
  function paintOrder() {
    var live = orderable();
    if (!live.length) {
      $("order").innerHTML = '<li class="order__empty">Fill something in above and it shows up here.</li>';
      return;
    }
    $("order").innerHTML = FIXED_NOTE + live.map(function (k, i) {
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
    var rest = S.order.filter(function (x) { return live.indexOf(x) < 0 && FIXED.indexOf(x) < 0; });
    S.order = FIXED.concat(live, rest);
    paintOrder(); dirty();
  }
  function move(k, dir) {
    var live = orderable();
    var i = live.indexOf(k), j = i + dir;
    if (i < 0 || j < 0 || j >= live.length) return;
    live.splice(j, 0, live.splice(i, 1)[0]);
    writeBack(live);
  }

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
    var live = orderable();
    var from = live.indexOf(dragKey), to = live.indexOf(li.dataset.k);
    if (from > -1 && to > -1 && from !== to) {
      live.splice(to, 0, live.splice(from, 1)[0]);
      writeBack(live);
    }
    dragKey = null;
  });
  $("order").addEventListener("dragend", function () { dragKey = null; paintOrder(); });

  $("pageLive").addEventListener("change", function () { S.live = this.checked; });

  function paintAll() {
    $("pageLive").checked = S.live;
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
      if (S.face) window.localStorage.setItem("cm.face", S.face);
      if (S.theme) window.localStorage.setItem("cm.theme", S.theme);

      if (CM.saveProfile) {
        CM.saveProfile(S);
      }
    } catch(e) {}
    CM.toast("Page updated · Synced to DB");
    return true;
  }
  function discard() {
    load(SAVED);
    paintAll();
    clean();
  }

  window.addEventListener("cm-profile-synced", function (e) {
    var fresh = e.detail;
    if (!fresh) return;
    if (!bar.hasAttribute("data-on")) {
      if (fresh.theme && fresh.theme !== S.theme) {
        S.theme = fresh.theme;
        SAVED.theme = fresh.theme;
        paintTheme();
      }
      if (fresh.name && fresh.name !== S.name) {
        S.name = fresh.name;
        SAVED.name = fresh.name;
        paintBasics();
      }
      if (fresh.bio !== undefined && fresh.bio !== S.bio) {
        S.bio = fresh.bio;
        SAVED.bio = fresh.bio;
        paintBasics();
      }
      if (fresh.photo && fresh.photo !== S.photo) {
        S.photo = fresh.photo;
        SAVED.photo = fresh.photo;
        paintPhoto();
      }
    }
  });

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
    $("meAv").textContent = (SAVED.name.trim()[0] || SAVED.handle[0] || "?").toUpperCase();
    $("meView").setAttribute("href", ownerUrl());
  }
  /* View page opens the live preview full screen, not a new tab (Garry,
     2026-10-10); the href stays as the no-script fallback */
  var ppFull = null;
  $("meView").removeAttribute("target");
  $("meView").addEventListener("click", function (e) {
    if (!ppFull) { return; }
    e.preventDefault();
    ppFull();
  });
  /* FOLD (Garry, 2026-10-10): the card starts closed — photo, name, Live.
     The header opens it. Height runs on a grid row (0fr → 1fr) so it eases
     open with no jump; the inside only stops clipping once it has settled,
     so the copy tooltip is not cut off and nothing spills mid-animation. */
  (function () {
    var head = $("meHead"), card = head.closest(".me"), body = $("meBody");
    head.addEventListener("click", function () {
      var open = head.getAttribute("aria-expanded") !== "true";
      head.setAttribute("aria-expanded", String(open));
      card.toggleAttribute("data-open", open);
      if (!open) { card.removeAttribute("data-settled"); }
    });
    body.addEventListener("transitionend", function (e) {
      if (e.target === body && card.hasAttribute("data-open")) { card.setAttribute("data-settled", ""); }
    });
  })();
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

  /* ══ LIVE PREVIEW ═════════════════════════════════════════════════════
     Gurdeep's ask, agreed 2026-09-30: edit like onboarding — the page on a
     phone beside the editor, changing as you type. It is the REAL page
     (profile.html?preview=1) in a frame, fed the unsaved state, so every
     theme and row looks exactly as a scan will show it. Desktop: a sticky
     column on the right. Narrower: a "Preview" button opens it as a sheet. */
  (function () {
    var view = document.querySelector("main.view");
    if (!view || !$("savebar")) { return; }

    var wrap = document.createElement("div");
    wrap.className = "pp-wrap";
    view.parentNode.insertBefore(wrap, view);
    wrap.appendChild(view);

    var src = CM.ROOT + "profile.html?view=visitor&chrome=0&preview=1&handle=" +
              encodeURIComponent(S.handle || "") + "&theme=" + encodeURIComponent(S.theme || "light");
    var FULL = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 7.5v-4h4M16.5 7.5v-4h-4M3.5 12.5v4h4M16.5 12.5v4h-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var pp = document.createElement("aside");
    pp.className = "pp";
    pp.setAttribute("aria-label", "Live preview");
    pp.innerHTML =
      '<div class="pp__in">' +
        '<div class="pp__phone" data-device="mobile"><span class="pp__island" aria-hidden="true"></span>' +
          /* Web only, in the column: ⤢ in the browser bar opens it full size */
          '<button class="pp__full" type="button" aria-label="Open full screen">' + FULL + "</button>" +
          '<div class="pp__scr"><iframe title="Your page, as a scan shows it" src="' + src + '"></iframe></div></div>' +
        /* the controls. In the column they sit around the device; full screen
           they become a dock (phones) or a slim top bar (laptops) — the same
           as onboarding (Garry, 2026-10-10) */
        '<div class="pp__ctl">' +
          '<div class="pp__devs" role="group" aria-label="Preview size">' +
            '<button type="button" data-d="mobile" aria-pressed="true">Mobile</button>' +
            '<button type="button" data-d="web" aria-pressed="false">Web</button></div>' +
          /* closed, the theme is one line of text; tap it and the swatches
             open with a × to fold them away again (Garry, 2026-10-08) */
          '<div class="pp__themes" data-open="false" hidden>' +
            '<button class="pp__tt" type="button" aria-expanded="false"><span class="pp__th">Theme · <b></b></span>' +
              '<span class="pp__chg">Change</span></button>' +
            '<div class="pp__tray">' +
              '<div class="pp__tray-top"><span class="pp__th">Theme · <b></b></span>' +
                '<button class="pp__tc" type="button" aria-label="Close themes">' + CM.icon("close") + "</button></div>" +
              '<div class="pp__sws" role="group" aria-label="Page theme"></div></div></div>' +
          '<button class="pp__x" type="button" aria-label="Close preview">' + CM.icon("close") + "<span>Close preview</span></button>" +
        "</div>" +
      "</div>";
    wrap.appendChild(pp);

    /* A small copy of the theme picker under the phone (Garry, 2026-10-03),
       so a theme can be tried while looking at the page rather than after
       scrolling back to the Theme card. Built from that card's own buttons,
       so the two lists can never differ; both write S.theme, and the poll
       below keeps the pair in step. */
    var sws = pp.querySelector(".pp__sws");
    var big = document.querySelectorAll(".theme");
    if (big.length) {
      pp.querySelector(".pp__themes").hidden = false;
      sws.innerHTML = Array.prototype.map.call(big, function (b) {
        var n = (b.querySelector(".theme__n") || {}).textContent || b.dataset.theme;
        return '<button class="pp__sw" type="button" data-theme="' + b.dataset.theme + '" title="' + n +
               '" aria-label="' + n + ' theme"><span class="theme__sw" data-t="' + b.dataset.theme + '"></span>' +
               '<i aria-hidden="true">' + CM.icon("check") + "</i></button>";
      }).join("");
      sws.insertAdjacentHTML("afterend", '<div class="pp__subs" role="group" aria-label="Theme version"></div>');
      var tbox = pp.querySelector(".pp__themes");
      function tray(open) {
        tbox.dataset.open = String(open);
        pp.querySelector(".pp__tt").setAttribute("aria-expanded", String(open));
      }
      pp.querySelector(".pp__tt").addEventListener("click", function () {
        trayFrom = S.theme; trayName = pp.querySelector(".pp__th b").textContent;
        tray(true);
      });
      pp.querySelector(".pp__tc").addEventListener("click", function () { settle(function () { tray(false); }); });
      sws.addEventListener("click", function (e) {
        var b = e.target.closest(".pp__sw"); if (!b) { return; }
        chooseTheme(b.dataset.theme);
        paintMini();
      });
    }
    /* Picking in the tray only previews (Garry, 2026-10-09). Folding it, or
       closing the preview, with a different theme showing asks first — yes
       keeps it for Save, no puts the old one back. Esc / tapping outside
       the question leaves them where they were. */
    var trayFrom = null, trayName = "", asking = false;
    function settle(done) {
      if (trayFrom === null || S.theme === trayFrom) { trayFrom = null; done(); return; }
      if (asking) { return; }
      asking = true;
      CM.dialog({
        title: "Switch your page to " + pp.querySelector(".pp__th b").textContent + "?",
        body: "It\u2019s on " + trayName + " right now. Switching changes it for everyone who scans your code, once you save.",
        actions: [
          { id: "yes", label: "Yes, switch", kind: "go" },
          { id: "no",  label: "Keep " + trayName, kind: "quiet" }
        ],
        onPick: function (id) {
          asking = false;
          if (!id) { return; }
          if (id === "no") { chooseTheme(trayFrom, true); paintMini(); }
          trayFrom = null;
          pp.querySelector(".pp__themes").dataset.open = "false";
          pp.querySelector(".pp__tt").setAttribute("aria-expanded", "false");
          done();
        }
      });
    }
    var miniFor = null;
    function paintMini() {
      if (!big.length || miniFor === S.theme) { return; }
      miniFor = S.theme;
      Array.prototype.forEach.call(sws.children, function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.theme === themeBase(S.theme)));
      });
      paintTheme();   /* keeps both colour rows in step */
      var on = sws.querySelector('[aria-pressed="true"]');
      var ver = subOf(S.theme);
      Array.prototype.forEach.call(pp.querySelectorAll(".pp__th b"), function (b) {
        b.textContent = (on ? on.title : "") + (ver && (!on || ver.n !== on.title) ? " \u00b7 " + ver.n : "");
      });
    }
    paintMini();

    var fab = document.createElement("button");
    fab.type = "button";
    fab.className = "pp-fab";
    fab.innerHTML = CM.icon("eye") + "<span>Preview</span>";
    document.body.appendChild(fab);

    /* FULL SCREEN (Garry, 2026-10-10). The preview is the page itself: a
       phone gets the mobile page edge to edge; a laptop opens on Web at full
       size, and Mobile there stays framed. The column's own Mobile / Web
       comes back on close. */
    function small() { return !window.matchMedia("(min-width:600px)").matches; }
    var colDev = "mobile";
    function openFull() {
      colDev = dev;
      pp.dataset.open = "true"; document.body.dataset.ppOpen = "";
      document.body.style.overflow = "hidden";
      setDev(small() ? "mobile" : "web");
    }
    fab.addEventListener("click", openFull);
    ppFull = openFull;
    pp.querySelector(".pp__full").addEventListener("click", openFull);
    pp.querySelector(".pp__x").addEventListener("click", closeSheet);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeSheet(); } });
    function closeSheet() {
      if (pp.dataset.open !== "true") { return; }
      settle(function () {
        pp.dataset.open = "false"; delete document.body.dataset.ppOpen;
        document.body.style.overflow = "";
        setDev(colDev);
      });
    }

    var frame = pp.querySelector("iframe");

    /* Mobile / Web (Garry, 2026-10-03). The page renders at a real 375px
       phone or 1280px laptop width and is scaled to the frame — tiny on
       Web, but it shows the shape of the page there, which is the point. */
    var dev = "mobile";
    function fitPP() {
      var scr = pp.querySelector(".pp__scr");
      if (!scr.clientWidth) { return; }
      var vw = dev === "web" ? 1280 : 375;
      /* full screen, wherever the page fills the screen it is drawn at the
         screen's own width — real size, not a scaled copy */
      if (pp.dataset.open === "true" && (dev === "web" || small())) { vw = scr.clientWidth; }
      var s = scr.clientWidth / vw;
      frame.style.width = vw + "px";
      frame.style.height = Math.ceil(scr.clientHeight / s) + "px";
      frame.style.transform = "scale(" + s + ")";
    }
    function setDev(d) {
      dev = d;
      pp.querySelector(".pp__phone").dataset.device = dev;
      Array.prototype.forEach.call(pp.querySelectorAll(".pp__devs [data-d]"), function (x) {
        x.setAttribute("aria-pressed", String(x.dataset.d === d));
      });
      fitPP();
      requestAnimationFrame(fitPP);
    }
    pp.querySelector(".pp__devs").addEventListener("click", function (e) {
      var b = e.target.closest("[data-d]"); if (b) { setDev(b.dataset.d); }
    });
    if (window.ResizeObserver) { new ResizeObserver(fitPP).observe(pp.querySelector(".pp__scr")); }
    window.addEventListener("resize", fitPP);
    function page() {
      var links = {};
      Object.keys(S.links).forEach(function (k) {
        var l = S.links[k];
        if (l && l.v && l.on) { links[k] = l.v; }
      });
      return {
        handle: S.handle || "", name: S.name || "", bio: S.bio || "", photo: S.photo || null,
        phone: S.phone && S.phoneOn ? S.phone : "",
        wa: waNumber() && S.waOn ? waNumber() : "",
        email: S.email && S.emailOn ? S.email : "",
        links: links,
        customs: S.customs.filter(function (c) { return c.title && c.on; })
                          .map(function (c) { return { id: c.id, title: c.title, url: c.url }; }),
        theme: S.theme || "light",
        order: S.order.filter(rowLive),
        socialOrder: (S.socialOrder || []).slice()
      };
    }
    /* a cheap poll rather than hooks in every handler above: the editor has
       a dozen ways to change S, and this catches all of them */
    var last = "";
    /* Opened straight from disk (file://) every page is its own opaque
       origin, so a same-origin message never arrives and the preview stayed
       blank. There, "*"; on a real host, same-origin only. */
    function push(force) {
      paintMini();
      var p = page(), j = JSON.stringify(p);
      if (!force && j === last) { return; }
      last = j;
      if (frame.contentWindow) { frame.contentWindow.postMessage({ type: "cm-preview", page: p }, (location.protocol === "file:" ? "*" : location.origin)); }
    }
    window.addEventListener("message", function (e) {
      if ((e.origin === location.origin || location.protocol === "file:") && e.data && e.data.type === "cm-preview-ready") { push(true); }
    });
    frame.addEventListener("load", function () { push(true); });
    setInterval(push, 250);
  })();

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
