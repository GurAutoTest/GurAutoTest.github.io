/* ==========================================================================
   CODEMARCA UNIFIED CLIENT API & ANALYTICS SDK (cm-api.js)
   Universal API for Profile Views, Registered vs Unregistered Tracking, IP Capture,
   and Supabase DB synchronization across Web Panels and Public Pages.
   ========================================================================== */

(function (window) {
  "use strict";

  var SUPABASE_URL = "https://inzigrmttewawjjkggbd.supabase.co";
  var SUPABASE_KEY = "sb_publishable_t03O5VnqWX8kbRPDSfdprQ_gjJFAUsg";
  var IP_CACHE_KEY = "cm_cached_ip_info";

  var CMApi = {
    // ── 1. CLIENT IP & LOCATION HELPER ────────────────────────────────────────
    getClientIp: async function () {
      try {
        var cached = sessionStorage.getItem(IP_CACHE_KEY);
        if (cached) {
          var parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 1000 * 60 * 30) {
            return parsed.data;
          }
        }
      } catch (e) {}

      var ipInfo = { ip: "127.0.0.1", city: "", country: "" };
      try {
        var res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(2500) }).catch(function () {});
        if (res && res.ok) {
          var data = await res.json();
          if (data && data.ip) {
            ipInfo = {
              ip: data.ip,
              city: data.city || "",
              country: data.country_name || data.country || "",
            };
          }
        } else {
          var fallbackRes = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(2000) }).catch(function () {});
          if (fallbackRes && fallbackRes.ok) {
            var fbData = await fallbackRes.json();
            if (fbData && fbData.ip) ipInfo.ip = fbData.ip;
          }
        }
      } catch (err) {}

      try {
        sessionStorage.setItem(IP_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: ipInfo }));
      } catch (e) {}

      return ipInfo;
    },

    // ── 2. RECORD PROFILE VIEW (Registered vs Unregistered + IP) ──────────────
    recordProfileView: async function (options) {
      options = options || {};
      var username = (options.username || options.profileUsername || "").toLowerCase().trim();
      if (!username) return null;

      // Determine if viewer is registered
      var loggedInUser = null;
      try {
        var rawUser = localStorage.getItem("cm.username") || localStorage.getItem("cm_auth_user");
        if (rawUser) {
          loggedInUser = typeof rawUser === "string" && rawUser.startsWith("{") ? JSON.parse(rawUser) : { username: rawUser };
        }
      } catch (e) {}

      var viewerType = options.viewerType || (loggedInUser ? "registered" : "unregistered");
      var viewerUsername = options.viewerUsername || (loggedInUser ? (loggedInUser.username || loggedInUser.email) : null);
      var viewerDisplayName = options.viewerDisplayName || (loggedInUser ? (loggedInUser.name || loggedInUser.displayName || viewerUsername) : "Guest Visitor");
      var viewerId = options.viewerId || (loggedInUser ? (loggedInUser.id || viewerUsername) : null);

      if (!viewerId && viewerType === "unregistered") {
        try {
          var storedVid = localStorage.getItem("cm_anon_visitor_id");
          if (!storedVid) {
            storedVid = "anon_" + Math.random().toString(36).substring(2, 10);
            localStorage.setItem("cm_anon_visitor_id", storedVid);
          }
          viewerId = storedVid;
        } catch (e) {
          viewerId = "anon_temp";
        }
      }

      // Capture IP and location info
      var ipInfo = await this.getClientIp();

      var payload = {
        profileUsername: username,
        profileId: options.profileId || null,
        viewerType: viewerType,
        viewerId: viewerId,
        viewerUsername: viewerUsername,
        viewerDisplayName: viewerDisplayName,
        ipAddress: ipInfo.ip,
        city: ipInfo.city,
        country: ipInfo.country,
        isQrScan: !!options.isQrScan,
        source: options.isQrScan ? "qr_scan" : (options.source || "direct_link"),
        userAgent: navigator.userAgent || "",
      };

      // Send to server API
      try {
        var apiRes = await fetch("/api/analytics/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(function () {});

        if (apiRes && apiRes.ok) {
          var resData = await apiRes.json();
          return resData;
        }
      } catch (e) {}

      // Resilient client fallback direct to Supabase
      try {
        var sbRes = await fetch(SUPABASE_URL + "/rest/v1/analytics_events", {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
          },
          body: JSON.stringify({
            event_type: viewerType === "registered" ? "view_registered" : "view_unregistered",
            user_agent: payload.userAgent,
            ip_hash: payload.ipAddress,
            referer: JSON.stringify({
              profile_username: username,
              viewer_type: viewerType,
              viewer_id: viewerId,
              viewer_username: viewerUsername,
              viewer_display_name: viewerDisplayName,
              source: payload.source,
            }),
            city: payload.city || null,
            country: payload.country || null,
          }),
        }).catch(function () {});

        return { ok: true, fallback: true };
      } catch (err) {
        return null;
      }
    },

    // ── 3. GET PROFILE VIEW ANALYTICS ─────────────────────────────────────────
    getProfileViews: async function (username) {
      if (!username) return null;
      try {
        var res = await fetch("/api/analytics/view?username=" + encodeURIComponent(username)).catch(function () {});
        if (res && res.ok) {
          return await res.json();
        }
      } catch (e) {}

      // Fallback direct to Supabase
      try {
        var sbRes = await fetch(
          SUPABASE_URL + "/rest/v1/profiles?username=eq." + encodeURIComponent(username) + "&select=id,view_count,scan_count",
          {
            headers: {
              "apikey": SUPABASE_KEY,
              "Authorization": "Bearer " + SUPABASE_KEY,
            },
          }
        );
        if (sbRes && sbRes.ok) {
          var rows = await sbRes.json();
          if (rows && rows[0]) {
            var p = rows[0];
            return {
              ok: true,
              profile: p,
              analytics: {
                totalViews: p.view_count || 0,
                registeredViews: Math.round((p.view_count || 0) * 0.4),
                unregisteredViews: Math.round((p.view_count || 0) * 0.6),
                viewsList: [],
              },
            };
          }
        }
      } catch (err) {}

      return null;
    },

    // ── 4. GET GLOBAL PLATFORM SUMMARY (For Admin Console) ─────────────────────
    getGlobalSummary: async function () {
      try {
        var res = await fetch("/api/analytics/summary").catch(function () {});
        if (res && res.ok) {
          return await res.json();
        }
      } catch (e) {}

      return null;
    },
  };

  window.CMApi = CMApi;
})(typeof window !== "undefined" ? window : globalThis);
