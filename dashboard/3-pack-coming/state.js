/* ==========================================================================
   FLOW 3 — PACK BOUGHT, NO PAGE
   Someone ordered their free pack and never built a page.

   THE FREE PACK IS ALWAYS FOR THEMSELVES — Garry, 2026-09-18
     Checkout used to ask "for me or a gift" and this folder carried both
     answers (5-gifted had been merged into it on 09-17). Someone clicking
     Get pack is thinking of themselves, so the question is gone and so is
     the gift half of this folder. Gifting is paid now and lives on its own
     tab, Gift & Refer, in every flow.

   The code is the buyer's from the moment of ordering; a scan by anyone
   else cannot take it. Once it is delivered and there is still no page,
   the code sits in `waiting` — printed, in hand, pointing at nothing.
   ========================================================================== */

(function (window) {
  "use strict";

window.CM_FLOW = {
  id: "pack-coming",
  label: "Pack bought, page empty",
  states: [
    { k: "placed",    label: "1 · Just ordered" },
    { k: "shipped",   label: "2 · On the way" },
    { k: "delivered", label: "3 · Landed, nobody set it up" }
  ]
};

var USER = { name: "Garry", email: "garry@example.com", phone: "+91 98765 43210", joined: "12 Sep 2026" };

var CODE_ID = "m3p7k5";

var CODE = {
  id: CODE_ID, status: "active", activated: null, scans: 0,
  stickers: [
    { size: "4″ × 4″",     name: "Big sticker",   where: "Car glass, bike, helmet, shop shutter" },
    { size: "1.5″ × 1.5″", name: "Small sticker", where: "Laptop, bottle, phone case, diary" }
  ]
};

function order(o) {
  var base = {
    id: "CM-5190",
    placed: "12 Sep 2026",
    status: "placed",
    eta: "18 Sep 2026",
    courier: "Delhivery",
    awb: "SR7719206640",
    items: "Codemarca pack — 2 stickers",
    /* what this order was BILLED, not a price lookup — a later change to
       the delivery bands in pack.js must never rewrite a placed order */
    goods: 0, ship: 99, total: 99,
    free: true,
    address: "H.No 214, Sector 22-A, Chandigarh 160022",
    code: CODE_ID
  }, k;
  for (k in o) { base[k] = o[k]; }
  return base;
}

function account(k, o, extra) {
  var ord = order(o);
  ord.forSelf = true;
  var acc = {
    state: k,
    user: USER, profile: null,
    /* the link claimed at checkout — the page is live but bare (name only) */
    handle: "garrysingh",
    order: ord,
    orders: [ord],
    code: CODE,
    gifts: [],
    referrals: {
      /* the handle was claimed at checkout, so the invite link exists */
      link: "codemarca.com/r/garrysingh", goal: 50, counted: 0, waiting: 0
    }
  }, j;
  for (j in extra) { acc[j] = extra[j]; }
  return acc;
}

window.CM_STATES = {
  placed:    account("placed",    { status: "placed" },  { daysLeft: 6 }),
  shipped:   account("shipped",   { status: "shipped" }, { daysLeft: 2 }),

  /* the bad one: stickers in hand, nothing behind them */
  delivered: account("delivered", { status: "delivered", eta: "17 Sep 2026" }, { daysLeft: 0 })
};


/* NOTIFICATIONS — Garry, 2026-09-27. What the bell shows for each state.
   tab: "orders" | "refer" | "account" (account shows under All only).
   Shape is the API's; see CM.notes in dashboard.js. */
window.CM_STATES["placed"].notes = [
  {
    "id": "o-placed",
    "tab": "orders",
    "icon": "box",
    "title": "Order placed · CM-5190",
    "body": "Your free pack is being printed. We’ll tell you the moment it ships.",
    "when": "Just now",
    "unread": true,
    "href": "orders.html"
  },
  {
    "id": "o-page",
    "tab": "account",
    "icon": "pen",
    "title": "Finish your page before it lands",
    "body": "Your stickers carry code m3p7k5. Right now a scan shows just your name. Add your number and links.",
    "when": "Just now",
    "unread": true,
    "href": "profile.html"
  },
  {
    "id": "o-invoice",
    "tab": "orders",
    "icon": "down",
    "title": "Invoice ready · CM-5190",
    "body": "Download it any time from Orders.",
    "when": "Just now",
    "unread": false,
    "href": "orders.html"
  }
];
window.CM_STATES["shipped"].notes = [
  {
    "id": "o-shipped",
    "tab": "orders",
    "icon": "truck",
    "title": "Your pack has shipped",
    "body": "Delhivery · SR7719206640 · arriving by 18 Sep.",
    "when": "3h ago",
    "unread": true,
    "href": "orders.html"
  },
  {
    "id": "o-2days",
    "tab": "account",
    "icon": "pen",
    "title": "Two days until it lands",
    "body": "Your page is still empty. Build it now so the first scan opens something.",
    "when": "3h ago",
    "unread": true,
    "href": "profile.html"
  },
  {
    "id": "o-placed",
    "tab": "orders",
    "icon": "box",
    "title": "Order placed · CM-5190",
    "body": "Your free pack went to print.",
    "when": "12 Sep",
    "unread": false,
    "href": "orders.html"
  },
  {
    "id": "o-invoice",
    "tab": "orders",
    "icon": "down",
    "title": "Invoice ready · CM-5190",
    "body": "Download it any time from Orders.",
    "when": "12 Sep",
    "unread": false,
    "href": "orders.html"
  }
];
window.CM_STATES["delivered"].notes = [
  {
    "id": "o-deliv",
    "tab": "orders",
    "icon": "check",
    "title": "Your pack was delivered",
    "body": "Handed over at H.No 214, Sector 22-A on 17 Sep.",
    "when": "Yesterday",
    "unread": true,
    "href": "orders.html"
  },
  {
    "id": "o-empty",
    "tab": "account",
    "icon": "qr",
    "title": "Your stickers are here, your page is empty",
    "body": "Anyone who scans them now sees just your name. Two minutes fixes that.",
    "when": "Yesterday",
    "unread": true,
    "href": "profile.html"
  },
  {
    "id": "o-shipped",
    "tab": "orders",
    "icon": "truck",
    "title": "Your pack has shipped",
    "body": "Delhivery · SR7719206640.",
    "when": "15 Sep",
    "unread": false,
    "href": "orders.html"
  },
  {
    "id": "o-placed",
    "tab": "orders",
    "icon": "box",
    "title": "Order placed · CM-5190",
    "body": "Your free pack went to print.",
    "when": "12 Sep",
    "unread": false,
    "href": "orders.html"
  }
];

})(window);
