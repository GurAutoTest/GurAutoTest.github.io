/* ==========================================================================
   CODEMARCA — FOLLOWERS, VIEWS AND QUICK CHAT, OWNER SIDE (Phase-1, 2026-10-13)
   Shared by every flow folder's home.html and messages.html.

       CM.mountStats(a)      Home: "Your page" — views (owner-only, sticker vs
                             link), followers, following; lists open in a sheet
       (the Quick Chat inbox, messages.html, is quick-chat.js)

   RULES — Garry, 2026-10-13
     · Quick chat is the owner's switch. Off = the page shows Follow only.
     · A stranger's first message is a REQUEST. Accept, Ignore, Block, Report.
       Nothing more arrives from them until it is accepted.
     · 500 characters a day per person, every chat together, replies too.
     · Seen messages disappear 24 hours after they are seen.
     · Report keeps a copy of the chat for our team, and has room for a
       longer note when it is serious. Block is silent — they are not told.
     · Followers get no feed; the owner can hide the counts and the lists.

   a.social is the API's shape — see state.js (4-active, 2-page-live).
   ========================================================================== */

(function () {
  "use strict";

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };
  function fmt(n) { return n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function pageUrl(h) { return CM.ROOT + "profile.html?handle=" + encodeURIComponent(h); }

  /* ══ 0. YOUR PEOPLE — followers · following (Garry, 2026-10-17) ══════
     The owner's own lists, opened from Home ("Your page" counts) and the
     Profile tab ("How people connect with you"). Phone: full screen, slides
     in. Laptop: a centred panel. Tabs with counts, search, and per row:
       Followers   Follow back / Following · ⋯ Remove (they aren't told), Block
       Following   Following → tap to unfollow, tap again to follow
     Each name opens that page the way a scan would. No feed, ever.
     CM.people(s, tab, onChange) — s is a.social; onChange(s) after a count
     moves, so the card that opened it can repaint. */
  CM.people = function (s, tab, onChange) {
    if (!s.people) { s.people = { followers: [], following: [] }; }
    try {
      var savedP = JSON.parse(localStorage.getItem("cm.social_people") || "null");
      if (savedP) {
        if (Array.isArray(savedP.followers)) s.people.followers = savedP.followers;
        if (Array.isArray(savedP.following)) s.people.following = savedP.following;
      }
      if (localStorage.getItem("cm.social_followers") !== null) {
        s.followers = +localStorage.getItem("cm.social_followers");
      }
      if (localStorage.getItem("cm.social_following") !== null) {
        s.following = +localStorage.getItem("cm.social_following");
      }
    } catch (e) {}
    var P = s.people, q = "";
    tab = tab === "following" ? "following" : "followers";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var el = document.createElement("div");
    el.className = "ppl";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Followers and following");
    el.innerHTML =
      '<div class="ppl__scrim" data-pclose></div>' +
      '<section class="ppl__box">' +
        '<header class="ppl__head">' +
          '<button class="ppl__x" type="button" data-pclose aria-label="Close">' + CM.icon("back", "ppl__xb") + CM.icon("close", "ppl__xc") + "</button>" +
          "<b>Your people</b><span></span>" +
        "</header>" +
        '<div class="ppl__tabs" role="tablist" data-ptabs></div>' +
        '<label class="ppl__search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>' +
          '<input type="search" placeholder="Search" aria-label="Search people" data-pq autocomplete="off"></label>' +
        '<div class="ppl__body" data-pbody></div>' +
      "</section>";
    document.body.appendChild(el);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () { el.classList.add("is-on"); });

    function close() {
      el.classList.remove("is-on");
      document.removeEventListener("keydown", key);
      setTimeout(function () { el.remove(); document.body.style.overflow = ""; }, reduce ? 0 : 300);
    }
    function key(e) { if (e.key === "Escape" && !document.querySelector(".shs, .dlg[data-on]")) { close(); } }
    document.addEventListener("keydown", key);

    function paintTabs() {
      el.querySelector("[data-ptabs]").innerHTML =
        '<button type="button" role="tab" data-pt="followers" aria-selected="' + (tab === "followers") + '"><b>' + fmt(s.followers) + "</b>Followers</button>" +
        '<button type="button" role="tab" data-pt="following" aria-selected="' + (tab === "following") + '"><b>' + fmt(s.following) + "</b>Following</button>" +
        '<span class="ppl__line" data-at="' + tab + '" aria-hidden="true"></span>';
    }
    function btn(p) {
      if (tab === "following") {
        return p.you ? '<button class="ppl__btn" type="button" data-pf="' + esc(p.handle) + '">Following</button>'
                     : '<button class="ppl__btn ppl__btn--go" type="button" data-pf="' + esc(p.handle) + '">Follow</button>';
      }
      return p.you ? '<button class="ppl__btn" type="button" data-pf="' + esc(p.handle) + '">Following</button>'
                   : '<button class="ppl__btn ppl__btn--go" type="button" data-pf="' + esc(p.handle) + '">Follow back</button>';
    }
    function paintBody(anim) {
      var all = P[tab] || [], total = tab === "followers" ? s.followers : s.following;
      var list = all.filter(function (p) { return !q || (p.name + " " + p.handle).toLowerCase().indexOf(q) > -1; });
      var note = "";
      if (s.follow === false) { note = '<p class="ppl__note">Your Follow button is off — nobody new can follow you. Turn it on in the Profile tab.</p>'; }
      else if (s.showList === false) { note = '<p class="ppl__note">Only you can see these lists. Visitors can’t open them — change it in the Profile tab.</p>'; }
      el.querySelector("[data-pbody]").innerHTML = note +
        (!all.length
          ? '<div class="ppl__empty">' + CM.icon("user") + "<b>" + (tab === "followers" ? "No followers yet" : "Not following anyone yet") + "</b><p>" +
              (tab === "followers" ? "When someone scans your sticker and taps Follow, they show up here."
                                   : "Tap Follow on any Codemarca page and it lands here.") + "</p></div>"
          : !list.length ? '<div class="ppl__empty"><b>Nobody matches “' + esc(q) + '”</b></div>'
          : '<div class="ppl__rows">' + list.map(function (p, i) {
              return '<div class="ppl__row' + (anim && !reduce ? " ppl__row--in" : "") + '" style="--i:' + i + '">' +
                '<a class="ppl__who" href="' + pageUrl(p.handle) + '" target="_blank" rel="noopener">' + CM.dp(p, "qdp--md") +
                  '<span class="ppl__t"><b>' + esc(p.name) + (p.fresh && tab === "followers" ? '<i class="ppl__new">New</i>' : "") + "</b>" +
                  "<small>codemarca.com/" + esc(p.handle) + "</small></span></a>" +
                btn(p) +
                (tab === "followers" ? '<button class="ppl__more" type="button" data-pm="' + esc(p.handle) + '" aria-label="More for ' + esc(p.name) + '">' + CM.icon("more") + "</button>" : "") +
              "</div>";
            }).join("") + "</div>" +
            (!q && total > all.length ? '<p class="ppl__rest">and ' + fmt(total - all.length) + " more</p>" : ""));
    }
    function paint(anim) { paintTabs(); paintBody(anim); }

    function find(list, h) { return (P[list] || []).filter(function (x) { return x.handle === h; })[0]; }
    function setFollow(h, on) {
      var f = find("followers", h), g = find("following", h);
      var src = f || g;
      if (f) { f.you = on; }
      if (on && !g) { P.following.unshift({ name: src.name, handle: src.handle, face: src.face, photo: src.photo, you: true }); s.following++; }
      else if (g && g.you !== on) { g.you = on; s.following += on ? 1 : -1; }
      else if (!g && !on) { /* nothing */ }
      if (onChange) { onChange(s); }
      try {
        localStorage.setItem("cm.social_people", JSON.stringify(P));
        localStorage.setItem("cm.social_followers", s.followers);
        localStorage.setItem("cm.social_following", s.following);
      } catch (e) {}
    }

    el.addEventListener("click", function (e) {
      var t;
      if (e.target.closest("[data-pclose]")) { close(); return; }
      if ((t = e.target.closest("[data-pt]"))) { tab = t.getAttribute("data-pt"); paint(true); return; }
      if ((t = e.target.closest("[data-pf]"))) {
        var h = t.getAttribute("data-pf"), p = find(tab, h), on = !p.you;
        setFollow(h, on);
        t.classList.add("is-pop");
        paintTabs(); paintBody(false);
        CM.toast(on ? "Following " + p.name.split(" ")[0] : "Unfollowed " + p.name.split(" ")[0]);
        return;
      }
      if ((t = e.target.closest("[data-pm]"))) {
        var who = find("followers", t.getAttribute("data-pm"));
        var first = who.name.split(" ")[0];
        CM.sheet({
          title: who.name,
          html: '<div class="more">' +
            '<button class="more__row" type="button" data-m="remove"><span class="more__ic">' + CM.icon("close") + '</span><span class="more__txt"><span class="more__l">Remove follower</span><span class="more__s">' + esc(first) + " won’t be told</span></span></button>" +
            '<button class="more__row more__row--bad" type="button" data-m="block"><span class="more__ic">' + CM.icon("lock") + '</span><span class="more__txt"><span class="more__l">Block</span><span class="more__s">No Follow or Quick Chat for them. They won’t be told.</span></span></button>' +
          "</div>",
          onOpen: function (panel, closeSheet) {
            panel.addEventListener("click", function (ev) {
              var b = ev.target.closest("[data-m]"); if (!b) { return; }
              closeSheet();
              P.followers = P.followers.filter(function (x) { return x !== who; });
              s.followers = Math.max(0, s.followers - 1);
              if (b.getAttribute("data-m") === "block" && who.you) { setFollow(who.handle, false); }
              if (onChange) { onChange(s); }
              try {
                localStorage.setItem("cm.social_people", JSON.stringify(P));
                localStorage.setItem("cm.social_followers", s.followers);
                localStorage.setItem("cm.social_following", s.following);
              } catch (e) {}
              paint(false);
              CM.toast(b.getAttribute("data-m") === "block" ? first + " is blocked" : first + " removed");
            });
          }
        });
      }
    });
    el.querySelector("[data-pq]").addEventListener("input", function (e) { q = e.target.value.trim().toLowerCase(); paintBody(false); });
    paint(true);
  };
  /* the old name, kept so nothing that calls it breaks */
  CM.peopleSheet = function (s, kind) { CM.people(s, kind); };

  /* ══ 1. HOME — YOUR PAGE ═════════════════════════════════════════════ */
  CM.mountStats = function (a) {
    var box = document.querySelector("[data-stats]");
    if (!box) { return; }
    var s = a.social;
    if (!s || !a.profile || a.profile.live === false) { box.hidden = true; return; }
    var v = s.views || { week: 0, sticker: 0, link: 0 };
    var unread = CM.unread(a);
    box.innerHTML =
      '<div class="card__head"><span class="card__title">Your page</span><span class="stats__wk">Last 7 days</span></div>' +
      '<div class="stats">' +
        '<div class="stat"><b>' + fmt(v.week) + '</b><span>Views</span><small>' +
          (v.week ? v.sticker + " sticker<br>" + v.link + " link" : "No scans yet") + "</small></div>" +
        '<button class="stat" type="button" data-pp="followers"><b>' + fmt(s.followers) + "</b><span>Followers</span><small>" +
          (s.followers ? "See all" : "Nobody yet") + "</small></button>" +
        '<button class="stat" type="button" data-pp="following"><b>' + fmt(s.following) + "</b><span>Following</span><small>" +
          (s.following ? "See all" : "Nobody yet") + "</small></button>" +
      "</div>" +
      '<a class="row stats__msg" href="messages.html">' +
        '<span class="row__ic">' + CM.icon("chat") + "</span>" +
        '<span class="row__txt"><span class="row__t">Quick Chat</span><span class="row__s">' +
          (!s.chat ? "Quick Chat is off" : unread ? unread + " new" : "Nothing new") + "</span></span>" +
        (unread ? '<span class="stats__n">' + unread + "</span>" : "") +
        CM.icon("chev", "row__chev") +
      "</a>" +
      '<p class="card__note stats__note">Only you see views. Followers see nothing you do — following just puts you on a list.</p>';
    /* REVIEW ONLY (flows.html): ?people=followers|following opens the list */
    var pq = new URLSearchParams(window.location.search).get("people");
    if (pq && !box._wired) { setTimeout(function () { CM.people(a.social, pq, function () { CM.mountStats(a); }); }, 200); }
    if (!box._wired) {
      box._wired = true;
      box.addEventListener("click", function (e) {
        var b = e.target.closest("[data-pp]");
        if (b) { CM.people(a.social, b.getAttribute("data-pp"), function () { CM.mountStats(a); }); }
      });
    }
  };

  /* ══ 2. QUICK CHAT — moved to quick-chat.js (redesign, 2026-10-17) ══ */
})();
