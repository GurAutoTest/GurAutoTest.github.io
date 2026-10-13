/* ==========================================================================
   CODEMARCA — FOLLOW + QUICK CHAT ON THE PUBLIC PAGE (Phase-1, 2026-10-13)
   Loaded by profile.html before its own script. Two halves:

     1. THE BLOCK under the bio, in the page's own theme: follower and
        following counts, Follow, and Message. profile.html asks for the
        markup with CMSocial.html(P, look) inside render().
     2. THE FLOW behind Message and Follow, in Codemarca's sheets (never
        themed — the page is the owner's, the sheets are ours):

          guest ──► Google sign-in ──► follow works straight away
                                  └──► message: own profile must be filled
                                       first (photo, name, ONE social at
                                       least) — real people only
          filled ──► consent (once, again every 2 weeks, 18+) ──► chat

   RULES — Garry, 2026-10-13
     · 500 characters a DAY per person, across every chat, replies included.
       The bar is always on screen.
     · The first message is a REQUEST: text only, no links, nothing more
        until the owner accepts.
     · Seen messages disappear 24 hours after they are seen.
     · The owner can switch Quick chat off (no Message button), hide the
       counts, hide the follower lists. Blocked people see no buttons.
     · No feed: following someone only puts them on a list.

   P.social is the API's shape:
     { followers, following, showCounts, showList, chat,
       people: { followers:[{name, handle}], following:[…] } }
   ========================================================================== */

(function () {
  "use strict";

  var LIMIT = 500;
  var CONSENT_DAYS = 14;

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };
  function store(k, v) {
    try {
      if (v === undefined) { return JSON.parse(window.localStorage.getItem(k)); }
      window.localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { return null; }
  }

  /* who is looking — a demo of the real session. guest · new (signed in,
     empty profile) · full (signed in, profile filled) · blocked */
  var V = (function () {
    try { return window.sessionStorage.getItem("cm.viewer") || "guest"; } catch (e) { return "guest"; }
  })();
  function setViewer(v) {
    V = v;
    try { window.sessionStorage.setItem("cm.viewer", v); } catch (e) {}
  }
  var following = false;
  var P, rerender;

  var IC = {
    chat:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.4A7.5 7.5 0 1 1 20 11.5Z"/></svg>',
    plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    tick:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    send:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    lock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>',
    g:     '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>'
  };

  function first() { return ((P && P.name) || "them").split(" ")[0]; }
  function fmt(n) { return n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n); }

  /* ══ 1. THE BLOCK ════════════════════════════════════════════════════ */
  function html(page) {
    P = page;
    var s = P.social;
    if (!s || !P.name) { return ""; }
    var n = "";
    if (s.showCounts) {
      if (!s.followers && !s.following) {
        n = '<span class="sx__new">New on Codemarca</span>';
      } else {
        var tag = s.showList ? "button" : "span";
        var attr = function (k) { return s.showList ? ' type="button" data-sx="' + k + '"' : ""; };
        n = "<" + tag + ' class="sx__c"' + attr("followers") + "><b>" + fmt(s.followers + (following ? 1 : 0)) + "</b> followers</" + tag + ">" +
            '<span class="sx__dot" aria-hidden="true">·</span>' +
            "<" + tag + ' class="sx__c"' + attr("following") + "><b>" + fmt(s.following) + "</b> following</" + tag + ">";
      }
    }
    var b = "";
    if (V !== "blocked") {
      b = '<div class="sx__b">' +
        '<button class="sx__btn sx__btn--solid" type="button" data-sx="follow" aria-pressed="' + following + '">' +
          (following ? IC.tick + "Following" : IC.plus + "Follow") + "</button>" +
        (s.chat ? '<button class="sx__btn sx__btn--soft" type="button" data-sx="message">' + IC.chat + "Message</button>" : "") +
      "</div>";
    }
    if (!n && !b) { return ""; }
    return '<div class="sx">' + (n ? '<div class="sx__n">' + n + "</div>" : "") + b + "</div>";
  }

  /* ══ 2. SHEETS ═══════════════════════════════════════════════════════
     The same shell as profile.html's share and claim sheets: a bottom
     sheet on a phone, a centred card from 640px. One at a time. */
  var openEl = null;
  function sheet(inner, label, cls) {
    closeSheet();
    var el = document.createElement("div");
    el.className = "sheet sxs" + (cls ? " " + cls : "");
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", label);
    el.innerHTML = '<div class="sheet__scrim" data-sxclose></div>' +
      '<div class="sheet__panel">' +
        '<button class="sheet__x" type="button" data-sxclose aria-label="Close">' + IC.close + "</button>" +
        '<div class="sheet__grip" aria-hidden="true"></div>' + inner +
      "</div>";
    el.addEventListener("click", function (e) { if (e.target.closest("[data-sxclose]")) { closeSheet(); } });
    document.querySelector(".pg").appendChild(el);
    document.body.style.overflow = "hidden";
    openEl = el;
    var f = el.querySelector("[data-focus]") || el.querySelector(".sheet__x");
    if (f) { setTimeout(function () { f.focus(); }, 30); }
    return el;
  }
  function closeSheet() {
    if (!openEl) { return; }
    openEl.remove(); openEl = null;
    document.body.style.overflow = "";
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") { return; }
    if (chatEl) { closeChat(); } else { closeSheet(); }
  });

  /* — sign in: one tap, Google only (no OTP on Codemarca, ever) — */
  function gate(want) {
    var el = sheet(
      '<span class="sxs__av" aria-hidden="true">' + esc(first().charAt(0).toUpperCase()) + "</span>" +
      "<h2>" + (want === "follow" ? "Follow " : "Message ") + esc(first()) + "</h2>" +
      "<p>Sign in to follow people and message them on Codemarca. It takes one tap.</p>" +
      '<button class="sxs__google" type="button" data-focus data-go>' + IC.g + "Continue with Google</button>" +
      '<p class="sxs__legal">By continuing you agree to the <a href="terms.html">Terms</a> and <a href="privacy.html">Privacy Policy</a>.</p>',
      "Sign in");
    el.querySelector("[data-go]").addEventListener("click", function () {
      /* a fresh sign-up always starts with an empty page */
      setViewer("new");
      closeSheet();
      if (want === "follow") { following = true; rerender(); }
      else { complete(); }
      syncReview();
    });
  }

  /* — no chat-only accounts: the sender shows who they are first — */
  function complete() {
    var rows = [
      { t: "A photo or a face",          s: "So they know who is saying hi" },
      { t: "Your name and a short bio",  s: "One line about you is plenty" },
      { t: "At least one social",        s: "Instagram, LinkedIn, anything real", must: true },
      { t: "A way to reach you",         s: "Phone, WhatsApp or email — you can hide it" }
    ];
    sheet(
      "<h2>Finish your page first</h2>" +
      "<p>People reply to people they can see. Before you message " + esc(first()) + ", fill in your own Codemarca page.</p>" +
      '<ul class="sxs__todo">' + rows.map(function (r) {
        return '<li><span class="sxs__chk" aria-hidden="true"></span><span><b>' + r.t +
          (r.must ? ' <em>needed</em>' : "") + "</b><small>" + r.s + "</small></span></li>";
      }).join("") + "</ul>" +
      '<a class="promo__go sxs__go" data-focus href="onboarding.html?next=message&amp;to=' + encodeURIComponent(P.handle) + '">Finish my page</a>' +
      '<p class="sxs__legal">You can follow ' + esc(first()) + " without it.</p>",
      "Finish your page");
  }

  /* — once, and again every two weeks: friendly, not a warning — */
  function consented() {
    var t = store("cm.consent");
    return t && (Date.now() - t) < CONSENT_DAYS * 864e5;
  }
  function consent() {
    var el = sheet(
      '<span class="sxs__wave" aria-hidden="true">👋</span>' +
      "<h2>Before you say hi</h2>" +
      "<p>Codemarca is for good connections. Keep it kind and keep it real.</p>" +
      '<ul class="sxs__rules">' +
        "<li>Say who you are and why you scanned.</li>" +
        "<li>" + esc(first()) + " can accept, ignore, block or report a message.</li>" +
        "<li>Bullying, threats and scams get accounts removed. We keep a copy of reported chats for our team.</li>" +
      "</ul>" +
      '<label class="sxs__age"><input type="checkbox" data-age> I’m 18 or older</label>' +
      '<button class="promo__go sxs__go" type="button" data-ok disabled>I understand</button>',
      "Before you say hi");
    var age = el.querySelector("[data-age]"), ok = el.querySelector("[data-ok]");
    age.addEventListener("change", function () { ok.disabled = !age.checked; });
    ok.addEventListener("click", function () {
      store("cm.consent", Date.now());
      closeSheet();
      chat();
    });
    setTimeout(function () { age.focus(); }, 30);
  }

  /* — who follows them, who they follow: names only, no feed — */
  function list(kind) {
    var s = P.social, ppl = (s.people && s.people[kind]) || [];
    var total = kind === "followers" ? s.followers + (following ? 1 : 0) : s.following;
    if (kind === "followers" && following) { ppl = [{ name: "You", handle: "" }].concat(ppl); }
    sheet(
      "<h2>" + (kind === "followers" ? "Followers" : "Following") + "</h2>" +
      '<ul class="sxs__ppl">' + ppl.map(function (p) {
        var inner = '<span class="sxs__pav" aria-hidden="true">' + esc(p.name.charAt(0)) + "</span>" +
          '<span class="sxs__pt"><b>' + esc(p.name) + "</b>" + (p.handle ? "<small>codemarca.com/" + esc(p.handle) + "</small>" : "") + "</span>";
        return "<li>" + (p.handle
          ? '<a href="profile.html?handle=' + encodeURIComponent(p.handle) + '">' + inner + "</a>"
          : '<span class="sxs__prow">' + inner + "</span>") + "</li>";
      }).join("") + "</ul>" +
      (total > ppl.length ? '<p class="sxs__legal">and ' + fmt(total - ppl.length) + " more</p>" : ""),
      kind === "followers" ? "Followers" : "Following", "sxs--list");
  }

  /* ══ 3. THE CHAT ═════════════════════════════════════════════════════
     A request: one message, text only, until the owner accepts. The day's
     500 characters are shared across every chat this person has, so the
     bar shows what is left today, not what is left in this box. */
  var chatEl = null;
  function today() { return new Date().toISOString().slice(0, 10); }
  function used() {
    var u = store("cm.usage");
    return u && u.day === today() ? u.used : 0;
  }
  function spend(n) { store("cm.usage", { day: today(), used: Math.min(LIMIT, used() + n) }); }
  var LINK = /(https?:\/\/|www\.)|\b[a-z0-9-]+\.(com|in|net|org|io|co|app|me|ly|xyz|link)\b/i;

  var activeRoomId = null;
  var realtimeBound = false;

  function bindRealtime() {
    if (!window.CMChat || realtimeBound) { return; }
    realtimeBound = true;
    window.CMChat.on("*", function (ev, payload) {
      if (!chatEl) { return; }
      if (ev === "NEW_REPLY") {
        if (!activeRoomId || payload.roomId === activeRoomId || !payload.roomId) {
          var body = chatEl.querySelector("[data-body]");
          if (body) {
            body.insertAdjacentHTML("beforeend",
              '<div class="cx__msg cx__msg--them"><p>' + esc(payload.text) + "</p><small>" + esc(payload.when || "Just now") + " · " + esc(first()) + "</small></div>");
            body.scrollTop = body.scrollHeight;
          }
          if (window.CMChat.playNotificationSound) { window.CMChat.playNotificationSound(); }
        }
      } else if (ev === "REQUEST_ACCEPTED") {
        if (!activeRoomId || payload.roomId === activeRoomId || !payload.roomId) {
          var foot = chatEl.querySelector("[data-foot]");
          if (foot) {
            var lock = foot.querySelector(".cx__lock");
            if (lock) { lock.innerHTML = '<span style="color:#17914F;font-weight:700;">✓ ' + esc(first()) + ' accepted your request! You can chat now.</span>'; }
            var openBtn = foot.querySelector(".cx__open");
            if (openBtn) { openBtn.remove(); }
            // enable follow-up composer
            setTimeout(function () { composer(); }, 800);
          }
        }
      }
    });
  }

  function chat() {
    closeChat();
    bindRealtime();
    activeRoomId = store("cm.room." + P.handle);
    if (activeRoomId && window.CMChat) {
      window.CMChat.joinChannel("room_" + activeRoomId);
    }
    var sent = store("cm.req." + P.handle);
    chatEl = document.createElement("div");
    chatEl.className = "cx";
    chatEl.setAttribute("role", "dialog");
    chatEl.setAttribute("aria-modal", "true");
    chatEl.setAttribute("aria-label", "Message " + first());
    chatEl.innerHTML =
      '<div class="cx__scrim" data-cxclose></div>' +
      '<section class="cx__box">' +
        '<header class="cx__head">' +
          '<span class="cx__av" aria-hidden="true">' + esc(first().charAt(0).toUpperCase()) + "</span>" +
          '<span class="cx__who"><b>' + esc(P.name) + "</b><small>Message request</small></span>" +
          '<button class="cx__x" type="button" data-cxclose aria-label="Close">' + IC.close + "</button>" +
        "</header>" +
        '<div class="cx__body" data-body>' +
          '<p class="cx__sys">Your first message goes as a request. ' + esc(first()) + " sees it and can accept, ignore or block it. Text only — no links or photos.</p>" +
          '<p class="cx__sys cx__sys--soft">Messages disappear 24 hours after they’re seen.</p>' +
        "</div>" +
        '<footer class="cx__foot" data-foot></footer>' +
      "</section>";
    chatEl.addEventListener("click", function (e) { if (e.target.closest("[data-cxclose]")) { closeChat(); } });
    document.querySelector(".pg").appendChild(chatEl);
    document.body.style.overflow = "hidden";

    if (sent) {
      showSent(sent);
      // Fetch live history from DB if room exists
      if (activeRoomId && window.CMChat) {
        window.CMChat.getRoomMessages(activeRoomId).then(function (msgs) {
          if (!chatEl || !msgs || !msgs.length) return;
          var body = chatEl.querySelector("[data-body]");
          if (!body) return;
          // Clear previous messages and show all
          var sysP = body.querySelectorAll(".cx__sys");
          body.innerHTML = "";
          sysP.forEach(function (s) { body.appendChild(s); });
          msgs.forEach(function (m) {
            if (m.sender_type === "owner") {
              body.insertAdjacentHTML("beforeend",
                '<div class="cx__msg cx__msg--them"><p>' + esc(m.content) + '</p><small>' + esc(first()) + '</small></div>');
            } else {
              body.insertAdjacentHTML("beforeend",
                '<div class="cx__msg"><p>' + esc(m.content) + '</p><small>Request sent</small></div>');
            }
          });
          body.scrollTop = body.scrollHeight;
        });
      }
    } else {
      composer();
    }
  }
  function closeChat() {
    if (!chatEl) { return; }
    chatEl.remove(); chatEl = null;
    document.body.style.overflow = "";
  }

  function usageHtml() {
    var left = LIMIT - used();
    var pct = Math.round(left / LIMIT * 100);
    return '<div class="cx__use" data-low="' + (left < 100) + '">' +
      '<span class="cx__use-t">Today</span>' +
      '<span class="cx__bar" role="meter" aria-label="Characters left today" aria-valuemin="0" aria-valuemax="' + LIMIT + '" aria-valuenow="' + left + '"><i style="width:' + pct + '%"></i></span>' +
      '<span class="cx__use-n"><b data-left>' + left + "</b> / " + LIMIT + " left</span>" +
    "</div>";
  }

  function composer() {
    var foot = chatEl.querySelector("[data-foot]");
    var left = LIMIT - used();
    if (left <= 0) {
      foot.innerHTML = usageHtml() + '<p class="cx__lock">' + IC.lock + "You’ve used today’s 500 characters. More tomorrow.</p>";
      return;
    }
    foot.innerHTML = usageHtml() +
      '<div class="cx__warn" data-warn hidden>Links can’t go in a message request.</div>' +
      '<div class="cx__in">' +
        '<textarea data-msg rows="2" maxlength="' + left + '" placeholder="Hi ' + esc(first()) + ', I saw your sticker at…" aria-label="Your message"></textarea>' +
        '<button class="cx__send" type="button" data-send disabled aria-label="Send request">' + IC.send + "</button>" +
      "</div>";
    var ta = foot.querySelector("[data-msg]"), send = foot.querySelector("[data-send]");
    var warn = foot.querySelector("[data-warn]"), leftEl = foot.querySelector("[data-left]");
    var bar = foot.querySelector(".cx__bar i"), use = foot.querySelector(".cx__use");
    ta.addEventListener("input", function () {
      var v = ta.value, l = LIMIT - used() - v.length;
      var bad = LINK.test(v);
      warn.hidden = !bad;
      send.disabled = !v.trim() || bad;
      leftEl.textContent = l;
      bar.style.width = Math.max(0, Math.round(l / LIMIT * 100)) + "%";
      use.dataset.low = String(l < 100);
      ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
    });
    send.addEventListener("click", function () {
      var v = ta.value.trim();
      if (!v || LINK.test(v)) { return; }
      spend(v.length);
      var msg = { text: v, when: "Just now" };
      store("cm.req." + P.handle, msg);
      showSent(msg);

      // Persist to Supabase and send Realtime broadcast
      if (window.CMChat) {
        var vis = window.CMChat.getVisitorProfile();
        window.CMChat.getOrCreateRoom(P.handle, vis, v).then(function (room) {
          if (room) {
            activeRoomId = room.id;
            store("cm.room." + P.handle, room.id);
            window.CMChat.joinChannel("room_" + room.id);
            window.CMChat.postMessage(room.id, "visitor", vis.id, vis.name, v);
            window.CMChat.broadcast("owner_" + (P.handle || "").toLowerCase().trim(), "NEW_REQUEST", {
              roomId: room.id,
              visitorId: vis.id,
              name: vis.name,
              handle: vis.handle,
              photo: vis.photo,
              bio: vis.bio,
              socials: vis.socials,
              text: v,
              when: "Just now",
              source: "sticker"
            });
          }
        });
      }
    });
    setTimeout(function () { ta.focus(); }, 30);
  }

  function showSent(msg) {
    var body = chatEl.querySelector("[data-body]");
    body.insertAdjacentHTML("beforeend",
      '<div class="cx__msg"><p>' + esc(msg.text) + "</p><small>" + esc(msg.when) + " · Request sent</small></div>");
    chatEl.querySelector("[data-foot]").innerHTML = usageHtml() +
      '<p class="cx__lock">' + IC.lock + "You can send more once " + esc(first()) + " accepts. Replies land in Messages on your dashboard.</p>" +
      '<a class="cx__open" href="dashboard/4-active/messages.html">Open my Messages</a>';
  }

  /* ══ 4. WIRING ═══════════════════════════════════════════════════════ */
  function onClick(e) {
    var b = e.target.closest("[data-sx]");
    if (!b || !P) { return; }
    var k = b.getAttribute("data-sx");
    if (k === "followers" || k === "following") { list(k); return; }
    if (k === "follow") {
      if (V === "guest") { gate("follow"); return; }
      following = !following;
      rerender();
      return;
    }
    if (k === "message") {
      if (V === "guest") { gate("message"); }
      else if (V === "new") { complete(); }
      else if (!consented()) { consent(); }
      else { chat(); }
    }
  }

  /* review panel: who is looking, and the owner's three switches */
  function syncReview() {
    var row = document.getElementById("revViewer");
    if (!row) { return; }
    Array.prototype.forEach.call(row.querySelectorAll("[data-vw]"), function (x) {
      x.setAttribute("aria-pressed", String(x.dataset.vw === V));
    });
    Array.prototype.forEach.call(document.querySelectorAll("#revOwner [data-ow]"), function (x) {
      var s = P.social, k = x.dataset.ow;
      var on = k === "chat" ? !s.chat : k === "counts" ? !s.showCounts : (!s.followers && !s.following);
      x.setAttribute("aria-pressed", String(on));
    });
  }
  var ZERO = null;
  function wireReview() {
    var row = document.getElementById("revViewer");
    if (row) {
      row.addEventListener("click", function (e) {
        var b = e.target.closest("[data-vw]"); if (!b) { return; }
        setViewer(b.dataset.vw);
        if (V === "guest") { following = false; }
        rerender(); syncReview();
      });
    }
    var own = document.getElementById("revOwner");
    if (own) {
      own.addEventListener("click", function (e) {
        var b = e.target.closest("[data-ow]"); if (!b) { return; }
        var s = P.social, k = b.dataset.ow;
        if (k === "chat") { s.chat = !s.chat; }
        else if (k === "counts") { s.showCounts = !s.showCounts; }
        else if (k === "zero") {
          if (s.followers || s.following) { ZERO = [s.followers, s.following]; s.followers = 0; s.following = 0; following = false; }
          else if (ZERO) { s.followers = ZERO[0]; s.following = ZERO[1]; }
        }
        rerender(); syncReview();
      });
    }
    syncReview();
  }

  window.CMSocial = {
    html: html,
    wire: function (page, redraw) {
      P = page; rerender = redraw;
      document.addEventListener("click", onClick);
      wireReview();
    }
  };
})();
