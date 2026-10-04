/* ==========================================================================
   FLOW 1 — EMPTY
   Signed up and walked away. No page, no order, no code.

   Who lands here
     · signed up straight from the header, never picked a lane
     · claimed a handle on the homepage, then closed the tab
     · was GIFTED a pack — scanned the sticker, signed in with their own
       email, and so the sticker is theirs now but points at nothing

   The one job of this flow: get a page built. Not a pack — a page. A page
   with no sticker is still a link we can hand out; a sticker with no page
   is a dead square. Customer first, order second.
   ========================================================================== */

(function (window) {
  "use strict";

window.CM_FLOW = {
  id: "empty",
  label: "Empty account",
  states: [
    { k: "fresh",     label: "1 · Just signed up" },
    { k: "returning", label: "2 · Came back, still empty" },
    { k: "scanned",   label: "3 · Signed up off a gifted sticker" }
  ]
};

var BASE = {
  profile: null,
  order:   null,
  code:    null,
  gift:    null
};

function make(o) {
  var a = {}, k;
  for (k in BASE) { a[k] = BASE[k]; }
  for (k in o)    { a[k] = o[k]; }
  return a;
}

window.CM_STATES = {

  /* signed up minutes ago */
  fresh: make({
    state: "fresh",
    user: { name: "Garry", email: "garry@example.com", phone: "", joined: "16 Sep 2026" },
    since: "just now"
  }),

  /* signed up a while back, never came back to finish */
  returning: make({
    state: "returning",
    user: { name: "Garry", email: "garry@example.com", phone: "", joined: "2 Sep 2026" },
    since: "2 weeks ago"
  }),

  /* the gifted case — someone else paid, this person scanned and signed in.
     The code is already in their hand and already theirs; it just has
     nothing behind it yet. `code.status` is "waiting" until a page exists. */
  scanned: make({
    state: "scanned",
    user: { name: "Simran Kaur", email: "simran@example.com", phone: "", joined: "16 Sep 2026" },
    since: "just now",
    /* ACTIVE, not waiting (Garry, 2026-09-27). Signing in with their own
       email is what claims the code, so it works from that moment. What is
       missing is not the code, it is anything worth opening: Google handed
       over a name, we made a handle out of it, and that bare page is what a
       scan shows until they fill it in. */
    handle: "simran-kaur",
    code: {
      id: "q4v8n1", status: "active", activated: "16 Sep 2026", scans: 2,
      stickers: [
        { size: "4″ × 4″",     name: "Big sticker",   where: "Car glass, bike, helmet, shop shutter" },
        { size: "1.5″ × 1.5″", name: "Small sticker", where: "Laptop, bottle, phone case, diary" }
      ]
    },
    /* who sent it — shown so the thank-you is possible and the referral
       credit is explainable */
    giftedBy: { name: "Arjun M.", on: "14 Sep 2026" }
  })
};


/* NOTIFICATIONS — Garry, 2026-09-27. What the bell shows for each state.
   tab: "orders" | "refer" | "account" (account shows under All only).
   Shape is the API's; see CM.notes in dashboard.js. */
window.CM_STATES["fresh"].notes = [
  {
    "id": "e-welcome",
    "tab": "account",
    "icon": "user",
    "title": "Welcome to Codemarca",
    "body": "Build your page in about two minutes: your number, WhatsApp and socials behind one link.",
    "when": "Just now",
    "unread": true,
    "href": "profile.html"
  }
];
window.CM_STATES["returning"].notes = [
  {
    "id": "e-blank",
    "tab": "account",
    "icon": "pen",
    "title": "Your page is still blank",
    "body": "Two minutes and your link is ready to share. No pack needed.",
    "when": "2 days ago",
    "unread": true,
    "href": "profile.html"
  },
  {
    "id": "e-pack",
    "tab": "orders",
    "icon": "box",
    "title": "Your free pack is waiting",
    "body": "Two stickers, one code. You only pay delivery.",
    "when": "1 week ago",
    "unread": true,
    "href": "orders.html"
  },
  {
    "id": "e-welcome",
    "tab": "account",
    "icon": "user",
    "title": "Welcome to Codemarca",
    "body": "Build your page in about two minutes: your number, WhatsApp and socials behind one link.",
    "when": "2 Sep",
    "unread": false,
    "href": "profile.html"
  }
];
window.CM_STATES["scanned"].notes = [
  {
    "id": "s-gift",
    "tab": "refer",
    "icon": "gift",
    "title": "Arjun M. sent you a Codemarca pack",
    "body": "The stickers in your hand carry your own code now. Say thanks?",
    "when": "Just now",
    "unread": true,
    "href": "gift.html"
  },
  {
    "id": "s-welcome",
    "tab": "account",
    "icon": "user",
    "title": "Welcome to Codemarca",
    "body": "Signing in claimed the code. It's yours for good.",
    "when": "Just now",
    "unread": false,
    "href": "qr.html"
  }
];

})(window);
