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
    { k: "tee",     label: "3 · 50 referrals, tee unlocked" },
    { k: "offline", label: "4 · Page switched off" },
    { k: "giftwait", label: "5 · A gift nobody has scanned" },
    { k: "teeship", label: "6 · Tee on its way" },
    { k: "teedone", label: "7 · Tee delivered" },
    { k: "travel",  label: "8 · Travel mode on" },
    { k: "lost",    label: "9 · Lost mode on" }
  ]
};

var USER = { name: "Garry Singh", email: "garry@example.com", phone: "+91 98765 43210", joined: "12 Aug 2026" };

/* THE PAGE, IN ONE SHAPE — Garry, 2026-09-24.
   This is the builder's state, the API's response and what the Profile tab
   loads: the same object, so Home's checklist, the editor and the live page
   can never disagree about what has been filled in. The editor used to keep
   its own hardcoded copy, which is how Home came to say "add your links"
   over a page that already had six. */
var PROFILE = {
  live: true, theme: "soft", updated: "4 days ago",
  handle: "garry", name: "Garry Singh", title: "Garry Singh",
  bio: "Designing things people actually use. Usually somewhere near a coffee.",
  photo: null,   /* no photo yet — the dashboard draws the grey face (2026-10-03) */
  phone: "9876543210", phoneOn: true,
  waSame: false, wa: "9876501234", waOn: true,
  email: "garry@example.com", emailOn: true,
  links: {
    instagram: { v: "@garry.designs",              on: true  },
    linkedin:  { v: "linkedin.com/in/garrysingh",  on: true  },
    x:         { v: "@garrymakes",                 on: true  },
    threads:   { v: "@garry.designs",              on: true  },
    website:   { v: "garry.design",                on: true  },
    spotify:   { v: "open.spotify.com/user/garry", on: false }
  },
  customs: [],
  order: ["call","wa","email","vcard","socials","website","directions","review"],
  /* the icon row's own order */
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

/* the tee as a parcel — free, shipped like any pack */
function TEE_ORDER(status) {
  return {
    id: "CM-6017", placed: "1 Oct 2026", status: status, eta: status === "delivered" ? "5 Oct 2026" : "6 Oct 2026",
    courier: "Delhivery", awb: "SR7719209931", items: "Codemarca tee \u2014 Pocket, size L",
    goods: 0, ship: 0, total: 0, free: true, forSelf: true, tee: true,
    address: "H.No 214, Sector 22-A, Chandigarh 160022"
  };
}

function referrals(counted, claimedTee, tee) {
  return {
    tee: tee || null,             /* { design, size, status, eta, awb } once claimed */
    link: "codemarca.com/r/garry",
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

/* the two people on the Kasol trip — Travel and Lost share them */
var TRIP_PEOPLE = [
  { name: "Rahul",  rel: "Travel buddy", phone: "98140 22310" },
  { name: "Simran", rel: "Trip host",    phone: "98722 41907" }
];

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

  /* PAGE OFF — 2026-10-08. Stickers are out in the world and the owner
     switched the page off from My QR: a scan gets the "not available" note. */
  offline: {
    state: "offline",
    user: USER, profile: (function () { var p = {}, k; for (k in PROFILE) { p[k] = PROFILE[k]; } p.live = false; return p; })(),
    code: CODE,
    order: FIRST_ORDER,
    orders: [FIRST_ORDER],
    gifts: GIFTS,
    referrals: referrals(23, false),
    notes: [
      { "id": "f-off", "tab": "account", "icon": "eye", "title": "Your page is off",
        "body": "Your stickers and link show a “not available” note until you switch it back on.", "when": "Yesterday", "unread": true, "href": "qr.html" }
    ]
  },

  /* A GIFT NOBODY HAS SCANNED — 2026-10-08. Dad's ten stickers landed three
     weeks ago and nobody has signed in on them. The buyer is the only one
     who can nudge, so the Gift tab hands them the words. */
  giftwait: {
    state: "giftwait",
    user: USER, profile: PROFILE, code: CODE,
    order: FIRST_ORDER,
    orders: [FIRST_ORDER],
    gifts: [ gift({ id: "CM-5188", to: "Dad", placed: "13 Sep 2026", status: "delivered", eta: "17 Sep 2026",
                    awb: "SR7719207702", items: "Gift \u2014 10 stickers", lines: "L:6,S:4",
                    goods: 1330, ship: 49, total: 1379, code: "b2h6t9", idle: "3 weeks",
                    address: "Kothi 88, Model Town, Ludhiana 141002" }) ].concat(GIFTS.slice(1)),
    referrals: referrals(23, false),
    notes: [
      { "id": "w-dad", "tab": "refer", "icon": "gift", "title": "Dad hasn’t scanned his stickers yet",
        "body": "They landed 3 weeks ago. A quick message usually does it.", "when": "Today", "unread": true, "href": "gift.html#gift" }
    ]
  },

  /* THE TEE, AFTER THE CLAIM — 2026-10-08. Picked, printed, posted; then
     delivered. It shows on Home's referral card and as a free parcel on
     Orders, like any other. */
  teeship: {
    state: "teeship",
    user: USER, profile: PROFILE, code: CODE,
    order: FIRST_ORDER,
    orders: [TEE_ORDER("shipped"), FIRST_ORDER],
    gifts: GIFTS,
    referrals: referrals(50, true, { design: "Pocket", size: "L", status: "shipped", eta: "6 Oct 2026" }),
    notes: [
      { "id": "t-ship", "tab": "refer", "icon": "truck", "title": "Your tee has shipped",
        "body": "Pocket, size L · Delhivery · arriving by 6 Oct.", "when": "2h ago", "unread": true, "href": "orders.html" }
    ]
  },
  teedone: {
    state: "teedone",
    user: USER, profile: PROFILE, code: CODE,
    order: FIRST_ORDER,
    orders: [TEE_ORDER("delivered"), FIRST_ORDER],
    gifts: GIFTS,
    referrals: referrals(54, true, { design: "Pocket", size: "L", status: "delivered", eta: "5 Oct 2026" }),
    notes: [
      { "id": "t-done", "tab": "refer", "icon": "check", "title": "Your tee was delivered",
        "body": "Wear it — the code on it opens your page like any sticker.", "when": "Yesterday", "unread": true, "href": "home.html" }
    ]
  },

  /* MODES — Phase-1, 2026-10-13. Travel: a trip to Kasol, two people a
     finder can call, switches itself off on the 20th. Lost: the phone went
     missing at Manikaran; same two people, page turned into a return note. */
  travel: {
    state: "travel",
    user: USER, profile: PROFILE, code: CODE,
    order: FIRST_ORDER, orders: [FIRST_ORDER], gifts: GIFTS,
    referrals: referrals(23, false),
    modes: {
      travel: { on: true, until: "2026-10-20", note: "Group trip with Wanderlust Treks, bus HP 01 4521.", people: TRIP_PEOPLE },
      lost:   { on: false, since: "", item: "phone", note: "", people: [] }
    }
  },
  lost: {
    state: "lost",
    user: USER, profile: PROFILE, code: CODE,
    order: FIRST_ORDER, orders: [FIRST_ORDER], gifts: GIFTS,
    referrals: referrals(23, false),
    modes: {
      travel: { on: false, until: "2026-10-20", note: "Group trip with Wanderlust Treks, bus HP 01 4521.", people: TRIP_PEOPLE },
      lost:   { on: true, since: "2026-10-14", item: "phone", note: "Lost near the Manikaran bus stand. Small reward, thank you!", people: TRIP_PEOPLE }
    },
    notes: [
      { "id": "m-lost", "tab": "account", "icon": "eye", "title": "Lost mode is on",
        "body": "Every scan now asks the finder to call Rahul or Simran.", "when": "Today", "unread": true, "href": "home.html" }
    ]
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


/* FOLLOW + QUICK CHAT — Phase-1, Garry 2026-10-13. The API's shape:
   who follows, who this account follows, views (owner-only), the day's
   500-character budget (shared by every chat, replies included), message
   requests from strangers, and accepted chats. Seen messages disappear 24
   hours after they are seen — `left` is that countdown. */
var SOCIAL = {
  chat: true, showCounts: true, showList: true,
  views: { week: 59, total: 412, sticker: 41, link: 18 },
  followers: 128, following: 96,
  people: {
    followers: [
      { name: "Simran Kaur",  handle: "simran" }, { name: "Arjun Mehta", handle: "arjun" },
      { name: "Rohit Bansal", handle: "rohit" },  { name: "Karan Dhillon", handle: "karan" },
      { name: "Aisha Khan",  handle: "aisha" }
    ],
    following: [
      { name: "Gurdeep Singh", handle: "gurdeep" }, { name: "Rhea Malhotra", handle: "rhea" },
      { name: "Nikk Martin",   handle: "nikk"    }, { name: "Dr Rohan",      handle: "drrohan" }
    ]
  },
  usage: { used: 180, limit: 500 },
  requests: [
    { id: "r1", name: "Aman Verma", handle: "aman.v", source: "sticker", when: "12 min ago", unread: true,
      bio: "Product designer at a fintech. Chai over coffee, always.", socials: ["Instagram", "LinkedIn"],
      text: "Hey Garry! Saw the sticker on your laptop at Third Wave, Koramangala. I’m a product designer too — would love to swap notes sometime." },
    { id: "r2", name: "Priya Nair", handle: "priyan", source: "link", when: "3h ago", unread: true,
      bio: "Founder, small candle studio in Kochi.", socials: ["Instagram"],
      text: "Hi! A friend shared your page. Do you take freelance packaging work? Happy to share details." }
  ],
  chats: [
    {
      id: "c_codemarca",
      name: "Codemarca",
      handle: "codemarca",
      when: "Just now",
      unread: true,
      left: "Pinned",
      isOfficial: true,
      msgs: [
        { me: false, text: "Welcome to Quick Chat on Codemarca! 👋" },
        { me: false, text: "Here is how messaging works on your profile:\n\n• From Stickers & Link: Anyone who scans your physical sticker or visits your link can send you a message.\n• Requests First: New messages from visitors land in 'Requests' first. They cannot message you again until you tap Accept (or Ignore/Block).\n• 500 Chars/Day: You and visitors share a 500-character daily budget across chats (resets at midnight) to keep conversations fast and spam-free.\n• Privacy: Seen messages automatically disappear after 24 hours to keep your inbox clutter-free.\n• Control: You can turn Quick Chat on or off anytime using the switch above.\n\nEnjoy connecting!" }
      ]
    },
    { id: "c1", name: "Simran Kaur", handle: "simran", when: "1h ago", unread: true, left: "22h",
      msgs: [ { me: false, text: "Thanks for accepting! The sticker on your car is genius btw 😄" },
              { me: true,  text: "Haha thanks! Took two minutes to set up." },
              { me: false, text: "Ordering one for my scooty now." } ] },
    { id: "c2", name: "Arjun Mehta", handle: "arjun", when: "Yesterday", unread: false, left: "6h",
      msgs: [ { me: false, text: "Met you at the Kasol meetup — scanned your bag. Great chatting!" },
              { me: true,  text: "Same here, Arjun. Let’s plan the Kheerganga trek." } ] }
  ]
};
Object.keys(window.CM_STATES).forEach(function (k) {
  if (!window.CM_STATES[k].social) { window.CM_STATES[k].social = SOCIAL; }
});

})(window);
