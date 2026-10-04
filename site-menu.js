/* CODEMARCA — SITE MENU
   Builds the hamburger panel and wires the button. Every marketing page
   loads this, so the link list below is the only copy of the site's map.
   Needs: a <header class="nav" id="nav"> holding a <button class="nav__menu">. */
(function () {
  "use strict";

  var WA = "917719697117";
  var EMAIL = "hello@codemarca.com";

  var LINKS = [
    { href: "homepage.html",        label: "Home" },
    { href: "how-it-works.html",    label: "How it works" },
    { href: "homepage.html#where",  label: "Where it sticks" },
    { href: "homepage.html#pack",   label: "What's in the pack" },
    { href: "homepage.html#faq",    label: "Questions" },
    { href: "about.html",           label: "About" },
    { href: "contact.html",         label: "Contact" }
  ];

  var nav = document.getElementById("nav");
  var btn = nav && nav.querySelector(".nav__menu");
  if (!btn) return;

  var here = location.pathname.split("/").pop() || "homepage.html";

  var menu = document.createElement("div");
  menu.className = "menu";
  menu.id = "siteMenu";
  menu.setAttribute("role", "dialog");
  menu.setAttribute("aria-modal", "true");
  menu.setAttribute("aria-label", "Menu");

  var links = LINKS.map(function (l, i) {
    var current = l.href === here ? ' aria-current="page"' : "";
    return '<a href="' + l.href + '"' + current + ' style="--i:' + i + '">' +
      '<span class="menu__n">0' + (i + 1) + "</span>" + l.label + "</a>";
  }).join("");

  menu.innerHTML =
    '<div class="shell shell--wide menu__inner">' +
      '<nav class="menu__links" aria-label="Site">' + links + "</nav>" +
      '<div class="menu__cta" style="--i:' + LINKS.length + '">' +
        '<a class="btn btn--primary" href="signup.html?next=order">Get your pack</a>' +
        '<a class="btn btn--ghost" href="signup.html?mode=login">Login</a>' +
      "</div>" +
      '<div class="menu__foot" style="--i:' + (LINKS.length + 1) + '">' +
        '<a href="https://wa.me/' + WA + '" target="_blank" rel="noopener">WhatsApp +91 77196 97117</a>' +
        '<a href="mailto:' + EMAIL + '">' + EMAIL + "</a>" +
        "<span>City Beautiful, Chandigarh, India</span>" +
      "</div>" +
    "</div>";
  nav.insertAdjacentElement("afterend", menu);

  btn.setAttribute("aria-controls", "siteMenu");
  btn.setAttribute("aria-expanded", "false");

  function isOpen() { return menu.dataset.open === "true"; }

  function open() {
    /* The ticker above the nav may still be on screen, so the panel starts
       wherever the nav's bottom edge is right now. */
    menu.style.setProperty("--menu-top", Math.max(0, nav.getBoundingClientRect().bottom) + "px");
    menu.dataset.open = "true";
    nav.dataset.menu = "open";
    document.body.dataset.menu = "open";
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Close menu");
    var first = menu.querySelector("a");
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
  }

  function close(returnFocus) {
    menu.dataset.open = "false";
    delete nav.dataset.menu;
    delete document.body.dataset.menu;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Open menu");
    if (returnFocus) btn.focus();
  }

  btn.addEventListener("click", function () { isOpen() ? close(false) : open(); });

  /* Any link closes the panel — including same-page anchors, which would
     otherwise scroll the page underneath and leave the menu up. */
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) close(false);
  });

  document.addEventListener("keydown", function (e) {
    if (!isOpen()) return;
    if (e.key === "Escape") { close(true); return; }
    /* Keep Tab inside the panel and its button. */
    if (e.key === "Tab") {
      var items = [btn].concat([].slice.call(menu.querySelectorAll("a")));
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });

  window.addEventListener("resize", function () {
    if (isOpen()) menu.style.setProperty("--menu-top", Math.max(0, nav.getBoundingClientRect().bottom) + "px");
  });
})();
