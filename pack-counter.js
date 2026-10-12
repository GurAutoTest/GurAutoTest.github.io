/**
 * CODEMARCA — DYNAMIC FREE PACK COUNTER (DB DRIVEN)
 * Reads & updates live early-bird free pack claims in Supabase.
 * Updates both the header nav pill ("37 left / 37 of 100 packs left")
 * and the offer meter section ("37 of 100 packs left", "63 claimed so far", fill bar).
 */
(function (window) {
  "use strict";

  var SUPABASE_URL = "https://inzigrmttewawjjkggbd.supabase.co";
  var SUPABASE_KEY = "sb_publishable_t03O5VnqWX8kbRPDSfdprQ_gjJFAUsg";
  var CACHE_KEY = "cm.free_pack_counter";

  var state = {
    total: 100,
    claimed: 63,
    left: 37,
    loaded: false
  };

  // Try loading cached state first for instant render
  try {
    var cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "null");
    if (cached && typeof cached.left === "number") {
      state.total = cached.total || 100;
      state.claimed = cached.claimed || 63;
      state.left = cached.left;
    }
  } catch (e) {}

  function fetchLiveCount(callback) {
    var url = SUPABASE_URL + "/rest/v1/chat_rooms?owner_username=eq._codemarca_system&visitor_id=eq.free_pack_counter&select=id,last_message";
    fetch(url, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      }
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        if (data && data.length > 0 && data[0].last_message) {
          try {
            var parsed = JSON.parse(data[0].last_message);
            if (typeof parsed.left === "number" && typeof parsed.total === "number") {
              state.total = parsed.total;
              state.claimed = parsed.claimed;
              state.left = parsed.left;
              state.loaded = true;
              try {
                window.localStorage.setItem(CACHE_KEY, JSON.stringify(state));
              } catch (err) {}
            }
          } catch (e) {}
        }
        render();
        if (typeof callback === "function") callback(state);
      })
      .catch(function (err) {
        console.warn("Could not fetch live pack count from DB, using cached/fallback:", err);
        render();
        if (typeof callback === "function") callback(state);
      });
  }

  function render() {
    var total = state.total || 100;
    var claimed = state.claimed != null ? state.claimed : 63;
    var left = state.left != null ? state.left : (total - claimed);
    var soldOut = left <= 0;

    // 1. Offer Meter Section (#offer)
    var offer = document.getElementById("offer");
    if (offer) {
      offer.dataset.total = String(total);
      offer.dataset.claimed = String(claimed);
      offer.dataset.state = soldOut ? "out" : "open";

      var offerN = offer.querySelector("[data-offer-n]");
      if (offerN) offerN.textContent = soldOut ? "0" : String(left);

      var offerOf = offer.querySelector("[data-offer-of]");
      if (offerOf) {
        offerOf.textContent = soldOut
          ? "packs left — join the waitlist"
          : "of " + total + " packs left";
      }

      var offerMeta = offer.querySelector("[data-offer-meta]");
      if (offerMeta) {
        offerMeta.textContent = claimed + " claimed so far";
      }

      var fill = offer.querySelector("[data-offer-fill]");
      if (fill) {
        var pct = Math.round((claimed / total) * 100);
        fill.style.width = pct + "%";
      }
    }

    // 2. Header Nav Pill (#packsPill)
    var pill = document.getElementById("packsPill");
    if (pill) {
      pill.dataset.state = soldOut ? "out" : "open";

      var packsN = pill.querySelector("[data-packs-n]");
      if (packsN) packsN.textContent = soldOut ? "All" : String(left);

      var packsOf = pill.querySelector("[data-packs-of]");
      if (packsOf) {
        packsOf.textContent = soldOut
          ? " " + total + " packs claimed"
          : " of " + total + " packs left";
      }

      var packsShort = pill.querySelector(".packs__short");
      if (packsShort) {
        packsShort.innerHTML = "<b>" + (soldOut ? "0" : left) + "</b>" + (soldOut ? " claimed" : " left");
      }

      pill.setAttribute(
        "aria-label",
        soldOut
          ? "All " + total + " early bird packs claimed"
          : left + " of " + total + " early bird packs left"
      );
    }

    // Also update any other generic data-packs-left tags on page
    var genericBadges = document.querySelectorAll("[data-pack-count]");
    for (var i = 0; i < genericBadges.length; i++) {
      genericBadges[i].textContent = String(left);
    }
  }

  function claimFreePack(details, callback) {
    details = details || {};
    var url = SUPABASE_URL + "/rest/v1/chat_rooms?owner_username=eq._codemarca_system&visitor_id=eq.free_pack_counter&select=id,last_message";

    fetch(url, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      }
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data[0]) throw new Error("Counter room not found");
        var row = data[0];
        var cur = JSON.parse(row.last_message || "{}");
        var curTotal = cur.total || 100;
        var curClaimed = cur.claimed != null ? cur.claimed : 63;
        var nextClaimed = Math.min(curTotal, curClaimed + 1);
        var nextLeft = Math.max(0, curTotal - nextClaimed);

        var updatedPayload = {
          total: curTotal,
          claimed: nextClaimed,
          left: nextLeft,
          last_claimed_at: new Date().toISOString(),
          last_order_id: details.orderId || ""
        };

        // Update counter room
        return fetch(SUPABASE_URL + "/rest/v1/chat_rooms?id=eq." + row.id, {
          method: "PATCH",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            last_message: JSON.stringify(updatedPayload)
          })
        }).then(function () {
          // Log order claim event in chat_messages
          fetch(SUPABASE_URL + "/rest/v1/chat_messages", {
            method: "POST",
            headers: {
              "apikey": SUPABASE_KEY,
              "Authorization": "Bearer " + SUPABASE_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              room_id: row.id,
              sender_type: "visitor",
              sender_id: details.orderId || "order_" + Date.now(),
              sender_display: details.name || "Customer",
              content: "Free pack claimed (" + (details.orderId || "direct") + "). Remaining: " + nextLeft
            })
          }).catch(function () {});

          state.total = curTotal;
          state.claimed = nextClaimed;
          state.left = nextLeft;
          state.loaded = true;
          try {
            window.localStorage.setItem(CACHE_KEY, JSON.stringify(state));
          } catch (e) {}

          render();

          // Also try Next.js API if available
          try {
            fetch("/api/packs/claim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(details)
            }).catch(function () {});
          } catch (e) {}

          if (typeof callback === "function") callback(state);
        });
      })
      .catch(function (err) {
        console.error("Error claiming free pack:", err);
        // Optimistic local decrement fallback
        state.claimed = (state.claimed || 63) + 1;
        state.left = Math.max(0, (state.total || 100) - state.claimed);
        try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch (e) {}
        render();
        if (typeof callback === "function") callback(state);
      });
  }

  // Auto-init on DOMContentLoaded and page visibility
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      render();
      fetchLiveCount();
    });
  } else {
    render();
    fetchLiveCount();
  }

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) fetchLiveCount();
  });

  window.CMPacks = {
    getState: function () { return state; },
    fetch: fetchLiveCount,
    render: render,
    claimFreePack: claimFreePack
  };

})(typeof window !== "undefined" ? window : this);
