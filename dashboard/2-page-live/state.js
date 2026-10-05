/* ==========================================================================
   FLOW 2 — PAGE LIVE, NO PACK (YET)
   The page is built and public. Nothing is printed yet — or the free pack is
   ordered and still on its way (`coming`).

   Who lands here
     · claimed a handle, finished onboarding, skipped the pack
     · finished the page from the "build it first" nudge in flow 1

   The one job of this flow: sell the pack. The page already works as a
   link — the stickers are what make it work without sending the link.

   THE CODE ALREADY EXISTS HERE. One profile = one QR, minted with the
   page, printed later. So the QR tab is NOT empty for this person: they
   can download the square and put it on a bio, a card, a poster today.
   That is the argument for the pack, made with the thing itself.
   ========================================================================== */

(function (window) {
  "use strict";

window.CM_FLOW = {
  id: "page-live",
  label: "Page live, no stickers yet",
  states: [
    { k: "fresh",   label: "1 · Page just went live" },
    { k: "settled", label: "2 · Live a while, no pack" },
    { k: "coming",  label: "3 · Pack on the way" }
  ]
};

/* THE PAGE, IN ONE SHAPE — Garry, 2026-09-24.
   This is the builder's state, the API's response and what the Profile tab
   loads: the same object, so Home's checklist, the editor and the live page
   can never disagree about what has been filled in. The editor used to keep
   its own hardcoded copy, which is how Home came to say "add your links"
   over a page that already had six. */
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
  /* the icon row's own order */
  socialOrder: ["instagram","linkedin","x","threads","spotify"]
};

var CODE = {
  id: "t8r3w6", status: "active", activated: null, scans: 0,
  /* nothing printed yet — the code is real, the stickers are not */
  stickers: []
};

/* the free pack, ordered straight after the page went live */
var COMING = {
  id: "CM-5214", placed: "29 Sep 2026", status: "placed", eta: "4 Oct 2026",
  courier: "Delhivery", awb: "SR7719208812",
  items: "Codemarca pack — 2 stickers",
  goods: 0, ship: 49, total: 49, free: true, forSelf: true,
  address: "House 12, Guru Nanak Nagar, Ludhiana, Punjab 141001",
  code: CODE.id
};

function page(o) {
  var p = {}, k;
  for (k in PROFILE) { p[k] = PROFILE[k]; }
  for (k in o)       { p[k] = o[k]; }
  return p;
}

window.CM_STATES = {

  /* walked out of onboarding a minute ago — the page is the news */
  fresh: {
    state: "fresh",
    user: { name: "", email: "", phone: "", joined: "Recently" },
    profile: page({ updated: "just now", photo: null, bio: "",
                    links: {}, customs: [], waSame: true, wa: "", email: "", emailOn: true }),
    order: null,
    code: CODE,
    gift: null,
    referrals: { link: "", goal: 50, counted: 0, waiting: 0 }
  },

  coming: {
    state: "coming",
    user: { name: "", email: "", phone: "", joined: "Recently" },
    profile: page({ updated: "just now" }),
    order: COMING,
    orders: [COMING],
    code: { id: CODE.id, status: "active", activated: null, scans: 0,
            stickers: [
              { size: "4″ × 4″",     name: "Big sticker",   where: "Car glass, bike, helmet, shop shutter" },
              { size: "1.5″ × 1.5″", name: "Small sticker", where: "Laptop, bottle, phone case, diary" }
            ] },
    gift: null,
    daysLeft: 5,
    referrals: { link: "", goal: 50, counted: 0, waiting: 0 }
  },

  settled: {
    state: "settled",
    user: { name: "", email: "", phone: "", joined: "Recently" },
    profile: page({ updated: "just now" }),
    order: null,
    code: CODE,
    gift: null,
    shares: 0,
    referrals: { link: "", goal: 50, counted: 0, waiting: 0 }
  }
};


/* NOTIFICATIONS — Garry, 2026-09-27. What the bell shows for each state.
   tab: "orders" | "refer" | "account" (account shows under All only).
   Shape is the API's; see CM.notes in dashboard.js. */
window.CM_STATES["fresh"].notes = [
  {
    "id": "p-live",
    "tab": "account",
    "icon": "spark",
    "title": "Your page is live",
    "body": "codemarca.com/garry is ready to share. Add a photo and links whenever you like.",
    "when": "Just now",
    "unread": true,
    "href": "profile.html"
  },
  {
    "id": "p-tee",
    "tab": "refer",
    "icon": "tag",
    "title": "Invite 50 friends, get a tee",
    "body": "A black tee printed with your own code. Friends only need to sign up and finish their page.",
    "when": "Just now",
    "unread": true,
    "href": "gift.html"
  },
  {
    "id": "p-pack",
    "tab": "orders",
    "icon": "box",
    "title": "Your free pack is waiting",
    "body": "Two stickers with your code on them. You only pay delivery.",
    "when": "Just now",
    "unread": true,
    "href": "orders.html"
  }
];
window.CM_STATES["coming"].notes = [
  {
    "id": "c-placed",
    "tab": "orders",
    "icon": "box",
    "title": "Order placed · CM-5214",
    "body": "Your free pack is being printed. We’ll tell you the moment it ships.",
    "when": "Just now",
    "unread": true,
    "href": "orders.html"
  },
  {
    "id": "c-invoice",
    "tab": "orders",
    "icon": "down",
    "title": "Invoice ready · CM-5214",
    "body": "Download it any time from Orders.",
    "when": "Just now",
    "unread": false,
    "href": "orders.html"
  },
  {
    "id": "c-live",
    "tab": "account",
    "icon": "spark",
    "title": "Your page is live",
    "body": "codemarca.com/garry is ready to share.",
    "when": "Today",
    "unread": false,
    "href": "profile.html"
  }
];
window.CM_STATES["settled"].notes = [
  {
    "id": "q-neha",
    "tab": "refer",
    "icon": "user",
    "title": "Neha S.’s page is up",
    "body": "That’s 4 of 50 counted toward your tee.",
    "when": "2h ago",
    "unread": true,
    "href": "gift.html"
  },
  {
    "id": "q-rohit",
    "tab": "refer",
    "icon": "user",
    "title": "Rohit B. signed up through your link",
    "body": "Counts toward your tee once their page is up.",
    "when": "Yesterday",
    "unread": true,
    "href": "gift.html"
  },
  {
    "id": "q-shares",
    "tab": "orders",
    "icon": "box",
    "title": "You’ve shared your link 31 times",
    "body": "A sticker shares it for you. Your free pack is still waiting.",
    "when": "3 days ago",
    "unread": true,
    "href": "orders.html"
  },
  {
    "id": "q-karan",
    "tab": "refer",
    "icon": "user",
    "title": "Karan D.’s page is up",
    "body": "That’s 3 of 50 counted toward your tee.",
    "when": "8 Sep",
    "unread": false,
    "href": "gift.html"
  },
  {
    "id": "q-live",
    "tab": "account",
    "icon": "spark",
    "title": "Your page is live",
    "body": "codemarca.com/garry is ready to share.",
    "when": "2 Sep",
    "unread": false,
    "href": "profile.html"
  }
];

})(window);
