/* ==========================================================================
   CODEMARCA — ORDERS TAB
   Shared by every flow folder.

   WHY THIS RENDERS A LIST — decided 2026-09-16, Garry
     "One pack per account" is gone. Ordering more is the main thing we want
     from a finished account, so an account can hold any number of orders.
     What it CANNOT hold is more than one code: every pack after the first
     is the same code, reprinted. The screen has to say that out loud, or a
     second order reads like a second page to maintain.

   Every order is drawn from the same object, so a flow only has to hand
   over `a.orders` (newest first) or a single `a.order`. Each one carries
   the fee it was BILLED — never re-derived from pack.js, because a
   delivery band that changes next month must not rewrite last month's
   invoice.

   Gift orders (`forSelf: false`) are drawn differently: they are tracked
   like any parcel, but the code on them belongs to whoever claims it.
   Since 2026-09-18 gifts are their own list on the account (`a.gifts`,
   shown on the Gift & Refer tab); they are paid, so they are merged in
   here too, newest first, alongside the account's own orders.
   ========================================================================== */

(function () {
  "use strict";

  var a = CM.shell({ page: "orders", title: "Orders" });
  var MON = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
  function when(o) {                       /* "8 Sep 2026" — parsed by hand, not trusted to Date */
    var p = String(o.placed || "").split(" ");
    return new Date(+p[2] || 0, MON[p[1]] || 0, +p[0] || 1).getTime();
  }
  var orders = (a.orders || (a.order ? [a.order] : [])).concat(a.gifts || [])
    .sort(function (x, y) { return when(y) - when(x); });

  CM.draw(a, CM.derived(a));

  /* ══ ONE ORDER ════════════════════════════════════════════════════════ */

  var STAGES = [
    { k: "placed",    t: "Order placed" },
    { k: "printed",   t: "Stickers printed" },
    { k: "shipped",   t: "Shipped" },
    { k: "delivered", t: "Delivered" }
  ];

  function chip(o) {
    if (o.status === "delivered") { return '<span class="chip chip--ok">Delivered</span>'; }
    if (o.status === "shipped")   { return '<span class="chip chip--warn">On the way</span>'; }
    return '<span class="chip chip--flat">Placed</span>';
  }

  function timeline(o) {
    var at = STAGES.map(function (s) { return s.k; }).indexOf(o.status);
    return '<ol class="tl">' + STAGES.map(function (s, i) {
      var mark = i < at || (i === at && s.k === "delivered") ? "data-done"
               : i === at ? "data-now" : "";
      var sub =
        s.k === "placed"    ? o.placed :
        s.k === "printed"   ? (o.forSelf === false
                                ? "Printed with the code that goes with this pack"
                                : "Printed with your code — the same one as always") :
        s.k === "shipped"   ? o.courier + ' · <span class="mono">' + o.awb + "</span>" :
        /* delivered */       (o.status === "delivered" ? o.eta : "Expected " + o.eta);
      var icon = s.k === "shipped" ? "truck" : "check";
      return '<li class="tl__step" ' + mark + '>' +
        '<span class="tl__mark"><span class="tl__dot">' + CM.icon(icon) + "</span>" +
          (i < STAGES.length - 1 ? '<span class="tl__line"></span>' : "") + "</span>" +
        '<span class="tl__txt"><span class="tl__t">' + s.t + "</span>" +
          '<span class="tl__s">' + sub + "</span></span>" +
      "</li>";
    }).join("") + "</ol>";
  }

  /* ONE ORDER, FOLDED — Garry, 2026-09-17
     The full card (timeline, address, bill, buttons) was too much to read
     at a glance, and with several orders it became a wall. So each order is
     an accordion: the header alone says what it is and where it stands —
     item, id, date, status chips — and the rest opens on a tap.

     For a gift the header also says whether it has been claimed, and a
     claimed gift shows WHO claimed it, with a link to their page, without
     opening anything: that is the one thing a gift buyer comes here for. */

  function chips(o) {
    var gift = o.forSelf === false;
    var out = chip(o);
    if (gift && o.status === "delivered") {
      out += o.claimed
        ? '<span class="chip chip--ok">Claimed</span>'
        : '<span class="chip chip--warn">Not claimed</span>';
    }
    return out;
  }

  /* Claimed is not counted: the referral lands when their PAGE is up
     (Garry, 2026-09-16), which is what `claimedBy.handle` stands for. */
  function claimedRow(o) {
    var by = o.claimedBy || {};
    var url = by.handle ? CM.url(by.handle) : null;
    return '<div class="oc__claim">' +
      '<span class="oc__claim-ic">' + CM.icon("check") + "</span>" +
      '<span class="oc__claim-txt">' +
        '<span class="oc__claim-t">Claimed by ' + (by.name || o.to) +
          (o.claimedOn ? " · " + o.claimedOn : "") + "</span>" +
        (url
          ? '<a class="oc__claim-url" href="' + CM.ROOT + "profile.html?handle=" +
              encodeURIComponent(by.handle) + '" target="_blank" rel="noopener">' +
              url + CM.icon("chev") + "</a>"
          : "") +
        '<span class="oc__claim-s">' + (url
          ? "Counted as one of your referrals"
          : "Counts as a referral once their page is up") + "</span>" +
      "</span>" +
    "</div>";
  }

  function card(o, i) {
    var gift = o.forSelf === false;
    var bodyId = "ob-" + o.id;
    return '<section class="card oc" data-order="' + o.id + '">' +

      '<button class="oc__head" type="button" aria-expanded="false" aria-controls="' + bodyId + '">' +
        '<span class="item__ic">' + CM.icon(gift ? "tag" : "box") + "</span>" +
        '<span class="oc__txt">' +
          '<span class="item__t">' + (gift ? "Gift for " + o.to : o.items) + "</span>" +
          '<span class="item__s"><span class="mono">' + o.id + "</span> · ordered " + o.placed + "</span>" +
          '<span class="oc__chips">' + chips(o) + "</span>" +
        "</span>" +
        '<span class="oc__chev">' + CM.icon("chev") + "</span>" +
      "</button>" +

      (gift && o.claimed ? claimedRow(o) : "") +

      '<div class="oc__body" id="' + bodyId + '" hidden>' +
        timeline(o) +

        '<p class="addr"><b>' + (gift ? o.to : a.user.name) + "</b>" +
          "<span>" + o.address + "</span></p>" +

        '<dl class="sum">' +
          '<div class="sum__row' + (o.free ? " sum__row--free" : "") + '">' +
            "<dt>" + o.items + "</dt>" +
            "<dd>" + (o.free ? "Free" : CM.money(o.goods)) + "</dd>" +
          "</div>" +
          '<div class="sum__row"><dt>Delivery</dt><dd>' + CM.money(o.ship) + "</dd></div>" +
          '<div class="sum__row sum__row--total"><dt>Paid</dt><dd>' + CM.money(o.total) + "</dd></div>" +
        "</dl>" +

        (gift && !o.claimed
          ? '<p class="note note--quiet">' + CM.icon("help") +
            '<span data-fold>' + "This gift's code is not yours. It belongs to " + o.to +
            " the moment they scan any sticker and sign in with their own email, " +
            "and it counts as one of your referrals once their page is up.</span></p>"
          : "") +

        '<div class="card__foot">' +
          '<a class="btn btn--ghost btn--sm btn--grow" href="' + invoice(o) +
            '" target="_blank" rel="noopener">' + CM.icon("down") + "Invoice</a>" +
          (o.status !== "delivered"
            ? '<button class="btn btn--ghost btn--sm btn--grow" type="button" ' +
                'data-soon="Opens the courier\'s tracking page">' +
                CM.icon("truck") + "Track parcel</button>"
            : gift ? ""
            : '<a class="btn btn--ghost btn--sm btn--grow" href="qr.html">' +
                CM.icon("qr") + "My QR</a>") +
        "</div>" +
      "</div>" +

    "</section>";
  }

  /* Drawn here, not at the top: STAGES is a `var`, so running the list
     above it would hand timeline() an undefined. */
  var box = document.querySelector("[data-orders]");
  if (box && orders.length) {
    box.innerHTML = orders.map(card).join("");
    box.addEventListener("click", function (e) {
      var h = e.target.closest(".oc__head");
      if (!h) { return; }
      var open = h.getAttribute("aria-expanded") !== "true";
      h.setAttribute("aria-expanded", String(open));
      var panel = document.getElementById(h.getAttribute("aria-controls"));
      panel.hidden = !open;
      if (open) { CM.refold(panel); }
    });
    Array.prototype.forEach.call(box.querySelectorAll("[data-ic]"), function (el) {
      el.insertAdjacentHTML("afterbegin", CM.icon(el.getAttribute("data-ic")));
    });
    /* the order cards are drawn after the shell ran, so their own long
       notes have to be handed to the folder here */
    CM.fold(box);
  }

  function invoice(o) {
    var p = new URLSearchParams({
      id:    o.id,
      pack:  o.free ? "free" : "custom",
      name:  a.user.name,
      phone: (a.user.phone || "").replace(/^\+91\s*/, ""),
      email: a.user.email,
      addr:  o.address,
      ship:  String(o.ship),
      date:  o.placed
    });
    if (o.lines) p.set("items", o.lines);
    return CM.ROOT + "invoice.html?" + p.toString();
  }
})();
