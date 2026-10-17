/* ==========================================================================
   CODEMARCA — MY QR TAB
   Shared by every flow folder. The markup differs per flow (an empty state
   in 1 and 5, a waiting code in 3, the full screen in 2 and 4); this file
   only wires up whatever of it is present, so every block below is guarded.

   ONE PROFILE = ONE QR, FOR GOOD — decided 2026-09-16
     There is never a list. `a.code` is one object or null, and `code.id`
     never changes for the life of the account.

     code.status
       "active"   live — a scan opens the page
       "waiting"  printed and in someone's hand, but no page behind it yet
       null       no code at all (no page has been built)

   LOST STICKER — reprint, do not reissue. Reissuing would kill every
   sticker still stuck to a car, a laptop, a shutter. The code stays; we
   print it again.
   ========================================================================== */

(function () {
  "use strict";

  var a = CM.shell({ page: "qr", title: "My QR" });
  var c = a.code;

  CM.draw(a, CM.derived(a));

  /* ══ 1. THE SQUARE ════════════════════════════════════════════════════
     Lives outside the sticker card now, so these are document-wide. */

  if (c) {
    /* The square encodes codemarca.com/c/<id> — that id never reaches the
       screen (Garry, 2026-09-17). What people see, copy and share is the
       page link; with no page yet there is nothing to show but the square. */
    var codeUrl = "https://codemarca.com/c/" + c.id;
    var url     = a.profile ? "https://" + CM.url(a.profile.handle) : codeUrl;
    var pattern = CM.qr(c.id);
    var live    = c.status === "active";

    each("[data-qr]", function (el) { el.innerHTML = pattern; });

    /* The button copies whatever the line beside it shows: the printed
       codemarca.com/c/<id> on most screens, or the handle link where that
       is what is on screen (a claimed gift sticker). */
    var slug = (a.profile && a.profile.handle) || a.handle;
    each("[data-copy-url]", function (el) {
      var byHandle = el.getAttribute("data-copy-url") === "handle" && slug;
      el.innerHTML = CM.icon("copy");
      el.addEventListener("click", function () {
        CM.copy(byHandle ? "https://" + CM.url(slug) : url,
                byHandle ? "Link copied" : "Page link copied");
      });
    });

    /* VIEW PAGE — the owner's own page, in a new tab. Same link a scan
       opens, so it is the honest preview.
       Links only: the Preview card carries data-view="phone|web" itself, and
       a bare [data-view] caught the whole card — any click opened full screen
       and swallowed Edit page (Garry, 2026-10-11). */
    each("a[data-view]", function (el) {
      el.href = CM.ROOT + "profile.html?view=owner" +
        (slug ? "&handle=" + encodeURIComponent(slug) : "") +
        (a.profile && a.profile.theme ? "&theme=" + encodeURIComponent(a.profile.theme.toLowerCase()) : "");
    });

    /* ── PREVIEW ────────────────────────────────────────────────────
       The iframe is only pointed at the page once, and only if the card is
       on this screen. Phone / Web just resize the window around it. */
    var pv = one("[data-pv]");
    if (pv) {
      var frame = one("[data-pv-frame]");
      var live  = one("[data-live]");

      /* THREE CASES, one frame:
           a page       → the page itself, visitor view, review tools off
           a code only  → scan.html, which is literally what a scan gets
           neither      → nothing to preview, so the card stays away */
      /* A claimed gift sticker has a handle but no page yet — Google gave
         us a name and nothing else. Preview it as it really is (bare=1),
         or the owner sees a full page here and an empty one on the profile
         tab. */
      var activeTheme = (a.profile && a.profile.theme) || window.localStorage.getItem("cm.theme") || "light";
      var src = slug
        ? CM.ROOT + "profile.html?view=owner&chrome=0&preview=1&handle=" + encodeURIComponent(slug) +
          "&theme=" + encodeURIComponent(activeTheme.toLowerCase())
        : c ? CM.ROOT + "scan.html?chrome=0&state=waiting&code=" + encodeURIComponent(c.id)
            : null;

      if (!src) {
        pv.remove();
      } else {
        pv.hidden = false;
        frame.src = src;
        each("a[data-view]", function (el) { el.href = src; });

        function postToFrame() {
          if (!frame || !frame.contentWindow) return;
          var p = a.profile || {};
          var themeVal = (p.theme || window.localStorage.getItem("cm.theme") || "light").toLowerCase();
          var photoVal = p.photo || window.localStorage.getItem("cm.photo") || null;
          var nameVal = p.name || window.localStorage.getItem("cm.name") || a.user.name || "";
          var bioVal = p.bio !== undefined ? p.bio : (window.localStorage.getItem("cm.bio") || "");
          var links = {};
          if (p.links) {
            for (var k in p.links) {
              var lv = p.links[k];
              if (typeof lv === "string") links[k] = lv;
              else if (lv && lv.v && lv.on !== false) links[k] = lv.v;
            }
          }
          try {
            frame.contentWindow.postMessage({
              type: "cm-preview",
              page: {
                handle: p.handle || slug,
                name: nameVal,
                bio: bioVal,
                photo: photoVal,
                theme: themeVal,
                phone: p.phone || "",
                wa: p.wa || "",
                email: p.email || "",
                links: links,
                customs: p.customs || [],
                order: p.order || [],
                socialOrder: p.socialOrder || []
              }
            }, "*");
          } catch (err) {}
        }

        frame.addEventListener("load", postToFrame);
        setTimeout(postToFrame, 200);
        setTimeout(postToFrame, 700);

        window.addEventListener("message", function (e) {
          if (e.data && e.data.type === "cm-preview-ready") {
            postToFrame();
          }
        });
        window.addEventListener("cm-profile-synced", function () {
          a = CM.account();
          postToFrame();
        });
        window.addEventListener("cm-profile-updated", function () {
          a = CM.account();
          postToFrame();
        });

        /* Edit or Build, depending on whether there is anything to edit.
           And with nothing on the page yet, "Open" would open a blank —
           so it goes, leaving one button that is worth pressing. */
        each("[data-pv-do]", function (el) {
          if (a.profile) { return; }
          el.href = CM.ROOT + "onboarding.html" + (a.state === "scanned" ? "?claim=" + encodeURIComponent(a.code.id)
          : !a.order ? "" : a.state === "delivered" ? "?ordered=landed" : "?ordered=1");
          el.innerHTML = CM.icon("plus") + "Build my page";
        });
        if (!a.profile) {
          Array.prototype.forEach.call(pv.querySelectorAll("a[data-view]"), function (el) {
            el.remove();
          });
        }

        var sub = one("[data-pv-sub]");
        if (sub) {
          sub.textContent = !slug
            ? "Until your page is built, this is all a scan shows."
            : a.profile
              ? "The same page anyone gets when they scan your sticker."
              : "This is all a scan opens today — your name, and nothing else.";
        }

        /* REAL DEVICES (Garry, 2026-10-08): Phone is an iPhone, Web is a
           browser window. The page renders at a real width —
           390px or 1280px — and is scaled into the screen, so Web is tiny
           but reads as a website, not a stretched phone. */
        var urlText = slug ? CM.url(slug) : "codemarca.com/c/" + (c ? c.id : "");
        var box = one(".pv__frame");
        var dev = CM.pageDevice(frame, urlText, { onFull: function () { openFull(); } });
        box.parentNode.replaceChild(dev.el, box);
        dev.set("phone");

        each("[data-pv-tab]", function (b) {
          b.addEventListener("click", function () {
            pv.setAttribute("data-view", b.dataset.pvTab);
            each("[data-pv-tab]", function (x) {
              x.setAttribute("aria-selected", String(x === b));
            });
            dev.set(b.dataset.pvTab);
          });
        });

        /* OPEN — the page full screen (page-view.js), never a new tab. The
           top card's View page too, now (Garry, 2026-10-10). A theme picked
           in there carries back to the card and to the next Open. */
        var openFull = function () {
          CM.openPage({ src: src, url: urlText, profile: a.profile, onClose: function () {
            if (a.profile && a.profile.theme && !new RegExp("[?&]theme=" + a.profile.theme + "(&|$)").test(src)) {
              src = CM.withTheme(src, a.profile.theme);
              frame.src = src;
            }
          } });
        };
        each("a[data-view]", function (el) {
          el.removeAttribute("target");
          el.addEventListener("click", function (e) { e.preventDefault(); openFull(); });
        });

        /* ONE SWITCH (Garry, 2026-09-27). There used to be two — one for
           the code, one for the page — and nobody could tell them apart,
           because in practice they are the same question: does the thing
           people reach open, or not. Off closes both doors: a scan and the
           link get the same short note. */
        var liveRow = one("[data-live-row]") || (live && live.closest(".onoff"));
        if (live && slug) {
          if (liveRow) { liveRow.hidden = false; }
          live.checked = !(a.profile && a.profile.live === false);
          var paintLive = function () {
            var off = !live.checked;
            pv.toggleAttribute("data-off", off);
            liveRow.toggleAttribute("data-off", off);
            one("[data-live-t]").textContent = off ? "Your page is off" : "Your page is live";
            one("[data-live-s]").textContent = off
              ? "Scans and your link both show a short \u201cnot available\u201d note"
              : "Sticker scans and your link both open it";
            each("[data-status]", function (el) {
              el.textContent = off ? "Off" : "Active";
              el.className = "chip " + (off ? "chip--warn" : "chip--ok");
            });
          };
          live.addEventListener("change", function () {
            paintLive();
            CM.toast(live.checked ? "Your page is live again" : "Your page is off");
          });
          paintLive();
        } else if (liveRow) {
          liveRow.remove();
        }
      }
    }

    var show = function () {
      if (document.querySelector("[data-paused]")) {
        CM.toast("Resume the code before showing it");
        return;
      }
      var slug = (a.profile && a.profile.handle) || a.handle || window.localStorage.getItem("cm.username") || "";
      CM.showCode({
        title: a.profile ? a.profile.title : "My code",
        sub:   a.profile ? CM.url(a.profile.handle) : (slug ? CM.url(slug) : ""),
        url:   url,
        seed:  c.id,
        handle: slug,
        username: slug
      });
    };
    each("[data-show]", function (el) { el.addEventListener("click", show); });
    each("[data-qr]",   function (el) { el.addEventListener("click", show); });

    /* Download and Share both go through the full-screen mode, because
       that is where dashboard.js keeps the rasteriser. Opening it and
       firing the button is less code than a second copy of codePng(). */
    each("[data-download]", function (el) {
      el.addEventListener("click", function () {
        show();
        var b = document.querySelector(".show [data-dl]");
        if (b) { b.click(); }
      });
    });
    each("[data-share-code]", function (el) {
      el.addEventListener("click", function () {
        CM.shareSheet({
          title: "Share my code",
          url: url,
          name: a.profile ? a.profile.title : a.user.name
        });
      });
    });
  }


  /* ══ 2. THE STICKERS IT IS PRINTED ON ═════════════════════════════════ */

  var card = document.getElementById("code");

  if (c && card) {
    /* each square is sized against the biggest one, from the number at the
       front of its size ("4″ × 4″" → 4) */
    var FRAME = 40;
    var edge  = function (s) { return parseFloat(s.size) || 1; };
    var list  = c.stickers || [];
    var big   = list.length ? Math.max.apply(null, list.map(edge)) : 1;
    var box   = card.querySelector("[data-stickers]");

    if (box) {
      box.innerHTML = list.length
        ? list.map(function (s) {
            var px = Math.max(8, Math.round(FRAME * edge(s) / big));
            return '<div class="stk">' +
              '<span class="stk__fig"><span class="stk__sq" style="width:' + px + 'px">' +
                CM.qr(c.id) + "</span></span>" +
              '<span class="stk__txt">' +
                '<span class="stk__t">' + s.name + '<span class="mono">' + s.size + "</span></span>" +
                '<span class="stk__s">' + s.where + "</span>" +
              "</span>" +
            "</div>";
          }).join("")
        : '<p class="card__note">Nothing printed yet. Your code works as a ' +
          'square on a screen today — stickers just put it on things.</p>';
    }

    /* The Pause button is gone with the second switch — the one on the
       preview card is the only lever now, and it paints this chip too. */
    function set(sel, fn) { var el = card.querySelector(sel); if (el) { fn(el); } }

    /* A lost sticker is a reprint, not a new code. Nothing switches off,
       nothing already stuck to anything stops working, and the dialog says
       exactly that — because the old behaviour was the opposite and people
       will expect to be punished for losing one. */
    set("[data-lost]", function (btn) {
      btn.addEventListener("click", function () {
        CM.dialog({
          title: "Lost or damaged a sticker?",
          body: "Nothing breaks. We print the same code again and send you a new " +
                "pair — your code never changes, so every sticker you still have " +
                "keeps working exactly as it did. You only pay delivery.",
          actions: [
            { id: "reprint", label: "Send me a new pair", kind: "go" },
            { id: "keep",    label: "Not now", kind: "quiet" }
          ],
          onPick: function (id) {
            if (id !== "reprint") { return; }
            window.location.href = CM.ROOT + "checkout.html?pack=free&built=1&free=used&reason=lost";
          }
        });
      });
    });
  }


  /* ══ 3. HELPERS ═══════════════════════════════════════════════════════ */

  function one(sel) { return document.querySelector(sel); }

  function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }
})();
