/* ==========================================================================
   CODEMARCA — DASHBOARD SHELL + DEMO DATA
   Loaded by every page under dashboard/<flow>/. Two jobs, nothing else:

     1. render the chrome  — sidebar (desktop) / top bar + tabs (mobile)
     2. hand the page a DUMMY account object to draw itself from

   ── FOR THE REACT BUILD ────────────────────────────────────────────────
   · CM.shell()      becomes <DashboardLayout page="home" title="Home">
   · CM.account()    becomes whatever the session/API hook returns.
     The shape of the object it returns is the shape the API should
     answer with — it is written out in full below on purpose.
   · CM.qr()         is a FAKE pattern. It only exists so the UI has
     something QR-shaped to lay out. Swap for a real encoder.
   · the .demo switcher at the bottom-right is a handoff toy. Delete it.

   ── THE ONE REAL DECISION BAKED IN HERE ────────────────────────────────
   A printed code is identified by a PERMANENT id (code.id, e.g. "x7k9m2")
   and resolves at codemarca.com/c/<id>. The handle (codemarca.com/garry)
   is a pretty alias that points at the same profile. That is why changing
   the handle in settings does not brick a sticker that is already stuck
   on something — the sticker never carried the handle in the first place.

   ONE PROFILE = ONE QR, FOR GOOD — decided 2026-09-16, Garry.
   The code is minted with the profile and never changes again. Ordering a
   second pack reprints the SAME code; losing a sticker gets the SAME code
   reprinted too, because the owner already holds every control that matters
   (pause it, edit the page behind it, switch it off). So an account holds a
   single `code`, never a list — which is why the tab is "My QR", one thing
   shown large, and not "Codes", a list of them.

   ========================================================================== */

  (function (window, document) {
    "use strict";

    var CM = {};

    /* ══ 1. THE ACCOUNT ═════════════════════════════════════════════════════
       The dummy account no longer lives in this file. Every flow folder under
       dashboard/ ships its own state.js, which sets:
  
         window.CM_FLOW   = { id, label, home, states:[{ k, label }] }
         window.CM_STATES = { <k>: <account object>, … }
  
       That is what makes the folders worth having: 4-active/state.js only
       ever describes a finished account, 1-empty/state.js only ever an empty
       one, and neither has to carry the other's shape. The switcher at the
       bottom-right moves between the states of THIS flow only — to see a
       different kind of user you open a different folder.
  
       ── FOR THE REACT BUILD ──────────────────────────────────────────────
       CM.account() becomes the session hook. The object shape each state.js
       returns is the shape the API should answer with. */

    var FLOW = window.CM_FLOW || { id: "flow", label: "", states: [] };
    var STATES = window.CM_STATES || {};

    function firstKey() {
      if (FLOW.stages && FLOW.stages[0] && FLOW.stages[0].states[0]) {
        return FLOW.stages[0].id + ":" + FLOW.stages[0].states[0].k;
      }
      return (FLOW.states && FLOW.states[0] && FLOW.states[0].k) || Object.keys(STATES)[0] || "fresh";
    }

    var KEY = "cm.demo." + (FLOW.id || "unified");

    CM.account = function () {
      var q = new URLSearchParams(window.location.search);
      var stage = "page-live";
      var substage = "fresh";

      try {
        stage = window.localStorage.getItem("cm.stage") || (FLOW.id !== "flow" && FLOW.id !== "unified" ? FLOW.id : "page-live");
        substage = window.localStorage.getItem("cm.substage") || "fresh";
      } catch (e) {}

      if (q.get("stage")) {
        stage = q.get("stage");
        try { window.localStorage.setItem("cm.stage", stage); } catch (e) {}
      }
      if (q.get("state")) {
        substage = q.get("state");
        try { window.localStorage.setItem("cm.substage", substage); } catch (e) {}
      }
      if (q.get("username")) {
        try { window.localStorage.setItem("cm.username", q.get("username").toLowerCase().trim()); } catch (e) {}
      }
      if (q.get("name")) {
        try { window.localStorage.setItem("cm.name", q.get("name").trim()); } catch (e) {}
      }

      // Automatically strip ugly query parameters from the address bar so user sees only clean clean URL
      if (window.history && window.history.replaceState && (q.has("username") || q.has("state") || q.has("stage") || q.has("name"))) {
        try {
          var cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (e) {}
      }

      var lookupKey = stage + ":" + substage;
      var base = STATES[lookupKey] || STATES[substage] || STATES[stage] || STATES[firstKey()] || {};
      var acc = JSON.parse(JSON.stringify(base));

      acc.stage = stage;
      acc.substage = substage;
      acc.state = substage;

      var customAccount = null;
      try {
        var raw = window.localStorage.getItem("cm.account.custom");
        if (raw) customAccount = JSON.parse(raw);
      } catch (e) {}

      var customUsername = window.localStorage.getItem("cm.username") ||
                           (customAccount && customAccount.profile && customAccount.profile.handle) ||
                           (acc.profile && acc.profile.handle);
      var customName = window.localStorage.getItem("cm.name") ||
                       (customAccount && customAccount.user && customAccount.user.name) ||
                       (customUsername && customUsername !== "garry" ? customUsername : (acc.user && acc.user.name));

      if (customUsername) {
        customUsername = customUsername.toLowerCase().trim();
        acc.profile = acc.profile || {};
        acc.user = acc.user || {};
        acc.code = acc.code || {};

        acc.profile.handle = customUsername;
        acc.profile.title = customName || customUsername;
        acc.user.name = customName || customUsername;
        acc.user.email = (customAccount && customAccount.user && customAccount.user.email) || (customUsername + "@gmail.com");
        acc.code.id = (customAccount && customAccount.code && customAccount.code.id) || customUsername.slice(0, 8);
        acc.code.url = "codemarca.com/c/" + acc.code.id;

        if (customAccount && customAccount.profile) {
          if (customAccount.profile.photo) acc.profile.photo = customAccount.profile.photo;
          if (customAccount.profile.bio) acc.profile.bio = customAccount.profile.bio;
          if (customAccount.profile.links) acc.profile.links = customAccount.profile.links;
          if (customAccount.profile.theme) acc.profile.theme = customAccount.profile.theme;
        }

        try {
          window.localStorage.setItem("cm.username", customUsername);
          if (customName) window.localStorage.setItem("cm.name", customName);
        } catch (e) {}
      }

      return acc;
    };

    CM.fetchGetValues = function (username, onData) {
      if (!username) return;
      var stage = "page-live";
      var substage = "";
      try {
        stage = window.localStorage.getItem("cm.stage") || (FLOW && FLOW.id) || "page-live";
        substage = window.localStorage.getItem("cm.substage") || "";
      } catch (e) {}
      var url = "/api/dashboard/get-values?username=" + encodeURIComponent(username) +
                "&stage=" + encodeURIComponent(stage) +
                (substage ? "&substage=" + encodeURIComponent(substage) : "");

      fetch(url)
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (data) {
          if (!data || !data.profile) return;
          var p = data.profile;
          var uName = p.display_name || p.username;
          var uInitial = (uName || "?").trim().charAt(0).toUpperCase();

          Array.prototype.forEach.call(document.querySelectorAll(".me__name, [data-fill='profile.title']"), function (el) {
            el.textContent = uName;
          });
          Array.prototype.forEach.call(document.querySelectorAll("[data-fill='profile.handle']"), function (el) {
            el.textContent = p.username;
          });
          Array.prototype.forEach.call(document.querySelectorAll(".me__url b"), function (el) {
            el.textContent = p.username;
          });
          Array.prototype.forEach.call(document.querySelectorAll(".me__av, .avatar"), function (el) {
            if (p.avatar_url && !p.avatar_url.includes("dicebear")) {
              el.innerHTML = '<img src="' + p.avatar_url + '" alt="">';
            } else {
              el.textContent = uInitial;
            }
          });
          Array.prototype.forEach.call(document.querySelectorAll(".side__me__name"), function (el) {
            el.textContent = uName;
          });
          Array.prototype.forEach.call(document.querySelectorAll(".side__me__mail"), function (el) {
            el.textContent = p.email || (p.username + "@gmail.com");
          });

          try {
            var saved = JSON.parse(localStorage.getItem("cm.account.custom") || "{}");
            saved.user = saved.user || {};
            saved.profile = saved.profile || {};
            saved.user.name = uName;
            saved.user.email = p.email || (p.username + "@gmail.com");
            saved.profile.handle = p.username;
            saved.profile.title = uName;
            saved.profile.bio = p.bio || "";
            if (p.avatar_url) saved.profile.photo = p.avatar_url;
            if (p.theme) saved.profile.theme = p.theme;
            localStorage.setItem("cm.account.custom", JSON.stringify(saved));
            localStorage.setItem("cm.username", p.username);
            localStorage.setItem("cm.name", uName);
            if (data.stage) localStorage.setItem("cm.stage", data.stage);
            if (data.substage) localStorage.setItem("cm.substage", data.substage);
          } catch(e) {}

          if (typeof onData === "function") onData(data);
        })
        .catch(function () {});
    };

    CM.setState = function (k) {
      if (k && k.indexOf(":") !== -1) {
        var parts = k.split(":");
        try {
          window.localStorage.setItem("cm.stage", parts[0]);
          window.localStorage.setItem("cm.substage", parts[1]);
        } catch (e) {}
      } else {
        try {
          window.localStorage.setItem(KEY, k);
          window.localStorage.setItem("cm.substage", k);
        } catch (e) {}
      }
      /* drop any ?state= or ?stage= from the address */
      var u = new URL(window.location.href);
      u.searchParams.delete("state");
      u.searchParams.delete("stage");
      window.location.href = u.pathname;
    };

    /* ══ 2. ICONS ═══════════════════════════════════════════════════════════ */

    var I = {
      home: '<path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
      user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
      box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>',
      qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20v.01M20 20v.01M17.5 20v.01M20 17.5v.01"/>',
      gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
      chev: '<path d="m9 6 6 6-6 6"/>',
      close: '<path d="M6 6l12 12M18 6L6 18"/>',
      back: '<path d="m15 6-6 6 6 6"/>',
      check: '<path d="m5 12 5 5L19 7"/>',
      copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
      share: '<path d="M12 15V3m0 0L8 7m4-4 4 4"/><path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/>',
      eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
      lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      truck: '<path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
      spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
      pen: '<path d="M4 20h4L20 8l-4-4L4 16z"/>',
      out: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 8 6 12l4 4M6 12h10"/>',
      link: '<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 1 0-5.7-5.7l-1.4 1.4"/><path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 1 0 5.7 5.7l1.4-1.4"/>',
      grip: '<circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/>',
      card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19M6 14.5h4"/>',
      tag: '<path d="M3 11.2V4.5A1.5 1.5 0 0 1 4.5 3h6.7a2 2 0 0 1 1.4.6l7.8 7.8a2 2 0 0 1 0 2.8l-6.2 6.2a2 2 0 0 1-2.8 0L3.6 12.6a2 2 0 0 1-.6-1.4Z"/><circle cx="7.8" cy="7.8" r="1.4"/>',
      pause: '<rect x="8" y="5" width="3" height="14" rx="1"/><rect x="13" y="5" width="3" height="14" rx="1"/>',
      play: '<path d="M8 5.5v13l11-6.5z"/>',
      trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"/>',
      down: '<path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M5 19h14"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
      phone: '<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6L16.5 13l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"/>',
      shield: '<path d="M12 3.2 5 6v5.4c0 4 2.9 7.7 7 9.4 4.1-1.7 7-5.4 7-9.4V6z"/><path d="m9 12 2 2 4-4"/>',
      help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.4v.3"/><path d="M12 17v.01"/>',
      bell: '<path d="M18 9a6 6 0 1 0-12 0c0 4.2-1.3 5.6-1.9 6.2a.9.9 0 0 0 .6 1.5h14.6a.9.9 0 0 0 .6-1.5c-.6-.6-1.9-2-1.9-6.2Z"/><path d="M10.2 20a2.1 2.1 0 0 0 3.6 0"/>',
      more: '<circle cx="5.5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.5" cy="12" r="1.5"/>',
      gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12M12 8v13"/><path d="M12 8C10.6 5.2 7 4.6 7 6.6 7 8 9.8 8 12 8Zm0 0c1.4-2.8 5-3.4 5-1.4C17 8 14.2 8 12 8Z"/>'
    };

    /* SOLID SET — worn by the current nav item, in the sidebar and in the
       bottom tabs. Every outline above is a closed shape, so filling it gives
       the same silhouette with no jump between states; only the gear needs a
       path of its own, because it has to keep the hole in the middle and an
       even-odd subpath is what puts it there. */
    var IF = {
      /* stroke-less, so the 2px ribbon down the middle stays open when filled */
      gift: '<g stroke="none"><path d="M2.1 8.7a1.6 1.6 0 0 1 1.6-1.6H11v5.2H3.7a1.6 1.6 0 0 1-1.6-1.6z"/><path d="M13 7.1h7.3a1.6 1.6 0 0 1 1.6 1.6v2a1.6 1.6 0 0 1-1.6 1.6H13z"/><path d="M4.1 13.3H11v8.6H6.1a2 2 0 0 1-2-2z"/><path d="M13 13.3h6.9v6.6a2 2 0 0 1-2 2H13z"/><path d="M11 7.1C9.6 4.3 6.2 3.6 6.2 5.8c0 1.3 1.9 1.3 4.8 1.3Z"/><path d="M13 7.1c1.4-2.8 4.8-3.5 4.8-1.3 0 1.3-1.9 1.3-4.8 1.3Z"/></g>',
      more: '<g stroke="none"><circle cx="5.5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18.5" cy="12" r="2"/></g>',
      gear: '<path fill-rule="evenodd" d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1zM12 9.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8z"/>'
    };

    CM.icon = function (name, cls) {
      return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        (I[name] || "") + "</svg>";
    };

    CM.iconSolid = function (name, cls) {
      return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="currentColor" ' +
        'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ' +
        'aria-hidden="true">' + (IF[name] || I[name] || "") + "</svg>";
    };

    /* the wordmark and the mark, lifted from checkout.html so every screen
       in the product is carrying the same file */
    var LOGO_WM = '<svg class="wm" viewBox="0 0 257 40" fill="none" role="img" aria-label="Codemarca"><g fill="#6E27E6"><path d="M33.1134 20.2323H23.257C21.5532 20.2323 20.1719 18.851 20.1719 17.1473V7.29084C20.1719 5.58706 18.7907 4.20581 17.0869 4.20581H7.2291C5.52529 4.20581 4.14404 5.58706 4.14404 7.29084V17.1479C4.14404 18.8517 5.52529 20.233 7.2291 20.233H17.0855C18.7893 20.233 20.1706 21.6142 20.1706 23.318V33.1744C20.1706 34.8782 21.5518 36.2595 23.2556 36.2595H33.1134C34.8172 36.2595 36.1984 34.8782 36.1984 33.1744V23.3173C36.1984 21.6135 34.8172 20.2323 33.1134 20.2323Z"/><path d="M31.7853 17.9021C35.4337 16.3909 37.1662 12.2083 35.655 8.55988C34.1438 4.9115 29.9612 3.17899 26.3128 4.69019C22.6644 6.20139 20.9319 10.3841 22.4431 14.0324C23.9543 17.6808 28.137 19.4133 31.7853 17.9021Z"/><path d="M11.2943 36.2599C15.2432 36.2599 18.4445 33.0587 18.4445 29.1097C18.4445 25.1607 15.2432 21.9595 11.2943 21.9595C7.34533 21.9595 4.14404 25.1607 4.14404 29.1097C4.14404 33.0587 7.34533 36.2599 11.2943 36.2599Z"/></g><g fill="#101215"><path d="M245.956 14.0999H252.172V34.82H245.956V32.8723C244.589 34.447 242.558 35.4002 239.782 35.4002C234.353 35.4002 229.877 30.6345 229.877 24.46C229.877 18.2854 234.353 13.5198 239.782 13.5198C242.558 13.5198 244.589 14.4729 245.956 16.0476V14.0999ZM241.025 29.5157C243.884 29.5157 245.956 27.568 245.956 24.46C245.956 21.352 243.884 19.4043 241.025 19.4043C238.165 19.4043 236.093 21.352 236.093 24.46C236.093 27.568 238.165 29.5157 241.025 29.5157Z"/><path d="M220.695 35.4002C214.396 35.4002 209.713 30.6345 209.713 24.46C209.713 18.2854 214.396 13.5198 220.695 13.5198C224.714 13.5198 228.278 15.6332 230.06 18.8241L224.631 21.9736C223.927 20.5232 222.435 19.6529 220.612 19.6529C217.918 19.6529 215.929 21.6006 215.929 24.46C215.929 27.3193 217.918 29.267 220.612 29.267C222.435 29.267 223.968 28.3968 224.631 26.9464L230.06 30.0544C228.278 33.2867 224.756 35.4002 220.695 35.4002Z"/><path d="M203.477 17.7881C204.306 15.0116 207.083 13.6855 209.693 13.6855V20.7304C207.124 20.316 203.477 21.352 203.477 25.4545V34.82H197.261V14.1H203.477V17.7881Z"/><path d="M187.728 14.0999H193.944V34.82H187.728V32.8723C186.361 34.447 184.33 35.4002 181.554 35.4002C176.125 35.4002 171.649 30.6345 171.649 24.46C171.649 18.2854 176.125 13.5198 181.554 13.5198C184.33 13.5198 186.361 14.4729 187.728 16.0476V14.0999ZM182.797 29.5157C185.656 29.5157 187.728 27.568 187.728 24.46C187.728 21.352 185.656 19.4043 182.797 19.4043C179.937 19.4043 177.865 21.352 177.865 24.46C177.865 27.568 179.937 29.5157 182.797 29.5157Z"/><path d="M161.806 13.5198C166.571 13.5198 169.679 16.9179 169.679 22.0979V34.82H163.463V22.6366C163.463 20.5646 162.469 19.2385 160.479 19.2385C158.407 19.2385 157.247 20.6889 157.247 23.1339V34.82H151.031V22.6366C151.031 20.5646 150.037 19.2385 148.047 19.2385C145.975 19.2385 144.815 20.6889 144.815 23.1339V34.82H138.599V14.0999H144.815V16.0062C145.768 14.5972 147.592 13.5198 150.368 13.5198C152.813 13.5198 154.636 14.5143 155.797 16.2548C156.957 14.5972 158.863 13.5198 161.806 13.5198Z"/><path d="M121.357 26.9464C122.144 29.1013 124.051 29.8472 126.33 29.8472C128.029 29.8472 129.479 29.1841 130.308 28.2725L135.281 31.1318C133.25 33.9497 130.184 35.4002 126.247 35.4002C119.161 35.4002 114.768 30.6345 114.768 24.46C114.768 18.2854 119.244 13.5198 125.791 13.5198C131.841 13.5198 136.317 18.2025 136.317 24.46C136.317 25.3302 136.234 26.159 136.068 26.9464H121.357ZM121.233 22.3051H130.142C129.479 19.9016 127.614 19.0313 125.75 19.0313C123.388 19.0313 121.813 20.1916 121.233 22.3051Z"/><path d="M106.271 5.81201H112.487V34.8201H106.271V32.8724C104.903 34.4471 102.873 35.4002 100.096 35.4002C94.6674 35.4002 90.1919 30.6346 90.1919 24.4601C90.1919 18.2855 94.6674 13.5199 100.096 13.5199C102.873 13.5199 104.903 14.473 106.271 16.0477V5.81201ZM101.339 29.5158C104.199 29.5158 106.271 27.5681 106.271 24.4601C106.271 21.3521 104.199 19.4044 101.339 19.4044C98.4799 19.4044 96.4079 21.3521 96.4079 24.4601C96.4079 27.5681 98.4799 29.5158 101.339 29.5158Z"/><path d="M77.9738 35.4002C71.8821 35.4002 66.9922 30.6345 66.9922 24.46C66.9922 18.2854 71.8821 13.5198 77.9738 13.5198C84.0655 13.5198 88.9554 18.2854 88.9554 24.46C88.9554 30.6345 84.0655 35.4002 77.9738 35.4002ZM77.9738 29.3499C80.6674 29.3499 82.7394 27.4022 82.7394 24.46C82.7394 21.5177 80.6674 19.57 77.9738 19.57C75.2802 19.57 73.2082 21.5177 73.2082 24.46C73.2082 27.4022 75.2802 29.3499 77.9738 29.3499Z"/><path d="M57.8088 35.4002C51.5099 35.4002 46.8271 30.6345 46.8271 24.46C46.8271 18.2854 51.5099 13.5198 57.8088 13.5198C61.8285 13.5198 65.3923 15.6332 67.1742 18.8241L61.7456 21.9736C61.0411 20.5232 59.5493 19.6529 57.7259 19.6529C55.0323 19.6529 53.0432 21.6006 53.0432 24.46C53.0432 27.3193 55.0323 29.267 57.7259 29.267C59.5493 29.267 61.0825 28.3968 61.7456 26.9464L67.1742 30.0544C65.3923 33.2867 61.8699 35.4002 57.8088 35.4002Z"/></g></svg>';
    var LOGO_MK = '<svg class="mk" viewBox="0 0 40 40" fill="#6E27E6" role="img" aria-label="Codemarca"><path d="M33.1134 20.2323H23.257C21.5532 20.2323 20.1719 18.851 20.1719 17.1473V7.29084C20.1719 5.58706 18.7907 4.20581 17.0869 4.20581H7.2291C5.52529 4.20581 4.14404 5.58706 4.14404 7.29084V17.1479C4.14404 18.8517 5.52529 20.233 7.2291 20.233H17.0855C18.7893 20.233 20.1706 21.6142 20.1706 23.318V33.1744C20.1706 34.8782 21.5518 36.2595 23.2556 36.2595H33.1134C34.8172 36.2595 36.1984 34.8782 36.1984 33.1744V23.3173C36.1984 21.6135 34.8172 20.2323 33.1134 20.2323Z"/><path d="M31.7853 17.9021C35.4337 16.3909 37.1662 12.2083 35.655 8.55988C34.1438 4.9115 29.9612 3.17899 26.3128 4.69019C22.6644 6.20139 20.9319 10.3841 22.4431 14.0324C23.9543 17.6808 28.137 19.4133 31.7853 17.9021Z"/><path d="M11.2943 36.2599C15.2432 36.2599 18.4445 33.0587 18.4445 29.1097C18.4445 25.1607 15.2432 21.9595 11.2943 21.9595C7.34533 21.9595 4.14404 25.1607 4.14404 29.1097C4.14404 33.0587 7.34533 36.2599 11.2943 36.2599Z"/></svg>';

    /* ══ 3. NAV ═════════════════════════════════════════════════════════════
       Orders and Code grey out until the account actually has one. They
       stay clickable — the page behind them explains itself. */

    /* GIFT & REFER — added 2026-09-18, Garry. Gifts are paid and live on a
       tab of their own, in every flow, so the free pack never has to ask who
       it is for.
  
       MORE — 2026-09-24, Garry. The phone bar holds five and the sidebar
       holds six, so on the phone the two tabs nobody opens daily — Gift &
       Refer and Settings — moved behind one More button (`more: true`), and
       the bar carries four real tabs plus it. The sidebar is untouched: on a
       desktop all six still stand in the rail. */
    var NAV = [
      { id: "home", label: "Home", href: "home.html", icon: "home" },
      { id: "profile", label: "Profile", href: "profile.html", icon: "user" },
      { id: "orders", label: "Orders", href: "orders.html", icon: "box" },
      { id: "qr", label: "My QR", href: "qr.html", icon: "qr" },
      {
        id: "gift", label: "Gift & Refer", href: "gift.html", icon: "gift",
        more: true, sub: "Gift a pack, invite friends, your tee"
      },
      {
        id: "settings", label: "Settings", href: "settings.html", icon: "gear",
        more: true, sub: "Account, email, password, log out"
      }
    ];

    /* Everything outside the flow folder is resolved dynamically based on depth.
       Under dashboard/ directly it is ../, under dashboard/<flow>/ it is ../../ */
    CM.ROOT = (function () {
      var p = window.location.pathname;
      if (/\/[1-4]-[^\/]+\//.test(p)) {
        return "../../";
      }
      if (p.indexOf("/dashboard/") !== -1) {
        return "../";
      }
      return "./";
    })();

    function navFlags(a) {
      return {
        /* a gift is an order too — someone who has only ever gifted still has a bill to see */
        orders: {
          locked: !a.order && !(a.gifts && a.gifts.length),
          dot: !!(a.order && a.order.status !== "delivered")
        },
        qr: { locked: false, dot: false },
        profile: { locked: !a.profile, dot: !a.profile }
      };
    }

    /* ══ 4. SHELL ═══════════════════════════════════════════════════════════ */

    CM.shell = function (opts) {
      var a = CM.account();
      var f = navFlags(a);
      var app = document.querySelector(".app");
      var main = document.querySelector(".app__main");
      var initial = (a.user.name || "?").trim().charAt(0).toUpperCase();

      /* — sidebar, desktop — */
      var side = document.createElement("aside");
      side.className = "side";
      side.innerHTML =
        '<a class="side__logo" href="' + CM.ROOT + 'homepage.html" aria-label="Codemarca home">' + LOGO_WM + "</a>" +
        '<nav class="side__nav" aria-label="Dashboard">' +
        NAV.map(function (n) {
          var s = f[n.id] || {};
          var cur = n.id === opts.page;
          return '<a class="side__link" href="' + n.href + '"' +
            (cur ? ' aria-current="page"' : "") +
            (s.locked ? ' data-locked=""' : "") + ">" +
            (cur ? CM.iconSolid(n.icon) : CM.icon(n.icon)) + "<span>" + n.label + "</span>" +
            (s.dot ? '<span class="side__dot" aria-hidden="true"></span>' : "") +
            "</a>";
        }).join("") +
        "</nav>" +
        '<a class="side__me" href="settings.html">' +
        '<span class="avatar">' + initial + "</span>" +
        '<span class="side__me__txt">' +
        '<span class="side__me__name">' + a.user.name + "</span>" +
        '<span class="side__me__mail">' + a.user.email + "</span>" +
        "</span>" +
        "</a>";
      app.insertBefore(side, app.firstChild);

      /* — top bar, mobile — */
      var top = document.createElement("header");
      top.className = "top";
      top.innerHTML =
        (opts.back
          ? '<a class="top__back" href="' + opts.back + '" aria-label="Back">' + CM.icon("back") + "</a>" +
          '<span class="top__title">' + (opts.title || "") + "</span>"
          : '<a class="top__logo" href="' + CM.ROOT + 'homepage.html" aria-label="Codemarca home">' + LOGO_MK + "</a>" +
          '<span class="top__title">' + (opts.title || "") + "</span>") +
        /* The avatar used to sit here and open Settings. Settings moved into
           More on the bar (2026-09-24), so the corner is the bell's now. */
        '<span class="top__end">' +
        '<button class="top__bell bell" type="button" data-bell aria-haspopup="dialog" ' +
        'aria-label="Notifications">' + CM.icon("bell") + '<span class="bell__n" hidden></span></button>' +
        "</span>";
      main.insertBefore(top, main.firstChild);

      /* — the bell, desktop — Garry, 2026-09-27. The phone had it in the top
         bar; the desktop has no top bar, so it gets a strip of its own above
         the page head, the same width as the content column, so the bell
         lands over the right edge of the cards on every tab. */
      var dbar = document.createElement("div");
      dbar.className = "dbar";
      dbar.innerHTML =
        '<button class="dbar__bell bell" type="button" data-bell aria-haspopup="dialog" aria-expanded="false" ' +
        'aria-label="Notifications">' + CM.icon("bell") + '<span class="bell__n" hidden></span></button>';
      main.insertBefore(dbar, top.nextSibling);
      var onScroll = function () { top.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false"); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      /* — bottom tabs, mobile — */
      var tabs = document.createElement("nav");
      tabs.className = "tabs";
      tabs.setAttribute("aria-label", "Dashboard");
      var inMore = NAV.filter(function (n) { return n.more; });
      var onMore = inMore.some(function (n) { return n.id === opts.page; });

      /* More sits at the tail of the bar (Garry, 2026-09-24), so Home keeps the
         first slot. It lights up violet the same way a tab does while you are
         standing on one of the screens it holds, so the bar never says "you
         are nowhere". */
      tabs.innerHTML =
        NAV.filter(function (n) { return n.tabs !== false && !n.more; }).map(function (n) {
          var s = f[n.id] || {};
          var cur = n.id === opts.page;
          return '<a class="tabs__link" href="' + n.href + '"' +
            (cur ? ' aria-current="page"' : "") +
            (s.locked ? ' data-locked=""' : "") + ">" +
            (cur ? CM.iconSolid(n.icon) : CM.icon(n.icon)) + "<span>" + n.label + "</span>" +
            (s.dot ? '<span class="tabs__dot" aria-hidden="true"></span>' : "") +
            "</a>";
        }).join("") +
        '<button class="tabs__link" type="button" data-more' +
        (onMore ? ' aria-current="page"' : "") + ' aria-haspopup="dialog">' +
        (onMore ? CM.iconSolid("more") : CM.icon("more")) + "<span>More</span>" +
        "</button>";
      app.appendChild(tabs);

      CM.notes.mount(a, top.querySelector("[data-bell]"), dbar);

      tabs.querySelector("[data-more]").addEventListener("click", function () {
        CM.sheet({
          title: "More",
          html: '<div class="more">' + inMore.map(function (n) {
            var cur = n.id === opts.page;
            return '<a class="more__row" href="' + n.href + '"' +
              (cur ? ' aria-current="page"' : "") + ">" +
              '<span class="more__ic">' + CM.icon(n.icon) + "</span>" +
              '<span class="more__txt"><span class="more__l">' + n.label + "</span>" +
              '<span class="more__s">' + n.sub + "</span></span>" +
              '<span class="more__go">' + CM.icon("chev") + "</span>" +
              "</a>";
          }).join("") + "</div>"
        });
      });

      /* Deferred by a tick on purpose: not every home calls CM.draw, and the
         ones that do write the initial into .me__av after the shell has run.
         A timeout of 0 lands after the page's own script, whichever way it
         fills the card (Garry, 2026-09-24 — one page, one look). */
      setTimeout(function () { paintAvatar(a); }, 0);

      CM.foldCards();
      CM.fold();
      mountDemo(a);
      if (a && a.profile && a.profile.handle) {
        CM.fetchGetValues(a.profile.handle);
      }
      return a;
    };

    /* ══ 4b. LONG NOTES FOLD ON A PHONE ═════════════════════════════════════
       Garry, 2026-09-24: the Orders tab reads fine on a desktop and is too
       much on a phone. The fix is NOT less copy on the phone — someone who
       reads the app and then the site has to find the same product, not two
       different explanations. So the words stay identical and simply do not
       all land at once: a paragraph marked `data-fold` clamps to two lines
       under 1024px with a More / Less toggle, and stands open on a desktop.
  
       The button appears only when the text actually overflows those two
       lines, so marking a short note costs nothing. Measured after the
       webfont lands, because Manrope wraps differently from the fallback. */
    CM.fold = function (root) {
      var mq = window.matchMedia("(max-width:1023px)");

      /* `data-fold="card"` is the other folder's, below — this one only ever
         clamps text, and matching a card here would clip the whole card. */
      Array.prototype.forEach.call(
        (root || document).querySelectorAll('[data-fold]:not([data-fold="card"])'), function (p) {
          if (p.dataset.foldReady) { return; }
          p.dataset.foldReady = "1";
          p.classList.add("fold");

          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "fold__btn";
          p.insertAdjacentElement("afterend", btn);

          var open = false;
          function sync() {
            if (!mq.matches) {                  /* desktop: nothing is folded */
              p.dataset.open = "true";
              btn.hidden = true;
              return;
            }
            p.dataset.open = open ? "true" : "false";
            if (!open) { btn.hidden = p.scrollHeight - p.clientHeight <= 2; }
            btn.textContent = open ? "Less" : "More";
            btn.setAttribute("aria-expanded", open ? "true" : "false");
          }

          /* A note inside a closed accordion measures zero, so the folder has
             to be asked again the moment the panel opens — CM.refold(panel). */
          p._foldSync = sync;
          btn.addEventListener("click", function () { open = !open; sync(); });
          /* a rotate or a resize across the breakpoint re-folds it */
          (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(
            function () { open = false; sync(); }
          );
          sync();
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () { if (!open) { sync(); } });
          }
        });
    };

    /* A WHOLE CARD FOLDS ON A PHONE — same reasoning, one level up.
       `data-fold="card"` keeps the card's title on screen and puts the rest
       behind it: a supporting card is still announced, it just does not spend
       a third of a phone screen explaining itself before the list the tab is
       actually for. Open on a desktop, where there is room for all of it. */
    CM.foldCards = function (root) {
      var mq = window.matchMedia("(max-width:1023px)");

      Array.prototype.forEach.call(
        (root || document).querySelectorAll('[data-fold="card"]'), function (card) {
          if (card.dataset.foldReady) { return; }
          card.dataset.foldReady = "1";
          card.classList.add("foldc");

          var title = card.firstElementChild;
          var body = document.createElement("div");
          body.className = "foldc__body";
          while (title.nextSibling) { body.appendChild(title.nextSibling); }
          card.appendChild(body);

          var head = document.createElement("button");
          head.type = "button";
          head.className = "foldc__head";
          card.insertBefore(head, title);
          head.appendChild(title);
          head.insertAdjacentHTML("beforeend",
            '<span class="foldc__chev">' + CM.icon("chev") + "</span>");

          var open = false;
          function sync() {
            var shut = mq.matches && !open;
            body.hidden = shut;
            head.setAttribute("aria-expanded", String(!shut));
            head.disabled = !mq.matches;
          }
          head.addEventListener("click", function () {
            open = !open;
            sync();
            /* a clamped paragraph inside measured zero while the card was
               shut, so its own More button has to be worked out now */
            if (!body.hidden) { CM.refold(body); }
          });
          (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(
            function () { open = false; sync(); }
          );
          sync();
        });
    };

    CM.refold = function (root) {
      Array.prototype.forEach.call(
        (root || document).querySelectorAll('[data-fold]:not([data-fold="card"])'), function (p) {
          if (p._foldSync) { p._foldSync(); }
        });
    };

    /* ══ 5. FAKE QR ═════════════════════════════════════════════════════════
       A plausible-looking module grid so the layout can be judged. It encodes
       NOTHING. Replace with a real encoder over codemarca.com/c/<code id>. */

    CM.qr = function (seed) {
      var N = 25, i, x, y, h = 2166136261;
      for (i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = (h * 16777619) >>> 0; }
      function rnd() { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; }

      function finder(fx, fy) {
        return '<rect x="' + fx + '" y="' + fy + '" width="7" height="7" rx="1.6" fill="#101215"/>' +
          '<rect x="' + (fx + 1.4) + '" y="' + (fy + 1.4) + '" width="4.2" height="4.2" rx="1" fill="#fff"/>' +
          '<rect x="' + (fx + 2.4) + '" y="' + (fy + 2.4) + '" width="2.2" height="2.2" rx=".6" fill="#6E27E6"/>';
      }
      function reserved(cx, cy) {
        return (cx < 8 && cy < 8) || (cx > N - 9 && cy < 8) || (cx < 8 && cy > N - 9);
      }

      var mods = "";
      for (y = 0; y < N; y++) {
        for (x = 0; x < N; x++) {
          if (reserved(x, y)) continue;
          if (rnd() > 0.52) {
            mods += '<rect x="' + x + '" y="' + y + '" width="1" height="1" rx=".22" fill="#101215"/>';
          }
        }
      }
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ' +
        (N + 2) + " " + (N + 2) + '" role="img" ' +
        'aria-label="QR code for this Codemarca profile"><rect x="-1" y="-1" width="' + (N + 2) +
        '" height="' + (N + 2) + '" fill="#fff"/>' + mods +
        finder(0, 0) + finder(N - 7, 0) + finder(0, N - 7) + "</svg>";
    };

    /* ── THE FIVE TEES ───────────────────────────────────────────────────
       The referral reward, drawn rather than photographed until the mockups
       exist. One black tee outline; each design only changes where the code
       sits and what is printed beside it. The code keeps its white ground on
       purpose — a QR printed dark-on-black is a QR that does not scan.
       Shared by every home that sells the tee (2-page-live, 4-active). */

    CM.TEES = [
      { k: "pocket", n: "Pocket", s: "Small code, left chest", side: "Front", qr: [64, 30, 17] },
      { k: "centre", n: "Front centre", s: "Big code across the chest", side: "Front", qr: [40, 34, 40] },
      { k: "name", n: "Name tag", s: "Code with your name under it", side: "Front", qr: [45, 30, 30], name: true },
      { k: "back", n: "Big back", s: "Plain front, code on the back", side: "Back", qr: [35, 28, 50] },
      { k: "hem", n: "Low corner", s: "Small code near the hem", side: "Front", qr: [70, 88, 16] }
    ];

    CM.tee = function (d, pattern, a) {
      var back = d.side === "Back";
      var neck = back ? "C72 13 48 13 42 10" : "C74 18 46 18 42 10";
      var rib = back ? "M42 10 C48 13 72 13 78 10" : "M42 10 C46 18 74 18 78 10";
      var q = d.qr;
      var code = pattern.replace("<svg ", '<svg x="' + q[0] + '" y="' + q[1] +
        '" width="' + q[2] + '" height="' + q[2] + '" ');
      var name = d.name
        ? '<text x="60" y="71" text-anchor="middle" fill="#fff" font-family="Manrope,sans-serif" ' +
        'font-size="7.5" font-weight="800" letter-spacing="1.2">' +
        (a.user.name.split(" ")[0] || "").toUpperCase() + "</text>" +
        '<text x="60" y="79" text-anchor="middle" fill="rgba(255,255,255,.55)" ' +
        'font-family="JetBrains Mono,monospace" font-size="3.9">' +
        (a.profile ? CM.url(a.profile.handle) : "codemarca.com/you") + "</text>"
        : "";
      return '<svg viewBox="0 0 120 120" aria-hidden="true">' +
        '<path d="M42 10 L20 16 L4 38 L18 48 L26 41 L26 112 Q26 114 28 114 L92 114 Q94 114 94 112 ' +
        'L94 41 L102 48 L116 38 L100 16 L78 10 ' + neck + ' Z" fill="#0B0B0D" stroke="rgba(255,255,255,.14)" stroke-width=".8"/>' +
        '<path d="' + rib + '" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.2"/>' +
        code + name + "</svg>";
    };

    /* ── THE FREE TEE CARD ───────────────────────────────────────────────
       Paints the light referral card (.rf in home.css): meter, subline, the
       five tees and the invite buttons. `pattern` is the square to print on
       the tees — the account's own code, or a sample when it has none yet.
       INVITE LINK = HANDLE = PAGE: an account with no page has
       `referrals.link: null` and its card carries a locked row, not buttons. */

    CM.referCard = function (a, pattern) {
      /* an account that never had a page has no referrals block — no handle,
         no invite link. Same shape, all zeroes, so the card still paints. */
      var R = a.referrals ||
        (a.referrals = { counted: 0, goal: 50, waiting: 0, people: [], link: null, claimed: false });
      var refUrl = R.link ? "https://" + R.link : null;
      var left = Math.max(0, R.goal - R.counted);
      document.getElementById("rfFill").style.width = Math.min(100, R.counted / R.goal * 100) + "%";
      document.getElementById("rfBar").setAttribute("aria-valuenow", R.counted);
      document.getElementById("rfSub").innerHTML = R.counted === 0
        ? "Your first friend who finishes their page puts you at <b>1</b>."
        : "<b>" + left + " more</b> to go" +
        (R.waiting ? " · " + R.waiting + " friends are still building their page" : "");

      document.getElementById("tees").innerHTML = CM.TEES.map(function (d) {
        /* picture only — no name, no description (Garry, 2026-09-27). The
           designs are the kind of thing you point at, not read, and real
           photographs land here later. The name rides along for the picker. */
        return '<div class="rf__tee" title="' + d.n + '" aria-label="' + d.n + '">' +
          '<span class="rf__fig">' + CM.tee(d, pattern, a) +
          '<span class="rf__side">' + d.side + "</span></span>" +
          "</div>";
      }).join("");

      /* no link without a page — the card shows the locked row instead */
      if (!R.link) { return; }
      document.querySelector("[data-copy-ref]").addEventListener("click", function () {
        CM.copy(refUrl, "Invite link copied");
      });
      document.querySelector("[data-share-ref]").addEventListener("click", function () {
        CM.shareSheet({ title: "Invite friends", url: refUrl, name: a.profile.title });
      });
    };

    /* ══ 6. SMALL HELPERS ═══════════════════════════════════════════════════ */

    /* ── THE CONDITIONAL LAYER ────────────────────────────────────────────
       Three passes every dashboard page used to repeat by hand. Splitting
       the dashboard into flow folders multiplied that copy by five, so it
       moved in here instead.
  
         data-when="a b"    keep this node only in these states of this flow
         data-fill="x.y"    write a dot-path value out of the account object
         data-ic="name"     paint an icon inside
         data-ic-in="name"  REPLACE the node with the icon
         data-ic-btn="name" paint an icon at the end
  
       Call it once, after the page has done its own conditional work:
  
           CM.draw(a, { "user.first": "Garry" })
  
       `extra` wins over the account, for values that are derived rather
       than stored — CM.derived(a) supplies the two every screen needs. */

    /* the card wears the page's own photo when there is one; the initial is
       the fallback, not the rule */
    function paintAvatar(a) {
      if (!a || !a.profile || !a.profile.photo) { return; }
      Array.prototype.forEach.call(document.querySelectorAll(".me__av"), function (el) {
        if (el.querySelector("img")) { return; }
        el.innerHTML = '<img src="' + a.profile.photo + '" alt="">';
      });
    }

    CM.draw = function (a, extra) {
      extra = extra || {};

      Array.prototype.forEach.call(document.querySelectorAll("[data-flow]"), function (el) {
        var flows = el.getAttribute("data-flow").split(" ");
        if (flows.indexOf(a.stage || "page-live") === -1) {
          el.hidden = true;
        } else {
          el.hidden = false;
        }
      });

      Array.prototype.forEach.call(document.querySelectorAll("[data-when]"), function (el) {
        if (el.hasAttribute("data-flow") && el.getAttribute("data-flow").split(" ").indexOf(a.stage || "page-live") === -1) {
          el.hidden = true;
          return;
        }
        var whens = el.getAttribute("data-when").split(" ");
        var curState = a.substage || a.state || "fresh";
        if (whens.indexOf(curState) === -1 && whens.indexOf(a.state) === -1) {
          el.hidden = true;
        } else {
          el.hidden = false;
        }
      });

      Array.prototype.forEach.call(document.querySelectorAll("[data-fill]"), function (el) {
        var k = el.getAttribute("data-fill");
        var v = (k in extra) ? extra[k]
          : k.split(".").reduce(function (o, p) { return o == null ? o : o[p]; }, a);
        if (v !== undefined && v !== null && v !== "") { el.textContent = v; }
      });

      paintAvatar(a);

      Array.prototype.forEach.call(document.querySelectorAll("[data-ic]"), function (el) {
        el.insertAdjacentHTML("afterbegin", CM.icon(el.getAttribute("data-ic")));
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-ic-in]"), function (el) {
        el.outerHTML = CM.icon(el.getAttribute("data-ic-in"));
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-ic-btn]"), function (el) {
        el.insertAdjacentHTML("beforeend", CM.icon(el.getAttribute("data-ic-btn")));
      });
    };

    /* ── WHAT IS STILL MISSING ────────────────────────────────────────────
       The same checklist onboarding's last step shows, on Home, for the same
       reason: Save & exit lets people leave the builder with a page that is
       live but half filled in (Garry, 2026-09-23). Read off `a.profile`:
  
         contacts  how many of phone / WhatsApp / email are on the page.
                   Zero is the one genuinely broken state — a scan opens a
                   name and nothing else — so that row is marked `must`.
         links     socials and custom links, counted
         photo     null until one is uploaded
         bio       "" until written
  
       Every row opens the Profile tab at its own field (`?add=`), so the
       card is a way in rather than a scolding. Nothing missing → no card. */
    CM.pageTodo = function (a) {
      var p = a.profile;
      if (!p) { return []; }
      var out = [];
      if (!contactCount(p)) {
        out.push({
          k: "contact", must: true, ic: "phone", l: "Add a way to reach you",
          s: "A phone, WhatsApp or email. Without one, a scan opens just your name."
        });
      }
      if (!linkCount(p)) {
        out.push({
          k: "links", ic: "link", l: "Add your links",
          s: "Instagram, YouTube, your website — whichever ones you hand out."
        });
      }
      if (!p.photo) {
        out.push({
          k: "photo", ic: "user", l: "Add a photo",
          s: "It is the first thing on the page, and the first thing people recognise."
        });
      }
      /* No bio row — the field is marked optional in the editor, so asking for
         it here would contradict it (Garry, 2026-09-24). */
      return out;
    };

    /* Both counts are read off the page itself rather than off a number kept
       beside it (Garry, 2026-09-24) — a second copy of the truth is how Home
       came to ask for links a page already had. */
    function contactCount(p) {
      var n = 0;
      if (p.phone && p.phoneOn) { n++; }
      if ((p.waSame ? p.phone : p.wa) && p.waOn) { n++; }
      if (p.email && p.emailOn) { n++; }
      return n;
    }
    function linkCount(p) {
      var n = 0, k;
      for (k in (p.links || {})) { if (p.links[k] && p.links[k].v && p.links[k].on) { n++; } }
      (p.customs || []).forEach(function (c) { if (c.url && c.on !== false) { n++; } });
      return n;
    }

    /* Fills a `<section class="card todo" data-page-todo hidden>` and shows it.
       Left hidden when the page is complete, so a finished account never sees
       an empty card. */
    CM.mountTodo = function (a) {
      var host = document.querySelector("[data-page-todo]");
      if (!host) { return; }
      var left = CM.pageTodo(a);
      if (!left.length) { return; }

      host.innerHTML =
        '<div class="todo__head">' +
        '<span class="card__title">Finish your page</span>' +
        '<span class="todo__n">' + left.length + (left.length === 1 ? " thing left" : " things left") + "</span>" +
        "</div>" +
        '<div class="todo__rows">' +
        left.map(function (m) {
          return '<a class="todo__row" href="profile.html?add=' + m.k + '"' +
            (m.must ? " data-must" : "") + ">" +
            '<span class="todo__ic">' + CM.icon(m.ic) + "</span>" +
            '<span class="todo__txt"><span class="todo__l">' + m.l + "</span>" +
            '<span class="todo__s">' + m.s + "</span></span>" +
            '<span class="todo__go">' + CM.icon("chev") + "</span>" +
            "</a>";
        }).join("") +
        "</div>";
      host.hidden = false;
    };

    /* ── THE PACK SLIDER ──────────────────────────────────────────────────
       Scroll-snap does the moving — swipe, trackpad and keyboard all work
       without us. This only keeps the dots in step, and nudges the track
       along until a hand touches it, after which it stays where it is put.
  
       Three flow folders show the same three product photo frames, so it
       lives here rather than three times over. */

    CM.carousel = function (shots) {
      if (!shots) { return; }
      var track = shots.querySelector(".shot__track");
      var dots = [].slice.call(shots.querySelectorAll(".shot__dot"));
      if (!track || !dots.length) { return; }
      var auto = true;

      function mark() {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach(function (d, n) {
          if (n === i) { d.setAttribute("data-on", ""); }
          else { d.removeAttribute("data-on"); }
        });
        return i;
      }
      function go(i) { track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" }); }

      dots.forEach(function (d, n) {
        d.addEventListener("click", function () { auto = false; go(n); });
      });
      track.addEventListener("scroll", mark, { passive: true });
      ["pointerdown", "wheel", "touchstart"].forEach(function (e) {
        track.addEventListener(e, function () { auto = false; }, { passive: true });
      });
      window.setInterval(function () {
        if (auto && !document.hidden) { go((mark() + 1) % dots.length); }
      }, 4500);
      mark();

      CM.lightbox(track, ".shot__ph");
    };

    /* Object.assign, written out — the dashboard still targets whatever a
       three-year-old Android browser is running. */
    /* ── THE SCAN SCENE ───────────────────────────────────────────────────
       The one drawing that explains the whole product without a word:
  
         1. a printed sticker turns up
         2. a phone comes in and scans it
         3. the phone is now showing the contact page
  
       It loops. It is drawn, not filmed — the "page" on the phone is the
       real thing built out of the same tokens, so it never goes out of date
       the way a screenshot would.
  
       Used wherever a dashboard screen has to sell the idea to someone who
       has not built a page yet. Call it into an empty element:
  
           host.innerHTML = CM.scanScene(a);
  
       The spans keep their data-fill hooks, so call CM.draw(a, …) after.
       Styles live in dashboard.css under "SCAN SCENE". */

    CM.scanScene = function (a, opts) {
      opts = opts || {};
      var seed = opts.seed || (a.code ? a.code.id : "preview");
      var qr = CM.qr(seed);

      return '<div class="scene" aria-hidden="true">' +

        '<div class="phone">' +
        '<div class="phone__screen">' +

        /* 2 — what the camera sees */
        '<div class="cam">' +
        '<span class="cam__qr">' + qr + "</span>" +
        '<span class="cam__frame"></span>' +
        '<span class="cam__beam"></span>' +
        '<span class="cam__tick">' + CM.icon("check") + "</span>" +
        "</div>" +

        /* 3 — and what it opens */
        '<div class="pm">' +
        '<span class="pm__av" data-fill="user.initial">G</span>' +
        '<span class="pm__name" data-fill="user.name">Garry</span>' +
        '<span class="pm__url">codemarca.com/<span data-fill="handle">garry</span></span>' +
        '<span class="pm__soc">' + SOCIALS + "</span>" +
        '<span class="pm__btns">' +
        '<span class="pm__btn pm__btn--call" data-ic="phone">Call</span>' +
        '<span class="pm__btn pm__btn--wa">WhatsApp</span>' +
        '<span class="pm__btn pm__btn--save" data-ic="down">Save contact</span>' +
        "</span>" +
        "</div>" +

        "</div>" +
        "</div>" +

        /* 1 — the printed sticker, held up to the camera */
        '<span class="scene__sticker">' + qr + "</span>" +

        "</div>";
    };

    /* the four the page shows by default — brand marks, so they are drawn
       here rather than pulled from the icon set */
    var SOCIALS =
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#E1306C"/><rect x="6.5" y="6.5" width="11" height="11" rx="3.4" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="12" cy="12" r="2.7" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="15.4" cy="8.6" r=".9" fill="#fff"/></svg>' +
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FF0000"/><path d="M10 8.8v6.4l5.4-3.2z" fill="#fff"/></svg>' +
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#0A66C2"/><path d="M8 10.2h2v6H8zM9 7.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zM11.6 10.2h1.9v.9c.3-.5 1-1.1 2-1.1 2 0 2.4 1.3 2.4 3v3.2h-2v-2.8c0-.7 0-1.6-1-1.6s-1.2.8-1.2 1.6v2.8h-2z" fill="#fff"/></svg>' +
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#101215"/><path d="M6 5.4h3.3l3 4.1 3.5-4.1h2.9l-5 5.8 5.4 7.4h-3.3l-3.3-4.5-3.8 4.5H5.8l5.3-6.2z" fill="#fff"/></svg>';

    CM.assign = function (into) {
      Array.prototype.slice.call(arguments, 1).forEach(function (o) {
        if (!o) { return; }
        for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) { into[k] = o[k]; } }
      });
      return into;
    };

    CM.derived = function (a) {
      return {
        "user.first": (a.user.name || "").split(" ")[0],
        "user.initial": (a.user.name || "?").charAt(0).toUpperCase()
      };
    };


    CM.money = function (n) { return "₹" + n.toLocaleString("en-IN"); };

    CM.url = function (handle) { return "codemarca.com/" + handle; };

    var toastEl, toastT;
    CM.toast = function (msg) {
      if (!toastEl) {
        toastEl = document.createElement("div");
        toastEl.className = "toast";
        toastEl.setAttribute("role", "status");
        document.body.appendChild(toastEl);
      }
      toastEl.innerHTML = CM.icon("check") + "<span>" + msg + "</span>";
      /* reflow so the transition replays on a repeat tap */
      void toastEl.offsetWidth;
      toastEl.setAttribute("data-on", "");
      clearTimeout(toastT);
      toastT = setTimeout(function () { toastEl.removeAttribute("data-on"); }, 2000);
    };

    CM.copy = function (text, msg) {
      if (navigator.clipboard) { navigator.clipboard.writeText(text).catch(function () { }); }
      CM.toast(msg || "Copied");
    };

    /* wire any [data-copy] button without the page having to think about it */
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || typeof t.closest !== "function") { return; }
      var b = t.closest("[data-copy]");
      if (b) { CM.copy(b.getAttribute("data-copy"), b.getAttribute("data-copy-msg")); }
      var s = t.closest("[data-soon]");
      if (s) { CM.toast(s.getAttribute("data-soon")); }
    });

    /* ══ 7. SHOW MY CODE ════════════════════════════════════════════════════
       The dashboard's one full-screen mode. Called from the home hero and
       from the code card on the code screen:
  
           CM.showCode({ title, sub, url, seed })
  
       `url` is what a real encoder would encode. `seed` is only for the
       fake pattern — pass the code id so the square shown here matches the
       square printed on the stickers.
  
       Built once, on first use, and reused after that. There is only ever
       one of these in the document.
  
       WAKE LOCK — the screen going to sleep while someone is lining up a
       camera is the one failure this mode cannot survive, so it asks to
       stay awake and quietly gives up if the browser says no. Raising the
       actual brightness is not something the web can do; that is a
       Capacitor call when the app ships. */

    var showEl, showLock, showPrev;

    function buildShow() {
      showEl = document.createElement("div");
      showEl.className = "show";
      showEl.setAttribute("role", "dialog");
      showEl.setAttribute("aria-modal", "true");
      showEl.setAttribute("aria-label", "Your code, full screen");
      showEl.hidden = true;
      showEl.innerHTML =
        '<button class="show__close" type="button" aria-label="Close">' + CM.icon("close") + "</button>" +
        '<p class="show__hint">Point a camera here</p>' +
        '<div class="show__qr" data-qr></div>' +
        '<div class="show__id">' +
        '<span class="show__name" data-name></span>' +
        '<span class="show__sub" data-sub></span>' +
        "</div>" +
        '<div class="show__acts">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-dl>' +
        CM.icon("down") + "Download</button>" +
        '<button class="btn btn--ghost btn--sm" type="button" data-send>' +
        CM.icon("share") + "Share</button>" +
        '<button class="btn btn--ghost btn--sm" type="button" data-link>' +
        CM.icon("copy") + "Copy link</button>" +
        "</div>";

      showEl.querySelector(".show__close").addEventListener("click", closeShow);
      /* tapping the empty space around the square closes it — the square
         itself does not, because that is the bit people point at */
      showEl.addEventListener("click", function (e) {
        if (e.target === showEl) { closeShow(); }
      });
      document.body.appendChild(showEl);
    }

    function onShowKey(e) { if (e.key === "Escape") { closeShow(); } }

    /* Rasterise the square on screen into a PNG. The pattern is fake for now
       (see CM.qr) but the plumbing is not — when a real encoder goes in, the
       SVG it returns comes through here unchanged. Everything happens in the
       page: serialise the node, hand it to an <img>, paint it on a canvas at
       print size. A white ground is painted first, because a QR that ends up
       on a dark background is a QR that does not scan. */
    function codePng(size, done) {
      var node = showEl.querySelector("[data-qr] svg");
      if (!node) { done(null); return; }
      var svg = node.cloneNode(true);
      svg.setAttribute("width", size);
      svg.setAttribute("height", size);

      var img = new Image();
      img.onload = function () {
        var c = document.createElement("canvas");
        c.width = c.height = size;
        var g = c.getContext("2d");
        g.fillStyle = "#FFFFFF";
        g.fillRect(0, 0, size, size);
        g.drawImage(img, 0, 0, size, size);
        if (c.toBlob) { c.toBlob(function (b) { done(b); }, "image/png"); }
        else { done(null); }
      };
      img.onerror = function () { done(null); };
      img.src = "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(new XMLSerializer().serializeToString(svg));
    }

    CM.showCode = function (opts) {
      if (!showEl) { buildShow(); }

      showEl.querySelector("[data-qr]").innerHTML = CM.qr(opts.seed || opts.url);
      showEl.querySelector("[data-name]").textContent = opts.title || "";
      showEl.querySelector("[data-sub]").textContent = opts.sub != null ? opts.sub : (opts.url || "");

      /* 1024px is the size a print shop asks for and a phone wallpaper can
         take — one size covers both rather than offering a menu. */
      var file = "codemarca-" +
        String(opts.seed || "code").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".png";

      showEl.querySelector("[data-link]").onclick = function () {
        CM.copy(opts.url, "Link copied");
      };

      showEl.querySelector("[data-dl]").onclick = function () {
        codePng(1024, function (blob) {
          if (!blob) { CM.copy(opts.url, "Could not build the image — link copied"); return; }
          var href = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = href; a.download = file;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function () { URL.revokeObjectURL(href); }, 1000);
          CM.toast("Code saved as a PNG");
        });
      };

      /* The system share sheet, with the image attached where the browser
         allows it. Desktop browsers mostly do not, so the fallback is the
         thing a desktop user wanted anyway: the link on the clipboard. */
      showEl.querySelector("[data-send]").onclick = function () {
        codePng(1024, function (blob) {
          var data = { title: opts.title || "My Codemarca code", url: opts.url };
          if (blob && window.File && navigator.canShare) {
            var f = new File([blob], file, { type: "image/png" });
            if (navigator.canShare({ files: [f] })) { data.files = [f]; }
          }
          if (navigator.share) { navigator.share(data).catch(function () { }); }
          else { CM.copy(opts.url, "Link copied — sharing needs a phone"); }
        });
      };

      showPrev = document.activeElement;
      showEl.hidden = false;
      document.body.setAttribute("data-showing", "");
      /* reflow, so the fade and the scale actually play on a repeat open */
      void showEl.offsetWidth;
      showEl.setAttribute("data-on", "");
      showEl.querySelector(".show__close").focus();
      document.addEventListener("keydown", onShowKey);

      if ("wakeLock" in navigator) {
        navigator.wakeLock.request("screen")
          .then(function (l) { showLock = l; })
          .catch(function () { /* denied, or the tab is not visible — fine */ });
      }
    };

    function closeShow() {
      if (!showEl || showEl.hidden) { return; }
      showEl.removeAttribute("data-on");
      document.body.removeAttribute("data-showing");
      document.removeEventListener("keydown", onShowKey);
      if (showLock) { showLock.release().catch(function () { }); showLock = null; }
      if (showPrev && showPrev.focus) { showPrev.focus(); }
      setTimeout(function () { if (!showEl.hasAttribute("data-on")) { showEl.hidden = true; } }, 260);
    }

    CM.closeCode = closeShow;

    /* the wordmark, as it is drawn everywhere else — for pages outside the
       dashboard shell that still want the logo (scan.html) */
    CM.wordmark = function (cls) {
      return LOGO_WM.replace('class="wm"', 'class="' + (cls || "wm") + '"');
    };

    /* the mark on its own, in whatever colour the CSS gives it — for places
       that use it as decoration rather than as the logo */
    CM.mark = function (cls) {
      return LOGO_MK
        .replace('class="mk"', 'class="' + (cls || "") + '"')
        .replace('fill="#6E27E6"', 'fill="currentColor"')
        .replace('role="img" aria-label="Codemarca"', 'aria-hidden="true"');
    };

    /* ══ 7b. DIALOG ═════════════════════════════════════════════════════════
       One question, a few answers. A sheet from the bottom on a phone, a
       centred card on desktop.
  
           CM.dialog({
             title: "…", body: "…",
             actions: [ { id:"save", label:"Save and leave", kind:"go" }, … ],
             onPick: function (id) { … }      // id, or null if dismissed
           });
  
       `kind` is go · bad · quiet. Escape and a tap outside both count as
       dismissing it — the same as the quiet "stay" answer, never as the
       destructive one. */

    var dlgEl, dlgPrev, dlgPick;

    function dlgClose(id) {
      if (!dlgEl || dlgEl.hidden) { return; }
      dlgEl.removeAttribute("data-on");
      document.removeEventListener("keydown", dlgKey);
      if (dlgPrev && dlgPrev.focus) { dlgPrev.focus(); }
      setTimeout(function () { if (!dlgEl.hasAttribute("data-on")) { dlgEl.hidden = true; } }, 240);
      var cb = dlgPick; dlgPick = null;
      if (cb) { cb(id); }
    }
    function dlgKey(e) { if (e.key === "Escape") { dlgClose(null); } }

    CM.dialog = function (o) {
      if (!dlgEl) {
        dlgEl = document.createElement("div");
        dlgEl.className = "dlg";
        dlgEl.hidden = true;
        dlgEl.innerHTML =
          '<div class="dlg__box" role="alertdialog" aria-modal="true" ' +
          'aria-labelledby="dlgTitle" aria-describedby="dlgBody">' +
          '<h2 class="dlg__t" id="dlgTitle"></h2>' +
          '<p class="dlg__b" id="dlgBody"></p>' +
          '<div class="dlg__acts"></div>' +
          "</div>";
        dlgEl.addEventListener("click", function (e) {
          if (e.target === dlgEl) { dlgClose(null); return; }
          var b = e.target.closest("[data-dlg]");
          if (b) { dlgClose(b.getAttribute("data-dlg")); }
        });
        document.body.appendChild(dlgEl);
      }

      dlgEl.querySelector(".dlg__t").textContent = o.title || "";
      dlgEl.querySelector(".dlg__b").textContent = o.body || "";
      dlgEl.querySelector(".dlg__acts").innerHTML = (o.actions || []).map(function (a) {
        var cls = a.kind === "go" ? "btn--go" : a.kind === "bad" ? "btn--bad" : "btn--quiet";
        return '<button class="btn ' + cls + ' btn--wide" type="button" data-dlg="' + a.id + '">' +
          a.label + "</button>";
      }).join("");

      dlgPick = o.onPick || null;
      dlgPrev = document.activeElement;
      dlgEl.hidden = false;
      void dlgEl.offsetWidth;
      dlgEl.setAttribute("data-on", "");
      document.addEventListener("keydown", dlgKey);
      var first = dlgEl.querySelector("[data-dlg]");
      if (first) { first.focus(); }
    };

    /* ══ 7c. SHARE SHEET ════════════════════════════════════════════════════
       The same sheet profile.html opens from its share icon, so the owner
       shares their page the way a visitor would: the link with a copy
       button, then one tap to WhatsApp, X, Facebook, Telegram or email, and
       the phone's own share menu as "More" where the browser has one.
  
           CM.shareSheet({ title, url, name })
  
       Opening it copies the link straight away, as profile.html does — the
       write has to happen inside the tap, because Safari refuses clipboard
       access from a timer. The promo block is left out: the owner already
       has a code. Targets and glyphs are copied from profile.html; keep the
       two lists in step until they are one component. */

    var shsEl, shsSeq;
    var shs = { url: "", name: "" };

    var SHARE = [
      {
        k: "whatsapp", n: "WhatsApp", c: "#25D366",
        g: '<path d="M6.2 18 7.3 14.6a6.7 6.7 0 1 1 2.5 2.4z" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.9 9.4c.35 1.7 1.7 3 3.4 3.4l.7-1.1 1.6.75-.25 1.4c-2.8.4-6-2.8-5.6-5.6l1.4-.25.75 1.6z" fill="#fff"/>',
        u: function (v) { return "https://wa.me/?text=" + encodeURIComponent(v); }
      },
      {
        k: "x", n: "X", c: "#101215",
        g: '<path d="M6 5.4h3.3l3 4.1 3.5-4.1h2.9l-5 5.8 5.4 7.4h-3.3l-3.3-4.5-3.8 4.5H5.8l5.3-6.2z" fill="#fff"/>',
        u: function (v) { return "https://x.com/intent/tweet?url=" + encodeURIComponent(v); }
      },
      {
        k: "facebook", n: "Facebook", c: "#1877F2",
        g: '<path d="M13.4 20v-7.1h2.4l.36-2.78H13.4V8.34c0-.8.23-1.35 1.39-1.35h1.48V4.5a19.7 19.7 0 0 0-2.16-.11c-2.13 0-3.59 1.3-3.59 3.69v2.04H8.1v2.78h2.42V20z" fill="#fff"/>',
        u: function (v) { return "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(v); }
      },
      {
        k: "telegram", n: "Telegram", c: "#229ED9",
        g: '<path d="M19.2 6.2 5.5 11.5c-.7.28-.7.78.02.98l3.44 1.07 7.98-5.03c.38-.23.72-.11.44.14l-6.46 5.84-.25 3.5c.29 0 .42-.13.58-.29l1.4-1.35 2.9 2.14c.53.3.92.14 1.05-.5l1.9-8.94c.19-.86-.31-1.25-.9-1.02z" fill="#fff"/>',
        u: function (v) { return "https://t.me/share/url?url=" + encodeURIComponent(v); }
      },
      {
        k: "email", n: "Email", c: "#5B5D68",
        g: '<rect x="5" y="7.4" width="14" height="9.2" rx="2" fill="none" stroke="#fff" stroke-width="1.6"/><path d="m5.8 8.6 6.2 4.3 6.2-4.3" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
        u: function (v) { return "mailto:?subject=" + encodeURIComponent(shs.name + " on Codemarca") + "&body=" + encodeURIComponent(v); }
      }
    ];

    var SHS_SPIN = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>';
    var SHS_TICK = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.4 6.5 12 13 4.6" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    function shsCopy() {
      var b = shsEl.querySelector("[data-shs-copy]");
      if (navigator.clipboard) { navigator.clipboard.writeText(shs.url).catch(function () { }); }
      clearTimeout(shsSeq);
      b.dataset.state = "busy";
      b.innerHTML = SHS_SPIN;
      b.setAttribute("aria-label", "Copying link");
      shsSeq = setTimeout(function () {
        b.dataset.state = "done";
        b.innerHTML = SHS_TICK + "<span>Link copied</span>";
        b.setAttribute("aria-label", "Link copied");
        shsSeq = setTimeout(function () {
          b.dataset.state = "";
          b.textContent = "Copy";
          b.setAttribute("aria-label", "Copy link");
        }, 2000);
      }, 1000);
    }

    function shsClose() {
      if (!shsEl || shsEl.hidden) { return; }
      clearTimeout(shsSeq);
      shsEl.hidden = true;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", shsKey);
    }
    function shsKey(e) { if (e.key === "Escape") { shsClose(); } }

    CM.shareSheet = function (o) {
      shs.url = o.url;
      shs.name = o.name || "";

      if (!shsEl) {
        shsEl = document.createElement("div");
        shsEl.className = "shs";
        shsEl.hidden = true;
        shsEl.setAttribute("role", "dialog");
        shsEl.setAttribute("aria-modal", "true");
        shsEl.innerHTML =
          '<div class="shs__scrim" data-shs-close></div>' +
          '<div class="shs__panel">' +
          '<button class="shs__x" type="button" data-shs-close aria-label="Close">' + CM.icon("close") + "</button>" +
          '<div class="shs__grip" aria-hidden="true"></div>' +
          '<h2 class="shs__t"></h2>' +
          '<div class="shs__row"><span class="shs__url"></span>' +
          '<button type="button" data-shs-copy>Copy</button></div>' +
          '<div class="shs__targets"></div>' +
          "</div>";
        shsEl.addEventListener("click", function (e) {
          if (e.target.closest("[data-shs-close]")) { shsClose(); return; }
          if (e.target.closest("[data-shs-copy]")) {
            if (e.target.closest("[data-shs-copy]").dataset.state !== "busy") { shsCopy(); }
            return;
          }
          if (e.target.closest("[data-shs-more]") && navigator.share) {
            navigator.share({ title: shs.name + " on Codemarca", url: shs.url }).catch(function () { });
          }
        });
        document.body.appendChild(shsEl);
      }

      shsEl.setAttribute("aria-label", o.title || "Share this page");
      shsEl.querySelector(".shs__t").textContent = o.title || "Share this page";
      shsEl.querySelector(".shs__url").textContent = o.url.replace(/^https?:\/\//i, "");

      var html = SHARE.map(function (t) {
        return '<a href="' + t.u(shs.url).replace(/"/g, "&quot;") + '" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="' + t.c + '"/>' +
          t.g + "</svg><span>" + t.n + "</span></a>";
      }).join("");
      if (navigator.share) {
        html += '<button type="button" data-shs-more>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#6E27E6"/>' +
          '<circle cx="8.4" cy="12" r="1.6" fill="#fff"/><circle cx="15.6" cy="12" r="1.6" fill="#fff"/><circle cx="12" cy="12" r="1.6" fill="#fff"/></svg>' +
          "<span>More</span></button>";
      }
      shsEl.querySelector(".shs__targets").innerHTML = html;

      shsEl.hidden = false;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", shsKey);
      shsCopy();
    };

    /* ── PHOTO STRIP ──────────────────────────────────────────────────────
       The bar under a swipe row of photos: its thumb is as wide a share of
       the bar as the row shows of itself, and it sits where the row is
       scrolled to. Markup is .ps > .ps__row + .ps__bar > i. */

    CM.strip = function (el) {
      if (!el) { return; }
      var row = el.querySelector(".ps__row"), thumb = el.querySelector(".ps__bar i");
      if (!row || !thumb) { return; }
      function paint() {
        var w = row.scrollWidth, seen = row.clientWidth;
        if (!w || seen >= w) { thumb.style.width = "100%"; thumb.style.left = "0"; return; }
        thumb.style.width = (seen / w * 100) + "%";
        thumb.style.left = (row.scrollLeft / w * 100) + "%";
      }
      row.addEventListener("scroll", paint, { passive: true });
      window.addEventListener("resize", paint);
      paint();

      CM.lightbox(row, ".ps__ph");
    };

    /* ── LIGHTBOX ─────────────────────────────────────────────────────────
       Tap a photo and it opens full screen, with the rest of that row beside
       it (Garry, 2026-09-24). Swipe on a phone, arrows or the keyboard on a
       desktop, Esc or the cross to close. `sel` picks the photos inside
       `box`; each one is cloned, so a placeholder shows as a placeholder and
       a real <img> shows as the photo, with nothing to keep in step. */

    CM.lightbox = function (box, sel) {
      if (!box) { return; }
      var shots = [].slice.call(box.querySelectorAll(sel));
      if (!shots.length) { return; }

      shots.forEach(function (ph, i) {
        ph.setAttribute("role", "button");
        ph.setAttribute("tabindex", "0");
        ph.setAttribute("aria-label", "Open photo " + (i + 1) + " of " + shots.length);
        ph.addEventListener("click", function () { open(i); });
        ph.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
        });
      });

      function open(start) {
        var el = document.createElement("div");
        el.className = "lb";
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-modal", "true");
        el.setAttribute("aria-label", "Photos");
        el.innerHTML =
          '<div class="lb__scrim" data-lb-close></div>' +
          '<button class="lb__x" type="button" data-lb-close aria-label="Close">' + CM.icon("close") + "</button>" +
          '<div class="lb__track"></div>' +
          (shots.length > 1
            ? '<button class="lb__go lb__go--prev" type="button" data-lb-go="-1" aria-label="Previous photo">' + CM.icon("chev") + "</button>" +
            '<button class="lb__go lb__go--next" type="button" data-lb-go="1" aria-label="Next photo">' + CM.icon("chev") + "</button>" +
            '<span class="lb__count"></span>'
            : "");

        var track = el.querySelector(".lb__track");
        shots.forEach(function (ph) {
          var slide = document.createElement("div");
          slide.className = "lb__slide";
          var copy = ph.cloneNode(true);
          copy.removeAttribute("role");
          copy.removeAttribute("tabindex");
          copy.removeAttribute("aria-label");
          copy.classList.add("lb__ph");
          slide.appendChild(copy);
          track.appendChild(slide);
        });

        /* WHICH PHOTO IS SHOWING is kept here, not read back off scrollLeft
           (fixed 2026-09-29). Smooth scrolling made the old way lie: press →
           twice quickly and the second press read a position halfway through
           the first animation, so it landed on the same slide or skipped one.
           Now the arrows move this number and the scroll follows; a swipe
           writes it back once the track settles. */
        var idx = start;
        function clamp(n) { return Math.max(0, Math.min(shots.length - 1, n)); }
        function at() { return idx; }
        function count() {
          var c = el.querySelector(".lb__count");
          if (c) { c.textContent = (idx + 1) + " / " + shots.length; }
        }
        function go(n) {
          idx = clamp(n);
          track.scrollTo({ left: idx * track.clientWidth, behavior: "smooth" });
          count();
        }

        function close() {
          el.remove();
          document.body.style.overflow = "";
          document.removeEventListener("keydown", key);
          shots[at()] && shots[at()].focus && shots[at()].focus({ preventScroll: true });
        }
        function key(e) {
          if (e.key === "Escape") { close(); }
          if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
        }

        /* A tap anywhere that is not the photo itself or an arrow closes it —
           the scrim, the padding around the photo, all of it. Escape and the
           cross still work; this just means nobody has to aim (Garry,
           2026-09-29). */
        el.addEventListener("click", function (e) {
          var g = e.target.closest("[data-lb-go]");
          if (g) { go(idx + Number(g.getAttribute("data-lb-go"))); return; }
          if (!e.target.closest(".lb__ph")) { close(); }
        });

        /* a swipe is the other way the slide changes, so read it back once
           the track has stopped moving */
        var settle;
        function sync() {
          if (!track.clientWidth) { return; }
          idx = clamp(Math.round(track.scrollLeft / track.clientWidth));
          count();
        }
        track.addEventListener("scroll", function () {
          clearTimeout(settle);
          settle = setTimeout(sync, 90);
        }, { passive: true });
        /* scrollend fires once the finger is off and the snap has landed —
           cheaper and exact where the browser has it; the timer above is the
           fallback for the ones that do not */
        track.addEventListener("scrollend", sync);

        document.body.appendChild(el);
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", key);
        track.scrollLeft = start * track.clientWidth;
        count();
        el.querySelector(".lb__x").focus();
      }
    };

    /* ── A GENERAL SHEET ─────────────────────────────────────────────────
       Same shell as the share sheet — rises from the bottom on a phone, a
       centred card from 640px up — but holds any content, left-aligned.
       First use: the referral list on 4-active's home.
  
           CM.sheet({ title: "Your referrals", html: "…", onOpen: fn(panel) })
  
       A fresh node per open, removed on close, so nothing leaks between
       two different sheets. */

    CM.sheet = function (o) {
      var el = document.createElement("div");
      el.className = "shs shs--list";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      el.setAttribute("aria-label", o.title || "");
      el.innerHTML =
        '<div class="shs__scrim" data-sheet-close></div>' +
        '<div class="shs__panel">' +
        '<div class="shs__grip" aria-hidden="true"></div>' +
        '<button class="shs__x" type="button" data-sheet-close aria-label="Close">' + CM.icon("close") + "</button>" +
        '<h2 class="shs__t">' + (o.title || "") + "</h2>" +
        '<div class="shs__body">' + (o.html || "") + "</div>" +
        "</div>";

      function close() {
        el.remove();
        document.body.style.overflow = "";
        document.removeEventListener("keydown", key);
      }
      function key(e) { if (e.key === "Escape") { close(); } }

      el.addEventListener("click", function (e) {
        if (e.target.closest("[data-sheet-close]")) { close(); }
      });
      document.body.appendChild(el);
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", key);
      if (o.onOpen) { o.onOpen(el.querySelector(".shs__panel"), close); }
      return close;
    };

    /* ══ 7d. NOTIFICATIONS ═════════════════════════════════════════════════
       Garry, 2026-09-27. One bell on every tab — the top bar on a phone, a
       strip above the page head on a desktop — and one panel behind it with
       three tabs, so nobody scrolls a single feed looking for their parcel:
  
           All      everything, newest first
           Orders   placed, shipped, delivered, invoices — gifts included
           Refer    friends in through the link, gifts claimed, the tee
  
       Anything that is neither (page live, scans) shows under All only.
  
       The list is the account's own: each state.js carries `notes`, in the
       shape the API should answer with —
  
           { id, tab: "orders" | "refer" | "account", icon, title, body,
             when, unread, href }
  
       A phone gets it as a bottom sheet (CM.sheet), a desktop as a dropdown
       under the bell. Same markup inside both, built by one function.
  
       ── FOR THE REACT BUILD ──────────────────────────────────────────────
       "read" lives in localStorage here only so the demo remembers it across
       tabs. In the product it is a PATCH on the note. */

    var NOTE_TABS = [
      {
        k: "all", label: "All",
        empty: "Nothing yet. Order updates, friends joining through your link and gifts being claimed all land here."
      },
      {
        k: "orders", label: "Orders",
        empty: "No order news. When a pack is placed, shipped or delivered, it shows up here first."
      },
      {
        k: "refer", label: "Refer",
        empty: "Nothing from your link yet. Every friend who signs up or finishes their page shows up here."
      }
    ];

    CM.notes = (function () {
      var list = [], readKey = "", read = {}, tab = "all", bells = [];

      function save() {
        try { window.localStorage.setItem(readKey, JSON.stringify(Object.keys(read))); } catch (e) { }
      }
      function isNew(n) { return n.unread && !read[n.id]; }
      function inTab(n, k) { return k === "all" || n.tab === k; }
      function unread(k) { return list.filter(function (n) { return inTab(n, k) && isNew(n); }).length; }

      function paintBells() {
        var n = unread("all");
        bells.forEach(function (b) {
          var c = b.querySelector(".bell__n");
          c.hidden = !n;
          c.textContent = n > 9 ? "9+" : String(n);
          b.setAttribute("aria-label", n ? "Notifications, " + n + " unread" : "Notifications");
        });
      }

      function row(n) {
        return '<a class="nt__row" href="' + (n.href || "#") + '" data-id="' + n.id + '"' +
          (isNew(n) ? " data-new" : "") + ">" +
          '<span class="nt__ic">' + CM.icon(n.icon || "bell") + "</span>" +
          '<span class="nt__txt">' +
          '<span class="nt__t">' + n.title + "</span>" +
          (n.body ? '<span class="nt__b">' + n.body + "</span>" : "") +
          '<span class="nt__w">' + n.when + "</span>" +
          "</span>" +
          '<span class="nt__dot" aria-hidden="true"></span>' +
          "</a>";
      }

      /* the panel's inside — tabs, the "n new" line, the list */
      function render(host) {
        function draw() {
          var t = NOTE_TABS.filter(function (x) { return x.k === tab; })[0];
          var rows = list.filter(function (n) { return inTab(n, tab); });
          var fresh = unread(tab);
          host.innerHTML =
            '<div class="nt">' +
            '<div class="nt__tabs" role="tablist" aria-label="Notification types">' +
            NOTE_TABS.map(function (x) {
              var c = unread(x.k);
              return '<button class="nt__tab" type="button" role="tab" data-tab="' + x.k + '"' +
                ' aria-selected="' + (x.k === tab) + '">' + x.label +
                (c ? '<span class="nt__n">' + c + "</span>" : "") + "</button>";
            }).join("") +
            "</div>" +
            (rows.length
              ? '<div class="nt__meta"><span>' + (fresh ? fresh + " new" : "All caught up") + "</span>" +
              (fresh ? '<button type="button" data-read-all>Mark all as read</button>' : "") + "</div>" +
              '<div class="nt__list" role="tabpanel">' + rows.map(row).join("") + "</div>"
              : '<p class="nt__empty" role="tabpanel">' + t.empty + "</p>") +
            "</div>";
        }

        host.addEventListener("click", function (e) {
          var b = e.target.closest("[data-tab]");
          if (b) { tab = b.getAttribute("data-tab"); draw(); return; }
          if (e.target.closest("[data-read-all]")) {
            list.forEach(function (n) { if (inTab(n, tab)) { read[n.id] = 1; } });
            save(); paintBells(); draw(); return;
          }
          var r = e.target.closest(".nt__row");
          if (r) {
            read[r.getAttribute("data-id")] = 1;
            save(); paintBells();
            if (r.getAttribute("href") === "#") { e.preventDefault(); draw(); }
          }
        });
        draw();
      }

      /* desktop: a dropdown hanging off the bell, right edges lined up */
      function dropdown(bell, bar) {
        var pop = null;
        function close() {
          if (!pop) { return; }
          pop.remove(); pop = null;
          bell.setAttribute("aria-expanded", "false");
          document.removeEventListener("mousedown", outside);
          document.removeEventListener("keydown", key);
        }
        function outside(e) { if (!pop.contains(e.target) && !bell.contains(e.target)) { close(); } }
        function key(e) { if (e.key === "Escape") { close(); bell.focus(); } }
        bell.addEventListener("click", function () {
          if (pop) { close(); return; }
          pop = document.createElement("div");
          pop.className = "npop";
          pop.setAttribute("role", "dialog");
          pop.setAttribute("aria-label", "Notifications");
          pop.innerHTML = '<h2 class="npop__t">Notifications</h2><div class="npop__body"></div>';
          bar.appendChild(pop);
          render(pop.querySelector(".npop__body"));
          bell.setAttribute("aria-expanded", "true");
          document.addEventListener("mousedown", outside);
          document.addEventListener("keydown", key);
        });
      }

      return {
        mount: function (a, phoneBell, bar) {
          list = (a.notes || []).slice();
          readKey = "cm.notes." + FLOW.id + "." + (a.state || "");
          read = {};
          try {
            (JSON.parse(window.localStorage.getItem(readKey)) || []).forEach(function (id) { read[id] = 1; });
          } catch (e) { }

          var deskBell = bar.querySelector("[data-bell]");
          bells = [phoneBell, deskBell];
          paintBells();

          phoneBell.addEventListener("click", function () {
            CM.sheet({
              title: "Notifications",
              onOpen: function (panel) { render(panel.querySelector(".shs__body")); }
            });
          });
          dropdown(deskBell, bar);
        }
      };
    })();

    /* ══ 8. DEMO SWITCHER — deleted for production ═══════════════════════════ */

    function mountDemo(a) {
      // Demo switcher disabled for clean UI
      return;
    }

    window.CM = CM;

  })(window, document);
