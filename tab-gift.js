/* ==========================================================================
   CODEMARCA — REFER & GIFT TAB. Shared by every flow folder.

   TWO TABS, REFER FIRST (Garry, 2026-09-27). Referring earns the tee, so it
   is the open tab; gifting is the paid favour behind it. Each keeps its own
   list, and the counts sit on the tab buttons so neither list has to be
   opened to know whether there is anything in it.

   THE RULES THIS SCREEN SHOWS
     · A gift is PAID — the per-sticker custom prices in pack.js.
     · Any sizes, any quantity, and ONE code on every sticker in it. Ten
       stickers to one person is one code, one page, one referral.
     · One recipient per gift. A second person is a second order.
     · The code is nobody's until the recipient scans a sticker and signs in
       with their own email. It counts as a referral once their PAGE is up —
       the same rule as an invite link, so a paid gift cannot buy the tee.
     · No page of your own = no handle = no invite link yet. That card shows
       a locked row instead of the buttons.

   A gift's stage is read off the order:
     placed / shipped          on its way
     delivered, not claimed    waiting for them to scan and sign in
     claimed, no handle        signed in, page not up — not counted yet
     claimed, handle           page live — counted
   ========================================================================== */

(function () {
  "use strict";

  var a = CM.shell({ page: "gift", title: "Refer & Gift" });
  var P = window.PACK;
  /* An account that has never had a page has no referrals block at all —
     no handle means no invite link. Fill it in so every part of this
     screen, and CM.referCard, can read the same shape. */
  var R = a.referrals || { counted: 0, goal: 50, waiting: 0, people: [], link: null, claimed: false };
  a.referrals = R;
  var gifts = (a.gifts || []).slice();
  var people = (R.people || []).slice();

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }


  /* ══ 1. THE TWO TABS ══════════════════════════════════════════════════
     #gift in the address opens the second one, so anything that links here
     about a gift can land on it. */

  function show(which) {
    all("[data-tab]", function (b) {
      b.setAttribute("aria-selected", String(b.dataset.tab === which));
    });
    all("[data-pane]", function (p) { p.hidden = p.dataset.pane !== which; });
    if (history.replaceState) {
      history.replaceState(null, "", which === "gift" ? "#gift" : location.pathname);
    }
  }
  all("[data-tab]", function (b) {
    b.addEventListener("click", function () { show(b.dataset.tab); });
  });
  one("[data-ref-n]").textContent  = R.counted || people.length || 0;
  one("[data-gift-n]").textContent = gifts.length;


  /* ══ 2. REFER ═════════════════════════════════════════════════════════ */

  var pattern = CM.qr(a.code ? a.code.id : "preview");
  CM.referCard(a, pattern);                 /* meter, subline, the five tees */

  if (!R.link) {
    one("[data-share-row]").hidden = true;
    one("[data-lock]").hidden = false;
  }

  /* who joined — counted, or still building */
  var pbox = one("[data-people]");
  if (people.length) {
    pbox.innerHTML = people.map(function (p) {
      return '<span class="row">' +
        '<span class="row__ic"' + (p.done ? " data-done" : " data-wait") + ">" +
          CM.icon(p.done ? "check" : "user") + "</span>" +
        '<span class="row__txt">' +
          '<span class="row__t">' + p.name + "</span>" +
          '<span class="row__s">' + (p.done ? "Page live · counted" : "Signed up · page not up yet") +
            " · " + p.joined + "</span>" +
        "</span>" +
        '<span class="row__end">' + (p.done
          ? '<span class="chip chip--ok">Counted</span>'
          : '<span class="chip chip--warn">Waiting</span>') + "</span>" +
      "</span>";
    }).join("");
    /* the full count, not the sample list — home reads the same number */
    var waiting = R.waiting != null ? R.waiting : people.filter(function (p) { return !p.done; }).length;
    one("[data-ref-sum]").innerHTML =
      "<b>" + R.counted + "</b> counted" + (waiting ? " · <b>" + waiting + "</b> waiting" : "");
  } else {
    pbox.hidden = true;
    one("[data-people-empty]").hidden = false;
  }


  /* ══ 3. THE TEE — design, size, address, shipped ══════════════════════
     Nothing here is a step of its own. The designs are on screen anyway;
     at 50 they simply become choosable and the size row appears. */

  var SIZES = ["S", "M", "L", "XL", "XXL"];
  var unlocked = R.counted >= R.goal && !R.claimed;
  var design = null, size = null;

  var tees = one("#tees");
  Array.prototype.forEach.call(tees.children, function (el, i) {
    el.setAttribute("role", "radio");
    el.setAttribute("aria-checked", "false");
    el.dataset.tee = CM.TEES[i].k;
    if (!unlocked) { return; }
    el.addEventListener("click", function () {
      design = el.dataset.tee;
      Array.prototype.forEach.call(tees.children, function (x) {
        x.setAttribute("aria-checked", String(x === el));
      });
      ready();
    });
  });

  if (R.claimed) {
    one("[data-claimed]").hidden = false;
    one("[data-hint]").textContent = "Claimed";
  } else if (unlocked) {
    tees.setAttribute("data-open", "");
    one("[data-hint]").textContent = "Pick one";
    one("[data-pick]").hidden = false;
    var sbox = one("[data-sizes]");
    sbox.innerHTML = SIZES.map(function (s) {
      return '<button class="size" type="button" role="radio" aria-checked="false" data-size="' + s + '">' + s + "</button>";
    }).join("");
    sbox.addEventListener("click", function (e) {
      var b = e.target.closest("[data-size]");
      if (!b) { return; }
      size = b.dataset.size;
      Array.prototype.forEach.call(sbox.children, function (x) {
        x.setAttribute("aria-checked", String(x === b));
      });
      ready();
    });
  } else {
    tees.setAttribute("data-locked", "");
  }

  var claim = one("[data-claim]");
  function ready() {
    var ok = design && size;
    claim.disabled = !ok;
    claim.textContent = ok ? "Claim my tee"
      : !design ? "Pick a design and a size" : "Pick a size";
  }


  /* ══ 3b. THE ADDRESS ══════════════════════════════════════════════════
     One sheet, prefilled from the last order when there is one, so most
     people only have to read it and tap. */

  var sheet = one("[data-csheet]");
  var addr  = one("[data-addr]");
  var saved = (a.order && a.order.address) ||
              (a.orders && a.orders[0] && a.orders[0].address) || "";

  function openSheet() {
    addr.value = saved;
    one("[data-csheet-s]").textContent = saved
      ? "We kept this from your last order. Change it if it has moved."
      : "We have no address for you yet.";
    sheet.hidden = false;
    document.body.style.overflow = "hidden";
    addr.focus();
  }
  function closeSheet() {
    sheet.hidden = true;
    document.body.style.overflow = "";
  }

  if (claim) { claim.addEventListener("click", openSheet); }
  all("[data-csheet-close]", function (b) { b.addEventListener("click", closeSheet); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !sheet.hidden) { closeSheet(); }
  });

  one(".csheet__box").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!addr.value.trim()) { CM.toast("Add an address first"); addr.focus(); return; }
    closeSheet();
    one("[data-pick]").hidden = true;
    one("[data-claimed]").hidden = false;
    one("[data-hint]").textContent = "Claimed";
    tees.removeAttribute("data-open");
    CM.toast("Tee claimed — it ships this week");
  });


  /* ══ 4. GIFT ══════════════════════════════════════════════════════════
     The folder this page sits in is the flow a gift checkout hands back to,
     so it travels with the order as `from`. */

  var flow = (window.location.pathname.match(/dashboard\/([^/]+)\//) || [])[1];
  var send = P.orderQuery({ kind: "custom", gift: true, from: flow, built: !!a.profile });
  all("[data-send]", function (el) { el.href = CM.ROOT + "select-pack.html" + send; });

  var from = P.SIZES.reduce(function (m, s) { return Math.min(m, s.price); }, Infinity);
  all("[data-price]", function (el) {
    el.innerHTML = "From <b>₹" + P.inr(from) + "</b> a sticker, plus delivery";
  });

  function stage(g) {
    if (g.claimed && g.claimedBy && g.claimedBy.handle) { return "counted"; }
    if (g.claimed) { return "claimed"; }
    if (g.status === "delivered") { return "waiting"; }
    return "moving";
  }

  function stickers(g) {
    var n = (g.lines || "").split(",").reduce(function (t, bit) {
      return t + (parseInt(bit.split(":")[1], 10) || 0);
    }, 0);
    return n ? n + (n === 1 ? " sticker" : " stickers") : "";
  }

  var LOOK = {
    moving:  { ic: "truck", chip: '<span class="chip chip--flat">On the way</span>' },
    waiting: { ic: "help",  chip: '<span class="chip chip--warn">Not claimed</span>' },
    claimed: { ic: "user",  chip: '<span class="chip chip--flat">Claimed</span>' },
    counted: { ic: "check", chip: '<span class="chip chip--ok">Counted</span>' }
  };

  function sub(g, st) {
    if (st === "counted") { return "Page live · " + CM.url(g.claimedBy.handle); }
    if (st === "claimed") { return "Signed in · counts once their page is up"; }
    if (st === "waiting") { return "Delivered · waiting for them to scan it"; }
    return [stickers(g), "sent " + g.placed].filter(Boolean).join(" · ");
  }

  var gbox = one("[data-gifts]");
  if (gifts.length) {
    gbox.innerHTML = gifts.map(function (g) {
      var st = stage(g), look = LOOK[st];
      return '<a class="row" href="orders.html">' +
        '<span class="row__ic"' + (st === "counted" ? " data-done" : "") + ">" + CM.icon(look.ic) + "</span>" +
        '<span class="row__txt">' +
          '<span class="row__t">For ' + g.to + "</span>" +
          '<span class="row__s">' + sub(g, st) + "</span>" +
        "</span>" +
        '<span class="row__end">' + look.chip + "</span>" +
      "</a>";
    }).join("");
    var counted = gifts.filter(function (g) { return stage(g) === "counted"; }).length;
    one("[data-sum]").innerHTML =
      "<b>" + gifts.length + "</b> sent · <b>" + counted + "</b> counted";
  } else {
    gbox.hidden = true;
    one("[data-gifts-empty]").hidden = false;
  }


  if (location.hash === "#gift") { show("gift"); }

  CM.draw(a, CM.derived(a));
})();
