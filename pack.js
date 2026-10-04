/* ════════════════════════════════════════════════════════════════════════
   pack.js — the numbers, in one place.

   select-pack.html and checkout.html both need the same pack list, the same
   size table and the same delivery rates. Holding them in two files is how
   a ₹79 becomes a ₹89 on one screen and not the other, so they live here
   and nowhere else.

   EVERY RUPEE FIGURE AND EVERY MEASUREMENT BELOW IS A PLACEHOLDER.
   When the printer quotes and the courier quotes land, change them here.
   Nothing outside this file needs touching.
   ════════════════════════════════════════════════════════════════════════ */
(function (root) {
  "use strict";

  /* ── THE FREE PACK ────────────────────────────────────────────────────
     One per account, forever, and ALWAYS for the account itself — Garry,
     2026-09-18. The pack costs nothing; the person covers the courier. Two
     stickers so one can go on the counter and one on a phone case, a
     helmet, a laptop. It can never be a gift: a gift is a paid custom
     order (see GIFT below). */
  var FREE = {
    key: "free",
    name: "Codemarca pack",
    blurb: "Two stickers \u2014 4\u2033 and 1.5\u2033 \u00b7 one code \u00b7 one page",
    price: 0,                 /* the whole point */
    qty: 1,
    onePerAccount: true
  };

  /* ── CUSTOM SIZES ─────────────────────────────────────────────────────
     Square stickers, sold single-size with a quantity. The free pack's
     two-sticker combo is not offered here — someone ordering custom is
     printing for a counter, a shop shutter, a stall board, and wants N of
     one size rather than a mixed pair.

     Sizes FINAL — Garry, 2026-09-24: S 1.5\u2033, M 3\u2033, L 4\u2033, XL 5\u2033,
     XXL 6\u2033. The free pack is S + L.

     `price` is PER STICKER. Placeholder.
     `mm`    is the printed edge, and select-pack draws the sticker to scale
             from the number at the front of it — keep it first.
     `photo` is the real shot for the size picker, sticker next to something
             everyone knows the size of. null until the photos land; the
             page draws a stand-in until then. Drop the path in, nothing
             else changes. */
  var SIZES = [
    { key:"S",   name:"Small",       inch:'1.5\u2033 \u00d7 1.5\u2033', mm:"38 \u00d7 38 mm",   price:79,  photo:null },
    { key:"M",   name:"Medium",      inch:'3\u2033 \u00d7 3\u2033',     mm:"76 \u00d7 76 mm",   price:119, photo:null },
    { key:"L",   name:"Large",       inch:'4\u2033 \u00d7 4\u2033',     mm:"102 \u00d7 102 mm", price:169, photo:null },
    { key:"XL",  name:"Extra large", inch:'5\u2033 \u00d7 5\u2033',     mm:"127 \u00d7 127 mm", price:249, photo:null },
    { key:"XXL", name:"Double XL",   inch:'6\u2033 \u00d7 6\u2033',     mm:"152 \u00d7 152 mm", price:349, photo:null }
  ];

  /* QTY_MAX is for the WHOLE custom order, across every size in it — past
     that it is a bulk conversation, not a checkout. */
  var QTY_MIN = 1, QTY_MAX = 50;

  /* ── GIFT ─────────────────────────────────────────────────────────────
     Decided 2026-09-18, Garry. A gift is a custom order with `gift: true`:
       · always PAID — the same per-sticker prices as SIZES above, so the
         gift price is a placeholder exactly as they are
       · any sizes, any quantity (up to QTY_MAX an order, like any custom)
       · ONE code on every sticker in it, whatever the mix — so ten stickers
         to one person is one code, one page, and one referral
       · ONE recipient per order. A second person is a second order
       · the code is nobody's until the recipient scans a sticker and signs
         in with their own email; building their page is what counts it as
         a referral for the buyer
     It is ordered from the Gift & Refer tab of the dashboard, never from
     the free-pack path. */

  /* The four dashboard folders an order can be placed from, and so the
     four a gift checkout can hand back to. Anything else falls to 1-empty
     rather than a 404. */
  var FLOWS = ["1-empty", "2-page-live", "3-pack-coming", "4-active"];
  function flowOr(f) { return FLOWS.indexOf(f) !== -1 ? f : "1-empty"; }

  /* ── DELIVERY ZONES ───────────────────────────────────────────────────
     Resolved from the delivery STATE, which checkout already derives from
     the pincode. Four bands, because a courier quotes in bands, not per
     state.

     To move a state between zones — say Tamil Nadu turns out to cost more
     than the rest — cut its name from one `states` array and paste it into
     another. That is the whole edit.

     `fee` is a placeholder. The real slab is not quoted yet. */
  var ZONES = [
    { key:"local", fee:49,  label:"Local",
      states:["Punjab","Chandigarh","Haryana","Himachal Pradesh","Delhi"] },

    { key:"north", fee:79,  label:"North India",
      states:["Uttar Pradesh","Uttarakhand","Rajasthan","Jammu & Kashmir","Ladakh",
              "Bihar","Jharkhand","Madhya Pradesh","Chhattisgarh"] },

    { key:"rest",  fee:99,  label:"Rest of India",
      states:["Maharashtra","Gujarat","Goa","Telangana","Andhra Pradesh","Karnataka",
              "Kerala","Tamil Nadu","Odisha","West Bengal","Puducherry",
              "Dadra & Nagar Haveli and Daman & Diu"] },

    { key:"far",   fee:149, label:"Far reach",
      states:["Assam","Arunachal Pradesh","Manipur","Meghalaya","Mizoram","Nagaland",
              "Sikkim","Tripura","Andaman & Nicobar Islands","Lakshadweep"] }
  ];

  /* A state that is in no list falls here rather than shipping free by
     accident. Widest band, so a miss costs us nothing. */
  var ZONE_FALLBACK = ZONES[ZONES.length - 1];

  function zoneFor(state) {
    if (!state) return null;
    for (var i = 0; i < ZONES.length; i++) {
      if (ZONES[i].states.indexOf(state) !== -1) return ZONES[i];
    }
    return ZONE_FALLBACK;
  }

  function sizeFor(key) {
    for (var i = 0; i < SIZES.length; i++) if (SIZES[i].key === key) return SIZES[i];
    return null;
  }

  function clampQty(n) {
    n = parseInt(n, 10);
    if (!n || n < QTY_MIN) return QTY_MIN;
    return n > QTY_MAX ? QTY_MAX : n;
  }

  /* Indian grouping — 1,00,000 not 100,000. Intl handles it; the manual
     fallback is there because this has to render the same on an old
     Android WebView as it does on a desktop Chrome. */
  function inr(n) {
    n = Math.round(Number(n) || 0);
    try { return n.toLocaleString("en-IN"); } catch (e) {}
    var s = String(n), last = s.slice(-3), head = s.slice(0, -3);
    if (!head) return last;
    return head.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last;
  }

  /* ── THE ORDER ────────────────────────────────────────────────────────
     One shape every page reads, so select-pack, checkout and the invoice
     can never disagree about what is being bought.

     kind : "free" | "custom"
     items: custom only — [{ size:"L", qty:2 }, { size:"XL", qty:1 }]
            any mix of sizes, each once, in SIZES order
     state: the delivery state, once known — null until then

     cleanItems is the one gate every list goes through: unknown sizes are
     dropped, a size named twice is merged, each quantity is at least 1, and
     the order as a whole is capped at QTY_MAX (the last lines give way). */
  function cleanItems(list) {
    var byKey = {};
    (list || []).forEach(function (it) {
      if (!it || !sizeFor(it.size)) return;
      var n = parseInt(it.qty, 10);
      byKey[it.size] = (byKey[it.size] || 0) + (n > 0 ? n : 1);
    });
    var room = QTY_MAX, out = [];
    SIZES.forEach(function (s) {
      if (!byKey[s.key] || room <= 0) return;
      var n = Math.min(byKey[s.key], room);
      room -= n;
      out.push({ size: s.key, qty: n });
    });
    return out;
  }

  function priceOrder(o) {
    var gift  = !!(o && o.gift);
    var kind  = gift || (o && o.kind === "custom") ? "custom" : "free";
    var items = kind === "custom" ? cleanItems(o.items) : [];
    var lines = items.map(function (it) {
      var s = sizeFor(it.size);
      return { size: s, qty: it.qty, amount: s.price * it.qty };
    });
    var qty   = kind === "custom" ? lines.reduce(function (a, l) { return a + l.qty; }, 0) : 1;
    var goods = lines.reduce(function (a, l) { return a + l.amount; }, 0);
    var zone  = zoneFor(o && o.state);

    var title, blurb;
    if (kind === "free") {
      title = FREE.name; blurb = FREE.blurb;
    } else if (!lines.length) {
      title = gift ? "A gift" : "Custom stickers"; blurb = "Pick at least one size";
    } else if (gift) {
      title = "A gift";
      blurb = qty + (qty === 1 ? " sticker" : " stickers") +
              (lines.length > 1 ? " in " + lines.length + " sizes" : "") + " \u00b7 one code, theirs";
    } else {
      title = lines.length === 1 ? lines[0].size.name + " \u00b7 " + lines[0].size.inch : "Custom stickers";
      blurb = qty + (qty === 1 ? " sticker" : " stickers") +
              (lines.length > 1 ? " in " + lines.length + " sizes" : "") + " \u00b7 one code";
    }

    return {
      kind:  kind,
      gift:  gift,
      items: items,
      lines: lines,                          /* [{ size, qty, amount }] */
      qty:   qty,                            /* stickers in the order */
      goods: goods,
      zone:  zone,
      ship:  zone ? zone.fee : null,         /* null = pincode not in yet */
      total: zone ? goods + zone.fee : null,
      title: title,
      blurb: blurb
    };
  }

  /* ── URL ──────────────────────────────────────────────────────────────
     The pages hand each other state through the query string, because a
     prototype with no backend has nowhere else to put it.

     pack  = free | custom
     items = L:2,XL:1                  (custom only — size:qty pairs)
     size, qty                         old single-size links; still read,
                                       never written
     built = 1                         this account already has a live page
     free  = used                      the one free pack is already spent
     gift  = 1                         a paid gift for someone else — forces
                                       pack=custom; never set on the free path
     from  = 1-empty | 2-page-live | 3-pack-coming | 4-active
                                       the dashboard a gift was started from,
                                       so checkout can hand the buyer back
                                       to that same Gift & Refer tab

     `free=used` is the demo switch for an account that has had its free
     pack — the real answer comes from the account, not the URL. */
  function readOrder(search) {
    var q = new URLSearchParams(search || (root.location && root.location.search) || "");
    var gift = q.get("gift") === "1";
    return {
      kind:     gift || q.get("pack") === "custom" ? "custom" : "free",
      items:    readItems(q),
      built:    q.get("built") === "1",
      freeUsed: q.get("free") === "used",
      gift:     gift,
      from:     q.get("from") ? flowOr(q.get("from")) : null,
      state:    null
    };
  }

  function readItems(q) {
    var raw = q.get("items");
    if (raw) {
      return cleanItems(raw.split(",").map(function (bit) {
        var kv = bit.split(":");
        return { size: kv[0], qty: kv[1] };
      }));
    }
    if (q.get("size")) return cleanItems([{ size: q.get("size"), qty: q.get("qty") || 1 }]);
    return [];
  }

  function itemsParam(items) {
    return cleanItems(items).map(function (it) { return it.size + ":" + it.qty; }).join(",");
  }

  function orderQuery(o) {
    var custom = o.gift || o.kind === "custom";
    var bits = ["pack=" + (custom ? "custom" : "free")];
    if (custom && cleanItems(o.items).length) bits.push("items=" + itemsParam(o.items));
    if (o.built) bits.push("built=1");
    if (o.freeUsed) bits.push("free=used");
    if (o.gift) bits.push("gift=1");
    if (o.from) bits.push("from=" + flowOr(o.from));
    return "?" + bits.join("&");
  }

  /* ── PRODUCT PHOTOS ───────────────────────────────────────────────────
     The slider in the checkout summary reads this list. The frame is
     square, so every shot here is square or taller — a crop only trims
     top and bottom, never the product. Files live in assets/photos/
     `cap` is the caption AND the image's alt. */
  var SHOTS = [
    { src:"assets/photos/codemarca-qr-sticker-pack-on-wooden-desk-square.jpg",        cap:"The Codemarca pack as it arrives \u2014 both stickers on one card" },
    { src:"assets/photos/codemarca-qr-sticker-peel-from-pack-square.jpg",             cap:"Peel a Codemarca QR sticker straight off the pack" },
    { src:"assets/photos/codemarca-qr-sticker-laptop-office-desk-square.jpg",         cap:"The 1.5\u2033 Codemarca sticker on a laptop lid" },
    { src:"assets/photos/codemarca-qr-sticker-phone-case-market-street-portrait.jpg", cap:"Codemarca QR sticker on a phone case, pack in hand" }
  ];

  /* ── WHERE IT GOES ────────────────────────────────────────────────────
     The sell on onboarding's last step (Garry, 2026-09-21). Someone who has
     just built a page has no reason to want a sticker until they can SEE one
     on a thing they own — so these are surfaces, not product shots. Same
     rule as SHOTS: tall shots in a 4:5 frame, so only top and bottom crop. */
  var PLACES = [
    { src:"assets/photos/codemarca-qr-sticker-cafe-counter-tall.jpg",           tag:"Shop",     cap:"Codemarca QR sticker on a caf\u00e9 counter, next to the pack" },
    { src:"assets/photos/codemarca-qr-sticker-laptop-palm-rest-studio-tall.jpg", tag:"Laptop",   cap:"The 1.5\u2033 Codemarca sticker on a laptop" },
    { src:"assets/photos/codemarca-qr-sticker-helmet-studio-tall.jpg",           tag:"Helmet",   cap:"Codemarca QR sticker on a bike helmet" },
    { src:"assets/photos/codemarca-qr-sticker-suitcase-airport-tall.jpg",        tag:"Suitcase", cap:"Codemarca QR sticker on a suitcase at the airport" },
    { src:"assets/photos/codemarca-qr-sticker-salon-mirror-scan-tall.jpg",       tag:"Mirror",   cap:"Someone scanning a Codemarca sticker on a salon mirror" }
  ];

  /* ── THE SLIDER ───────────────────────────────────────────────────────
     Both screens show the same gallery, so it is mounted from here rather
     than written twice and left to drift. Data above, the one widget below.

     Give it a host element and it fills it. Keyboard arrows work, the dots
     are real buttons, and a photo that 404s swaps itself for the labelled
     frame — which is what every one of them does today. */
  function mountShots(host, opts) {
    if (!host) return null;
    opts = opts || {};
    var shots = opts.shots || SHOTS, i = 0;

    host.classList.add("shots");
    host.innerHTML =
      '<div class="shots__stage">' +
        shots.map(function (s, n) {
          return '<figure class="shots__f"' + (n ? ' aria-hidden="true"' : '') + '>' +
                   '<img alt="' + esc(s.cap) + '">' +
                   '<span class="shots__ph"><b>Photo ' + (n + 1) + ' of ' + shots.length + '</b>' +
                     'Real shot goes here' +
                   '</span>' +
                 '</figure>';
        }).join("") +
        '<button class="shots__arw shots__arw--p" type="button" aria-label="Previous photo">' +
          '<svg viewBox="0 0 20 20" fill="none"><path d="M12 4 6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
        '<button class="shots__arw shots__arw--n" type="button" aria-label="Next photo">' +
          '<svg viewBox="0 0 20 20" fill="none"><path d="M8 4l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</div>' +
      '<p class="shots__cap"></p>' +
      '<div class="shots__dots" role="tablist" aria-label="Product photos">' +
        shots.map(function (s, n) {
          return '<button class="shots__dot" type="button" role="tab" data-n="' + n + '"' +
                 ' aria-label="Photo ' + (n + 1) + ' of ' + shots.length + '"></button>';
        }).join("") +
      '</div>';

    var figs = host.querySelectorAll(".shots__f");
    var dots = host.querySelectorAll(".shots__dot");
    var cap  = host.querySelector(".shots__cap");

    /* The <img> src is set after the placeholder is already in the DOM, so a
       missing file never flashes a broken-image glyph — the frame under it
       is what stays visible. */
    Array.prototype.forEach.call(figs, function (fig, n) {
      var img = fig.querySelector("img");
      img.addEventListener("load", function () { fig.dataset.has = "1"; });
      img.addEventListener("error", function () { img.remove(); });
      img.src = shots[n].src;
    });

    function show(n) {
      i = (n + shots.length) % shots.length;
      Array.prototype.forEach.call(figs, function (fig, k) {
        fig.dataset.on = k === i ? "1" : "";
        if (k === i) fig.removeAttribute("aria-hidden"); else fig.setAttribute("aria-hidden", "true");
      });
      Array.prototype.forEach.call(dots, function (d, k) {
        d.setAttribute("aria-selected", k === i ? "true" : "false");
      });
      cap.textContent = shots[i].cap;
    }

    Array.prototype.forEach.call(dots, function (d) {
      d.addEventListener("click", function () { show(Number(d.dataset.n)); });
    });
    host.querySelector(".shots__arw--p").addEventListener("click", function () { show(i - 1); });
    host.querySelector(".shots__arw--n").addEventListener("click", function () { show(i + 1); });
    host.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  { show(i - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { show(i + 1); e.preventDefault(); }
    });

    /* Tap the photo for the full-size view (lightbox.js, when loaded). */
    if (root.Lightbox) root.Lightbox.bind(host.querySelector(".shots__stage"), "img");

    show(0);
    return { show: show, go: function (n) { show(n); } };
  }

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c];
    });
  }

  root.PACK = {
    FREE: FREE, SIZES: SIZES, ZONES: ZONES, FLOWS: FLOWS, flowOr: flowOr,
    QTY_MIN: QTY_MIN, QTY_MAX: QTY_MAX,
    zoneFor: zoneFor, sizeFor: sizeFor, clampQty: clampQty,
    inr: inr, priceOrder: priceOrder, cleanItems: cleanItems,
    readOrder: readOrder, readItems: readItems, itemsParam: itemsParam, orderQuery: orderQuery,
    SHOTS: SHOTS, PLACES: PLACES, mountShots: mountShots
  };
})(window);
