/* ==========================================================================
   CODEMARCA — MODES (Phase-1, Garry 2026-10-13)
   Two switches on Home that change what a scan shows, for a while. The
   sticker never changes; only the top of the page does.

     TRAVEL  up to two people a finder can call (a travel buddy, the trip
             host), a short note, and a date it switches itself off — so a
             friend's number is not left on a public page for good.
     LOST    the page turns into a "please return" note: what was lost,
             who to call, a short note. Stays on until the owner says found.

   One at a time. Lost takes over from Travel, because a lost phone is the
   case Travel was set up for in the first place.

   Lives on Home, near the top (Garry, 2026-10-13): someone whose phone is
   gone signs in from a friend's laptop and the switch is on the first
   screen they see. Works from any device they sign in on.

       CM.mountModes(a)   draws into [data-modes]; a.modes is the saved state

   The shape of a.modes is the API's:

       { travel: { on, until, note, people: [ { name, rel, phone } ] },
         lost:   { on, since, item, note, people: [ … ] } }

   The public page gets ONE of them as P.mode (see profile.html 2h).
   ========================================================================== */

(function () {
  "use strict";

  var IC = {
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    lost:  '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.2"/><path d="M12 16.4v.01"/>'
  };
  function ic(k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[k] + "</svg>";
  }
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  var RELS  = ["Travel buddy", "Friend", "Family", "Partner", "Trip host", "Colleague"];
  var ITEMS = [
    { k: "phone",  n: "Phone"  },
    { k: "laptop", n: "Laptop" },
    { k: "bag",    n: "Bag"    },
    { k: "bottle", n: "Bottle" },
    { k: "keys",   n: "Keys"   },
    { k: "other",  n: "Something else" }
  ];
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function blank() {
    return {
      travel: { on: false, until: "", note: "", people: [] },
      lost:   { on: false, since: "", item: "phone", note: "", people: [] }
    };
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* dates travel as yyyy-mm-dd (the input's own format) and show as "20 Oct" */
  function iso(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function nice(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    return m ? (+m[3]) + " " + MONTHS[+m[2] - 1] : (s || "");
  }
  function inDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return iso(d); }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  function okPhone(s) { var d = digits(s); return d.length >= 10 && d.length <= 13; }
  function names(people) {
    return people.map(function (p) { return p.name; }).filter(Boolean).join(", ");
  }

  /* ══ THE CARD ════════════════════════════════════════════════════════ */
  CM.mountModes = function (a) {
    var box = document.querySelector("[data-modes]");
    if (!box) { return; }
    /* a page that is switched off shows nobody anything — no mode either */
    if (a.profile && a.profile.live === false) { box.hidden = true; return; }
    var M = a.modes ? clone(a.modes) : blank();
    a.modes = M;

    function line(k) {
      var m = M[k];
      if (k === "travel") {
        if (m.on) { return "On till " + nice(m.until) + " · " + esc(names(m.people)); }
        if (M.lost.on) { return "Lost mode is on instead"; }
        return "Puts a travel buddy’s number on top of your page.";
      }
      if (m.on) {
        var it = ITEMS.filter(function (x) { return x.k === m.item; })[0];
        return "On since " + nice(m.since) + " · " + esc(it ? it.n : "Something else");
      }
      return "Your page asks whoever finds it to call someone you trust.";
    }

    function row(k, title) {
      var m = M[k];
      return '<div class="mrow" data-k="' + k + '"' + (m.on ? " data-on" : "") + ">" +
        '<span class="mrow__ic">' + ic(k === "travel" ? "plane" : "lost") + "</span>" +
        '<span class="mrow__txt">' +
          '<span class="mrow__t">' + title + "</span>" +
          '<span class="mrow__s">' + line(k) + "</span>" +
        "</span>" +
        (m.on ? '<button class="mrow__edit" type="button" data-edit="' + k + '">Edit</button>' : "") +
        '<label class="sw"><input type="checkbox" data-sw="' + k + '"' + (m.on ? " checked" : "") +
          ' aria-label="' + title + '"><span class="sw__track"></span></label>' +
      "</div>";
    }

    function paint() {
      var live = M.lost.on ? "lost" : M.travel.on ? "travel" : "";
      box.dataset.live = live;
      box.innerHTML =
        '<div class="card__head"><span class="card__title">Modes</span></div>' +
        '<p class="card__h modes__h">Change what a scan shows, for a while.</p>' +
        '<div class="modes__rows">' + row("travel", "Travel mode") + row("lost", "Lost mode") + "</div>" +
        (live
          ? '<button class="btn btn--ghost btn--sm modes__see" type="button" data-see>' +
              CM.icon("eye") + "See what a scan shows</button>"
          : "") +
        '<p class="card__note modes__note">Works from any device you sign in on, so a lost phone can still be switched over from a friend’s.</p>';
    }

    box.addEventListener("change", function (e) {
      var sw = e.target.closest("[data-sw]");
      if (!sw) { return; }
      var k = sw.getAttribute("data-sw");
      if (sw.checked) {
        sw.checked = false;           /* only on once the form is saved */
        form(k);
      } else {
        M[k].on = false;
        paint();
      }
    });
    box.addEventListener("click", function (e) {
      var ed = e.target.closest("[data-edit]");
      if (ed) { form(ed.getAttribute("data-edit")); return; }
      if (e.target.closest("[data-see]")) { see(); }
    });

    /* the page as a scan opens it, with the live mode on top */
    function see() {
      var k = M.lost.on ? "lost" : "travel";
      var mode = clone(M[k]); mode.kind = k;
      delete mode.on;
      var src = CM.ROOT + "profile.html?view=visitor&chrome=0&handle=" + encodeURIComponent(a.profile.handle) +
        "&theme=" + encodeURIComponent((a.profile.theme || "light").toLowerCase()) +
        "&mode=" + encodeURIComponent(JSON.stringify(mode));
      if (CM.openPage) { CM.openPage({ src: src, url: CM.url(a.profile.handle), profile: a.profile }); }
      else { window.open(src.replace("&chrome=0", ""), "_blank", "noopener"); }
    }

    /* ══ THE FORM ══════════════════════════════════════════════════════
       One sheet per mode. People are shared: whoever was set up for
       Travel is already filled in when Lost goes on, and the other way. */
    function form(k) {
      var m = clone(M[k]);
      var other = M[k === "travel" ? "lost" : "travel"];
      var people = (m.people.length ? m.people : other.people).slice(0, 2);
      if (!people.length) { people = [{ name: "", rel: k === "travel" ? "Travel buddy" : "Family", phone: "" }]; }
      if (k === "travel" && !m.until) { m.until = inDays(7); }

      function personHtml(p, i) {
        return '<fieldset class="mp" data-i="' + i + '">' +
          '<legend class="mp__lg">' + (i ? "Second person" : "Who should they call?") +
            (i ? '<button class="mp__rm" type="button" data-rm>Remove</button>' : "") + "</legend>" +
          '<div class="grid2">' +
            '<label class="fld"><span class="fld__lbl">Name</span>' +
              '<input class="fld__in" data-f="name" maxlength="30" autocomplete="off" placeholder="Rahul" value="' + esc(p.name) + '"></label>' +
            '<label class="fld"><span class="fld__lbl">Who they are</span>' +
              '<select class="fld__in" data-f="rel">' + RELS.map(function (r) {
                return "<option" + (r === p.rel ? " selected" : "") + ">" + r + "</option>";
              }).join("") + "</select></label>" +
          "</div>" +
          '<label class="fld"><span class="fld__lbl">Phone number</span>' +
            '<input class="fld__in" data-f="phone" type="tel" inputmode="tel" maxlength="16" placeholder="98765 43210" value="' + esc(p.phone) + '"></label>' +
        "</fieldset>";
      }

      var head = k === "travel"
        ? "<p class=\"mf__lead\">If your phone or bag goes missing on the trip, whoever finds it sees these numbers first. Each one shows only when they tap it.</p>"
        : "<p class=\"mf__lead\">Your page turns into a “please return” note. Add someone else’s number — the finder can’t call the phone you lost.</p>";

      var itemHtml = k === "lost"
        ? '<div class="fld"><span class="fld__lbl">What’s lost?</span><div class="mf__chips" role="radiogroup" aria-label="What is lost">' +
            ITEMS.map(function (x) {
              return '<button type="button" class="mf__chip" role="radio" data-item="' + x.k + '" aria-checked="' + (x.k === m.item) + '">' + x.n + "</button>";
            }).join("") + "</div></div>"
        : "";

      var html =
        '<div class="mf" data-k="' + k + '">' + head + itemHtml +
          '<div class="mf__people"></div>' +
          '<button class="mf__add" type="button" data-add>' + CM.icon("plus") + "Add a second person</button>" +
          '<label class="fld"><span class="fld__top"><span class="fld__lbl">A short note <span class="mf__opt">optional</span></span><span class="mf__count" data-count></span></span>' +
            '<textarea class="fld__in mf__note" data-note maxlength="120" rows="2" placeholder="' +
            (k === "travel" ? "Group trip with Wanderlust Treks, bus HP 01 4521." : "Left it near the Manikaran bus stand. Small reward, thank you!") +
            '">' + esc(m.note) + "</textarea></label>" +
          (k === "travel"
            ? '<label class="fld"><span class="fld__lbl">Switch off by itself on</span>' +
                '<input class="fld__in" type="date" data-until min="' + inDays(1) + '" value="' + esc(m.until) + '"></label>'
            : "") +
          '<div class="mf__acts">' +
            '<button class="btn btn--go btn--wide" type="button" data-save disabled>' +
              (M[k].on ? "Save" : k === "travel" ? "Turn on Travel mode" : "Turn on Lost mode") + "</button>" +
            '<button class="btn btn--quiet btn--wide" type="button" data-sheet-close>Cancel</button>' +
          "</div>" +
        "</div>";

      CM.sheet({
        title: k === "travel" ? "Travel mode" : "Lost mode",
        html: html,
        onOpen: function (panel, close) {
          var f = panel.querySelector(".mf");
          var list = f.querySelector(".mf__people");
          var add  = f.querySelector("[data-add]");
          var save = f.querySelector("[data-save]");
          var note = f.querySelector("[data-note]");
          var cnt  = f.querySelector("[data-count]");

          function read() {
            people = Array.prototype.map.call(list.querySelectorAll(".mp"), function (fs) {
              return {
                name:  fs.querySelector('[data-f="name"]').value.trim(),
                rel:   fs.querySelector('[data-f="rel"]').value,
                phone: fs.querySelector('[data-f="phone"]').value.trim()
              };
            });
          }
          function draw() {
            list.innerHTML = people.map(personHtml).join("");
            add.hidden = people.length >= 2;
            check();
          }
          function check() {
            read();
            /* every person on the list needs a name and a number that dials */
            var ok = people.length && people.every(function (p) { return p.name && okPhone(p.phone); });
            if (k === "travel") { ok = ok && !!f.querySelector("[data-until]").value; }
            save.disabled = !ok;
            cnt.textContent = note.value.length + " / 120";
          }

          f.addEventListener("input", check);
          f.addEventListener("change", check);
          add.addEventListener("click", function () {
            read(); people.push({ name: "", rel: "Friend", phone: "" }); draw();
            list.querySelector('.mp[data-i="1"] [data-f="name"]').focus();
          });
          list.addEventListener("click", function (e) {
            if (!e.target.closest("[data-rm]")) { return; }
            read(); people.splice(1, 1); draw();
          });
          f.addEventListener("click", function (e) {
            var c = e.target.closest("[data-item]");
            if (!c) { return; }
            m.item = c.getAttribute("data-item");
            Array.prototype.forEach.call(f.querySelectorAll("[data-item]"), function (x) {
              x.setAttribute("aria-checked", String(x === c));
            });
          });
          save.addEventListener("click", function () {
            read();
            m.people = people;
            m.note = note.value.trim();
            if (k === "travel") { m.until = f.querySelector("[data-until]").value; }
            if (k === "lost" && !M.lost.on) { m.since = iso(new Date()); }
            m.on = true;
            M[k] = m;
            /* one at a time — Lost takes over from Travel, and back */
            M[k === "travel" ? "lost" : "travel"].on = false;
            close();
            paint();
          });

          draw();
          var first = list.querySelector('[data-f="name"]');
          if (first && !first.value) { first.focus(); }
        }
      });
    }

    paint();
  };
})();
