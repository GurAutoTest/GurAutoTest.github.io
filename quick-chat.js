/* ==========================================================================
   CODEMARCA — QUICK CHAT, OWNER SIDE (Phase-1, redesign Garry 2026-10-17)
   dashboard/<folder>/messages.html. Replaces the old "Messages" cards
   (social.js) with something that feels like a messaging app:

       Laptop   one card, two panes — chat list left, the open chat right
       Phone    the list fills the tab; a chat slides in full screen over
                the bars, back (or the phone's back) slides it out

   The list:  status pill (on / off · characters left) → opens the settings
              sheet; search; a row of circles — "Scan" first, then everyone
              who wrote — and Chats · Requests.
   Scan:      a camera screen that finds a Codemarca sticker (demo here) or
              a typed codemarca.com/<handle>, then "Quick Chat" opens a new
              chat. It reaches them as a request; senders with a page get two
              messages until they reply — never told the number.

   RULES carried over from social.js (2026-10-13 → 10-16)
     · Quick Chat is the owner's switch. Off = the page shows Follow only.
     · A stranger's first message is a REQUEST: Accept, Ignore, Block, Report.
     · 500 characters a day per person, every chat together, replies too.
     · Seen messages disappear 24 hours after they are seen.
     · Block is silent. Report keeps a copy and can block too.
     · DP = their page photo, else the grey person — never a letter.

   a.social is the API's shape — see state.js (4-active, 2-page-live).
   Each person may carry `face` (a PhotoKit key) standing in for a photo,
   and each message `at` (its time) and `seen` (mine, read by them).
   ========================================================================== */

(function () {
  "use strict";

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function first(n) { return String(n || "").split(" ")[0]; }
  function pageUrl(h) { return CM.ROOT + "profile.html?handle=" + encodeURIComponent(h); }
  function now() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    return (h % 12 || 12) + ":" + (m < 10 ? "0" : "") + m + (h < 12 ? " am" : " pm");
  }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function wide() { return window.matchMedia("(min-width:1024px)").matches; }

  var dp = function (p, cls) { return CM.dp(p, cls); };   /* dashboard.js */

  var IC = {
    scan:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M4 12h16"/></svg>',
    send:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>',
    timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
    ticks: '<svg viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m1 6.5 3.2 3.2L10 3.8M7.2 9.7 13.2 3.8"/></svg>',
    tick:  '<svg viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 6.5 3.2 3.2L12.5 3.8"/></svg>',
    sticker:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM20 20v.01"/></svg>',
    link:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 1 0-5.7-5.7l-1.4 1.4"/><path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 1 0 5.7 5.7l1.4-1.4"/></svg>',
    chats: '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M10 14a8 8 0 0 1 8-8h22a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H24l-9 7v-7.5A8 8 0 0 1 10 26z" fill="#101215"/><path d="M26 40a8 8 0 0 0 8 8h9l9 7v-7.6A8 8 0 0 0 58 40V30a8 8 0 0 0-8-8" fill="#E7E9EE"/><circle cx="21" cy="20" r="2.4" fill="#fff"/><circle cx="29" cy="20" r="2.4" fill="#fff"/><circle cx="37" cy="20" r="2.4" fill="#fff"/></svg>'
  };

  /* people a demo scan can find. In the product the code (or the typed
     handle) is looked up on the server — this is only the review's stand-in. */
  var DIRECTORY = [
    { name: "Meera Joshi",   handle: "meera",   face: "p-bob",  bio: "Illustrator · Pune. Coffee, comics, cats.", where: "a laptop sticker" },
    { name: "Rhea Malhotra", handle: "rhea",    face: "p-long", bio: "Runs a bakery in Sector 35.", where: "a shop shutter" },
    { name: "Gurdeep Singh", handle: "gurdeep", face: "p-suit", bio: "Co-founder, Codemarca.", where: "a car window" }
  ];

  /* ══ REVIEW ONLY — INBOX STATES ═══════════════════════════════════════
     A second picker beside the account picker, on this page only, so every
     look of the inbox can be judged without a new account state:
       account  what this account's state.js has
       empty    Quick Chat on, nobody has written yet
       off      Quick Chat switched off
       first    one brand-new request, nothing else — the very first hi
       busy     lots of chats and requests, new and old mixed
       old      everything read and old; two chats about to disappear
       limit    today's 500 characters used up
     Delete with the .demo switcher for production. */
  var INBOX = [
    { k: "account", l: "As the account has it" },
    { k: "empty",   l: "No messages yet" },
    { k: "off",     l: "Quick Chat off" },
    { k: "first",   l: "First message, just now" },
    { k: "busy",    l: "Busy — many chats" },
    { k: "old",     l: "All read, old" },
    { k: "limit",   l: "500 characters used" }
  ];
  var IKEY = "cm.inbox";
  function inboxKey() {
    var q = new URLSearchParams(window.location.search).get("inbox"), k;
    if (q) { try { localStorage.setItem(IKEY, q); } catch (e) {} return q; }
    try { k = localStorage.getItem(IKEY); } catch (e) { k = null; }
    return k || "account";
  }
  function P(id, name, handle, face, o) {
    var x = { id: id, name: name, handle: handle, face: face }, k;
    for (k in o) { x[k] = o[k]; }
    return x;
  }
  function M(me, at, text, seen) { return { me: me, at: at, text: text, seen: !!seen }; }
  function inbox(S) {
    var k = inboxKey();
    if (k === "account") {
      try {
        var saved = localStorage.getItem("cm.social_state");
        if (saved) {
          var parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            if (typeof parsed.chat === "boolean") S.chat = parsed.chat;
            if (Array.isArray(parsed.requests)) S.requests = parsed.requests;
            if (Array.isArray(parsed.chats)) S.chats = parsed.chats;
            if (parsed.usage) S.usage = parsed.usage;
          }
        }
      } catch (e) {}
    }
    else if (k === "empty") { S.chat = true; S.requests = []; S.chats = []; S.usage.used = 0; }
    else if (k === "off") { S.chat = false; S.requests = []; }
    else if (k === "first") {
      S.chat = true; S.chats = []; S.usage.used = 0;
      S.requests = [ P("f1", "Ishaan Kapoor", "ishaan", "p-tie", { source: "sticker", when: "Just now", at: now(), unread: true,
        bio: "Architect. Weekend cyclist.", socials: ["Instagram"],
        text: "Hi! Your sticker is on the car parked next to mine at Elante 😄 Love the idea." }) ];
    }
    else if (k === "busy") {
      S.chat = true; S.usage.used = 340;
      S.requests = S.requests.concat([
        P("b1", "Mehak Arora", "mehak", "p-long", { source: "sticker", when: "40 min ago", at: "3:52 pm", unread: true, bio: "Dentist, Mohali.", socials: ["Instagram"], text: "Is this your bike? The sticker made me smile." }),
        P("b2", "Zoya Siddiqui", "zoya", "shy", { source: "link", when: "Yesterday", at: "8:10 pm", bio: "", socials: ["LinkedIn"], text: "Hello! Saw your page on Simran’s profile." })
      ]);
      S.chats = S.chats.concat([
        P("b3", "Dev Malhotra", "devm", "p-suit", { source: "sticker", when: "2h ago", unread: true, left: "23h",
          msgs: [ M(false, "1:10 pm", "Bro the Kheerganga plan still on?"), M(true, "1:14 pm", "Yes! Leaving Friday night.", true), M(false, "2:02 pm", "Count me in 🙌"), M(false, "2:03 pm", "Can I bring my cousin?") ] }),
        P("b4", "Ananya Iyer", "ananya", "p-bob", { source: "link", when: "5h ago", left: "19h",
          msgs: [ M(false, "11:20 am", "Thanks for the packaging contacts!"), M(true, "11:31 am", "Anytime 😊", true) ] }),
        P("b5", "Kunal Bedi", "kunal", "cool", { source: "sticker", when: "Yesterday", left: "9h",
          msgs: [ M(false, "6:40 pm", "Found your keys near the gym — your sticker was on them!"), M(true, "6:42 pm", "You’re a lifesaver. Coming in 10.", true), M(false, "6:43 pm", "I’m at the front desk.") ] }),
        P("b6", "Pooja Rana", "pooja", "p-long", { source: "sticker", when: "Yesterday", left: "4h",
          msgs: [ M(true, "9:02 am", "Hey! Did the order land?", true), M(false, "9:30 am", "Yes, putting it on my laptop now") ] }),
        P("b7", "Sahil Grover", "sahil", "nerdy", { source: "link", when: "Mon", left: "2h",
          msgs: [ M(false, "4:15 pm", "Great talk at the meetup."), M(true, "4:20 pm", "Thanks Sahil!", false) ] }),
        P("b8", "Nisha Bhatia", "nisha", "p-bun", { source: "sticker", when: "Sun", left: "1h",
          msgs: [ M(false, "12:00 pm", "Your car sticker is so neat. Where from?"), M(true, "12:05 pm", "codemarca.com — free first pack!", true) ] })
      ]);
    }
    else if (k === "old") {
      S.chat = true; S.requests = []; S.usage.used = 0;
      S.chats = S.chats.map(function (c, i) {
        c.unread = false; c.when = i ? "Mon" : "Yesterday"; c.left = i ? "45m" : "3h";
        (c.msgs || []).forEach(function (m) { if (m.me) { m.seen = true; } });
        return c;
      }).concat([ P("o1", "Kunal Bedi", "kunal", "cool", { source: "sticker", when: "Sun", left: "20m",
        msgs: [ M(false, "6:40 pm", "Found your keys near the gym!"), M(true, "6:42 pm", "Lifesaver. Coming in 10.", true) ] }) ]);
    }
    else if (k === "limit") { S.chat = true; S.usage.used = S.usage.limit; }
    /* newest first, the way every inbox sorts */
    function rank(w) {
      var m = /(\d+)\s*(min|h)/.exec(w || "");
      if (/just now|now/i.test(w)) { return 0; }
      if (m) { return m[2] === "min" ? +m[1] : +m[1] * 60; }
      return { Yesterday: 2000, Mon: 3000, Sun: 4000 }[w] || 5000;
    }
    S.chats.sort(function (x, y) { return rank(x.when) - rank(y.when); });
    S.requests.sort(function (x, y) { return rank(x.when) - rank(y.when); });
    return S;
  }
  function inboxPicker() {
    var d = document.querySelector(".demo");
    if (!d || d.querySelector("[data-inbox]")) { return; }
    var k = inboxKey();
    d.insertAdjacentHTML("beforeend",
      '<span class="demo__lbl demo__lbl--inbox">Inbox</span>' +
      '<select class="demo__sel" data-inbox aria-label="Preview inbox state">' +
        INBOX.map(function (o) { return '<option value="' + o.k + '"' + (o.k === k ? " selected" : "") + ">" + o.l + "</option>"; }).join("") +
      "</select>");
    d.querySelector("[data-inbox]").addEventListener("change", function (e) {
      try { localStorage.setItem(IKEY, e.target.value); } catch (x) {}
      var u = new URL(window.location.href); u.searchParams.delete("inbox"); window.location.href = u.toString();
    });
  }

  /* ══ MOUNT ═══════════════════════════════════════════════════════════ */
  CM.mountMessages = function (a) {
    var root = document.querySelector("[data-messages]");
    if (!root) { return; }
    document.body.classList.add("qx-page");

    /* no page yet — nobody can scan to message, and real pages only */
    if (!a.social || !a.profile) {
      root.innerHTML =
        '<section class="qx qx--none">' +
          '<div class="qx__hero">' + IC.chats +
            "<h2>Quick Chat opens once your page is live</h2>" +
            "<p>People who scan your sticker can say hi here — and to Quick Chat anyone yourself, your own page needs a photo, a name and at least one social.</p>" +
            '<a class="btn btn--go" href="' + CM.ROOT + 'onboarding.html">Make my page</a>' +
          "</div>" +
        "</section>";
      return;
    }

    var S = inbox(clone(a.social));
    var tab = !S.chats.length && S.requests.length ? "requests" : "chats";
    var q = "";
    var cur = null;          /* { kind: "request" | "chat", it } */
    var firstPaint = true;

    function left() { return Math.max(0, S.usage.limit - S.usage.used); }
    function all() { return S.requests.concat(S.chats); }
    function find(id) { return all().filter(function (x) { return x.id === id; })[0]; }
    function kindOf(it) { return S.requests.indexOf(it) > -1 ? "request" : "chat"; }

    function persistSocial() {
      try {
        localStorage.setItem("cm.social_state", JSON.stringify(S));
        localStorage.setItem("cm.chat_enabled", JSON.stringify(S.chat));
        a.social = clone(S);
        if (typeof CM.save === "function") {
          CM.save({ social: S });
        }
      } catch (e) {}
    }

    /* ── SKELETON — built once, so search keeps focus while lists repaint ── */
    root.innerHTML =
      '<section class="qx" data-qx>' +
        '<aside class="qx__list">' +
          '<div class="qx__hd">' +
            '<div class="qx__ttl"><h1>Quick Chat</h1><button class="qx__status" type="button" data-settings></button></div>' +
            '<button class="qx__tool" type="button" data-settings aria-label="Quick Chat settings">' + CM.icon("gear") + "</button>" +
          "</div>" +
          '<label class="qx__search">' + IC.search +
            '<input type="search" placeholder="Search chats" aria-label="Search chats" data-q autocomplete="off"></label>' +
          '<div data-lbody></div>' +
        "</aside>" +
        '<section class="qx__pane" data-pane aria-live="off"></section>' +
      "</section>";
    var qx = root.querySelector("[data-qx]");
    var lbody = root.querySelector("[data-lbody]");
    var pane = root.querySelector("[data-pane]");

    /* ── THE LIST ─────────────────────────────────────────────────────── */
    function statusPaint() {
      root.querySelector(".qx__status").outerHTML =
        '<button class="qx__status" type="button" data-settings' + (S.chat ? "" : " data-off") + ">" +
          '<i aria-hidden="true"></i>' + (S.chat ? "On" : "Off") + '<span class="qx__dot">·</span>' +
          "<b>" + left() + "</b>&nbsp;left today" + CM.icon("chev") + "</button>";
    }

    function match(it) {
      if (!q) { return true; }
      var hay = (it.name + " " + (it.handle || "") + " " + (it.text || "") + " " +
        (it.msgs || []).map(function (m) { return m.text; }).join(" ")).toLowerCase();
      return hay.indexOf(q) > -1;
    }
    function lastOf(it) {
      if (it.msgs && it.msgs.length) { return it.msgs[it.msgs.length - 1]; }
      if (it.msgs) { return { me: false, text: "" }; }
      var more = it.more || [];
      return { me: false, text: more.length ? more[more.length - 1] : it.text, at: it.at };
    }
    function unreadN(it) {
      if (!it.unread) { return 0; }
      if (it.msgs) {
        var n = 0;
        for (var i = it.msgs.length - 1; i >= 0 && !it.msgs[i].me; i--) { n++; }
        return n || 1;
      }
      return 1 + (it.more || []).length;
    }

    function rowHtml(it, i) {
      var l = lastOf(it), req = kindOf(it) === "request";
      var on = cur && cur.it === it;
      var badge = it.source ? '<span class="qrow__src" title="' + (it.source === "sticker" ? "Scanned your sticker" : "Opened your link") + '">' +
        (it.source === "sticker" ? IC.sticker : IC.link) + "</span>" : "";
      return '<button class="qrow' + (firstPaint && !reduce ? " qrow--in" : "") + '" type="button" data-open="' + it.id + '"' +
          (it.unread ? " data-unread" : "") + (on ? ' aria-current="true"' : "") + ' style="--i:' + i + '">' +
        '<span class="qrow__av">' + dp(it) + badge + "</span>" +
        '<span class="qrow__txt">' +
          '<span class="qrow__top"><b>' + esc(it.name) + "</b><small>" + esc(it.when) + "</small></span>" +
          '<span class="qrow__btm">' +
            '<span class="qrow__p">' +
              (l.me ? '<span class="qrow__tk' + (l.seen ? " is-seen" : "") + '">' + (l.seen ? IC.ticks : IC.tick) + "</span>" : "") +
              (it.out && !it.msgs.length ? "<em>Say hi to " + esc(first(it.name)) + "</em>"
                : it.msgs && !it.msgs.length ? "<em>" + (it.cleared ? "You cleared this chat" : "No messages") + "</em>" : esc(l.text)) +
            "</span>" +
            (unreadN(it) ? '<span class="qrow__n">' + unreadN(it) + "</span>" : "") +
          "</span>" +
          (req && it.nopage ? '<span class="qrow__tag">No page yet</span>' : "") +
          (it.out && it.pending && it.msgs.length ? '<span class="qrow__tag qrow__tag--out">Request sent</span>' : "") +
        "</span>" +
      "</button>";
    }

    function emptyHtml() {
      if (q) { return '<div class="qx__empty"><b>No chats match “' + esc(q) + '”</b></div>'; }
      if (tab === "requests") {
        return '<div class="qx__empty">' + IC.chats + "<b>No requests</b><p>" + (S.chat
          ? "When someone scans your sticker and says hi, it lands here first."
          : "Quick Chat is off, so nobody can send one. Turn it on in settings.") + "</p></div>";
      }
      return '<div class="qx__empty">' + IC.chats + "<b>No chats yet</b>" +
        "<p>Accept a request and the chat moves here — or scan someone’s sticker and say hi first.</p>" +
        '<button class="btn btn--go btn--sm qx__scanbtn" type="button" data-scan>' + IC.scan + "Scan a sticker</button></div>";
    }

    function paintList() {
      statusPaint();
      var reqs = S.requests.filter(match), chats = S.chats.filter(match);
      var list = tab === "requests" ? reqs : chats;
      var people = S.requests.concat(S.chats);
      var reqUnread = S.requests.filter(function (r) { return r.unread; }).length;
      var chatUnread = S.chats.filter(function (c) { return c.unread; }).length;
      lbody.innerHTML =
        (S.chat ? "" :
          '<div class="qx__off"><span>' + CM.icon("pause") + "</span><p><b>Quick Chat is off.</b> Your page shows Follow only.</p>" +
          '<button class="btn btn--go btn--sm" type="button" data-turnon>Turn on</button></div>') +
        /* the circles — Scan first, then everyone who wrote */
        '<div class="qx__strip" role="list">' +
          '<button class="qcir qcir--scan" type="button" role="listitem" data-scan>' +
            '<span class="qcir__ring">' + IC.scan + "</span><span class=\"qcir__l\">Scan</span></button>" +
          people.map(function (p) {
            return '<button class="qcir" type="button" role="listitem" data-open="' + p.id + '"' + (p.unread ? " data-unread" : "") + ">" +
              '<span class="qcir__ring">' + dp(p) + "</span><span class=\"qcir__l\">" + esc(first(p.name)) + "</span></button>";
          }).join("") +
        "</div>" +
        '<div class="qx__tabs" role="tablist" aria-label="Quick Chat">' +
          '<button type="button" role="tab" data-tab="chats" aria-selected="' + (tab === "chats") + '">Chats' +
            (chatUnread ? "<i>" + chatUnread + "</i>" : "") + "</button>" +
          '<button type="button" role="tab" data-tab="requests" aria-selected="' + (tab === "requests") + '">Requests' +
            (reqUnread ? "<i>" + reqUnread + "</i>" : S.requests.length ? '<i class="is-quiet">' + S.requests.length + "</i>" : "") + "</button>" +
          '<span class="qx__tabline" data-at="' + tab + '" aria-hidden="true"></span>' +
        "</div>" +
        '<div class="qx__rows" role="tabpanel">' + (list.length ? list.map(rowHtml).join("") : emptyHtml()) + "</div>";
      firstPaint = false;
      syncBadges();
    }

    /* the chat icon's red count in the shell (top bar + desktop strip + rail dot) */
    function syncBadges() {
      var n = S.requests.filter(function (r) { return r.unread; }).length + S.chats.filter(function (c) { return c.unread; }).length;
      document.querySelectorAll('a.bell[href="messages.html"] .bell__n').forEach(function (b) {
        b.textContent = n; b.hidden = !n;
      });
      document.querySelectorAll('.side__link[href="messages.html"] .side__dot').forEach(function (d) { d.hidden = !n; });
    }

    /* ── THE OPEN CHAT ────────────────────────────────────────────────── */
    function emptyPane() {
      pane.innerHTML =
        '<div class="qx__hero">' + IC.chats +
          "<h2>Your Quick Chats</h2>" +
          "<p>Pick a chat on the left — or scan someone’s Codemarca sticker and say hi first.</p>" +
          '<button class="btn btn--go qx__scanbtn" type="button" data-scan>' + IC.scan + "Scan a sticker</button>" +
        "</div>";
    }

    function bubble(m, i, arr, fresh) {
      var nxt = arr[i + 1], prv = arr[i - 1];
      var tail = !nxt || nxt.me !== m.me;
      var head = !prv || prv.me !== m.me;
      return '<div class="bb bb--' + (m.me ? "me" : "them") + (tail ? " bb--tail" : "") + (head ? " bb--head" : "") +
          (fresh ? " bb--new" : "") + '">' +
        "<p>" + esc(m.text) + "</p>" +
        '<span class="bb__t">' + esc(m.at || "") +
          (m.me ? '<span class="bb__tk' + (m.seen ? " is-seen" : "") + '">' + (m.seen ? IC.ticks : IC.tick) + "</span>" +
            (tail ? (m.seen ? "Seen" : "Sent") : "") : "") +
        "</span></div>";
    }

    function msgsOf(it) {
      if (it.msgs) { return it.msgs; }
      return [it.text].concat(it.more || []).map(function (x) { return { me: false, text: x, at: it.at }; });
    }

    function drawThread() {
      var it = cur.it, req = cur.kind === "request";
      var dayLbl = /yesterday/i.test(it.when) ? "Yesterday" : "Today";
      var ms = msgsOf(it);
      pane.innerHTML =
        '<div class="qt' + (reduce ? "" : " qt--in") + '">' +
          '<header class="qt__head">' +
            '<button class="qt__back" type="button" data-back aria-label="Back to chats">' + CM.icon("back") + "</button>" +
            (it.nopage ? dp(it, "qdp--sm") : '<a class="qt__dpl" href="' + pageUrl(it.handle) + '" target="_blank" rel="noopener" aria-label="Open ' + esc(first(it.name)) + '’s page">' + dp(it, "qdp--sm") + "</a>") +
            '<span class="qt__who"><b>' + esc(it.name) + "</b>" +
              (it.nopage ? "<small>Signed in with Google · no page yet</small>"
                : '<a href="' + pageUrl(it.handle) + '" target="_blank" rel="noopener">codemarca.com/' + esc(it.handle) + "</a>") +
            "</span>" +
            (it.left ? '<span class="qt__left" title="This chat disappears in ' + esc(it.left) + '">' + IC.timer + esc(it.left) + "</span>" : "") +
            '<button class="qt__more" type="button" data-more aria-label="More">' + CM.icon("more") + "</button>" +
          "</header>" +
          '<div class="qt__body" data-body>' +
            '<div class="qt__wall">' +
              (req || it.out ? introCard(it) : "") +
              '<p class="qt__note">' + IC.timer + "Seen messages disappear 24 hours after they’re seen.</p>" +
              (ms.length ? '<p class="qt__day"><span>' + dayLbl + "</span></p>" : "") +
              (req ? '<p class="qt__sys">' + (it.source === "sticker" ? "Scanned your sticker" : "Opened your link") + "</p>" : "") +
              (it.out && it.via ? '<p class="qt__sys">You scanned ' + esc(first(it.name)) + "’s sticker</p>" : "") +
              (it.cleared && !ms.length ? '<p class="qt__sys">You cleared this chat · new messages show up here</p>' : "") +
              '<div class="qt__msgs" data-msgs>' + ms.map(function (m, i, arr) { return bubble(m, i, arr, false); }).join("") + "</div>" +
              '<div class="qt__typing" data-typing hidden>' + dp(it, "qdp--xs") + '<span class="qt__dots"><i></i><i></i><i></i></span></div>' +
            "</div>" +
          "</div>" +
          '<footer class="qt__foot" data-foot>' + footHtml() + "</footer>" +
        "</div>";
      scrollEnd(false);
      wireComposer();
    }

    function introCard(it) {
      return '<div class="qt__card">' + dp(it, "qdp--lg") +
        "<b>" + esc(it.name) + "</b>" +
        (it.nopage ? "<small>Signed in with Google</small>" : "<small>codemarca.com/" + esc(it.handle) + "</small>") +
        (it.bio ? "<p>" + esc(it.bio) + "</p>" : "") +
        ((it.socials || []).length ? '<span class="qt__tags">' + it.socials.map(function (x) { return "<i>" + esc(x) + "</i>"; }).join("") + "</span>" : "") +
        (it.nopage ? '<p class="qt__np">' + esc(first(it.name)) + " hasn’t built a page yet. Your reply reaches them once it’s live.</p>"
          : '<a class="btn btn--ghost btn--sm" href="' + pageUrl(it.handle) + '" target="_blank" rel="noopener">View page</a>') +
      "</div>";
    }

    function footHtml() {
      var it = cur.it;
      if (cur.kind === "request") {
        return '<div class="qt__ask">' +
          "<p><b>" + esc(first(it.name)) + " wants to Quick Chat with you.</b> Accept to reply. If you ignore, they won’t be told.</p>" +
          '<div class="qt__acts">' +
            '<button class="btn btn--quiet btn--sm qt__bad" type="button" data-act="block">Block</button>' +
            '<button class="btn btn--ghost btn--sm" type="button" data-act="ignore">Ignore</button>' +
            '<button class="btn btn--go btn--sm" type="button" data-act="accept">Accept</button>' +
          "</div></div>";
      }
      if (it.out && it.pending && it.msgs.length >= 2) {
        return '<p class="qt__wait">' + CM.icon("lock") + "Sent. You can send more once " + esc(first(it.name)) + " replies.</p>";
      }
      if (left() <= 0) { return '<p class="qt__wait">' + CM.icon("lock") + "You’ve used today’s 500 characters. More at midnight.</p>"; }
      var opener = it.out ? "Hi " + first(it.name) + ", I saw your sticker at" : "";
      return meterHtml() +
        (opener && !it.msgs.length ? '<button class="qt__chip" type="button" data-opener>' + esc(opener) + "…</button>" : "") +
        '<div class="qt__in">' +
          '<textarea rows="1" maxlength="' + left() + '" placeholder="' + esc(opener || "Message") + '" aria-label="Your message" data-msg></textarea>' +
          '<button class="qt__send" type="button" data-send disabled aria-label="Send">' + IC.send + "</button>" +
        "</div>";
    }
    function meterHtml() {
      var l = left(), pct = Math.round(l / S.usage.limit * 100);
      return '<div class="qt__use" data-low="' + (l < 100) + '">' +
        '<span class="qt__bar" role="meter" aria-label="Characters left today" aria-valuemin="0" aria-valuemax="' + S.usage.limit + '" aria-valuenow="' + l + '"><i style="width:' + pct + '%"></i></span>' +
        '<span class="qt__n"><b data-left>' + l + "</b> left today</span></div>";
    }

    function scrollEnd(smooth) {
      var b = pane.querySelector("[data-body]");
      if (!b) { return; }
      b.scrollTo({ top: b.scrollHeight, behavior: smooth && !reduce ? "smooth" : "auto" });
    }

    function wireComposer() {
      var ta = pane.querySelector("[data-msg]"), send = pane.querySelector("[data-send]");
      if (!ta) { return; }
      var nEl = pane.querySelector("[data-left]"), bar = pane.querySelector(".qt__bar i"), use = pane.querySelector(".qt__use");
      var opener = cur.it.out && !cur.it.msgs.length ? "Hi " + first(cur.it.name) + ", I saw your sticker at " : "";
      function sync() {
        var l = left() - ta.value.length;
        send.disabled = !ta.value.trim();
        nEl.textContent = Math.max(0, l);
        bar.style.width = Math.max(0, Math.round(l / S.usage.limit * 100)) + "%";
        use.dataset.low = String(l < 100);
        ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 132) + "px";
      }
      ta.addEventListener("input", sync);
      ta.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!send.disabled) { send.click(); } }
        if (e.key === "Tab" && opener && !ta.value) { e.preventDefault(); ta.value = opener; sync(); }
      });
      var chip = pane.querySelector("[data-opener]");
      if (chip) {
        chip.addEventListener("click", function () {
          ta.value = opener; sync(); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
          chip.classList.add("is-used");
        });
      }
      send.addEventListener("click", function () {
        var v = ta.value.trim(); if (!v) { return; }
        sendMsg(v);
      });
      if (wide()) { ta.focus(); }
    }

    function sendMsg(v) {
      var it = cur.it;
      S.usage.used = Math.min(S.usage.limit, S.usage.used + v.length);
      var m = { me: true, text: v, at: now(), seen: false };
      it.msgs.push(m); it.when = "Just now";
      /* newest chat to the top of the list */
      S.chats = [it].concat(S.chats.filter(function (x) { return x !== it; }));
      persistSocial();
      appendMsg();
      var chip = pane.querySelector("[data-opener]"); if (chip) { chip.remove(); }
      var foot = pane.querySelector("[data-foot]");
      if ((it.out && it.pending && it.msgs.length >= 2) || left() <= 0) { foot.innerHTML = footHtml(); }
      else {
        var ta = pane.querySelector("[data-msg]");
        ta.value = ""; ta.maxLength = left(); ta.placeholder = "Message"; ta.dispatchEvent(new Event("input")); ta.focus();
      }
      paintList();
      if (!it.out) { demoReply(it); }
    }

    /* redraw only the bubbles, so the new one can pop in */
    function appendMsg() {
      var box = pane.querySelector("[data-msgs]");
      var ms = cur.it.msgs;
      box.innerHTML = ms.map(function (m, i, arr) { return bubble(m, i, arr, i === arr.length - 1); }).join("");
      scrollEnd(true);
    }

    /* REVIEW ONLY — the other side "types" and answers once, so the chat
       can be felt end to end. The product gets real replies over the wire. */
    var REPLIES = ["Haha 😄 sounds good!", "Perfect, talk soon 🙌", "Done! Thanks yaar 👍"];
    function demoReply(it) {
      if (it._replied) { return; }
      it._replied = true;
      var mine = it;
      setTimeout(function () {
        if (!cur || cur.it !== mine) { return; }
        mine.msgs.forEach(function (m) { if (m.me) { m.seen = true; } });
        appendMsgQuiet();
        var t = pane.querySelector("[data-typing]"); if (t) { t.hidden = false; scrollEnd(true); }
      }, 900);
      setTimeout(function () {
        mine.msgs.push({ me: false, text: REPLIES[S.chats.indexOf(mine) % REPLIES.length] || REPLIES[0], at: now() });
        mine.when = "Just now";
        persistSocial();
        if (!cur || cur.it !== mine) { mine.unread = true; paintList(); return; }
        var t = pane.querySelector("[data-typing]"); if (t) { t.hidden = true; }
        appendMsg(); paintList();
      }, 2600);
    }
    function appendMsgQuiet() {
      var box = pane.querySelector("[data-msgs]");
      box.innerHTML = cur.it.msgs.map(function (m, i, arr) { return bubble(m, i, arr, false); }).join("");
    }

    /* ── OPEN / CLOSE ─────────────────────────────────────────────────── */
    function open(it, kind) {
      it.unread = false;
      cur = { kind: kind || kindOf(it), it: it };
      tab = cur.kind === "request" ? "requests" : "chats";
      drawThread();
      paintList();
      if (!wide() && !qx.hasAttribute("data-thread")) {
        qx.setAttribute("data-thread", "");
        document.body.style.overflow = "hidden";
        try { history.pushState({ qx: 1 }, ""); } catch (e) {}
      }
    }
    function closeThread(fromPop) {
      if (!qx.hasAttribute("data-thread")) { return; }
      qx.removeAttribute("data-thread");
      document.body.style.overflow = "";
      if (!fromPop) { try { if (history.state && history.state.qx) { history.back(); } } catch (e) {} }
      setTimeout(function () { if (!qx.hasAttribute("data-thread") && !wide()) { cur = null; paintList(); } }, 320);
    }
    window.addEventListener("popstate", function () { closeThread(true); });
    window.addEventListener("resize", function () {
      if (wide() && qx.hasAttribute("data-thread")) { qx.removeAttribute("data-thread"); document.body.style.overflow = ""; }
      if (wide() && !cur) { autoOpen(); }
    });
    function autoOpen() {
      var it = S.chats.filter(function (c) { return c.unread; })[0] || S.chats[0] || S.requests[0];
      if (it) { cur = { kind: kindOf(it), it: it }; it.unread = false; drawThread(); } else { emptyPane(); }
      paintList();
    }

    function drop(it) {
      S.requests = S.requests.filter(function (x) { return x !== it; });
      S.chats = S.chats.filter(function (x) { return x !== it; });
      persistSocial();
      if (cur && cur.it === it) {
        cur = null;
        if (wide()) { autoOpen(); } else { closeThread(); }
      }
      paintList();
    }
    function accept(it) {
      S.requests = S.requests.filter(function (x) { return x !== it; });
      var c = { id: "c" + it.id, name: it.name, handle: it.handle, face: it.face, source: it.source, nopage: it.nopage,
                when: it.when, unread: false, left: "24h", msgs: msgsOf(it) };
      S.chats.unshift(c);
      persistSocial();
      cur = { kind: "chat", it: c }; tab = "chats";
      var foot = pane.querySelector("[data-foot]");
      if (foot && !reduce) { foot.classList.add("is-going"); }
      setTimeout(function () { drawThread(); paintList(); CM.toast("Accepted — say hi to " + first(it.name)); }, reduce ? 0 : 180);
    }

    /* ── EVENTS ───────────────────────────────────────────────────────── */
    root.addEventListener("click", function (e) {
      var t;
      if ((t = e.target.closest("[data-tab]"))) { tab = t.getAttribute("data-tab"); paintList(); return; }
      if ((t = e.target.closest("[data-open]"))) { var it = find(t.getAttribute("data-open")); if (it) { open(it); } return; }
      if (e.target.closest("[data-scan]")) { scanner(); return; }
      if (e.target.closest("[data-settings]")) { settings(); return; }
      if (e.target.closest("[data-turnon]")) { S.chat = true; persistSocial(); paintList(); CM.toast("Quick Chat is on"); return; }
      if (e.target.closest("[data-back]")) { closeThread(); return; }
      if (e.target.closest("[data-more]")) { more(cur.it); return; }
      if ((t = e.target.closest("[data-act]"))) {
        var act = t.getAttribute("data-act"), x = cur.it;
        if (act === "accept") { accept(x); }
        else if (act === "ignore") { drop(x); CM.toast("Ignored — they won’t be told"); }
        else if (act === "block") { block(x); }
      }
    });
    root.querySelector("[data-q]").addEventListener("input", function (e) {
      q = e.target.value.trim().toLowerCase(); paintList();
    });

    /* ── SETTINGS SHEET — the switch and today's characters ───────────── */
    function settings() {
      var l = left(), pct = Math.round(l / S.usage.limit * 100);
      CM.sheet({
        title: "Quick Chat",
        html: '<div class="qset">' +
          '<label class="qset__row"' + (S.chat ? "" : " data-off") + ">" +
            '<span class="qset__txt"><b data-st>Quick Chat is ' + (S.chat ? "on" : "off") + "</b>" +
              "<small>People who scan you can message you inside Codemarca — not on your phone or WhatsApp. You choose who to reply to.</small></span>" +
            '<span class="sw"><input type="checkbox" data-qc' + (S.chat ? " checked" : "") + ' aria-label="Quick Chat"><span class="sw__track"></span></span>' +
          "</label>" +
          '<div class="qset__use"><div class="qt__use" data-low="' + (l < 100) + '">' +
            '<span class="qt__bar" role="meter" aria-label="Characters left today" aria-valuemin="0" aria-valuemax="' + S.usage.limit + '" aria-valuenow="' + l + '"><i style="width:' + pct + '%"></i></span>' +
            '<span class="qt__n"><b>' + l + "</b> / " + S.usage.limit + " left today</span></div></div>" +
          '<ul class="qset__rules">' +
            "<li>500 characters a day, across every chat — your replies too. Resets at midnight.</li>" +
            "<li>Seen messages disappear 24 hours after they’re seen.</li>" +
            "<li>Who sees Follow, the counts and the lists is on the Profile tab.</li>" +
          "</ul></div>",
        onOpen: function (panel) {
          panel.addEventListener("change", function (e) {
            if (!e.target.matches("[data-qc]")) { return; }
            S.chat = e.target.checked;
            persistSocial();
            panel.querySelector("[data-st]").textContent = "Quick Chat is " + (S.chat ? "on" : "off");
            panel.querySelector(".qset__row").toggleAttribute("data-off", !S.chat);
            paintList();
          });
        }
      });
    }

    /* ── MORE / BLOCK / REPORT ────────────────────────────────────────── */
    function more(it) {
      CM.sheet({
        title: it.name,
        html: '<div class="more">' +
          (it.nopage ? "" : '<a class="more__row" href="' + pageUrl(it.handle) + '" target="_blank" rel="noopener"><span class="more__ic">' + CM.icon("user") + '</span><span class="more__txt"><span class="more__l">View their page</span></span></a>') +
          (cur && cur.kind === "chat" && it.msgs.length ? '<button class="more__row" type="button" data-m="clear"><span class="more__ic">' + CM.icon("trash") + '</span><span class="more__txt"><span class="more__l">Clear chat</span><span class="more__s">From your side only — no need to wait 24 hours</span></span></button>' : "") +
          '<button class="more__row" type="button" data-m="block"><span class="more__ic">' + CM.icon("lock") + '</span><span class="more__txt"><span class="more__l">Block</span><span class="more__s">They won’t be told</span></span></button>' +
          '<button class="more__row more__row--bad" type="button" data-m="report"><span class="more__ic">' + CM.icon("shield") + '</span><span class="more__txt"><span class="more__l">Report</span><span class="more__s">We keep a copy of this chat for our team</span></span></button>' +
        "</div>",
        onOpen: function (panel, close) {
          panel.addEventListener("click", function (e) {
            var b = e.target.closest("[data-m]"); if (!b) { return; }
            close();
            var m = b.getAttribute("data-m");
            if (m === "clear") { clearChat(it); } else if (m === "block") { block(it); } else { report(it); }
          });
        }
      });
    }
    /* Clear chat — seen messages go by themselves after 24 hours; this is
       for "now": a shared laptop, a phone handed to a friend. It clears this
       side only; theirs still runs its own 24-hour clock. A report made
       before clearing keeps its copy (Garry, 2026-10-17). */
    function clearChat(it) {
      CM.dialog({
        title: "Clear this chat?",
        body: "Every message goes from your side, right now. " + first(it.name) + " won’t be told, and their side still disappears on its own 24 hours after it’s seen.",
        actions: [ { id: "clear", label: "Clear chat", kind: "bad" }, { id: "no", label: "Cancel", kind: "quiet" } ],
        onPick: function (id) {
          if (id !== "clear") { return; }
          it.msgs = []; it.cleared = true; it.left = null;
          persistSocial();
          if (cur && cur.it === it) {
            var box = pane.querySelector("[data-msgs]");
            if (box && !reduce) {
              box.classList.add("is-clearing");
              setTimeout(function () { drawThread(); }, 360);
            } else { drawThread(); }
          }
          paintList();
          CM.toast("Chat cleared");
        }
      });
    }
    function block(it) {
      CM.dialog({
        title: "Block " + first(it.name) + "?",
        body: "They won’t see Quick Chat or Follow on your page and can’t message you again. They won’t be told.",
        actions: [ { id: "block", label: "Block", kind: "bad" }, { id: "no", label: "Cancel", kind: "quiet" } ],
        onPick: function (id) {
          if (id !== "block") { return; }
          drop(it);
          CM.toast(first(it.name) + " is blocked");
        }
      });
    }
    var REASONS = [
      "Bullying, threats or harassment",
      "Scam, spam or selling",
      "Fake profile or pretending to be someone",
      "Sexual or hateful messages",
      "Something else"
    ];
    function report(it) {
      CM.sheet({
        title: "Report " + first(it.name),
        html: '<div class="rep">' +
          '<p class="card__note">Reports are private. ' + esc(first(it.name)) + " won’t know it was you. We save a copy of this chat so our team can look into it, even after it disappears.</p>" +
          '<div class="rep__list" role="radiogroup" aria-label="What happened">' + REASONS.map(function (r, i) {
            return '<label class="rep__r"><input type="radio" name="rep" value="' + i + '"><span>' + r + "</span></label>";
          }).join("") + "</div>" +
          '<label class="fld"><span class="fld__lbl">Serious issue? Tell us more <span class="mf__opt">optional</span></span>' +
            '<textarea class="fld__in" rows="4" maxlength="1000" data-more placeholder="What happened, and when. If you feel unsafe, also call 112."></textarea></label>' +
          '<label class="rep__blk"><input type="checkbox" checked data-blk> Also block ' + esc(first(it.name)) + "</label>" +
          '<button class="btn btn--bad btn--wide rep__go" type="button" data-send disabled>Send report</button>' +
        "</div>",
        onOpen: function (panel) {
          var go = panel.querySelector("[data-send]");
          panel.addEventListener("change", function () { go.disabled = !panel.querySelector('input[name="rep"]:checked'); });
          go.addEventListener("click", function () {
            var blk = panel.querySelector("[data-blk]").checked;
            panel.querySelector(".shs__body").innerHTML =
              '<div class="rep__done"><span class="rep__tick">' + CM.icon("check") + "</span>" +
                "<b>Thanks for telling us</b>" +
                "<p>We’ve saved a copy of this chat and our team will look into it, usually within a day." +
                (blk ? " " + esc(first(it.name)) + " is blocked and can’t reach you." : "") + "</p>" +
                '<button class="btn btn--go btn--wide" type="button" data-sheet-close>Done</button></div>';
            panel.querySelector(".shs__t").textContent = "Report sent";
            if (blk) { drop(it); }
          });
        }
      });
    }

    /* ── SCAN TO QUICK CHAT ───────────────────────────────────────────── */
    function scanner() {
      var el = document.createElement("div");
      el.className = "qs";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      el.setAttribute("aria-label", "Scan to Quick Chat");
      el.innerHTML =
        '<div class="qs__cam" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<header class="qs__head">' +
          '<button class="qs__x" type="button" data-qsx aria-label="Close">' + CM.icon("close") + "</button>" +
          "<b>Scan to Quick Chat</b><span></span>" +
        "</header>" +
        '<div class="qs__mid">' +
          '<div class="qs__frame" data-frame><i></i><i></i><i></i><i></i><span class="qs__laser"></span></div>' +
          '<p class="qs__hint" data-hint>Point your camera at a Codemarca sticker</p>' +
          '<p class="qs__sub">On a laptop? Type their link below.</p>' +
        "</div>" +
        '<div class="qs__low">' +
          '<button class="qs__demo" type="button" data-demo>' + IC.sticker + "Try a demo scan</button>" +
          '<form class="qs__link" data-link novalidate>' +
            '<span class="qs__pre">codemarca.com/</span>' +
            '<input type="text" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="their-name" aria-label="Their Codemarca link" data-h>' +
            '<button type="submit" aria-label="Find">' + CM.icon("chev") + "</button>" +
          "</form>" +
          '<p class="qs__err" data-err hidden></p>' +
        "</div>" +
        '<div class="qs__found" data-found hidden></div>';
      document.body.appendChild(el);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(function () { el.classList.add("is-on"); });

      var demoN = 0, timer = null;
      function close() {
        clearTimeout(timer);
        el.classList.remove("is-on");
        document.removeEventListener("keydown", key);
        setTimeout(function () {
          el.remove();
          if (!qx.hasAttribute("data-thread")) { document.body.style.overflow = ""; }
        }, reduce ? 0 : 260);
      }
      function key(e) { if (e.key === "Escape") { close(); } }
      document.addEventListener("keydown", key);

      function lookup(h) {
        h = String(h || "").toLowerCase().replace(/^https?:\/\//, "").replace(/^(www\.)?codemarca\.com\//, "").replace(/^@/, "").replace(/\/.*$/, "").trim();
        if (!h) { return null; }
        var mine = all().filter(function (x) { return x.handle === h; })[0];
        if (mine) { return { existing: mine }; }
        if (h === (a.profile && a.profile.handle)) { return { self: true }; }
        var d = DIRECTORY.filter(function (x) { return x.handle === h; })[0];
        if (d) return { person: d };
        return { person: { name: h.charAt(0).toUpperCase() + h.slice(1), handle: h, face: "p-bob", bio: "Codemarca profile @" + h, where: "a sticker" } };
      }

      function found(res, via) {
        var fr = el.querySelector("[data-frame]");
        fr.classList.add("is-hit");
        el.querySelector("[data-hint]").textContent = "Found it";
        timer = setTimeout(function () {
          var box = el.querySelector("[data-found]"), p = res.person || res.existing;
          box.innerHTML =
            '<div class="qs__card">' + dp(p, "qdp--lg") +
              "<b>" + esc(p.name) + "</b>" +
              (p.nopage ? "<small>Signed in with Google</small>" : "<small>codemarca.com/" + esc(p.handle) + "</small>") +
              (p.bio ? "<p>" + esc(p.bio) + "</p>" : "") +
              (res.existing ? '<p class="qs__already">You already have a chat with ' + esc(first(p.name)) + ".</p>" : "") +
              '<div class="qs__acts">' +
                (p.nopage ? "" : '<a class="btn btn--ghost" href="' + pageUrl(p.handle) + '" target="_blank" rel="noopener">View page</a>') +
                '<button class="btn btn--go" type="button" data-go>' + CM.icon("chat") + (res.existing ? "Open chat" : "Quick Chat") + "</button>" +
              "</div>" +
              '<button class="qs__again" type="button" data-again>Scan another</button>' +
            "</div>";
          box.hidden = false;
          requestAnimationFrame(function () { box.classList.add("is-on"); });
          box.querySelector("[data-go]").addEventListener("click", function () {
            close();
            if (res.existing) { open(res.existing); return; }
            var c = { id: "o" + p.handle, name: p.name, handle: p.handle, face: p.face, bio: p.bio,
                      when: "Now", unread: false, out: true, pending: true, via: via, msgs: [] };
            S.chats.unshift(c);
            persistSocial();
            open(c, "chat");
          });
          box.querySelector("[data-again]").addEventListener("click", reset);
        }, reduce ? 0 : 650);
      }
      function reset() {
        var box = el.querySelector("[data-found]");
        box.classList.remove("is-on"); box.hidden = true;
        el.querySelector("[data-frame]").classList.remove("is-hit");
        el.querySelector("[data-hint]").textContent = "Point your camera at a Codemarca sticker";
      }
      function err(t) {
        var e = el.querySelector("[data-err]");
        e.textContent = t; e.hidden = !t;
      }

      el.addEventListener("click", function (e) {
        if (e.target.closest("[data-qsx]")) { close(); return; }
        if (e.target.closest("[data-demo]")) {
          err("");
          var d = DIRECTORY[demoN++ % DIRECTORY.length];
          found({ person: d }, "sticker");
        }
      });
      el.querySelector("[data-link]").addEventListener("submit", function (e) {
        e.preventDefault();
        var res = lookup(el.querySelector("[data-h]").value);
        if (!res) { err("Type the name after codemarca.com/"); return; }
        if (res.self) { err("That’s your own page."); return; }
        if (res.none) { err("No Codemarca page at codemarca.com/" + res.none); return; }
        err(""); el.querySelector("[data-h]").blur();
        found(res, null);
      });
    }

    /* ── GO ───────────────────────────────────────────────────────────── */
    if (wide()) { autoOpen(); } else { paintList(); emptyPane(); }
    setTimeout(inboxPicker, 0);
    /* REVIEW ONLY (flows.html): ?scan=1 opens the scanner, ?scan=found also runs the demo scan */
    var sq = new URLSearchParams(window.location.search).get("scan");
    if (sq) {
      setTimeout(function () {
        scanner();
        if (sq === "found") { setTimeout(function () { var d = document.querySelector(".qs [data-demo]"); if (d) { d.click(); } }, 300); }
      }, 200);
    }
  };
})();
