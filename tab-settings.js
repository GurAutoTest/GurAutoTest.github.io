/* CODEMARCA — SETTINGS TAB. Shared by every flow folder. */
(function () {
  "use strict";

  var a = CM.shell({ page: "settings", title: "Settings" });

  /* ══ 1. FILL ══════════════════════════════════════════════════════════
     data-empty gives a field its own wording for a blank value, rather
     than leaving the dummy text sitting there looking real. */
  var derived = { "user.initial": (a.user.name || "?").charAt(0).toUpperCase() };
  Array.prototype.forEach.call(document.querySelectorAll("[data-fill]"), function (el) {
    var k = el.getAttribute("data-fill");
    var v = (k in derived) ? derived[k]
          : k.split(".").reduce(function (o, p) { return o == null ? o : o[p]; }, a);
    if (v === undefined || v === null || v === "") { v = el.getAttribute("data-empty"); }
    if (v) { el.textContent = v; }
  });

  /* Nothing on this screen is editable any more (2026-09-27): the name and
     the phone number belong to the page and are edited there, and the email
     is whatever Google account signed in. What is left is the account
     itself — what we may send, and how to end it. */

  /* ══ 2. DELETE — two taps, and the second one says what it costs ══════ */
  var del = document.getElementById("del");
  var note = document.getElementById("delNote");
  var armed = false;
  del.addEventListener("click", function () {
    if (!armed) {
      armed = true;
      del.textContent = "Yes, delete everything";
      note.textContent = a.code
        ? "This kills the code on both your stickers. It cannot be re-issued."
        : "This cannot be undone.";
      setTimeout(function () {
        if (!armed) { return; }
        armed = false;
        del.innerHTML = CM.icon("trash") + "Delete";
        note.textContent = "Your page comes down and your stickers stop working, for good";
      }, 5000);
      return;
    }
    CM.toast("A real delete would confirm with Google");
  });

  /* ══ 3. ICON SLOTS ════════════════════════════════════════════════════ */
  Array.prototype.forEach.call(document.querySelectorAll("[data-ic]"), function (el) {
    el.insertAdjacentHTML("afterbegin", CM.icon(el.getAttribute("data-ic")));
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-ic-in]"), function (el) {
    el.outerHTML = CM.icon(el.getAttribute("data-ic-in"));
  });

  /* ══ 4. LOG OUT ══════════════════════════════════════════════════════ */
  Array.prototype.forEach.call(document.querySelectorAll('a[href*="signup.html"], button[data-action="logout"], .btn-logout, a.btn'), function (btn) {
    if (btn.textContent.toLowerCase().indexOf("log out") > -1 || btn.getAttribute("data-action") === "logout") {
      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        btn.style.pointerEvents = "none";
        btn.innerHTML = (window.CM ? CM.icon("out") : "") + " Logging out…";
        if (window.CM && typeof CM.logout === "function") {
          await CM.logout();
        } else {
          try {
            if (window.supabase && typeof window.supabase.createClient === "function") {
              var sc = window.supabase.createClient("https://inzigrmttewawjjkggbd.supabase.co", "sb_publishable_t03O5VnqWX8kbRPDSfdprQ_gjJFAUsg");
              await sc.auth.signOut();
            }
          } catch (err) {}
          try {
            var keysToRemove = [];
            for (var i = 0; i < localStorage.length; i++) {
              var k = localStorage.key(i);
              if (k && (k.indexOf("sb-") === 0 || k.indexOf("cm.") === 0 || k.indexOf("cm_") === 0)) {
                keysToRemove.push(k);
              }
            }
            keysToRemove.forEach(function (k) { localStorage.removeItem(k); });
            sessionStorage.clear();
          } catch (err) {}
          location.href = (window.CM && CM.ROOT ? CM.ROOT : "../../") + "signup.html?logout=true";
        }
      });
    }
  });
})();
