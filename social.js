/* ==========================================================================
   CODEMARCA — FOLLOWERS, VIEWS AND QUICK CHAT, OWNER SIDE (Phase-1, 2026-10-13)
   Shared by every flow folder's home.html and messages.html.

       CM.mountStats(a)      Home: "Your page" — views (owner-only, sticker vs
                             link), followers, following; lists open in a sheet
       CM.mountMessages(a)   messages.html: the Quick chat switch, today's
                             500 characters, Requests · Chats, the thread,
                             accept / ignore / block / report, and who can
                             see the counts and lists

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
  function av(name) { return '<span class="sav" aria-hidden="true">' + esc((name || "?").charAt(0).toUpperCase()) + "</span>"; }
  function fmt(n) { return n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function pageUrl(h) { return CM.ROOT + "profile.html?handle=" + encodeURIComponent(h); }

  /* followers / following — names only, each opens that page like a scan */
  CM.peopleSheet = function (s, kind) {
    var ppl = (s.people && s.people[kind]) || [];
    var total = kind === "followers" ? s.followers : s.following;
    CM.sheet({
      title: kind === "followers" ? "Followers" : "Following",
      html: (ppl.length
        ? '<div class="sppl">' + ppl.map(function (p) {
            return '<a class="sppl__row" href="' + pageUrl(p.handle) + '" target="_blank" rel="noopener">' + av(p.name) +
              '<span class="sppl__t"><b>' + esc(p.name) + "</b><small>codemarca.com/" + esc(p.handle) + "</small></span>" +
              CM.icon("chev", "sppl__go") + "</a>";
          }).join("") + "</div>" +
          (total > ppl.length ? '<p class="card__note">and ' + fmt(total - ppl.length) + " more</p>" : "")
        : '<p class="card__note">' + (kind === "followers"
            ? "Nobody yet. When someone scans your sticker and taps Follow, they show up here."
            : "You’re not following anyone yet. Tap Follow on any Codemarca page.") + "</p>")
    });
  };

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
          (s.followers ? "See who" : "New on Codemarca") + "</small></button>" +
        '<button class="stat" type="button" data-pp="following"><b>' + fmt(s.following) + "</b><span>Following</span><small>" +
          (s.following ? "See who" : "Nobody yet") + "</small></button>" +
      "</div>" +
      '<a class="row stats__msg" href="messages.html">' +
        '<span class="row__ic">' + CM.icon("chat") + "</span>" +
        '<span class="row__txt"><span class="row__t">Messages</span><span class="row__s">' +
          (!s.chat ? "Quick chat is off" : unread ? unread + " new" : "Nothing new") + "</span></span>" +
        (unread ? '<span class="stats__n">' + unread + "</span>" : "") +
        CM.icon("chev", "row__chev") +
      "</a>" +
      '<p class="card__note stats__note">Only you see views. Followers see nothing you do — following just puts you on a list.</p>';
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-pp]");
      if (b) { CM.peopleSheet(s, b.getAttribute("data-pp")); }
    });
  };

  /* ══ 2. MESSAGES ═════════════════════════════════════════════════════ */
  CM.mountMessages = function (a) {
    var root = document.querySelector("[data-messages]");
    if (!root) { return; }

    /* no page yet — nobody can scan to message, and this account can't
       message anyone either: real pages only */
    if (!a.social || !a.profile) {
      root.innerHTML =
        '<section class="card card--act">' +
          '<span class="todo__ic">' + CM.icon("chat") + "</span>" +
          '<p class="card__h">Messages open once your page is live.</p>' +
          '<p class="card__note">People who scan your sticker can say hi here — and to message anyone yourself, your own page needs a photo, a name and at least one social.</p>' +
          '<a class="btn btn--go" href="' + CM.ROOT + 'onboarding.html">Make my page</a>' +
        "</section>";
      return;
    }

    var S = clone(a.social);
    var tab = S.requests.length ? "requests" : "chats";
    var blocked = [];

    function left() { return S.usage.limit - S.usage.used; }
    function usageHtml() {
      var l = left(), pct = Math.round(l / S.usage.limit * 100);
      return '<div class="use" data-low="' + (l < 100) + '">' +
        '<span class="use__t">Today</span>' +
        '<span class="use__bar" role="meter" aria-label="Characters left today" aria-valuemin="0" aria-valuemax="' + S.usage.limit + '" aria-valuenow="' + l + '"><i style="width:' + pct + '%"></i></span>' +
        '<span class="use__n"><b>' + l + "</b> / " + S.usage.limit + " left</span></div>";
    }

    function paint() {
      var reqN = S.requests.length, chatN = S.chats.length;
      root.innerHTML =
        /* the switch */
        '<section class="card">' +
          '<div class="onoff qc"' + (S.chat ? "" : " data-off") + ">" +
            '<span class="onoff__txt">' +
              '<span class="onoff__t">Quick chat is ' + (S.chat ? "on" : "off") + "</span>" +
              '<span class="onoff__s">' + (S.chat
                ? "People who scan your sticker or open your link can send you a request."
                : "Your page shows Follow only. Nobody can message you.") + "</span>" +
            "</span>" +
            '<label class="sw"><input type="checkbox" data-qc' + (S.chat ? " checked" : "") + ' aria-label="Quick chat"><span class="sw__track"></span></label>' +
          "</div>" +
          usageHtml() +
          '<p class="card__note">500 characters a day, across every chat — your replies too. Resets at midnight. Seen messages disappear 24 hours after they’re seen.</p>' +
        "</section>" +

        /* the inbox */
        '<section class="card inbox">' +
          '<div class="seg" role="tablist" aria-label="Messages">' +
            '<button class="seg__b" type="button" role="tab" data-tab="requests" aria-selected="' + (tab === "requests") + '">Requests' +
              (reqN ? '<span class="seg__n">' + reqN + "</span>" : "") + "</button>" +
            '<button class="seg__b" type="button" role="tab" data-tab="chats" aria-selected="' + (tab === "chats") + '">Chats' +
              (chatN ? '<span class="seg__n">' + chatN + "</span>" : "") + "</button>" +
          "</div>" +
          '<div class="inbox__list" role="tabpanel">' + (tab === "requests" ? requestsHtml() : chatsHtml()) + "</div>" +
        "</section>" +

        /* what visitors see */
        '<section class="card">' +
          '<div class="card__head"><span class="card__title">On your page</span></div>' +
          privRow("counts", "Show follower counts", "“128 followers · 96 following” under your bio", S.showCounts) +
          privRow("list", "Let people open the lists", "Tapping the counts shows who follows you", S.showList) +
        "</section>";
    }
    function privRow(k, t, sub, on) {
      return '<div class="item priv"><span class="item__txt"><span class="item__t">' + t + '</span><span class="item__s">' + sub + "</span></span>" +
        '<label class="sw"><input type="checkbox" data-priv="' + k + '"' + (on ? " checked" : "") + ' aria-label="' + t + '"><span class="sw__track"></span></label></div>';
    }

    function empty(t, s, btn) {
      return '<div class="inbox__empty"><span class="inbox__eic">' + CM.icon("chat") + "</span><b>" + t + "</b><p>" + s + "</p>" + (btn || "") + "</div>";
    }
    function requestsHtml() {
      if (!S.requests.length) {
        return S.chat
          ? empty("No requests", "When someone scans your sticker and says hi, it lands here first.")
          : empty("Quick chat is off", "Switch it on above and people who scan your sticker can say hi.");
      }
      return S.requests.map(function (r) {
        return '<button class="mrq" type="button" data-open="r:' + r.id + '"' + (r.unread ? " data-unread" : "") + ">" + av(r.name) +
          '<span class="mrq__txt"><span class="mrq__top"><b>' + esc(r.name) + "</b><small>" + esc(r.when) + "</small></span>" +
            '<span class="mrq__src">' + (r.source === "sticker" ? "Scanned your sticker" : "Opened your link") + "</span>" +
            '<span class="mrq__p">' + esc(r.text) + "</span></span></button>";
      }).join("");
    }
    function chatsHtml() {
      if (!S.chats.length) { return empty("No chats yet", "Accept a request and the chat moves here."); }
      return S.chats.map(function (c) {
        var last = c.msgs[c.msgs.length - 1];
        return '<button class="mrq" type="button" data-open="c:' + c.id + '"' + (c.unread ? " data-unread" : "") + ">" + av(c.name) +
          '<span class="mrq__txt"><span class="mrq__top"><b>' + esc(c.name) + "</b><small>" + esc(c.when) + "</small></span>" +
            '<span class="mrq__p">' + (last.me ? "You: " : "") + esc(last.text) + "</span>" +
            '<span class="mrq__gone">Disappears in ' + esc(c.left) + "</span></span></button>";
      }).join("");
    }

    root.addEventListener("click", function (e) {
      var t = e.target.closest("[data-tab]");
      if (t) { tab = t.getAttribute("data-tab"); paint(); return; }
      var o = e.target.closest("[data-open]");
      if (o) {
        var id = o.getAttribute("data-open").split(":");
        var list = id[0] === "r" ? S.requests : S.chats;
        var item = list.filter(function (x) { return x.id === id[1]; })[0];
        if (item) { item.unread = false; thread(id[0] === "r" ? "request" : "chat", item); paint(); }
      }
    });
    root.addEventListener("change", function (e) {
      if (e.target.matches("[data-qc]")) { S.chat = e.target.checked; paint(); return; }
      var p = e.target.getAttribute("data-priv");
      if (p === "counts") { S.showCounts = e.target.checked; }
      if (p === "list") { S.showList = e.target.checked; }
    });

    /* ── THE THREAD — a full-screen panel on a phone, a centred one on desktop ── */
    var th = null;
    var activeThreadItem = null;

    function updateBadge() {
      var unreadCount = (S.requests || []).filter(function (r) { return r.unread; }).length +
                        (S.chats || []).filter(function (c) { return c.unread; }).length;
      var bells = document.querySelectorAll(".bell__n");
      bells.forEach(function (b) {
        b.textContent = unreadCount;
        b.classList.toggle("hidden", unreadCount === 0);
      });
    }

    function closeThread() {
      if (!th) { return; }
      th.remove(); th = null;
      activeThreadItem = null;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", thKey);
    }
    function thKey(e) { if (e.key === "Escape" && !document.querySelector(".shs, .dlg[data-on]")) { closeThread(); } }

    function thread(kind, it) {
      closeThread();
      activeThreadItem = it;
      th = document.createElement("div");
      th.className = "mth";
      th.setAttribute("role", "dialog");
      th.setAttribute("aria-modal", "true");
      th.setAttribute("aria-label", it.name);
      document.body.appendChild(th);
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", thKey);
      th.addEventListener("click", function (e) {
        if (e.target.closest("[data-thclose]")) { closeThread(); return; }
        var b = e.target.closest("[data-act]");
        if (!b) { return; }
        var act = b.getAttribute("data-act");
        if (act === "accept") { accept(it); }
        else if (act === "ignore") {
          if (window.CMChat && (it.roomId || it.id)) {
            window.CMChat.updateRoom(it.roomId || it.id, { status: "ignored" });
          }
          drop(it); closeThread(); paint(); updateBadge(); CM.toast("Ignored — they won’t be told");
        }
        else if (act === "block") { block(it); }
        else if (act === "report") { report(it); }
        else if (act === "more") { more(it); }
      });
      drawThread(kind, it);

      // If room exists in DB, fetch full message history
      var rId = it.roomId || it.id;
      if (window.CMChat && rId && !it.historyLoaded) {
        window.CMChat.joinChannel("room_" + rId);
        window.CMChat.getRoomMessages(rId).then(function (msgs) {
          if (!msgs || !msgs.length || !th) return;
          it.historyLoaded = true;
          it.msgs = msgs.map(function (m) {
            return { me: m.sender_type === "owner", text: m.content };
          });
          drawThread(kind, it);
        });
      }
    }

    function drawThread(kind, it) {
      var req = kind === "request";
      th.innerHTML =
        '<div class="mth__scrim" data-thclose></div>' +
        '<section class="mth__box">' +
          '<header class="mth__head">' +
            '<button class="mth__back" type="button" data-thclose aria-label="Back">' + CM.icon("back") + "</button>" +
            av(it.name) +
            '<span class="mth__who"><b>' + esc(it.name) + '</b><a href="' + pageUrl(it.handle) + '" target="_blank" rel="noopener">codemarca.com/' + esc(it.handle) + "</a></span>" +
            (req ? "" : '<button class="mth__more" type="button" data-act="more" aria-label="More">' + CM.icon("more") + "</button>") +
          "</header>" +
          '<div class="mth__body">' +
            (req
              ? '<div class="mth__card">' + av(it.name) + "<b>" + esc(it.name) + "</b>" +
                  (it.bio ? "<p>" + esc(it.bio) + "</p>" : "") +
                  '<span class="mth__tags">' + (it.socials || []).map(function (x) { return "<i>" + esc(x) + "</i>"; }).join("") + "</span>" +
                  '<a class="btn btn--ghost btn--sm" href="' + pageUrl(it.handle) + '" target="_blank" rel="noopener">View their page</a>' +
                "</div>" +
                '<p class="mth__sys">' + (it.source === "sticker" ? "Scanned your sticker" : "Opened your link") + " · " + esc(it.when) + "</p>" +
                '<div class="mb mb--them"><p>' + esc(it.text) + "</p></div>"
              : '<p class="mth__sys">Seen messages disappear 24 hours after they’re seen.</p>' +
                (it.msgs || []).map(function (m) { return '<div class="mb mb--' + (m.me ? "me" : "them") + '"><p>' + esc(m.text) + "</p></div>"; }).join("") +
                '<p class="mth__sys mth__sys--soft">This chat disappears in ' + esc(it.left || "24h") + "</p>") +
          "</div>" +
          '<footer class="mth__foot">' +
            (req
              ? '<p class="mth__q">Accept to reply. They can’t send anything else until you do.</p>' +
                '<div class="mth__acts">' +
                  '<button class="btn btn--go btn--grow" type="button" data-act="accept">Accept</button>' +
                  '<button class="btn btn--ghost btn--grow" type="button" data-act="ignore">Ignore</button>' +
                "</div>" +
                '<div class="mth__acts mth__acts--quiet">' +
                  '<button class="btn btn--quiet btn--sm" type="button" data-act="block">Block</button>' +
                  '<button class="btn btn--quiet btn--sm mth__rep" type="button" data-act="report">Report</button>' +
                "</div>"
              : usageHtml() + composer()) +
          "</footer>" +
        "</section>";
      var body = th.querySelector(".mth__body"); body.scrollTop = body.scrollHeight;
      if (!req) { wireComposer(it); }
    }

    function composer() {
      if (left() <= 0) { return '<p class="mth__q">You’ve used today’s 500 characters. More tomorrow.</p>'; }
      return '<div class="mth__in"><textarea rows="1" maxlength="' + left() + '" placeholder="Message" aria-label="Your message" data-msg></textarea>' +
        '<button class="mth__send" type="button" data-send disabled aria-label="Send">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg></button></div>';
    }
    function wireComposer(it) {
      var ta = th.querySelector("[data-msg]"), send = th.querySelector("[data-send]");
      if (!ta) { return; }
      var n = th.querySelector(".use__n b"), bar = th.querySelector(".use__bar i"), use = th.querySelector(".use");
      ta.addEventListener("input", function () {
        var l = left() - ta.value.length;
        send.disabled = !ta.value.trim();
        n.textContent = l; bar.style.width = Math.max(0, Math.round(l / S.usage.limit * 100)) + "%";
        use.dataset.low = String(l < 100);
        ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
      });
      send.addEventListener("click", function () {
        var v = ta.value.trim(); if (!v) { return; }
        S.usage.used = Math.min(S.usage.limit, S.usage.used + v.length);
        it.msgs = it.msgs || [];
        it.msgs.push({ me: true, text: v }); it.when = "Just now";
        drawThread("chat", it); paint();
        var t2 = th.querySelector("[data-msg]"); if (t2) { t2.focus(); }

        // Send to DB and Realtime
        var rId = it.roomId || it.id;
        if (window.CMChat && rId) {
          var ownerHandle = (a.profile && a.profile.handle) || window.localStorage.getItem("cm.username") || "";
          window.CMChat.postMessage(rId, "owner", ownerHandle, (a.profile && a.profile.name) || ownerHandle, v);
          window.CMChat.broadcast("room_" + rId, "NEW_REPLY", {
            roomId: rId,
            text: v,
            when: "Just now",
            sender: ownerHandle
          });
        }
      });
      ta.focus();
    }

    function drop(it) {
      S.requests = S.requests.filter(function (x) { return x !== it; });
      S.chats = S.chats.filter(function (x) { return x !== it; });
    }
    function accept(it) {
      drop(it);
      var rId = it.roomId || it.id;
      var c = { id: "c" + it.id, roomId: rId, name: it.name, handle: it.handle, when: it.when, unread: false, left: "24h",
                msgs: [{ me: false, text: it.text }] };
      S.chats.unshift(c);
      tab = "chats";
      paint();
      updateBadge();
      drawThread("chat", c);

      if (window.CMChat && rId) {
        window.CMChat.updateRoom(rId, { status: "active", is_request: false });
        window.CMChat.broadcast("room_" + rId, "REQUEST_ACCEPTED", { roomId: rId });
      }
    }
    function block(it) {
      CM.dialog({
        title: "Block " + it.name.split(" ")[0] + "?",
        body: "They won’t see Message or Follow on your page and can’t message you again. They won’t be told.",
        actions: [ { id: "block", label: "Block", kind: "bad" }, { id: "no", label: "Cancel", kind: "quiet" } ],
        onPick: function (id) {
          if (id !== "block") { return; }
          var rId = it.roomId || it.id;
          if (window.CMChat && rId) {
            window.CMChat.updateRoom(rId, { status: "blocked" });
            window.CMChat.broadcast("room_" + rId, "ROOM_BLOCKED", { roomId: rId });
          }
          drop(it); blocked.push(it.handle);
          closeThread(); paint(); updateBadge();
          CM.toast(it.name.split(" ")[0] + " is blocked");
        }
      });
    }
    function more(it) {
      CM.sheet({
        title: it.name,
        html: '<div class="more">' +
          '<a class="more__row" href="' + pageUrl(it.handle) + '" target="_blank" rel="noopener"><span class="more__ic">' + CM.icon("user") + '</span><span class="more__txt"><span class="more__l">View their page</span></span></a>' +
          '<button class="more__row" type="button" data-m="block"><span class="more__ic">' + CM.icon("lock") + '</span><span class="more__txt"><span class="more__l">Block</span><span class="more__s">They won’t be told</span></span></button>' +
          '<button class="more__row more__row--bad" type="button" data-m="report"><span class="more__ic">' + CM.icon("shield") + '</span><span class="more__txt"><span class="more__l">Report</span><span class="more__s">We keep a copy of this chat for our team</span></span></button>' +
        "</div>",
        onOpen: function (panel, close) {
          panel.addEventListener("click", function (e) {
            var b = e.target.closest("[data-m]"); if (!b) { return; }
            close();
            if (b.getAttribute("data-m") === "block") { block(it); } else { report(it); }
          });
        }
      });
    }

    /* ── REPORT — reasons, room for the serious ones, and it blocks too ── */
    var REASONS = [
      "Bullying, threats or harassment",
      "Scam, spam or selling",
      "Fake profile or pretending to be someone",
      "Sexual or hateful messages",
      "Something else"
    ];
    function report(it) {
      CM.sheet({
        title: "Report " + it.name.split(" ")[0],
        html: '<div class="rep">' +
          '<p class="card__note">Reports are private. ' + esc(it.name.split(" ")[0]) + " won’t know it was you. We save a copy of this chat so our team can look into it, even after it disappears.</p>" +
          '<div class="rep__list" role="radiogroup" aria-label="What happened">' + REASONS.map(function (r, i) {
            return '<label class="rep__r"><input type="radio" name="rep" value="' + i + '"><span>' + r + "</span></label>";
          }).join("") + "</div>" +
          '<label class="fld"><span class="fld__lbl">Serious issue? Tell us more <span class="mf__opt">optional</span></span>' +
            '<textarea class="fld__in" rows="4" maxlength="1000" data-more placeholder="What happened, and when. If you feel unsafe, also call 112."></textarea></label>' +
          '<label class="rep__blk"><input type="checkbox" checked data-blk> Also block ' + esc(it.name.split(" ")[0]) + "</label>" +
          '<button class="btn btn--bad btn--wide rep__go" type="button" data-send disabled>Send report</button>' +
        "</div>",
        onOpen: function (panel, close) {
          var go = panel.querySelector("[data-send]");
          panel.addEventListener("change", function () { go.disabled = !panel.querySelector('input[name="rep"]:checked'); });
          go.addEventListener("click", function () {
            var blk = panel.querySelector("[data-blk]").checked;
            if (blk) { drop(it); blocked.push(it.handle); }
            panel.querySelector(".shs__body").innerHTML =
              '<div class="rep__done"><span class="rep__tick">' + CM.icon("check") + "</span>" +
                "<b>Thanks for telling us</b>" +
                "<p>We’ve saved a copy of this chat and our team will look into it, usually within a day." +
                (blk ? " " + esc(it.name.split(" ")[0]) + " is blocked and can’t reach you." : "") + "</p>" +
                '<button class="btn btn--go btn--wide" type="button" data-sheet-close>Done</button></div>';
            panel.querySelector(".shs__t").textContent = "Report sent";
            if (blk) { closeThread(); }
            paint();
          });
        }
      });
    }

    /* ── REALTIME & SUPABASE DB SYNC FOR OWNER ── */
    var ownerHandle = (a.profile && a.profile.handle) || window.localStorage.getItem("cm.username") || "";
    if (ownerHandle) { ownerHandle = ownerHandle.toLowerCase().trim(); }

    if (window.CMChat && ownerHandle) {
      window.CMChat.joinChannel("owner_" + ownerHandle);

      // Hydrate rooms from Supabase DB
      window.CMChat.getOwnerRooms(ownerHandle).then(function (dbRooms) {
        if (!dbRooms || !dbRooms.length) return;
        var changed = false;
        dbRooms.forEach(function (r) {
          if (r.status === "ignored" || r.status === "blocked") return;
          if (r.is_request) {
            var exists = S.requests.some(function (x) { return x.roomId === r.id; });
            if (!exists) {
              S.requests.unshift({
                id: r.id,
                roomId: r.id,
                name: r.visitor_display_name || "Visitor",
                handle: r.visitor_username || "",
                source: "sticker",
                when: "Recently",
                unread: true,
                bio: "",
                socials: [],
                text: r.last_message || "Hi"
              });
              changed = true;
            }
          } else {
            var existsC = S.chats.some(function (x) { return x.roomId === r.id; });
            if (!existsC) {
              S.chats.unshift({
                id: "c" + r.id,
                roomId: r.id,
                name: r.visitor_display_name || "Visitor",
                handle: r.visitor_username || "",
                when: "Recently",
                unread: false,
                left: "24h",
                msgs: [{ me: false, text: r.last_message || "Hi" }]
              });
              changed = true;
            }
          }
        });
        if (changed) { paint(); updateBadge(); }
      });

      // Listen for incoming live Realtime requests & messages
      window.CMChat.on("*", function (ev, payload) {
        if (ev === "NEW_REQUEST") {
          var exists = S.requests.some(function (x) { return x.roomId === payload.roomId; });
          if (!exists) {
            var newReq = {
              id: payload.roomId || ("r" + Date.now()),
              roomId: payload.roomId,
              name: payload.name || "Visitor",
              handle: payload.handle || "",
              source: payload.source || "sticker",
              when: payload.when || "Just now",
              unread: true,
              bio: payload.bio || "",
              socials: payload.socials || [],
              text: payload.text || ""
            };
            S.requests.unshift(newReq);
            tab = "requests";
            paint();
            updateBadge();
            if (window.CMChat.playNotificationSound) window.CMChat.playNotificationSound();
            CM.toast("New message request from " + (newReq.name || "visitor").split(" ")[0]);
          }
        } else if (ev === "NEW_MESSAGE" || ev === "NEW_REPLY") {
          if (th && activeThreadItem && (activeThreadItem.roomId === payload.roomId || activeThreadItem.id === payload.roomId)) {
            activeThreadItem.msgs = activeThreadItem.msgs || [];
            activeThreadItem.msgs.push({ me: false, text: payload.text });
            var body = th.querySelector(".mth__body");
            if (body) {
              body.insertAdjacentHTML("beforeend", '<div class="mb mb--them"><p>' + esc(payload.text) + '</p></div>');
              body.scrollTop = body.scrollHeight;
            }
            if (window.CMChat.playNotificationSound) window.CMChat.playNotificationSound();
          } else {
            var chatItem = S.chats.find(function (c) { return c.roomId === payload.roomId; });
            if (chatItem) {
              chatItem.unread = true;
              chatItem.msgs = chatItem.msgs || [];
              chatItem.msgs.push({ me: false, text: payload.text });
              chatItem.when = "Just now";
              paint();
              updateBadge();
              if (window.CMChat.playNotificationSound) window.CMChat.playNotificationSound();
            }
          }
        }
      });
    }

    paint();
  };
})();
