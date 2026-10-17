/* ==========================================================================
   CODEMARCA — FOLLOW + QUICK CHAT ON THE PUBLIC PAGE (Phase-1, 2026-10-13)
   Loaded by profile.html before its own script. Two halves:

     1. THE BLOCK under the bio, in the page's own theme: follower and
        following counts, Follow, and Message. profile.html asks for the
        markup with CMSocial.html(P, look) inside render().
     2. THE FLOW behind Message and Follow, in Codemarca's sheets (never
        themed — the page is the owner's, the sheets are ours):

          guest ──► Google sign-in (name + photo come from Google, nothing
                    to fill in) ──► consent (once, again every 2 weeks)
                    ──► chat

   QUICK CHAT STAYS QUICK — Garry, 2026-10-16
     · No profile first. Sign in and say hi.
     · An account with no page of its own gets TWO messages. Nobody tells
       them the number up front, or the two turn into an essay. After the
       second one the chat locks: "finish your page to keep chatting —
       replies reach you once it is live". A reply that lands after the
       lock shows blurred, so the reason to finish is right there.
     · Someone whose page is live can keep going once the owner replies.

   RULES — Garry, 2026-10-13
     · 500 characters a DAY per person, across every chat, replies included.
       The bar is always on screen.
     · Text only, no links.
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
    chat:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2.5 21.5Z"/></svg>',
    plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    tick:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    send:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    lock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>',
    g:     '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>'
  };

  function first() { return ((P && P.name) || "them").split(" ")[0]; }
  /* the owner's picture exactly as their page shows it: their photo, or the
     same grey person the page draws when there is none — never a letter
     (Garry, 2026-10-16: one DP everywhere). An inline SVG "photo" is the
     demo stand-in, which the page also treats as no photo. */
  var FACE = '<svg viewBox="0 0 96 96" aria-hidden="true"><rect width="96" height="96" fill="#E7E9EE"/>' +
    '<circle cx="48" cy="38" r="16" fill="#B3B8C2"/><path d="M16 96c4-19 17-28 32-28s28 9 32 28z" fill="#B3B8C2"/></svg>';
  function dp(cls) {
    var ph = P && P.photo && !/^data:image\/svg/.test(P.photo) ? P.photo : "";
    return '<span class="' + cls + '" aria-hidden="true">' + (ph ? '<img src="' + esc(ph) + '" alt="" referrerpolicy="no-referrer">' : FACE) + "</span>";
  }
  function fmt(n) { return n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n); }

  /* ══ 1. THE BLOCK ════════════════════════════════════════════════════ */
  function html(page) {
    P = page;
    var s = P.social;
    if (!s || !P.name) { return ""; }
    var n = "";
    /* no Follow button, no follower counts either (Garry, 2026-10-16) */
    if (s.showCounts && s.follow !== false) {
      /* zero shows as zero (Garry, 2026-10-16 — "New on Codemarca" is gone) */
      var tag = s.showList ? "button" : "span";
      var attr = function (k) { return s.showList ? ' type="button" data-sx="' + k + '"' : ""; };
      n = "<" + tag + ' class="sx__c"' + attr("followers") + "><b>" + fmt(s.followers + (following ? 1 : 0)) + "</b> followers</" + tag + ">" +
          '<span class="sx__dot" aria-hidden="true">·</span>' +
          "<" + tag + ' class="sx__c"' + attr("following") + "><b>" + fmt(s.following) + "</b> following</" + tag + ">";
    }
    var b = "";
    if (V !== "blocked" && (s.follow !== false || s.chat)) {
      b = '<div class="sx__b">' +
        /* the owner can switch the Follow button off (onboarding, Messages) */
        (s.follow !== false ? '<button class="sx__btn sx__btn--solid" type="button" data-sx="follow" aria-pressed="' + following + '">' +
          (following ? IC.tick + "Following" : IC.plus + "Follow") + "</button>" : "") +
        (s.chat ? '<button class="sx__btn sx__btn--soft" type="button" data-sx="message"' +
          (unread() ? ' aria-label="Quick Chat, ' + unread() + ' new"' : "") + ">" + IC.chat + "Quick Chat" +
          (unread() ? '<span class="sx__badge" aria-hidden="true">' + unread() + "</span>" : "") + "</button>" : "") +
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
    document.body.appendChild(el);
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

  /* — sign in: one tap, Google only (no OTP on Codemarca, ever). The name
       and photo come from the Google account, so there is nothing to fill
       in before the first message (Garry, 2026-10-16) — */
  var ME = { name: "Aman Verma", initial: "A" };   /* demo: what Google hands back */
  function gate(want) {
    var el = sheet(
      dp("sxs__av") +
      "<h2>" + (want === "follow" ? "Follow " : "Quick Chat with ") + esc(first()) + "</h2>" +
      "<p>One tap with Google. We use your Google name and photo, so there is nothing to fill in.</p>" +
      '<button class="sxs__google" type="button" data-focus data-go>' + IC.g + "Continue with Google</button>" +
      '<p class="sxs__legal">By continuing you confirm you’re 18 or older and agree to the <a href="terms.html">Terms</a> and <a href="privacy.html">Privacy Policy</a>.</p>',
      "Sign in");
    el.querySelector("[data-go]").addEventListener("click", function () {
      /* a fresh sign-up has a name and a photo, but no page of its own yet */
      setViewer("new");
      closeSheet();
      if (want === "follow") { following = true; rerender(); }
      else if (consented()) { chat(); }
      else { consent(); }
      syncReview();
    });
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
      /* no age checkbox here (Garry, 2026-10-16): it read like an adult site
         and proved nothing. Age is a sign-up matter — the Google sheet's
         legal line says 18+, and a birth year at onboarding can switch
         Quick chat off for under-18s. */
      '<button class="promo__go sxs__go" type="button" data-ok data-focus>I understand</button>',
      "Before you say hi");
    var ok = el.querySelector("[data-ok]");
    ok.addEventListener("click", function () {
      store("cm.consent", Date.now());
      closeSheet();
      chat();
    });
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
     The day's 500 characters are shared across every chat this person has,
     so the bar shows what is left today, not what is left in this box.

     TWO MESSAGES, THEN THE PAGE (Garry, 2026-10-16). An account with no page
     sends two, then the chat locks until they build one. The demo plays the
     owner's side too: a reply lands after the first message, and one more
     lands — blurred — after the lock. The thread is kept per page in
     localStorage (cm.thread.<handle>) so closing and reopening keeps it.

     SMOOTH (Garry, 2026-10-16): Enter sends (Shift+Enter = new line); the
     opening line is offered as a chip — tap it on a phone, or Tab on a
     laptop — and stays editable; every message carries its time; only the
     newest bubble animates in; the owner "types" before a reply; the lock
     card grows in while the thread glides up with it. */
  var chatEl = null, shown = 0, wasLocked = false, nudgeOn = false;
  var FREE_MSGS = 2;
  function today() { return new Date().toISOString().slice(0, 10); }
  function used() {
    var u = store("cm.usage");
    return u && u.day === today() ? u.used : 0;
  }
  function spend(n) { store("cm.usage", { day: today(), used: Math.min(LIMIT, used() + n) }); }
  var LINK = /(https?:\/\/|www\.)|\b[a-z0-9-]+\.(com|in|net|org|io|co|app|me|ly|xyz|link)\b/i;

  function tKey() { return "cm.thread." + P.handle; }
  function getT() { return store(tKey()) || { msgs: [] }; }
  function putT(t) { store(tKey(), t); }
  function mine(t) { return t.msgs.filter(function (m) { return m.me; }).length; }
  function replied(t) { return t.msgs.some(function (m) { return !m.me; }); }
  /* locked = no page of their own and the two messages are spent */
  function locked(t) { return V === "new" && mine(t) >= FREE_MSGS; }
  /* waiting = a live page, two sent, and no reply yet (the request rule) */
  function waiting(t) { return V !== "new" && mine(t) >= FREE_MSGS && !replied(t); }
  function opener() { return "Hi " + first() + ", I saw your sticker at "; }

  /* "Just now", "4:12 pm", "Yesterday, 4:12 pm", "14 Oct, 4:12 pm" */
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function when(ts) {
    if (!ts) { return ""; }
    var d = new Date(ts), now = new Date();
    if (now - d < 60000) { return "Just now"; }
    var h = d.getHours(), t = ((h % 12) || 12) + ":" + String(d.getMinutes()).padStart(2, "0") + (h < 12 ? " am" : " pm");
    var y = new Date(now); y.setDate(now.getDate() - 1);
    if (d.toDateString() === now.toDateString()) { return t; }
    if (d.toDateString() === y.toDateString()) { return "Yesterday, " + t; }
    return d.getDate() + " " + MON[d.getMonth()] + ", " + t;
  }

  var tick = null;
  function chat() {
    closeChat();
    chatEl = document.createElement("div");
    chatEl.className = "cx";
    chatEl.setAttribute("role", "dialog");
    chatEl.setAttribute("aria-modal", "true");
    chatEl.setAttribute("aria-label", "Message " + first());
    chatEl.innerHTML =
      '<div class="cx__scrim" data-cxclose></div>' +
      '<section class="cx__box">' +
        '<header class="cx__head">' +
          dp("cx__av") +
          '<span class="cx__who"><b>' + esc(P.name) + "</b><small>codemarca.com/" + esc(P.handle) + "</small></span>" +
          '<button class="cx__x" type="button" data-cxclose aria-label="Close chat">' + IC.close + "</button>" +
        "</header>" +
        '<div class="cx__body" data-body></div>' +
        '<footer class="cx__foot" data-foot></footer>' +
      "</section>";
    chatEl.addEventListener("click", function (e) { if (e.target.closest("[data-cxclose]")) { closeChat(); } });
    document.body.appendChild(chatEl);
    document.body.style.overflow = "hidden";
    var t = getT();
    shown = t.msgs.length;           /* what is already there doesn't animate */
    wasLocked = locked(t);
    nudgeOn = V === "new" && mine(t) >= 1 && !wasLocked;
    draw();
    /* keep "Just now" honest while the chat is open */
    tick = setInterval(function () {
      if (!chatEl) { return; }
      var tt = getT();
      Array.prototype.forEach.call(chatEl.querySelectorAll("[data-ts]"), function (el) {
        var m = tt.msgs[+el.getAttribute("data-ts")]; if (m) { el.textContent = when(m.ts); }
      });
    }, 30000);
  }
  function closeChat() {
    if (!chatEl) { return; }
    clearInterval(tick);
    chatEl.remove(); chatEl = null;
    document.body.style.overflow = "";
    if (rerender) { rerender(); }   /* clears the badge on Message */
  }
  /* replies that came in while the chat was closed — the count on the page's
     Message button (Garry, 2026-10-16). Signed-in visitors only. */
  function unread() {
    if (V === "guest" || V === "blocked" || !P || !P.handle) { return 0; }
    var t = getT(), seen = t.seen || 0;
    return t.msgs.slice(seen).filter(function (m) { return !m.me; }).length;
  }

  function bubble(m, i, lk) {
    var fresh = i >= shown ? " is-new" : "";
    var time = '<small data-ts="' + i + '">' + esc(when(m.ts)) + "</small>";
    if (m.me) { return '<div class="cx__msg' + fresh + '"><p>' + esc(m.text) + "</p>" + time + "</div>"; }
    /* after the lock, the owner's reply is there but can't be read yet */
    if (m.held && lk) {
      return '<div class="cx__msg cx__msg--them cx__msg--held' + fresh + '"><div class="cx__hb"><p aria-hidden="true">' + esc(m.text) + "</p>" +
        '<span class="cx__held">' + IC.lock + esc(first()) + " replied</span></div>" + time + "</div>";
    }
    return '<div class="cx__msg cx__msg--them' + fresh + '"><p>' + esc(m.text) + "</p>" + time + "</div>";
  }

  /* glide the thread to the bottom — and keep gliding while the footer grows */
  function follow(ms) {
    var body = chatEl && chatEl.querySelector("[data-body]");
    if (!body) { return; }
    var end = Date.now() + (ms || 0);
    (function step() {
      if (!chatEl) { return; }
      body.scrollTo({ top: body.scrollHeight, behavior: ms ? "auto" : "smooth" });
      if (Date.now() < end) { requestAnimationFrame(step); }
    })();
    if (!ms) { return; }
    setTimeout(function () { body.scrollTo({ top: body.scrollHeight, behavior: "smooth" }); }, ms);
  }

  /* The note at the top of the thread. Before anything is sent it says who
     can do what. Once a pageless sender has sent their first message it
     turns into the nudge to build a page — if no reply ever comes and they
     close the chat, they at least leave with a page (Garry, 2026-10-16).
     After the lock the card at the bottom carries that ask, so the top goes
     quiet again. */
  function introHtml(t, lk) {
    var bar = function (cls) {
      /* Garry's Figma (2026-10-16): a dark bar, the line on the left, the
         violet button on the right. One line, never swapped mid-chat; first
         name only — a long one shrinks the type to stay on two rows. */
      return '<div class="cx__nwrap ' + cls + '"><div class="cx__nin"><div class="cx__nbar">' +
        "<p>Finish your Codemarca page so " + esc(first()) + " can see who’s saying hi.</p>" +
        '<a class="cx__nbtn" href="onboarding.html?next=chat&amp;to=' + encodeURIComponent(P.handle) + '&amp;with=' + encodeURIComponent(first()) + '">Build my page</a>' +
      "</div></div></div>";
    };
    /* before anything is sent: who can do what — and only then. Once the
       first message is out, that note never comes back (Garry, 2026-10-16). */
    if (!mine(t)) {
      nudgeOn = false;
      return '<div class="cx__intro">' +
        "<p>" + esc(first()) + " can reply, ignore or block. Text only.</p>" +
        "<p>Sending as <b>" + esc(ME.name) + "</b> · name and photo from Google. Messages disappear 24 hours after they’re seen.</p>" +
      "</div>";
    }
    if (V === "new" && !lk) {
      /* grows in the first time; later redraws keep it open */
      var grow = !nudgeOn;
      nudgeOn = true;
      return bar(grow ? "is-growing" : "is-open");
    }
    /* the lock card takes over the ask: if the bar was showing, it folds
       up and away the way it came in, instead of vanishing */
    if (nudgeOn) {
      nudgeOn = false;
      return bar("is-open is-leaving");
    }
    return "";
  }

  /* the nudge line always reads in full on two rows: a long first name
     shrinks the type a half-pixel at a time, down to 10.5px (Garry) */
  function fitNudge(body) {
    var p = body.querySelector(".cx__nbar p");
    if (!p) { return; }
    var size = parseFloat(getComputedStyle(p).fontSize);
    p.style.fontSize = "";
    size = parseFloat(getComputedStyle(p).fontSize);
    while (size > 10.5) {
      var lh = size * 1.4;
      if (p.scrollHeight <= lh * 2 + 1) { break; }
      size -= .5;
      p.style.fontSize = size + "px";
    }
  }

  function draw(typing) {
    if (!chatEl) { return; }
    var t = getT(), lk = locked(t);
    /* everything on screen now counts as seen */
    if (t.seen !== t.msgs.length) { t.seen = t.msgs.length; putT(t); }
    var body = chatEl.querySelector("[data-body]");
    body.innerHTML =
      introHtml(t, lk) +
      t.msgs.map(function (m, i) { return bubble(m, i, lk); }).join("") +
      (typing ? '<div class="cx__typing" aria-label="' + esc(first()) + ' is typing"><i></i><i></i><i></i></div>' : "");
    shown = t.msgs.length;
    fitNudge(body);
    var gone = body.querySelector(".cx__nwrap.is-leaving");
    if (gone) {
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        gone.classList.remove("is-open");
        setTimeout(function () { if (gone.parentNode) { gone.remove(); } }, 520);
      }); });
    }
    var nw = body.querySelector(".cx__nwrap.is-growing");
    if (nw) {
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        nw.classList.remove("is-growing"); nw.classList.add("is-open");
      }); });
    }

    var foot = chatEl.querySelector("[data-foot]");
    if (lk) {
      var grow = !wasLocked;          /* only the moment it locks gets the animation */
      wasLocked = true;
      foot.innerHTML = usageHtml() +
        '<div class="cx__gwrap' + (grow ? "" : " is-open") + '"><div class="cx__gin"><div class="cx__gate">' +
          '<span class="cx__gate-ic">' + IC.lock + "</span>" +
          "<b>Finish your page to keep chatting</b>" +
          "<p>Your messages reached " + esc(first()) + ". Their replies open here once your own Codemarca page is live — about two minutes.</p>" +
          '<a class="cx__open" href="onboarding.html?next=chat&amp;to=' + encodeURIComponent(P.handle) + '&amp;with=' + encodeURIComponent(first()) + '">Build my page</a>' +
        "</div></div></div>";
      if (grow) {
        var w = foot.querySelector(".cx__gwrap");
        requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add("is-open"); }); });
        follow(480);
      } else { follow(); }
      return;
    }
    wasLocked = false;
    if (waiting(t)) {
      foot.innerHTML = usageHtml() +
        '<p class="cx__lock">' + IC.lock + "Sent. You can send more once " + esc(first()) + " replies. Replies also land in Messages on your dashboard.</p>";
      follow();
      return;
    }
    composer(t);
    follow();
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

  var draft = "";
  function composer(t) {
    var foot = chatEl.querySelector("[data-foot]");
    var left = LIMIT - used();
    if (left <= 0) {
      foot.innerHTML = usageHtml() + '<p class="cx__lock">' + IC.lock + "You’ve used today’s 500 characters. More tomorrow.</p>";
      return;
    }
    var start = !t.msgs.length;
    var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    foot.innerHTML = usageHtml() +
      '<div class="cx__warn" data-warn hidden>Links can’t go in a message.</div>' +
      (start
        ? '<button class="cx__chip" type="button" data-chip>' + esc(opener()) + "…" +
            (fine ? '<kbd>Tab</kbd>' : "") + "</button>"
        : "") +
      '<div class="cx__in">' +
        '<textarea data-msg rows="1" maxlength="' + left + '" placeholder="' +
          (start ? esc(opener()) + "…" : "Message") + '" aria-label="Your message"></textarea>' +
        '<button class="cx__send" type="button" data-send disabled aria-label="Send">' + IC.send + "</button>" +
      "</div>";
    var ta = foot.querySelector("[data-msg]"), send = foot.querySelector("[data-send]");
    var chip = foot.querySelector("[data-chip]");
    var warn = foot.querySelector("[data-warn]"), leftEl = foot.querySelector("[data-left]");
    var bar = foot.querySelector(".cx__bar i"), use = foot.querySelector(".cx__use");
    ta.value = draft;

    function sync() {
      var v = ta.value, l = LIMIT - used() - v.length;
      var bad = LINK.test(v);
      draft = v;
      warn.hidden = !bad;
      send.disabled = !v.trim() || bad;
      leftEl.textContent = l;
      bar.style.width = Math.max(0, Math.round(l / LIMIT * 100)) + "%";
      use.dataset.low = String(l < 100);
      if (chip) { chip.hidden = !!v; }
      ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
    }
    /* the opening line goes into the box, cursor at the end, ready to finish */
    function useOpener() {
      ta.value = opener(); sync();
      ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
    }
    ta.addEventListener("input", sync);
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Tab" && !e.shiftKey && start && !ta.value) { e.preventDefault(); useOpener(); return; }
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        if (!send.disabled) { send.click(); }
      }
    });
    if (chip) { chip.addEventListener("click", useOpener); }
    send.addEventListener("click", function () {
      var v = ta.value.trim();
      if (!v || LINK.test(v)) { return; }
      spend(v.length);
      draft = "";
      var tt = getT();
      tt.msgs.push({ me: true, text: v, ts: Date.now() });
      putT(tt);
      draw();
      demoReply(tt);
      var nt = chatEl && chatEl.querySelector("[data-msg]"); if (nt) { nt.focus(); }
    });
    sync();
    setTimeout(function () { ta.focus(); }, 30);
  }

  /* demo only — the owner's side. A reply after the first message; after the
     lock, one more that stays blurred until the sender's page is live. The
     owner "types" for a moment first. */
  function demoReply(t) {
    var n = mine(t);
    var text = n === 1 ? "Hey! Thanks for scanning 😊 Who’s this?"
             : locked(t) ? "Haha nice, which café was it? Tell me more!" : "";
    if (!text) { return; }
    var lockNow = locked(t);
    setTimeout(function () {
      if (chatEl && !lockNow) { keepDraft(); draw(true); }
    }, 700);
    setTimeout(function () {
      var t2 = getT();
      t2.msgs.push({ me: false, text: text, held: locked(t2), ts: Date.now() });
      putT(t2);
      if (!chatEl) { if (rerender) { rerender(); } return; }   /* closed: it shows as a count */
      keepDraft();
      draw();
    }, n === 1 ? 2600 : 2000);
  }
  /* a redraw rebuilds the box, so hold on to what was being typed */
  function keepDraft() {
    var ta = chatEl && chatEl.querySelector("[data-msg]");
    if (ta) { draft = ta.value; }
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
      if (k === "reset") { return; }
      var on = k === "follow" ? s.follow === false : k === "chat" ? !s.chat : k === "counts" ? !s.showCounts : (!s.followers && !s.following);
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
        if (k === "reset") {
          try { window.localStorage.removeItem("cm.thread." + P.handle); window.localStorage.removeItem("cm.usage"); window.localStorage.removeItem("cm.consent"); } catch (err) {}
          setViewer("guest"); following = false; closeChat(); rerender(); syncReview();
          return;
        }
        if (k === "chat") { s.chat = !s.chat; }
        else if (k === "follow") { s.follow = s.follow === false; }
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
      /* back from onboarding (?chat=open): their page is live now, so the
         chat opens straight away, unlocked — held replies readable
         (Garry, 2026-10-16: don't lose them on the success screen) */
      if (new URLSearchParams(location.search).get("chat") === "open") {
        setViewer("full");
        rerender(); syncReview();
        setTimeout(chat, 250);
      }
    }
  };
})();
