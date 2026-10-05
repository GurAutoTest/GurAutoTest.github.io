/* ==========================================================================
   CODEMARCA — UNIFIED DASHBOARD STATE
   Directly loaded under dashboard/. Contains states for all 4 account flows:
     1. empty       - signed up, no page yet
     2. page-live   - page is live, no stickers yet (or pack coming)
     3. pack-coming - pack ordered, page not built yet
     4. active      - steady state, stickers delivered, page live
   ========================================================================== */

(function (window) {
  "use strict";

  window.CM_FLOW = {
    id: "unified",
    label: "Codemarca Account",
    stages: [
      {
        id: "page-live",
        label: "Page live, no stickers yet",
        states: [
          { k: "fresh",   label: "1 · Page just went live" },
          { k: "settled", label: "2 · Live a while, no pack" },
          { k: "coming",  label: "3 · Pack on the way" }
        ]
      },
      {
        id: "active",
        label: "Active account",
        states: [
          { k: "active",  label: "1 · Steady — code live" },
          { k: "reorder", label: "2 · Second pack on the way" },
          { k: "tee",     label: "3 · 50 referrals, tee unlocked" }
        ]
      },
      {
        id: "empty",
        label: "Empty account",
        states: [
          { k: "fresh",     label: "1 · Just signed up" },
          { k: "returning", label: "2 · Came back, still empty" },
          { k: "scanned",   label: "3 · Signed up off gifted sticker" }
        ]
      },
      {
        id: "pack-coming",
        label: "Pack bought, page empty",
        states: [
          { k: "placed",    label: "1 · Just ordered" },
          { k: "shipped",   label: "2 · On the way" },
          { k: "delivered", label: "3 · Landed, nobody set it up" }
        ]
      }
    ]
  };

  /* Default user */
  /* Dynamic or fallback user */
  var storedUsername = "";
  var storedName = "";
  var storedPhone = "";
  var storedEmail = "";
  try {
    storedUsername = window.localStorage.getItem("cm.username") || "";
    storedName = window.localStorage.getItem("cm.name") || "";
    storedPhone = window.localStorage.getItem("cm.phone") || "";
    storedEmail = window.localStorage.getItem("cm.email") || "";
  } catch(e) {}

  var USER_DEFAULT = {
    name: storedName || (storedUsername ? storedUsername : "Your Name"),
    email: storedEmail || (storedUsername ? (storedUsername + "@gmail.com") : "you@example.com"),
    phone: storedPhone ? ("+91 " + storedPhone) : "",
    joined: "Just now"
  };

  /* Default profile */
  var PROFILE_DEFAULT = {
    live: true,
    theme: "violet",
    updated: "just now",
    handle: storedUsername || "yourname",
    name: storedName || (storedUsername ? storedUsername : "Your Name"),
    title: storedName || (storedUsername ? storedUsername : "Your Name"),
    bio: "",
    photo: null,
    phone: storedPhone || "",
    phoneOn: true,
    waSame: true,
    wa: storedPhone || "",
    waOn: true,
    email: storedEmail || (storedUsername ? (storedUsername + "@gmail.com") : "you@example.com"),
    emailOn: true,
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
    socialOrder: ["instagram","linkedin","x","threads","spotify"]
  };

  /* Default code */
  var CODE_DEFAULT = {
    id: "x7k9m2",
    url: "codemarca.com/c/x7k9m2",
    status: "active",
    activated: "12 Sep 2026",
    scans: 24,
    stickers: [
      { size: "4″ × 4″",     name: "Big sticker",   where: "Car glass, bike, helmet, shop shutter" },
      { size: "1.5″ × 1.5″", name: "Small sticker", where: "Laptop, bottle, phone case, diary" }
    ]
  };

  /* Default orders */
  var ORDER_COMING = {
    id: "CM-5214",
    placed: "29 Sep 2026",
    status: "placed",
    eta: "4 Oct 2026",
    courier: "Delhivery",
    awb: "SR7719208812",
    items: "Codemarca pack — 2 stickers",
    goods: 0,
    ship: 49,
    total: 49,
    free: true,
    forSelf: true,
    address: "House 12, Guru Nanak Nagar, Ludhiana, Punjab 141001",
    code: "x7k9m2",
    daysLeft: 5
  };

  var ORDER_DELIVERED = {
    id: "CM-5140",
    placed: "28 Aug 2026",
    delivered: "2 Sep 2026",
    status: "delivered",
    eta: "2 Sep 2026",
    courier: "Delhivery",
    awb: "SR7719205541",
    items: "Codemarca pack — 2 stickers",
    goods: 0,
    ship: 49,
    total: 49,
    lines: "L:1,S:1",
    free: true,
    forSelf: true,
    address: "House 12, Guru Nanak Nagar, Ludhiana, Punjab 141001",
    code: "x7k9m2",
    daysLeft: 0
  };

  var ORDER_REORDER = {
    id: "CM-5233",
    placed: "14 Sep 2026",
    status: "shipped",
    eta: "19 Sep 2026",
    courier: "Delhivery",
    awb: "SR7719207781",
    items: "Codemarca pack — 2 stickers",
    goods: 238,
    ship: 99,
    total: 337,
    lines: "M:2",
    free: false,
    forSelf: true,
    address: "House 12, Guru Nanak Nagar, Ludhiana, Punjab 141001",
    code: "x7k9m2",
    daysLeft: 2
  };

  var GIFTS_DEFAULT = [
    {
      id: "CM-5188",
      to: "Dad",
      placed: "13 Sep 2026",
      status: "shipped",
      eta: "19 Sep 2026",
      awb: "SR7719207702",
      courier: "Delhivery",
      items: "Gift — 10 stickers",
      lines: "L:6,S:4",
      goods: 1330,
      ship: 49,
      total: 1379,
      code: "b2h6t9",
      address: "Kothi 88, Model Town, Ludhiana 141002",
      free: false,
      forSelf: false,
      claimed: false,
      claimedOn: null,
      claimedBy: null
    }
  ];

  function makeRef(counted, goal, claimed) {
    return {
      link: "codemarca.com/r/garry",
      goal: goal || 50,
      counted: counted || 0,
      waiting: 2,
      claimed: !!claimed,
      people: [
        { name: "Simran K.", joined: "14 Sep", done: true },
        { name: "Arjun M.",  joined: "13 Sep", done: true },
        { name: "Neha S.",   joined: "11 Sep", done: true },
        { name: "Rohit B.",  joined: "10 Sep", done: false },
        { name: "Karan D.",  joined: "8 Sep",  done: true }
      ]
    };
  }

  window.CM_STATES = {
    /* ── FLOW 2: PAGE LIVE ────────────────────────────────────────── */
    "page-live:fresh": {
      state: "fresh", stage: "page-live",
      user: USER_DEFAULT, profile: PROFILE_DEFAULT, code: CODE_DEFAULT,
      order: null, orders: [], gifts: GIFTS_DEFAULT,
      referrals: makeRef(0, 50, false), shares: 0
    },
    "page-live:settled": {
      state: "settled", stage: "page-live",
      user: USER_DEFAULT, profile: PROFILE_DEFAULT, code: CODE_DEFAULT,
      order: null, orders: [], gifts: GIFTS_DEFAULT,
      referrals: makeRef(4, 50, false), shares: 31
    },
    "page-live:coming": {
      state: "coming", stage: "page-live",
      user: USER_DEFAULT, profile: PROFILE_DEFAULT, code: CODE_DEFAULT,
      order: ORDER_COMING, orders: [ORDER_COMING], gifts: GIFTS_DEFAULT,
      referrals: makeRef(0, 50, false), shares: 0
    },

    /* ── FLOW 4: ACTIVE ──────────────────────────────────────────── */
    "active:active": {
      state: "active", stage: "active",
      user: USER_DEFAULT, profile: PROFILE_DEFAULT, code: CODE_DEFAULT,
      order: ORDER_DELIVERED, orders: [ORDER_DELIVERED], gifts: GIFTS_DEFAULT,
      referrals: makeRef(23, 50, false), shares: 59
    },
    "active:reorder": {
      state: "reorder", stage: "active",
      user: USER_DEFAULT, profile: PROFILE_DEFAULT, code: CODE_DEFAULT,
      order: ORDER_REORDER, orders: [ORDER_REORDER, ORDER_DELIVERED], gifts: GIFTS_DEFAULT,
      referrals: makeRef(31, 50, false), shares: 72
    },
    "active:tee": {
      state: "tee", stage: "active",
      user: USER_DEFAULT, profile: PROFILE_DEFAULT, code: CODE_DEFAULT,
      order: ORDER_DELIVERED, orders: [ORDER_DELIVERED], gifts: GIFTS_DEFAULT,
      referrals: makeRef(50, 50, true), shares: 98
    },

    /* ── FLOW 1: EMPTY ───────────────────────────────────────────── */
    "empty:fresh": {
      state: "fresh", stage: "empty",
      user: USER_DEFAULT, profile: null, code: null,
      order: null, orders: [], gifts: [],
      referrals: makeRef(0, 50, false), shares: 0
    },
    "empty:returning": {
      state: "returning", stage: "empty",
      user: USER_DEFAULT, profile: null, code: null,
      order: null, orders: [], gifts: [],
      referrals: makeRef(0, 50, false), shares: 0
    },
    "empty:scanned": {
      state: "scanned", stage: "empty",
      user: USER_DEFAULT, profile: null,
      code: { id: "p4k9x2", url: "codemarca.com/c/p4k9x2", status: "waiting", activated: null, scans: 0, stickers: [] },
      order: null, orders: [], gifts: [],
      referrals: makeRef(0, 50, false), shares: 0
    },

    /* ── FLOW 3: PACK COMING, PAGE EMPTY ─────────────────────────── */
    "pack-coming:placed": {
      state: "placed", stage: "pack-coming",
      user: USER_DEFAULT, profile: null, code: CODE_DEFAULT,
      order: ORDER_COMING, orders: [ORDER_COMING], gifts: [],
      referrals: makeRef(0, 50, false), shares: 0
    },
    "pack-coming:shipped": {
      state: "shipped", stage: "pack-coming",
      user: USER_DEFAULT, profile: null, code: CODE_DEFAULT,
      order: ORDER_REORDER, orders: [ORDER_REORDER], gifts: [],
      referrals: makeRef(0, 50, false), shares: 0
    },
    "pack-coming:delivered": {
      state: "delivered", stage: "pack-coming",
      user: USER_DEFAULT, profile: null, code: CODE_DEFAULT,
      order: ORDER_DELIVERED, orders: [ORDER_DELIVERED], gifts: [],
      referrals: makeRef(0, 50, false), shares: 0
    }
  };

  /* Fallback aliases */
  window.CM_STATES["page-live"] = window.CM_STATES["page-live:fresh"];
  window.CM_STATES["active"]    = window.CM_STATES["active:active"];
  window.CM_STATES["empty"]     = window.CM_STATES["empty:fresh"];
  window.CM_STATES["pack-coming"] = window.CM_STATES["pack-coming:placed"];
  window.CM_STATES["fresh"]     = window.CM_STATES["page-live:fresh"];
  window.CM_STATES["settled"]   = window.CM_STATES["page-live:settled"];
  window.CM_STATES["coming"]    = window.CM_STATES["page-live:coming"];
  window.CM_STATES["reorder"]   = window.CM_STATES["active:reorder"];
  window.CM_STATES["tee"]       = window.CM_STATES["active:tee"];
  window.CM_STATES["placed"]    = window.CM_STATES["pack-coming:placed"];
  window.CM_STATES["shipped"]   = window.CM_STATES["pack-coming:shipped"];
  window.CM_STATES["delivered"] = window.CM_STATES["pack-coming:delivered"];

})(window);
