/* ==========================================================================
   FLOW 4 — ACTIVE
   Page built, pack delivered, code live. The steady state, and the only
   flow where nothing is left to finish.

   So this flow stops being a checklist and starts asking for two things:

     1. REFER   50 counted friends → a black tee printed with your own code
     2. REORDER more stickers — same code, new print, for the next car,
        the next laptop, the shop shutter, a friend

   REFERRAL RULE — decided 2026-09-15
     A friend COUNTS once they have signed up through the link AND finished
     their page. Ordering is not required.

   SAME CODE FOREVER — decided 2026-09-16
     `code.id` here never changes, no matter how many packs get ordered.
     A reorder is a reprint. That is why `orders` is a list but `code`
     is not.

   GIFTS — Garry, 2026-09-18
     Paid custom orders for someone else, in `gifts`. Shown on the Gift &
     Refer tab, and again on Orders as parcels with a bill. One code per
     gift, whatever the sticker count. It becomes the recipient's when they
     scan and sign in (`claimed`), and counts as a referral for this account
     once their page is up (`claimedBy.handle`).
   ========================================================================== */

(function (window) {
  "use strict";

window.CM_FLOW = {
  id: "active",
  label: "Active account",
  states: [
    { k: "active",  label: "1 · Steady — code live" },
    { k: "reorder", label: "2 · Second pack on the way" },
    { k: "tee",     label: "3 · 50 referrals, tee unlocked" }
  ]
};

var USER = { name: "", email: "", phone: "", joined: "Recently" };

/* THE PAGE, IN ONE SHAPE */
var PROFILE = {
  live: true, theme: "light", updated: "just now",
  handle: "", name: "", title: "",
  bio: "",
  photo: null,
  phone: "", phoneOn: true,
  waSame: true, wa: "", waOn: true,
  email: "", emailOn: true,
  links: {},
  customs: [],
  order: ["call","wa","email","vcard","socials","website","directions","review"],
  socialOrder: ["instagram","linkedin","x","threads","spotify"]
};

/* one code, printed on every sticker this account has ever been sent */
var CODE = {
  id: "x7k9m2", status: "active", activated: "16 Aug 2026", scans: 59,
  stickers: [
    { size: "4″ × 4″",     name: "Big sticker",   where: "Car glass, bike, helmet, shop shutter" },
    { size: "1.5″ × 1.5″", name: "Small sticker", where: "Laptop, bottle, phone case, diary" }
  ]
};

var FIRST_ORDER = {
  id: "CM-4102", placed: "12 Aug 2026", status: "delivered", eta: "16 Aug 2026",
  courier: "Delhivery", awb: "SR7719201102", items: "Codemarca pack — 2 stickers",
  goods: 0, ship: 99, total: 99,      /* the one free pack */
  address: "H.No 214, Sector 22-A, Chandigarh 160022",
  free: true, forSelf: true
};

var SECOND_ORDER = {
  id: "CM-5233", placed: "14 Sep 2026", status: "shipped", eta: "19 Sep 2026",
  courier: "Delhivery", awb: "SR7719207781", items: "Codemarca pack — 2 stickers",
  goods: 238, ship: 99, total: 337,   /* 2 × Medium, reprinted with the same code */
  lines: "M:2",                       /* size:qty pairs, same format as the order URL */
  address: "H.No 214, Sector 22-A, Chandigarh 160022",
  free: false, forSelf: true
};

/* Gifts this account paid for. One of each stage, so the tab can be
   judged: counted, signed in but no page yet, and still in the van — the
   last one is ten stickers in two sizes, all carrying one code. */
function gift(o) {
  var base = {
    courier: "Delhivery", free: false, forSelf: false,
    claimed: false, claimedOn: null, claimedBy: null
  }, k;
  for (k in o) { base[k] = o[k]; }
  return base;
}

var GIFTS = [
  gift({ id: "CM-5188", to: "Dad", placed: "13 Sep 2026", status: "shipped", eta: "19 Sep 2026",
         awb: "SR7719207702", items: "Gift \u2014 10 stickers", lines: "L:6,S:4",
         goods: 1330, ship: 49, total: 1379, code: "b2h6t9",
         address: "Kothi 88, Model Town, Ludhiana 141002" }),
  gift({ id: "CM-5160", to: "Rohan", placed: "11 Sep 2026", status: "delivered", eta: "15 Sep 2026",
         awb: "SR7719206955", items: "Gift \u2014 2 stickers", lines: "L:2",
         goods: 338, ship: 49, total: 387, code: "t5r1c8",
         address: "Flat 4B, Sector 70, Mohali 160071",
         claimed: true, claimedOn: "16 Sep 2026", claimedBy: { name: "Rohan S.", handle: null } }),
  gift({ id: "CM-5102", to: "Simran K.", placed: "8 Sep 2026", status: "delivered", eta: "12 Sep 2026",
         awb: "SR7719204410", items: "Gift \u2014 2 stickers", lines: "M:2",
         goods: 238, ship: 49, total: 287, code: "q4v8n1",
         address: "House 31, Sarabha Nagar, Ludhiana 141001",
         claimed: true, claimedOn: "13 Sep 2026", claimedBy: { name: "Simran K.", handle: "simran" } })
];

function referrals(counted, claimedTee) {
  return {
    link: "",
    goal: 50,
    counted: counted,
    waiting: 6,
    claimed: claimedTee,
    people: [
      { name: "Simran K.", joined: "14 Sep", done: true  },
      { name: "Arjun M.",  joined: "13 Sep", done: true  },
      { name: "Neha S.",   joined: "11 Sep", done: true  },
      { name: "Rohit B.",  joined: "10 Sep", done: false },
      { name: "Karan D.",  joined: "8 Sep",  done: true  }
    ]
  };
}

window.CM_STATES = {

  /* nothing in transit — the screen is pure refer + reorder */
  active: {
    state: "active",
    user: USER, profile: PROFILE, code: CODE,
    order: FIRST_ORDER,
    orders: [FIRST_ORDER],
    gifts: GIFTS,
    referrals: referrals(23, false)
  },

  /* bought a second pack. Same code, new print — the screen has to say so,
     because "ordered again" reads like "new QR" if nobody says otherwise. */
  reorder: {
    state: "reorder",
    user: USER, profile: PROFILE, code: CODE,
    order: SECOND_ORDER,
    orders: [SECOND_ORDER, FIRST_ORDER],
    gifts: GIFTS,
    referrals: referrals(31, false)
  },

  /* the payoff — 50 counted, tee unlocked, five designs to pick from */
  tee: {
    state: "tee",
    user: USER, profile: PROFILE, code: CODE,
    order: FIRST_ORDER,
    orders: [FIRST_ORDER],
    gifts: GIFTS,
    referrals: referrals(50, false)
  }
};


/* NOTIFICATIONS — Garry, 2026-09-27. What the bell shows for each state.
   tab: "orders" | "refer" | "account" (account shows under All only).
   Shape is the API's; see CM.notes in dashboard.js. */
window.CM_STATES["active"].notes = [
  {
    "id": "a-arjun",
    "tab": "refer",
    "icon": "user",
    "title": "Arjun M.’s page is up",
    "body": "That’s 23 of 50 counted toward your tee.",
    "when": "2h ago",
    "unread": true,
    "href": "gift.html"
  },
  {
    "id": "a-dad",
    "tab": "orders",
    "icon": "truck",
    "title": "Dad’s gift has shipped",
    "body": "CM-5188 · 10 stickers · arriving by 19 Sep.",
    "when": "2 days ago",
    "unread": true,
    "href": "orders.html"
  },
  {
    "id": "a-rohan-claim",
    "tab": "refer",
    "icon": "gift",
    "title": "Rohan S. claimed your gift",
    "body": "Code t5r1c8 is theirs now. It counts once their page is up.",
    "when": "16 Sep",
    "unread": false,
    "href": "gift.html"
  },
  {
    "id": "a-rohan-deliv",
    "tab": "orders",
    "icon": "check",
    "title": "Rohan’s gift was delivered",
    "body": "CM-5160 · Flat 4B, Sector 70, Mohali.",
    "when": "15 Sep",
    "unread": false,
    "href": "orders.html"
  },
  {
    "id": "a-simran",
    "tab": "refer",
    "icon": "user",
    "title": "Simran K.’s page is up",
    "body": "Your gift to Simran counts as a referral.",
    "when": "13 Sep",
    "unread": false,
    "href": "gift.html"
  }
];
window.CM_STATES["reorder"].notes = [
  {
    "id": "a-second",
    "tab": "orders",
    "icon": "truck",
    "title": "Your second pack has shipped",
    "body": "CM-5233 · same code, new print · arriving by 19 Sep.",
    "when": "4h ago",
    "unread": true,
    "href": "orders.html"
  },
  {
    "id": "a-neha",
    "tab": "refer",
    "icon": "user",
    "title": "Neha S.’s page is up",
    "body": "That’s 31 of 50 counted toward your tee.",
    "when": "Yesterday",
    "unread": true,
    "href": "gift.html"
  },
  {
    "id": "a-second-placed",
    "tab": "orders",
    "icon": "box",
    "title": "Order placed · CM-5233",
    "body": "2 stickers, reprinted with code x7k9m2.",
    "when": "14 Sep",
    "unread": false,
    "href": "orders.html"
  },
  {
    "id": "a-dad",
    "tab": "orders",
    "icon": "truck",
    "title": "Dad’s gift has shipped",
    "body": "CM-5188 · 10 stickers · arriving by 19 Sep.",
    "when": "2 days ago",
    "unread": false,
    "href": "orders.html"
  },
  {
    "id": "a-rohan-claim",
    "tab": "refer",
    "icon": "gift",
    "title": "Rohan S. claimed your gift",
    "body": "Code t5r1c8 is theirs now. It counts once their page is up.",
    "when": "16 Sep",
    "unread": false,
    "href": "gift.html"
  },
  {
    "id": "a-rohan-deliv",
    "tab": "orders",
    "icon": "check",
    "title": "Rohan’s gift was delivered",
    "body": "CM-5160 · Flat 4B, Sector 70, Mohali.",
    "when": "15 Sep",
    "unread": false,
    "href": "orders.html"
  },
  {
    "id": "a-simran",
    "tab": "refer",
    "icon": "user",
    "title": "Simran K.’s page is up",
    "body": "Your gift to Simran counts as a referral.",
    "when": "13 Sep",
    "unread": false,
    "href": "gift.html"
  }
];
window.CM_STATES["tee"].notes = [
  {
    "id": "a-tee",
    "tab": "refer",
    "icon": "tag",
    "title": "50 of 50. Your tee is unlocked",
    "body": "Pick one of five designs and we’ll print it with your own code.",
    "when": "Just now",
    "unread": true,
    "href": "gift.html"
  },
  {
    "id": "a-karan",
    "tab": "refer",
    "icon": "user",
    "title": "Karan D.’s page is up",
    "body": "That was the 50th.",
    "when": "Just now",
    "unread": true,
    "href": "gift.html"
  },
  {
    "id": "a-dad",
    "tab": "orders",
    "icon": "truck",
    "title": "Dad’s gift has shipped",
    "body": "CM-5188 · 10 stickers · arriving by 19 Sep.",
    "when": "2 days ago",
    "unread": false,
    "href": "orders.html"
  },
  {
    "id": "a-rohan-claim",
    "tab": "refer",
    "icon": "gift",
    "title": "Rohan S. claimed your gift",
    "body": "Code t5r1c8 is theirs now. It counts once their page is up.",
    "when": "16 Sep",
    "unread": false,
    "href": "gift.html"
  },
  {
    "id": "a-rohan-deliv",
    "tab": "orders",
    "icon": "check",
    "title": "Rohan’s gift was delivered",
    "body": "CM-5160 · Flat 4B, Sector 70, Mohali.",
    "when": "15 Sep",
    "unread": false,
    "href": "orders.html"
  },
  {
    "id": "a-simran",
    "tab": "refer",
    "icon": "user",
    "title": "Simran K.’s page is up",
    "body": "Your gift to Simran counts as a referral.",
    "when": "13 Sep",
    "unread": false,
    "href": "gift.html"
  }
];

})(window);
