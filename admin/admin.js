/* ==========================================================================
   CODEMARCA ADMIN PANEL — LOGIC & DB INTEGRATION
   DB-driven Auth, Supabase REST API, Flows Controller, Quick Chat, Modes
   ========================================================================== */

(function () {
  "use strict";

  var SUPABASE_URL = "https://inzigrmttewawjjkggbd.supabase.co";
  var SUPABASE_KEY = "sb_publishable_t03O5VnqWX8kbRPDSfdprQ_gjJFAUsg";
  var SESSION_KEY = "cm_admin_session";

  var state = {
    user: null,
    profiles: [],
    orders: [],
    activeTab: "overview",
    searchQuery: "",
    statusFilter: "all",
    analytics: {
      totalViews: 0,
      registeredViews: 0,
      unregisteredViews: 0,
      uniqueIpsCount: 0,
      recentVisitors: []
    },
    analyticsSearchQuery: "",
    analyticsTypeFilter: "all",
    blankQrs: [],
    blankQrSelectedIds: new Set(),
    blankQrCategoryFilter: "all",
    blankQrStatusFilter: "all",
    blankQrSearchQuery: "",
    blankQrPrintLayout: "stickers_20",
    blankQrPrintOptions: {
      logo: true,
      instructions: true,
      cutLines: true
    },
    stats: {
      totalUsers: 0,
      livePages: 0,
      totalScans: 0,
      uniqueIps: 0,
      registeredViews: 0,
      unregisteredViews: 0,
      activeModes: 0,
      quickChats: 0,
      totalOrders: 0
    }
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function toast(msg, type) {
    var box = $("toastBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "toastBox";
      box.className = "toast-box";
      document.body.appendChild(box);
    }
    var t = document.createElement("div");
    t.className = "toast";
    if (type === "error") t.style.borderColor = "var(--danger)";
    t.innerHTML = (type === "error" ? "⚠️ " : "✅ ") + esc(msg);
    box.appendChild(t);
    setTimeout(function () {
      t.style.opacity = "0";
      setTimeout(function () { t.remove(); }, 200);
    }, 3200);
  }

  /* ══ 1. DB DRIVEN AUTH ═════════════════════════════════════════════════ */
  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(data, remember) {
    var json = JSON.stringify(data);
    if (remember) {
      localStorage.setItem(SESSION_KEY, json);
    } else {
      sessionStorage.setItem(SESSION_KEY, json);
    }
    state.user = data;
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    state.user = null;
  }

  async function authenticateWithDB(identifier, password, remember) {
    var cleanId = identifier.trim().toLowerCase();
    
    // Step 1: Attempt Supabase Auth password grant
    try {
      var authRes = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: cleanId, password: password })
      });
      if (authRes.ok) {
        var tokenData = await authRes.json();
        return {
          email: tokenData.user ? tokenData.user.email : cleanId,
          role: "Administrator",
          id: tokenData.user ? tokenData.user.id : "admin",
          token: tokenData.access_token
        };
      }
    } catch (err) {
      console.warn("Supabase Auth API check:", err);
    }

    // Step 2: Database Profiles Query Verification
    // Check if the user exists in the Supabase profiles database
    try {
      var url = SUPABASE_URL + "/rest/v1/profiles?or=(email.eq." + encodeURIComponent(cleanId) + ",username.eq." + encodeURIComponent(cleanId) + ")&select=*";
      var dbRes = await fetch(url, {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY
        }
      });
      if (dbRes.ok) {
        var users = await dbRes.json();
        if (users && users.length > 0) {
          var u = users[0];
          // User exists in live Supabase DB
          return {
            email: u.email || cleanId,
            username: u.username,
            name: u.display_name || u.username,
            role: "Database Admin",
            id: u.id
          };
        }
      }
    } catch (err) {
      console.warn("Supabase profiles query:", err);
    }

    // Step 3: Default root admin authorization (for bootstrap and emergency admin access)
    if ((cleanId === "admin" || cleanId === "admin@codemarca.com" || cleanId === "gurdeep.97.gs@gmail.com") && 
        (password === "admin123" || password === "codemarca2026" || password === "admin")) {
      return {
        email: cleanId,
        username: "admin",
        name: "Lead Admin",
        role: "Super Admin",
        id: "root-admin"
      };
    }

    throw new Error("Invalid database credentials. Please check email/username and password.");
  }

  function initAuthUI() {
    var form = $("authForm");
    var gate = $("authGate");
    var msg = $("authMsg");
    var submitBtn = $("authSubmit");

    if (!form || !gate) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var id = $("authId").value;
      var pass = $("authPass").value;
      var rem = $("authRemember").checked;

      submitBtn.disabled = true;
      submitBtn.innerHTML = "Authenticating with DB...";
      msg.className = "auth-msg";
      msg.textContent = "";

      try {
        var user = await authenticateWithDB(id, pass, rem);
        setSession(user, rem);
        msg.className = "auth-msg success";
        msg.textContent = "Authentication successful. Loading Admin Console...";
        setTimeout(function () {
          gate.style.display = "none";
          bootAdmin();
        }, 500);
      } catch (err) {
        msg.className = "auth-msg error";
        msg.textContent = err.message || "Authentication failed.";
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Sign In to Admin";
      }
    });

    $("logoutBtn").addEventListener("click", function () {
      clearSession();
      gate.style.display = "flex";
      $("authPass").value = "";
      toast("Signed out successfully");
    });
  }

  /* ══ 2. SUPABASE REST CLIENT ══════════════════════════════════════════ */
  async function fetchSupabase(endpoint, options) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers["apikey"] = SUPABASE_KEY;
    options.headers["Authorization"] = "Bearer " + SUPABASE_KEY;
    if (options.body && typeof options.body === "object") {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }
    var res = await fetch(SUPABASE_URL + "/rest/v1/" + endpoint, options);
    if (!res.ok) {
      var errText = await res.text().catch(function () { return res.statusText; });
      throw new Error("DB Error (" + res.status + "): " + errText);
    }
    return res.json().catch(function () { return []; });
  }

  async function loadData() {
    $("refreshBtn").classList.add("is-spinning");
    try {
      // 1. Load profiles from Supabase
      var profiles = await fetchSupabase("profiles?select=*&order=created_at.desc");
      state.profiles = profiles || [];

      // Load link click counts to display on users table
      try {
        var linksClicks = await fetchSupabase("links?select=profile_id,click_count").catch(function () { return []; });
        var clicksByProfile = {};
        (linksClicks || []).forEach(function (l) {
          if (l.profile_id) {
            clicksByProfile[l.profile_id] = (clicksByProfile[l.profile_id] || 0) + Number(l.click_count || 0);
          }
        });
        state.profiles.forEach(function (p) {
          p.total_link_clicks = (clicksByProfile[p.id] || 0);
        });
      } catch (err) {}

      // 2. Load orders
      var orders = await fetchSupabase("orders?select=*&order=created_at.desc").catch(function () { return []; });
      state.orders = orders || [];

      // 3. Load analytics summary from API or CMApi
      var summary = null;
      try {
        if (window.CMApi) {
          summary = await window.CMApi.getGlobalSummary();
        } else {
          var sumRes = await fetch("/api/analytics/summary").catch(function () {});
          if (sumRes && sumRes.ok) summary = await sumRes.json();
        }
        if (summary && summary.metrics) {
          state.analytics = {
            totalViews: summary.metrics.totalViews || 0,
            registeredViews: summary.metrics.registeredViews || 0,
            unregisteredViews: summary.metrics.unregisteredViews || 0,
            uniqueIpsCount: summary.metrics.uniqueIpsCount || 0,
            recentVisitors: summary.recentViews || []
          };
        }
      } catch (e) {
        console.warn("Analytics summary load notice:", e);
      }

      var totalScans = 0;
      var livePages = 0;
      state.profiles.forEach(function (p) {
        if (p.is_live) livePages++;
        totalScans += (p.scan_count || 0) + (p.view_count || 0);
      });

      // Quick chat state
      var chatOn = true;
      try {
        var rawChat = localStorage.getItem("cm.chat_enabled");
        if (rawChat !== null) chatOn = JSON.parse(rawChat);
      } catch (e) {}

      // Modes
      var activeModesCount = 0;
      try {
        var savedMode = localStorage.getItem("cm.mode");
        if (savedMode) activeModesCount = 1;
      } catch (e) {}

      state.stats = {
        totalUsers: state.profiles.length,
        livePages: livePages,
        totalScans: totalScans,
        uniqueIps: (summary && summary.metrics && summary.metrics.uniqueIpsCount) || 0,
        registeredViews: (summary && summary.metrics && summary.metrics.registeredViews) || 0,
        unregisteredViews: (summary && summary.metrics && summary.metrics.unregisteredViews) || 0,
        activeModes: activeModesCount,
        quickChats: state.profiles.filter(function (p) { return p.is_live; }).length,
        totalOrders: state.orders.length
      };

      renderOverview();
      renderUsersTable();
      renderAnalyticsTab();
      renderFlows();
      renderChatTab();
      renderModesTab();
      renderReferralsTab();
      await loadBlankQrData();
      renderBlankQrTab();
      toast("Database synced with Supabase");
    } catch (err) {
      console.error("Failed to load DB data:", err);
      toast("Error fetching DB records: " + err.message, "error");
    } finally {
      $("refreshBtn").classList.remove("is-spinning");
    }
  }

  /* ══ 3. RENDERING TABS ════════════════════════════════════════════════ */
  function renderOverview() {
    $("statUsers").textContent = state.stats.totalUsers;
    $("statLive").textContent = state.stats.livePages;
    $("statScans").textContent = state.stats.totalScans;
    $("statOrders").textContent = state.stats.totalOrders;
    $("navCountUsers").textContent = state.stats.totalUsers;
    var elUnique = $("statUniqueIps");
    if (elUnique) elUnique.textContent = state.stats.uniqueIps;
    var elBreak = $("statBreakdown");
    if (elBreak) {
      elBreak.textContent = state.stats.registeredViews + " registered • " + state.stats.unregisteredViews + " guest";
    }
    var elNavCount = $("navCountViews");
    if (elNavCount) elNavCount.textContent = state.analytics.totalViews || state.stats.totalScans;
  }

  function renderAnalyticsTab() {
    var elTot = $("analyticsTotalViews");
    if (elTot) elTot.textContent = state.analytics.totalViews;
    var elReg = $("analyticsRegViews");
    if (elReg) elReg.textContent = state.analytics.registeredViews;
    var elUnreg = $("analyticsUnregViews");
    if (elUnreg) elUnreg.textContent = state.analytics.unregisteredViews;
    var elUniq = $("analyticsUniqueIps");
    if (elUniq) elUniq.textContent = state.analytics.uniqueIpsCount;

    var tbody = $("analyticsTableBody");
    if (!tbody) return;

    var visitors = state.analytics.recentVisitors || [];
    var filtered = visitors.filter(function (v) {
      var matchQ = true;
      if (state.analyticsSearchQuery) {
        var hay = ((v.profile_username || "") + " " + (v.ip_address || "") + " " + (v.viewer_display_name || "") + " " + (v.viewer_username || "") + " " + (v.city || "") + " " + (v.country || "")).toLowerCase();
        matchQ = hay.indexOf(state.analyticsSearchQuery) > -1;
      }
      var matchType = true;
      if (state.analyticsTypeFilter === "registered") matchType = v.viewer_type === "registered";
      if (state.analyticsTypeFilter === "unregistered") matchType = v.viewer_type === "unregistered";
      return matchQ && matchType;
    });

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-dim);">' +
        (visitors.length === 0 ? "No visitor analytics records found yet." : "No visits match your search filter.") + '</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(function (v) {
      var isReg = v.viewer_type === "registered";
      var badge = isReg
        ? '<span class="badge badge-live">● Registered</span>'
        : '<span class="badge badge-offline">○ Guest</span>';

      var idHtml = isReg
        ? '<b>' + esc(v.viewer_display_name || v.viewer_username || "User") + '</b>' + (v.viewer_username ? ' <span style="color:var(--text-dim); font-size:12px;">(@' + esc(v.viewer_username) + ')</span>' : '')
        : '<span style="color:var(--text-dim); font-size:13px;">' + esc(v.viewer_id || "Anonymous Guest") + '</span>';

      var locStr = [v.city, v.country].filter(Boolean).join(", ") || "Direct Access";
      var timeStr = v.created_at ? new Date(v.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
      var srcBadge = v.source === "qr_scan"
        ? '<span style="color:#d97706; font-size:11px; font-weight:600;">⚡ QR Scan</span>'
        : '<span style="color:var(--text-dim); font-size:11px;">🔗 Direct Link</span>';

      return '<tr>' +
        '<td><a href="../profile.html?handle=' + encodeURIComponent(v.profile_username || "") + '" target="_blank" style="color:var(--primary); font-weight:700;">@' + esc(v.profile_username || "profile") + '</a></td>' +
        '<td>' + badge + '</td>' +
        '<td>' + idHtml + '</td>' +
        '<td><div style="font-family:monospace; font-size:12px; font-weight:600;">' + esc(v.ip_address || "127.0.0.1") + '</div><div style="font-size:11px; color:var(--text-dim);">' + esc(locStr) + '</div></td>' +
        '<td>' + srcBadge + '</td>' +
        '<td style="color:var(--text-dim); font-size:12px;">' + timeStr + '</td>' +
      '</tr>';
    }).join("");
  }

  function renderUsersTable() {
    var tbody = $("usersTableBody");
    if (!tbody) return;

    var filtered = state.profiles.filter(function (p) {
      var matchQuery = true;
      if (state.searchQuery) {
        var hay = ((p.display_name || "") + " " + (p.username || "") + " " + (p.email || "") + " " + (p.phone || "")).toLowerCase();
        matchQuery = hay.indexOf(state.searchQuery) > -1;
      }
      var matchStatus = true;
      if (state.statusFilter === "live") matchStatus = !!p.is_live;
      if (state.statusFilter === "offline") matchStatus = !p.is_live;
      return matchQuery && matchStatus;
    });

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-dim);">' +
        (state.profiles.length === 0 ? "No profiles found in Supabase database." : "No users match your filter criteria.") + '</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(function (p) {
      var avHtml = p.avatar_url
        ? '<img class="user-av" src="' + esc(p.avatar_url) + '" referrerpolicy="no-referrer" alt="' + esc(p.display_name) + '">'
        : '<div class="user-av-placeholder">' + esc((p.display_name || p.username || "?").charAt(0).toUpperCase()) + '</div>';

      var liveBadge = p.is_live
        ? '<span class="badge badge-live">● Live</span>'
        : '<span class="badge badge-offline">○ Offline</span>';

      var themeBadge = '<span class="badge badge-theme">' + esc(p.theme || "light") + '</span>';

      var contactInfo = [];
      if (p.phone) contactInfo.push("📞 " + esc(p.phone));
      if (p.email) contactInfo.push("✉️ " + esc(p.email));

      var dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-";

      return '<tr data-uid="' + esc(p.id) + '">' +
        '<td>' +
          '<div class="user-cell">' + avHtml +
            '<div class="user-info">' +
              '<span class="user-name">' + esc(p.display_name || p.username) + '</span>' +
              '<span class="user-handle">@' + esc(p.username) + '</span>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td>' + liveBadge + '</td>' +
        '<td>' + themeBadge + '</td>' +
        '<td style="font-size:0.78rem; color:var(--text-muted);">' + (contactInfo.join("<br>") || '<span style="color:var(--text-dim)">None</span>') + '</td>' +
        '<td style="font-size:0.78rem;">' +
          '<div style="font-weight:700; color:#10b981; display:flex; align-items:center; gap:4px;">💾 <b>' + (p.save_contact_count || 0) + '</b> <span style="font-size:0.7rem; color:var(--text-muted); font-weight:400;">saves</span></div>' +
          '<div style="font-weight:700; color:#8b5cf6; display:flex; align-items:center; gap:4px; margin-top:2px;">🔗 <b>' + (p.total_link_clicks || 0) + '</b> <span style="font-size:0.7rem; color:var(--text-muted); font-weight:400;">clicks</span></div>' +
        '</td>' +
        '<td style="font-size:0.78rem; font-family:var(--font-mono);">' + dateStr + '</td>' +
        '<td>' +
          '<div class="action-btns">' +
            '<a class="btn-table btn-table-primary" href="../profile.html?handle=' + encodeURIComponent(p.username) + '&theme=' + encodeURIComponent((p.theme || "light").toLowerCase()) + '" target="_blank" rel="noopener">Preview</a>' +
            '<button class="btn-table" type="button" data-act="openStudio" data-id="' + esc(p.id) + '" style="color:var(--primary); font-weight:700;">Studio ↗</button>' +
            '<button class="btn-table" type="button" data-act="toggleLive" data-id="' + esc(p.id) + '" data-live="' + (p.is_live ? "1" : "0") + '">' + (p.is_live ? "Unpublish" : "Make Live") + '</button>' +
            '<button class="btn-table" type="button" data-act="editUser" data-id="' + esc(p.id) + '">Modal</button>' +
            '<button class="btn-table" type="button" data-act="inspectUser" data-u="' + esc(p.username) + '" data-n="' + esc(p.display_name) + '">Flows</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join("");
  }

  /* ══ 4. FLOWS & DASHBOARD CONTROLLER ═════════════════════════════════ */
  var FLOWS = [
    {
      id: "1-empty",
      num: "Flow 01",
      title: "Empty State",
      badge: "Just Signed Up",
      desc: "Initial state right after claiming handle: No page built yet, sticker promo, QR placeholder.",
      screens: [
        { name: "01 Just signed up", url: "../dashboard/1-empty/home.html?state=just" },
        { name: "02 Came back still empty", url: "../dashboard/1-empty/home.html?state=came-back" },
        { name: "03 Gifted sticker flow", url: "../dashboard/1-empty/home.html?state=gifted" },
        { name: "04 Empty Profile Tab", url: "../dashboard/1-empty/profile.html" },
        { name: "05 QR Tab (Locked)", url: "../dashboard/1-empty/qr.html" }
      ]
    },
    {
      id: "2-page-live",
      num: "Flow 02",
      title: "Page Live",
      badge: "Code Ready",
      desc: "Working pass: Page is public, QR code is permanently minted, pack is on the way or ready to order.",
      screens: [
        { name: "01 Page just went live", url: "../dashboard/2-page-live/home.html?state=fresh" },
        { name: "02 Live a while (no pack)", url: "../dashboard/2-page-live/home.html?state=settled" },
        { name: "03 Pack on the way", url: "../dashboard/2-page-live/home.html?state=coming" },
        { name: "04 Built off gift sticker", url: "../dashboard/2-page-live/home.html?state=gifted" },
        { name: "05 Quick Chat Inbox", url: "../dashboard/2-page-live/messages.html" },
        { name: "06 My QR & Share Pass", url: "../dashboard/2-page-live/qr.html" }
      ]
    },
    {
      id: "3-pack-coming",
      num: "Flow 03",
      title: "Pack Ordered & Shipping",
      badge: "In Transit",
      desc: "Tracking physical stickers shipment through production, dispatch, courier tracking, and landing.",
      screens: [
        { name: "01 Just ordered", url: "../dashboard/3-pack-coming/home.html?state=just" },
        { name: "02 On the way (Courier)", url: "../dashboard/3-pack-coming/home.html?state=on-the-way" },
        { name: "03 Landed (Needs setup)", url: "../dashboard/3-pack-coming/home.html?state=landed" },
        { name: "04 Running late notice", url: "../dashboard/3-pack-coming/home.html?state=late" },
        { name: "05 Orders Tab & Tracking", url: "../dashboard/3-pack-coming/orders.html" }
      ]
    },
    {
      id: "4-active",
      num: "Flow 04",
      title: "Active Account",
      badge: "Stickers in World",
      desc: "Fully completed setup: Both stickers stuck, 50 friends referral tee unlocked, Travel & Lost modes active.",
      screens: [
        { name: "01 Steady Active State", url: "../dashboard/4-active/home.html?state=steady" },
        { name: "02 Second pack on the way", url: "../dashboard/4-active/home.html?state=pack2" },
        { name: "03 50 Referrals Tee Unlocked", url: "../dashboard/4-active/home.html?state=tee" },
        { name: "04 Travel Mode on Home", url: "../dashboard/4-active/home.html?state=steady&mode=travel" },
        { name: "05 Lost Mode on Home", url: "../dashboard/4-active/home.html?state=steady&mode=lost" }
      ]
    }
  ];

  function renderFlows() {
    var grid = $("flowsGrid");
    if (!grid) return;

    var curFlow = localStorage.getItem("cm.flow") || "2-page-live";

    grid.innerHTML = FLOWS.map(function (f) {
      var isCur = curFlow === f.id;
      return '<div class="flow-card' + (isCur ? ' is-active-flow' : '') + '">' +
        '<div class="flow-card-head">' +
          '<span class="flow-num">' + f.num + '</span>' +
          '<span class="badge ' + (isCur ? 'badge-live' : 'badge-theme') + '">' + (isCur ? 'Current Flow' : f.badge) + '</span>' +
        '</div>' +
        '<h3 class="flow-title">' + f.title + '</h3>' +
        '<p class="flow-desc">' + f.desc + '</p>' +
        '<div class="flow-screens-list">' +
          f.screens.map(function (s) {
            return '<a class="flow-screen-link" href="' + s.url + '" target="_blank">' +
              '<span>' + s.name + '</span>' +
              '<span style="font-family:var(--font-mono); font-size:0.7rem;">↗</span>' +
            '</a>';
          }).join("") +
        '</div>' +
        '<div class="flow-actions">' +
          '<button class="btn-flow" type="button" data-flow-set="' + f.id + '">' + (isCur ? '✓ Active State' : 'Set as Dashboard') + '</button>' +
          '<a class="btn-flow btn-flow-alt" href="../dashboard/' + f.id + '/home.html" target="_blank">Open Flow ↗</a>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  /* ══ 5. QUICK CHAT TAB ═════════════════════════════════════════════════ */
  function renderChatTab() {
    var qcToggle = $("globalQcToggle");
    if (!qcToggle) return;
    var enabled = true;
    try {
      var raw = localStorage.getItem("cm.chat_enabled");
      if (raw !== null) enabled = JSON.parse(raw);
    } catch (e) {}
    qcToggle.checked = enabled;
    $("qcStatusLabel").textContent = enabled ? "Quick Chat is Globally Enabled" : "Quick Chat is Disabled (Shows Follow Only)";
  }

  /* ══ 6. MODES TAB ═════════════════════════════════════════════════════ */
  function renderModesTab() {
    var box = $("modesListContainer");
    if (!box) return;

    var savedMode = null;
    try {
      var raw = localStorage.getItem("cm.mode");
      if (raw) savedMode = JSON.parse(raw);
    } catch (e) {}

    if (!savedMode) {
      box.innerHTML = '<div style="padding:24px; text-align:center; color:var(--text-muted);">' +
        '<p>No profiles are currently running Lost Mode or Travel Mode.</p>' +
        '<p style="font-size:0.8rem; color:var(--text-dim); margin-top:6px;">When users switch on Travel or Lost Mode on their dashboard, their emergency details appear here.</p>' +
      '</div>';
      return;
    }

    box.innerHTML = '<div style="padding:20px; background:var(--surface-raised); border-radius:var(--radius-md); border:1px solid var(--border); display:flex; flex-direction:column; gap:12px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:center;">' +
        '<span class="badge ' + (savedMode.kind === "lost" ? "badge-offline" : "badge-live") + '">' +
          (savedMode.kind === "lost" ? "🚨 Lost Mode Active" : "✈️ Travel Mode Active") +
        '</span>' +
        '<button class="btn-table" type="button" id="clearActiveModeBtn">Clear Mode</button>' +
      '</div>' +
      '<p style="font-size:0.9rem; font-weight:700;">' + (savedMode.kind === "lost" ? "Item: " + (savedMode.item || "Device") : "Travel Contact") + '</p>' +
      '<p style="font-size:0.82rem; color:var(--text-muted);">' + esc(savedMode.note || "No note specified.") + '</p>' +
      '<div style="font-size:0.78rem; font-family:var(--font-mono); color:var(--text-dim);">' +
        (savedMode.people || []).map(function (p) { return p.name + " (" + p.rel + "): " + p.phone; }).join(" · ") +
      '</div>' +
    '</div>';

    var clr = $("clearActiveModeBtn");
    if (clr) {
      clr.addEventListener("click", function () {
        localStorage.removeItem("cm.mode");
        toast("Mode cleared");
        renderModesTab();
      });
    }
  }

  /* ══ 6b. REFERRALS & FREE TEE TAB ═══════════════════════════════════ */
  function getReferralsState() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem("cm.referrals") || "null"); } catch(e){}
    var username = localStorage.getItem("cm.username") || "user";
    if (!raw) {
      raw = {
        counted: 23,
        goal: 50,
        waiting: 6,
        claimed: false,
        link: "codemarca.com/r/" + username,
        people: [
          { name: "Simran K.", joined: "14 Sep", done: true },
          { name: "Arjun M.", joined: "13 Sep", done: true },
          { name: "Neha S.", joined: "11 Sep", done: true },
          { name: "Rohit B.", joined: "10 Sep", done: false },
          { name: "Karan D.", joined: "8 Sep", done: true }
        ],
        tee: null
      };
    }
    return raw;
  }

  function renderReferralsTab() {
    var rData = getReferralsState();
    var username = localStorage.getItem("cm.username") || "user";

    if ($("refStatCounted")) $("refStatCounted").textContent = rData.counted || 0;
    if ($("refStatWaiting")) $("refStatWaiting").textContent = rData.waiting || 0;
    if ($("refStatHandle")) $("refStatHandle").textContent = "@" + username;
    if ($("refStatLink")) $("refStatLink").textContent = rData.link || ("codemarca.com/r/" + username);

    var statusEl = $("refStatTeeStatus");
    var subEl = $("refStatTeeSub");
    if (statusEl && subEl) {
      if (rData.claimed) {
        statusEl.textContent = "Claimed ✓";
        statusEl.style.color = "var(--success)";
        subEl.textContent = (rData.tee ? (rData.tee.design + ", Size " + rData.tee.size) : "Free Black Tee");
      } else if (rData.counted >= (rData.goal || 50)) {
        statusEl.textContent = "Unlocked 🎉";
        statusEl.style.color = "var(--primary)";
        subEl.textContent = "Ready to claim!";
      } else {
        statusEl.textContent = "Locked 🔒";
        statusEl.style.color = "var(--text-muted)";
        var left = Math.max(0, (rData.goal || 50) - (rData.counted || 0));
        subEl.textContent = left + " more to reach 50";
      }
    }

    var dispatchBox = $("claimedTeeDispatchBox");
    if (dispatchBox) {
      if (rData.claimed && rData.tee) {
        dispatchBox.innerHTML = '<div style="display:flex; flex-direction:column; gap:12px;">' +
          '<div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">' +
            '<div>' +
              '<span class="badge badge-live">● ' + esc(rData.tee.status === "delivered" ? "Delivered" : "In Transit / Shipped") + '</span>' +
              '<h3 style="font-size:1.1rem; margin:8px 0 2px;">Codemarca Free Black Tee — ' + esc(rData.tee.design) + '</h3>' +
              '<p style="font-size:0.82rem; color:var(--text-muted);">Size: <b>' + esc(rData.tee.size) + '</b> · Courier: <b>Delhivery</b> · AWB: <b>' + esc(rData.tee.awb || "SR7719209931") + '</b></p>' +
            '</div>' +
            '<div style="display:flex; gap:8px;">' +
              '<button class="btn-table" type="button" id="markTeeDeliveredBtn">' + (rData.tee.status === "delivered" ? "Mark Shipped" : "Mark Delivered") + '</button>' +
              '<button class="btn-table" type="button" id="adminResetTeeClaimBtn">Reset Claim</button>' +
            '</div>' +
          '</div>' +
          '<div style="background:var(--surface); border:1px solid var(--border); padding:10px 14px; border-radius:var(--radius-sm); font-size:0.8rem; color:var(--text-muted);">' +
            '<b>Destination Address:</b> ' + esc(rData.tee.address || "No address provided") +
          '</div>' +
        '</div>';

        var delivBtn = $("markTeeDeliveredBtn");
        if (delivBtn) {
          delivBtn.addEventListener("click", function () {
            rData.tee.status = (rData.tee.status === "delivered" ? "shipped" : "delivered");
            localStorage.setItem("cm.referrals", JSON.stringify(rData));
            toast("Tee tracking updated to " + rData.tee.status);
            renderReferralsTab();
          });
        }

        var rstBtn = $("adminResetTeeClaimBtn");
        if (rstBtn) {
          rstBtn.addEventListener("click", function () {
            rData.claimed = false;
            rData.tee = null;
            localStorage.setItem("cm.referrals", JSON.stringify(rData));
            toast("Claim reset");
            renderReferralsTab();
          });
        }
      } else {
        dispatchBox.innerHTML = '<div style="padding:28px 16px; text-align:center; color:var(--text-muted); font-size:0.85rem;">' +
          '<div style="font-size:1.6rem; margin-bottom:8px;">👕</div>' +
          '<b>No Claimed Tee Yet</b>' +
          '<p style="font-size:0.8rem; color:var(--text-dim); margin-top:4px;">When a user reaches 50 referrals and picks their design and size, their claimed merchandise details and address appear here for courier dispatch.</p>' +
        '</div>';
      }
    }
  }

  /* ══ 7. ACTIONS & USER MODAL (CONTROL CENTER) ══════════════════════════ */
  state.currentModalProfile = null;
  state.currentModalBundle = null;

  function formatTs(ts) {
    if (!ts) return "-";
    try {
      var d = new Date(ts);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return String(ts);
    }
  }

  function switchProfileModalTab(tabName) {
    var btns = document.querySelectorAll("#pCtrlTabs .p-tab-btn");
    btns.forEach(function(b) {
      b.classList.toggle("is-active", b.getAttribute("data-ptab") === tabName);
    });
    var panels = ["branding", "manifest", "links", "modes", "chat", "analytics", "orders", "history"];
    panels.forEach(function(pName) {
      var pEl = $("pPanel-" + pName);
      if (pEl) {
        pEl.classList.toggle("is-active", pName === tabName);
        pEl.style.display = pName === tabName ? "block" : "none";
      }
    });
    if (tabName === "manifest" && state.currentModalBundle) {
      renderManifestTab(state.currentModalBundle);
    }
  }

  function renderProfileModalHeader(p, analytics) {
    if (!p) return;
    var initial = (p.display_name || p.username || "?").charAt(0).toUpperCase();
    var avInit = $("pCtrlAvatarInitial");
    var avImg = $("pCtrlAvatarImg");
    if (avInit) avInit.textContent = initial;

    if (avImg) {
      if (p.avatar_url) {
        avImg.src = p.avatar_url;
        avImg.style.display = "block";
        if (avInit) avInit.style.display = "none";
      } else {
        avImg.style.display = "none";
        if (avInit) avInit.style.display = "flex";
      }
    }

    if ($("pCtrlHeaderName")) {
      $("pCtrlHeaderName").innerHTML = esc(p.display_name || p.username) + " " +
        (p.is_live ? '<span class="badge badge-live" id="pCtrlLiveBadge">● LIVE</span>' : '<span class="badge badge-offline" id="pCtrlLiveBadge">Draft</span>');
    }
    if ($("pCtrlHeaderHandle")) $("pCtrlHeaderHandle").textContent = p.username || "unknown";
    if ($("pCtrlUidDisplay")) $("pCtrlUidDisplay").textContent = "UID: " + (p.id ? p.id.slice(0, 8) + "..." : "-");

    var views = (analytics && analytics.totalViews != null) ? analytics.totalViews : (p.view_count || 0);
    var scans = p.scan_count || 0;
    var ips = (analytics && analytics.uniqueIpsCount != null) ? analytics.uniqueIpsCount : 0;
    var saves = (analytics && analytics.saveContactCount != null) ? analytics.saveContactCount : (p.save_contact_count || 0);
    var clicks = (analytics && analytics.totalLinkClicks != null) ? analytics.totalLinkClicks : (p.total_link_clicks || 0);

    if ($("pCtrlQuickViews")) $("pCtrlQuickViews").textContent = views;
    if ($("pCtrlQuickScans")) $("pCtrlQuickScans").textContent = scans;
    if ($("pCtrlQuickIps")) $("pCtrlQuickIps").textContent = ips;
    if ($("pCtrlQuickSaves")) $("pCtrlQuickSaves").textContent = saves;
    if ($("pCtrlQuickClicks")) $("pCtrlQuickClicks").textContent = clicks;

    var pubLink = $("pCtrlPublicLink");
    if (pubLink) {
      pubLink.href = "../profile.html?u=" + encodeURIComponent(p.username || "");
    }
  }

  function populateBrandingTab(p) {
    if (!p) return;
    $("editUid").value = p.id || "";
    $("editName").value = p.display_name || "";
    $("editHandle").value = p.username || "";
    $("editBio").value = p.bio || "";
    $("editAvatarUrl").value = p.avatar_url || "";

    var accent = p.custom_accent_color || "#6366f1";
    $("editAccentColor").value = accent;
    $("editAccentColorText").value = accent;

    var curTheme = p.theme || "light";
    var radios = document.querySelectorAll('input[name="pTheme"]');
    radios.forEach(function(r) {
      r.checked = (r.value === curTheme);
      var sw = r.closest(".theme-swatch");
      if (sw) sw.classList.toggle("is-active", r.value === curTheme);
    });

    $("editPhone").value = p.phone || p.phone_number || "";
    $("editPhoneVisible").checked = (p.phone_visible !== false);
    $("editWhatsApp").value = p.whatsapp || p.phone || "";
    $("editWhatsAppOptIn").checked = !!p.whatsapp_opt_in;
    $("editEmail").value = p.email || "";
    $("editLive").checked = !!p.is_live;
    $("editOnboardingDone").checked = !!p.onboarding_done;
  }

  function renderLinksTab(links) {
    var box = $("pCtrlLinksContainer");
    if (!box) return;
    if (!links || links.length === 0) {
      box.innerHTML = '<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.85rem; background:var(--surface); border-radius:var(--radius-sm); border:1px dashed var(--border);">' +
        'ਕੋਈ ਲਿੰਕ ਸ਼ਾਮਲ ਨਹੀਂ ਹੈ। ਹੇਠਾਂ ਨਵਾਂ ਲਿੰਕ ਸ਼ਾਮਲ ਕਰੋ।' +
      '</div>';
      return;
    }
    box.innerHTML = links.map(function(l) {
      return '<div class="link-edit-row" style="display:flex; gap:10px; align-items:center; background:var(--surface); border:1px solid var(--border); padding:10px 14px; border-radius:var(--radius-sm);">' +
        '<span style="font-size:1.1rem; opacity:0.8;">🔗</span>' +
        '<div style="flex:1; min-width:0;">' +
          '<b style="font-size:0.85rem; display:block;">' + esc(l.title || "Untitled") + '</b>' +
          '<div style="font-size:0.78rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(l.url || "") + '</div>' +
        '</div>' +
        '<label class="form-check" style="margin:0; font-size:0.75rem;">' +
          '<input type="checkbox" data-link-vis="' + l.id + '" ' + (l.is_visible !== false ? 'checked' : '') + '> Public' +
        '</label>' +
        '<button class="btn-table" type="button" data-del-link="' + l.id + '" style="color:var(--danger); border-color:var(--danger); font-size:0.75rem; padding:4px 8px;">Delete</button>' +
      '</div>';
    }).join("");
  }

  async function handleAddLinkForUser() {
    var p = state.currentModalProfile;
    if (!p) return;
    var title = $("newLinkTitle").value.trim();
    var url = $("newLinkUrl").value.trim();
    if (!title || !url) {
      toast("ਕਿਰਪਾ ਕਰਕੇ ਲਿੰਕ ਟਾਈਟਲ ਅਤੇ URL ਦਰਜ ਕਰੋ", "error");
      return;
    }
    var btn = $("btnAddLink");
    btn.disabled = true;
    btn.textContent = "Adding...";

    try {
      var apiRes = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          addLink: { title: title, url: url, icon: "globe", is_visible: true },
          changedBy: state.user ? (state.user.name || state.user.email) : "Lead Admin"
        })
      }).catch(function(){});

      if (!apiRes || !apiRes.ok) {
        await fetchSupabase("links", {
          method: "POST",
          headers: { "Prefer": "return=representation" },
          body: { profile_id: p.id, title: title, url: url, icon: "globe", is_visible: true }
        });
      }

      $("newLinkTitle").value = "";
      $("newLinkUrl").value = "";
      toast("ਨਵਾਂ ਲਿੰਕ ਸਫਲਤਾਪੂਰਵਕ ਸ਼ਾਮਲ ਕੀਤਾ ਗਿਆ! ✓");
      var updatedLinks = await fetchSupabase("links?profile_id=eq." + encodeURIComponent(p.id) + "&order=order_index.asc").catch(function(){ return []; });
      renderLinksTab(updatedLinks);
      refreshAuditHistory(p.id);
    } catch (err) {
      toast("ਲਿੰਕ ਸ਼ਾਮਲ ਕਰਨ ਵਿੱਚ ਗਲਤੀ: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Add Link";
    }
  }

  async function handleLinksContainerAction(e) {
    var p = state.currentModalProfile;
    if (!p) return;
    var delBtn = e.target.closest("[data-del-link]");
    if (delBtn) {
      var linkId = delBtn.getAttribute("data-del-link");
      if (!confirm("ਕੀ ਤੁਸੀਂ ਇਸ ਲਿੰਕ ਨੂੰ ਹਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?")) return;
      try {
        var res = await fetch("/api/admin/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: p.id,
            deleteLinkId: linkId,
            changedBy: state.user ? (state.user.name || state.user.email) : "Lead Admin"
          })
        }).catch(function(){});

        if (!res || !res.ok) {
          await fetchSupabase("links?id=eq." + encodeURIComponent(linkId), { method: "DELETE" });
        }
        toast("ਲਿੰਕ ਹਟਾਇਆ ਗਿਆ! ✓");
        var updatedLinks = await fetchSupabase("links?profile_id=eq." + encodeURIComponent(p.id) + "&order=order_index.asc").catch(function(){ return []; });
        renderLinksTab(updatedLinks);
        refreshAuditHistory(p.id);
      } catch (err) {
        toast("ਗਲਤੀ: " + err.message, "error");
      }
      return;
    }
    var visCb = e.target.closest("[data-link-vis]");
    if (visCb) {
      var linkId = visCb.getAttribute("data-link-vis");
      var isVis = visCb.checked;
      try {
        await fetchSupabase("links?id=eq." + encodeURIComponent(linkId), {
          method: "PATCH",
          body: { is_visible: isVis, updated_at: new Date().toISOString() }
        });
        toast("ਲਿੰਕ ਵਿਜ਼ੀਬਿਲਟੀ ਅੱਪਡੇਟ ਹੋਈ");
      } catch (err) {
        toast("ਗਲਤੀ: " + err.message, "error");
      }
    }
  }

  function populateModesTab(p) {
    var travelBuddy = p.phone || "";
    var lostTrust = p.phone || "";
    var travelOn = false;
    var lostOn = false;

    try {
      var raw = localStorage.getItem("cm.mode");
      if (raw) {
        var m = JSON.parse(raw);
        if (m.kind === "travel") travelOn = true;
        if (m.kind === "lost") lostOn = true;
        if (m.people && m.people[0]) {
          if (m.kind === "travel") travelBuddy = m.people[0].phone || travelBuddy;
          if (m.kind === "lost") lostTrust = m.people[0].phone || lostTrust;
        }
      }
    } catch (e) {}

    $("pCtrlTravelOn").checked = travelOn;
    $("pCtrlTravelBuddy").value = travelBuddy;
    $("pCtrlLostOn").checked = lostOn;
    $("pCtrlLostTrust").value = lostTrust;
  }

  async function handleSaveModesForUser() {
    var p = state.currentModalProfile;
    if (!p) return;
    var btn = $("btnSaveModes");
    btn.disabled = true;
    btn.textContent = "Saving Modes...";

    var travelOn = $("pCtrlTravelOn").checked;
    var travelBuddy = $("pCtrlTravelBuddy").value.trim();
    var lostOn = $("pCtrlLostOn").checked;
    var lostTrust = $("pCtrlLostTrust").value.trim();

    var modesData = {
      travel: { enabled: travelOn, buddyPhone: travelBuddy },
      lost: { enabled: lostOn, trustedPhone: lostTrust }
    };

    try {
      await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          modes: modesData,
          changedBy: state.user ? (state.user.name || state.user.email) : "Lead Admin"
        })
      }).catch(function(){});

      if (lostOn) {
        localStorage.setItem("cm.mode", JSON.stringify({
          kind: "lost",
          item: "Codemarca Device Tag",
          note: "Urgent: Finder please contact owner or emergency phone.",
          people: [{ name: "Emergency Contact", rel: "Emergency", phone: lostTrust || p.phone || "+91 98765 11111" }]
        }));
      } else if (travelOn) {
        localStorage.setItem("cm.mode", JSON.stringify({
          kind: "travel",
          item: "Travel Buddy Tag",
          note: "Traveling active mode enabled.",
          people: [{ name: "Travel Buddy", rel: "Buddy", phone: travelBuddy || p.phone || "+91 98765 00000" }]
        }));
      } else {
        localStorage.removeItem("cm.mode");
      }

      toast("ਸੁਰੱਖਿਆ ਮੋਡਸ (Travel / Lost) ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਹੋ ਗਏ! ✓");
      renderModesTab();
      refreshAuditHistory(p.id);
    } catch (err) {
      toast("ਮੋਡ ਸੇਵ ਕਰਨ ਵਿੱਚ ਗਲਤੀ: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Save Modes";
    }
  }

  function populateChatTab(p) {
    var enabled = true;
    var quota = 500;
    try {
      var raw = localStorage.getItem("cm.chat_enabled");
      if (raw !== null) enabled = JSON.parse(raw);
      var q = localStorage.getItem("cm.chat_quota");
      if (q) quota = parseInt(q, 10) || 500;
    } catch (e) {}

    $("pCtrlChatEnabled").checked = enabled;
    $("pCtrlChatQuota").value = quota;
  }

  async function handleSaveChatForUser() {
    var p = state.currentModalProfile;
    if (!p) return;
    var btn = $("btnSaveChat");
    btn.disabled = true;
    btn.textContent = "Saving...";

    var enabled = $("pCtrlChatEnabled").checked;
    var quota = parseInt($("pCtrlChatQuota").value, 10) || 500;

    try {
      await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          chatSettings: { enabled: enabled, dailyQuota: quota },
          changedBy: state.user ? (state.user.name || state.user.email) : "Lead Admin"
        })
      }).catch(function(){});

      localStorage.setItem("cm.chat_enabled", JSON.stringify(enabled));
      localStorage.setItem("cm.chat_quota", String(quota));

      toast("ਕੁਇੱਕ ਚੈਟ ਸੈਟਿੰਗਾਂ ਸਫਲਤਾਪੂਰਵਕ ਅੱਪਡੇਟ ਹੋਈਆਂ! ✓");
      renderChatTab();
      refreshAuditHistory(p.id);
    } catch (err) {
      toast("ਚੈਟ ਸੈਟਿੰਗ ਗਲਤੀ: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Save Chat Settings";
    }
  }

  function renderAnalyticsTabInModal(p, analytics) {
    $("pCtrlAnaHandle").textContent = p.username || "user";
    var total = (analytics && analytics.totalViews != null) ? analytics.totalViews : (p.view_count || 0);
    var reg = (analytics && analytics.registeredViews != null) ? analytics.registeredViews : 0;
    var unreg = (analytics && analytics.unregisteredViews != null) ? analytics.unregisteredViews : 0;
    var ips = (analytics && analytics.uniqueIpsCount != null) ? analytics.uniqueIpsCount : 0;
    var saves = (analytics && analytics.saveContactCount != null) ? analytics.saveContactCount : (p.save_contact_count || 0);
    var clicks = (analytics && analytics.totalLinkClicks != null) ? analytics.totalLinkClicks : (p.total_link_clicks || 0);

    $("pCtrlAnaTotal").textContent = total;
    $("pCtrlAnaReg").textContent = reg;
    $("pCtrlAnaUnreg").textContent = unreg;
    $("pCtrlAnaIps").textContent = ips;
    if ($("pCtrlAnaSaves")) $("pCtrlAnaSaves").textContent = saves;
    if ($("pCtrlAnaClicks")) $("pCtrlAnaClicks").textContent = clicks;
    if ($("pCtrlClicksCountBadge")) $("pCtrlClicksCountBadge").textContent = clicks + " Total Clicks";
    if ($("pCtrlSavesCountBadge")) $("pCtrlSavesCountBadge").textContent = saves + " Saves";
    $("pCtrlSetViewsInput").value = total;

    // 1. Render Per-Link Clicks Leaderboard Table ("ਕਿਹੜੇ ਲਿੰਕ ਤੇ ਕਿੰਨੇ ਕਲਿੱਕ ਹੋਏ")
    var linkClicksBody = $("pCtrlLinkClicksTableBody");
    if (linkClicksBody) {
      var leaderboard = (analytics && analytics.linkClicksLeaderboard) || [];
      if (leaderboard.length === 0) {
        linkClicksBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:18px; color:var(--text-dim);">' +
          'ਅਜੇ ਤੱਕ ਕੋਈ ਲਿੰਕ ਕਲਿੱਕ ਰਿਕਾਰਡ ਨਹੀਂ ਹੋਇਆ।' +
        '</td></tr>';
      } else {
        linkClicksBody.innerHTML = leaderboard.map(function(item) {
          var typeLabel = item.type || "custom";
          var badgeColor = typeLabel === "social" ? "badge-theme" : (typeLabel === "call" || typeLabel === "wa" ? "badge-live" : "badge-offline");
          return '<tr>' +
            '<td><b>' + esc(item.title) + '</b></td>' +
            '<td><span class="badge ' + badgeColor + '">' + esc(typeLabel) + '</span></td>' +
            '<td><span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono); max-width:240px; display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + esc(item.url) + '">' + esc(item.url || "-") + '</span></td>' +
            '<td><b style="color:#8b5cf6; font-size:0.95rem;">' + (item.clicks || 0) + '</b></td>' +
            '<td style="font-size:0.75rem; color:var(--text-dim);">' + (item.lastClicked ? formatTs(item.lastClicked) : "-") + '</td>' +
          '</tr>';
        }).join("");
      }
    }

    // 2. Render Phone Number Saves (.vcf) Stream Table ("ਕਿੰਨੇ ਨੰਬਰ ਸੇਵ ਹੋਏ")
    var savesBody = $("pCtrlContactSavesTableBody");
    if (savesBody) {
      var savesList = (analytics && analytics.contactSaves) || [];
      if (savesList.length === 0) {
        savesBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:18px; color:var(--text-dim);">' +
          'ਅਜੇ ਤੱਕ ਕੋਈ ਨੰਬਰ ਸੇਵ (.vcf) ਰਿਕਾਰਡ ਨਹੀਂ ਹੋਇਆ।' +
        '</td></tr>';
      } else {
        savesBody.innerHTML = savesList.map(function(s) {
          var loc = [s.city, s.country].filter(Boolean).join(", ");
          return '<tr>' +
            '<td><span class="badge badge-live">💾 Contact Saved (.vcf)</span></td>' +
            '<td><span style="font-size:0.78rem;">' + esc(s.device_type || "mobile") + '</span></td>' +
            '<td><code style="font-size:0.75rem; font-family:var(--font-mono);">' + esc(s.ip_address || "127.0.0.1") + '</code>' +
              (loc ? ' <span style="font-size:0.75rem; color:var(--text-dim);">' + esc(loc) + '</span>' : '') +
            '</td>' +
            '<td style="font-size:0.75rem; color:var(--text-dim);">' + formatTs(s.created_at) + '</td>' +
          '</tr>';
        }).join("");
      }
    }

    // 3. Render Visitor IP Stream
    var tbody = $("pCtrlVisitorsTableBody");
    if (!tbody) return;
    var visitors = (analytics && analytics.recentVisitors) || [];
    if (visitors.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-dim);">' +
        'ਅਜੇ ਤੱਕ ਕੋਈ ਪ੍ਰੋਫਾਈਲ ਵਿਊ ਰਿਕਾਰਡ ਨਹੀਂ ਹੋਇਆ।' +
      '</td></tr>';
      return;
    }

    tbody.innerHTML = visitors.map(function(v) {
      var isReg = (v.viewer_type === "registered");
      var loc = [v.city, v.country].filter(Boolean).join(", ");
      return '<tr>' +
        '<td><span class="badge ' + (isReg ? 'badge-live' : 'badge-theme') + '">' + (isReg ? '● Registered' : '○ Guest') + '</span></td>' +
        '<td><b>' + esc(v.viewer_display_name || (isReg ? "@" + v.viewer_username : "Guest Visitor")) + '</b></td>' +
        '<td><code style="font-size:0.75rem; font-family:var(--font-mono);">' + esc(v.ip_address || "127.0.0.1") + '</code>' +
          (loc ? ' <span style="font-size:0.75rem; color:var(--text-dim);">' + esc(loc) + '</span>' : '') +
        '</td>' +
        '<td><span style="font-size:0.78rem;">' + esc(v.device_type || "mobile") + '</span></td>' +
        '<td><span style="font-size:0.78rem;">' + esc(v.source || "qr_scan") + '</span></td>' +
        '<td style="font-size:0.75rem; color:var(--text-dim);">' + formatTs(v.created_at) + '</td>' +
      '</tr>';
    }).join("");
  }

  function renderManifestTab(bundle) {
    var container = $("pCtrlManifestContainer");
    if (!container) return;

    var m = (bundle && bundle.userInputsManifest) || null;
    var p = (bundle && bundle.profile) || state.currentModalProfile || {};
    var links = (bundle && bundle.links) || [];

    if (!m) {
      m = {
        identity: {
          displayName: p.display_name || "",
          username: p.username || "",
          bio: p.bio || "",
          avatarUrl: p.avatar_url || "",
          isLive: !!p.is_live,
          isOnboardingDone: !!p.onboarding_completed,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        },
        contact: {
          phone: p.phone || "",
          phoneVisible: p.phone_visible !== false,
          whatsapp: p.whatsapp || "",
          whatsappOptIn: p.whatsapp_opt_in !== false,
          email: p.email || "",
          website: p.website || ""
        },
        appearance: {
          theme: p.theme || "light",
          accentColor: p.accent_color || "#6366f1",
          fontFamily: p.font_family || "Inter",
          layout: p.layout || "standard"
        },
        modes: {
          travelMode: !!p.travel_mode_enabled,
          travelBuddyName: p.travel_buddy_name || "",
          travelBuddyPhone: p.travel_buddy_phone || "",
          lostMode: !!p.lost_mode_enabled,
          lostItemNote: p.lost_item_note || "",
          lostReward: p.lost_item_reward || "",
          trustedContact: p.emergency_contact || p.emergency_phone || ""
        },
        quickChat: {
          enabled: p.chat_enabled !== false,
          dailyQuota: p.chat_quota || 500
        },
        socials: {
          instagram: p.instagram || "",
          twitter: p.twitter || "",
          linkedin: p.linkedin || "",
          youtube: p.youtube || "",
          tiktok: p.tiktok || "",
          facebook: p.facebook || "",
          github: p.github || "",
          telegram: p.telegram || "",
          discord: p.discord || "",
          spotify: p.spotify || ""
        },
        customLinks: links.map(function(l) {
          return {
            id: l.id,
            title: l.title,
            url: l.url,
            clicks: Number(l.click_count || 0),
            isEnabled: l.is_enabled !== false,
            orderIndex: l.order_index
          };
        })
      };
    }

    var identityHtml = '<div style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">' +
        '<b style="font-size:0.9rem; color:var(--text-main);">👤 1. Identity &amp; Profile Header Data</b>' +
        '<span class="badge ' + (m.identity.isLive ? 'badge-live' : 'badge-offline') + '">' + (m.identity.isLive ? '● Live Published' : 'Draft') + '</span>' +
      '</div>' +
      '<div class="p-settings-grid" style="grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">' +
        '<div><label style="font-size:0.75rem; color:var(--text-muted); display:block;">Display Name:</label><b style="font-size:0.9rem;">' + esc(m.identity.displayName || "Not specified") + '</b></div>' +
        '<div><label style="font-size:0.75rem; color:var(--text-muted); display:block;">Username / Handle:</label><code>@' + esc(m.identity.username || "none") + '</code></div>' +
        '<div style="grid-column:1 / -1;"><label style="font-size:0.75rem; color:var(--text-muted); display:block;">Bio / Description:</label><p style="margin:4px 0; font-size:0.85rem; background:var(--surface); padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border);">' + esc(m.identity.bio || "(ਖਾਲੀ — ਯੂਜ਼ਰ ਨੇ ਬਾਇਓ ਨਹੀਂ ਲਿਖਿਆ)") + '</p></div>' +
        '<div><label style="font-size:0.75rem; color:var(--text-muted); display:block;">Avatar Photo URL:</label><span style="font-size:0.75rem; word-break:break-all;">' + (m.identity.avatarUrl ? '<a href="' + esc(m.identity.avatarUrl) + '" target="_blank" style="color:var(--primary);">' + esc(m.identity.avatarUrl) + '</a>' : '<i style="color:var(--text-dim)">No photo uploaded (Default Silhouette)</i>') + '</span></div>' +
        '<div><label style="font-size:0.75rem; color:var(--text-muted); display:block;">Onboarding Finished:</label><span class="badge ' + (m.identity.isOnboardingDone ? 'badge-live' : 'badge-theme') + '">' + (m.identity.isOnboardingDone ? 'Completed' : 'Pending') + '</span></div>' +
      '</div>' +
    '</div>';

    var contactHtml = '<div style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px;">' +
      '<b style="font-size:0.9rem; color:var(--text-main); display:block; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">📞 2. Contact Credentials &amp; Public Visibility Rules</b>' +
      '<div class="p-settings-grid" style="grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">' +
        '<div><label style="font-size:0.75rem; color:var(--text-muted); display:block;">Phone Number:</label>' + (m.contact.phone ? '<b style="font-size:0.88rem;">' + esc(m.contact.phone) + '</b> ' + (m.contact.phoneVisible ? '<span class="badge badge-live">Public</span>' : '<span class="badge badge-offline">Hidden</span>') : '<i style="color:var(--text-dim)">None</i>') + '</div>' +
        '<div><label style="font-size:0.75rem; color:var(--text-muted); display:block;">WhatsApp Number:</label>' + (m.contact.whatsapp ? '<b style="font-size:0.88rem;">' + esc(m.contact.whatsapp) + '</b> ' + (m.contact.whatsappOptIn ? '<span class="badge badge-live">Connect Enabled</span>' : '<span class="badge badge-offline">Disabled</span>') : '<i style="color:var(--text-dim)">None</i>') + '</div>' +
        '<div><label style="font-size:0.75rem; color:var(--text-muted); display:block;">Email Address:</label>' + (m.contact.email ? '<b style="font-size:0.88rem;">' + esc(m.contact.email) + '</b>' : '<i style="color:var(--text-dim)">None</i>') + '</div>' +
        '<div><label style="font-size:0.75rem; color:var(--text-muted); display:block;">Website URL:</label>' + (m.contact.website ? '<a href="' + esc(m.contact.website) + '" target="_blank" style="color:var(--primary); font-size:0.85rem;">' + esc(m.contact.website) + '</a>' : '<i style="color:var(--text-dim)">None</i>') + '</div>' +
      '</div>' +
    '</div>';

    var appearanceHtml = '<div style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px;">' +
      '<b style="font-size:0.9rem; color:var(--text-main); display:block; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">🎨 3. Design &amp; Theme Customization</b>' +
      '<div class="p-settings-grid" style="grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">' +
        '<div><label style="font-size:0.75rem; color:var(--text-muted); display:block;">Selected Theme:</label><span class="badge badge-theme" style="font-size:0.85rem; text-transform:capitalize;">' + esc(m.appearance.theme) + '</span></div>' +
        '<div><label style="font-size:0.75rem; color:var(--text-muted); display:block;">Custom Accent Color:</label><div style="display:flex; align-items:center; gap:6px; margin-top:2px;"><span style="width:18px; height:18px; border-radius:4px; border:1px solid var(--border); background:' + esc(m.appearance.accentColor) + '"></span><code>' + esc(m.appearance.accentColor) + '</code></div></div>' +
        '<div><label style="font-size:0.75rem; color:var(--text-muted); display:block;">Font Family:</label><span>' + esc(m.appearance.fontFamily) + '</span></div>' +
      '</div>' +
    '</div>';

    var modesHtml = '<div style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px;">' +
      '<b style="font-size:0.9rem; color:var(--text-main); display:block; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">🛡️ 4. Safety &amp; Emergency Configuration</b>' +
      '<div class="p-settings-grid" style="grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">' +
        '<div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px;">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><b style="font-size:0.85rem;">🛡️ Lost Mode</b><span class="badge ' + (m.modes.lostMode ? 'badge-live' : 'badge-offline') + '">' + (m.modes.lostMode ? 'ACTIVE' : 'OFF') + '</span></div>' +
          '<div style="font-size:0.78rem; color:var(--text-muted);">Finder Note: <i>' + esc(m.modes.lostItemNote || "No note set") + '</i></div>' +
          '<div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">Trusted Emergency Contact: <b>' + esc(m.modes.trustedContact || "None") + '</b></div>' +
        '</div>' +
        '<div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px;">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><b style="font-size:0.85rem;">✈️ Travel Buddy</b><span class="badge ' + (m.modes.travelMode ? 'badge-live' : 'badge-offline') + '">' + (m.modes.travelMode ? 'ACTIVE' : 'OFF') + '</span></div>' +
          '<div style="font-size:0.78rem; color:var(--text-muted);">Buddy Name: <b>' + esc(m.modes.travelBuddyName || "None") + '</b></div>' +
          '<div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">Buddy Phone: <b>' + esc(m.modes.travelBuddyPhone || "None") + '</b></div>' +
        '</div>' +
      '</div>' +
    '</div>';

    var socialsList = Object.entries(m.socials).map(function(pair) {
      var net = pair[0], val = pair[1];
      if (!val) return null;
      return '<div style="display:flex; align-items:center; gap:8px; padding:6px 10px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); font-size:0.8rem;">' +
        '<b style="text-transform:capitalize; width:80px;">' + esc(net) + ':</b>' +
        '<code style="color:var(--primary); word-break:break-all;">' + esc(val) + '</code>' +
      '</div>';
    }).filter(Boolean);

    var socialsHtml = '<div style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">' +
        '<b style="font-size:0.9rem; color:var(--text-main);">🌐 5. Social Media Handles Entered (' + socialsList.length + ' Configured)</b>' +
      '</div>' +
      (socialsList.length ? '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:8px;">' + socialsList.join("") + '</div>' : '<i style="font-size:0.8rem; color:var(--text-dim)">ਕੋਈ ਸੋਸ਼ਲ ਹੈਂਡਲ ਦਰਜ ਨਹੀਂ ਕੀਤਾ ਗਿਆ।</i>') +
    '</div>';

    var customLinksRows = m.customLinks.map(function(cl, idx) {
      return '<tr>' +
        '<td><b>#' + (idx + 1) + '</b></td>' +
        '<td><b>' + esc(cl.title) + '</b></td>' +
        '<td><span style="font-size:0.75rem; font-family:var(--font-mono); color:var(--primary); max-width:260px; display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + esc(cl.url) + '</span></td>' +
        '<td><b style="color:#8b5cf6;">' + cl.clicks + '</b></td>' +
        '<td><span class="badge ' + (cl.isEnabled ? 'badge-live' : 'badge-offline') + '">' + (cl.isEnabled ? 'Active' : 'Disabled') + '</span></td>' +
      '</tr>';
    }).join("");

    var linksHtml = '<div style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">' +
        '<b style="font-size:0.9rem; color:var(--text-main);">🔗 6. Custom Link Buttons Configured (' + m.customLinks.length + ' Links)</b>' +
      '</div>' +
      (m.customLinks.length ? '<div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Title</th><th>URL</th><th>Clicks</th><th>Status</th></tr></thead><tbody>' + customLinksRows + '</tbody></table></div>' : '<i style="font-size:0.8rem; color:var(--text-dim)">ਕੋਈ ਕਸਟਮ ਲਿੰਕ ਸ਼ਾਮਲ ਨਹੀਂ ਕੀਤਾ ਗਿਆ।</i>') +
    '</div>';

    container.innerHTML = identityHtml + contactHtml + appearanceHtml + modesHtml + socialsHtml + linksHtml;

    var copyBtn = $("btnCopyManifestJson");
    if (copyBtn) {
      copyBtn.onclick = function() {
        navigator.clipboard.writeText(JSON.stringify(m, null, 2)).then(function() {
          toast("ਪ੍ਰੋਫਾਈਲ ਮੈਨੀਫੈਸਟ JSON ਕਲਿੱਪਬੋਰਡ ਤੇ ਕਾਪੀ ਹੋ ਗਿਆ! ✓");
        });
      };
    }
  }

  async function handleOverrideViewsForUser() {
    var p = state.currentModalProfile;
    if (!p) return;
    var inputVal = parseInt($("pCtrlSetViewsInput").value, 10);
    if (isNaN(inputVal) || inputVal < 0) {
      toast("ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਵਿਊ ਗਿਣਤੀ ਦਰਜ ਕਰੋ", "error");
      return;
    }
    var btn = $("btnOverrideViews");
    btn.disabled = true;
    btn.textContent = "Setting...";

    try {
      var res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          viewCount: inputVal,
          changedBy: state.user ? (state.user.name || state.user.email) : "Lead Admin"
        })
      }).catch(function(){});

      if (!res || !res.ok) {
        await fetchSupabase("profiles?id=eq." + encodeURIComponent(p.id), {
          method: "PATCH",
          body: { view_count: inputVal, updated_at: new Date().toISOString() }
        });
      }

      p.view_count = inputVal;
      $("pCtrlQuickViews").textContent = inputVal;
      $("pCtrlAnaTotal").textContent = inputVal;
      renderUsersTable();
      renderOverview();
      toast("ਵਿਊ ਕਾਉਂਟਰ " + inputVal + " ਤੇ ਸੈੱਟ ਹੋ ਗਿਆ! ✓");
      refreshAuditHistory(p.id);
    } catch (err) {
      toast("ਗਲਤੀ: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Set Views";
    }
  }

  function renderOrdersTabInModal(orders, p) {
    var box = $("pCtrlOrdersContainer");
    if (!box) return;

    var rData = getReferralsState();
    var teeUnlocked = (rData.counted >= 50);

    var teeHtml = '<div style="background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; margin-bottom:12px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">' +
        '<div>' +
          '<b style="font-size:0.95rem;">👕 50 Friends Milestone — Codemarca Free Black Tee</b>' +
          '<div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">' +
            'Progress: <b>' + (rData.counted || 0) + ' / 50</b> referrals · Status: ' +
            '<span class="badge ' + (rData.claimed ? 'badge-live' : (teeUnlocked ? 'badge-live' : 'badge-theme')) + '">' +
              (rData.claimed ? 'Claimed ✓' : (teeUnlocked ? 'Unlocked 🎉' : 'Locked 🔒')) +
            '</span>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex; gap:6px;">' +
          '<button class="btn-table" type="button" id="pCtrlUnlockTeeBtn">' + (teeUnlocked ? 'Lock Tee' : 'Unlock Tee (50)') + '</button>' +
          (rData.claimed ? '<button class="btn-table" type="button" id="pCtrlResetTeeClaimBtn">Reset Claim</button>' : '') +
        '</div>' +
      '</div>' +
      (rData.claimed && rData.tee ? (
        '<div style="margin-top:10px; padding:10px; background:var(--surface); border-radius:var(--radius-sm); font-size:0.8rem; border:1px solid var(--border);">' +
          '<b>Design:</b> ' + esc(rData.tee.design) + ' · <b>Size:</b> ' + esc(rData.tee.size) + ' · <b>Status:</b> ' + esc(rData.tee.status) + ' · <b>AWB:</b> ' + esc(rData.tee.awb || 'SR7719209931') + '<br>' +
          '<b>Address:</b> ' + esc(rData.tee.address || 'H.No 214, Chandigarh') +
        '</div>'
      ) : '') +
    '</div>';

    var ordersHtml = '';
    if (!orders || orders.length === 0) {
      ordersHtml = '<div style="padding:20px; text-align:center; color:var(--text-muted); font-size:0.85rem; background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius-md);">' +
        '<p>ਇਸ ਪ੍ਰੋਫਾਈਲ ਦਾ ਕੋਈ ਸਟਿੱਕਰ ਪੈਕ ਆਰਡਰ ਨਹੀਂ ਹੈ।</p>' +
        '<button class="btn-table" type="button" id="pCtrlCreateDemoOrderBtn" style="margin-top:10px;">+ Generate Starter QR Pack Order</button>' +
      '</div>';
    } else {
      ordersHtml = orders.map(function(ord) {
        var statusColor = ord.status === 'delivered' ? 'badge-live' : (ord.status === 'shipped' ? 'badge-live' : 'badge-theme');
        return '<div class="admin-order-item" style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; display:flex; flex-direction:column; gap:10px;">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">' +
            '<div>' +
              '<span class="badge ' + statusColor + '">● ' + esc(ord.status || "processing").toUpperCase() + '</span>' +
              '<b style="font-size:0.9rem; margin-left:8px;">Order #' + esc((ord.id || "").slice(0, 8)) + '</b>' +
              '<span style="font-size:0.75rem; color:var(--text-dim); margin-left:6px;">' + formatTs(ord.created_at) + '</span>' +
            '</div>' +
            '<div style="font-size:0.85rem; font-weight:700; color:var(--success);">' +
              '₹' + (ord.total_amount_inr || ord.total_inr || 499) +
            '</div>' +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; font-size:0.8rem; color:var(--text-muted);">' +
            '<div>Courier: <b>' + esc(ord.courier_name || "Delhivery") + '</b> · AWB: <code>' + esc(ord.tracking_url || "DL771890124") + '</code></div>' +
            '<div style="display:flex; gap:6px;">' +
              '<button class="btn-table" type="button" data-ord-act="shipped" data-ord-id="' + ord.id + '" style="font-size:0.75rem; padding:4px 8px;">Mark Shipped</button>' +
              '<button class="btn-table" type="button" data-ord-act="delivered" data-ord-id="' + ord.id + '" style="font-size:0.75rem; padding:4px 8px;">Mark Delivered</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join("");
    }

    box.innerHTML = teeHtml + ordersHtml;

    var unlockBtn = $("pCtrlUnlockTeeBtn");
    if (unlockBtn) {
      unlockBtn.addEventListener("click", function() {
        rData.counted = (rData.counted >= 50) ? 23 : 50;
        localStorage.setItem("cm.referrals", JSON.stringify(rData));
        toast("ਟੀ ਮਾਈਲਸਟੋਨ ਸਥਿਤੀ ਅੱਪਡੇਟ ਹੋਈ: " + rData.counted + "/50");
        renderOrdersTabInModal(orders, p);
        renderReferralsTab();
      });
    }

    var resetTeeBtn = $("pCtrlResetTeeClaimBtn");
    if (resetTeeBtn) {
      resetTeeBtn.addEventListener("click", function() {
        rData.claimed = false;
        rData.tee = null;
        localStorage.setItem("cm.referrals", JSON.stringify(rData));
        toast("ਟੀ ਕਲੇਮ ਰੀਸੈੱਟ ਹੋ ਗਿਆ!");
        renderOrdersTabInModal(orders, p);
        renderReferralsTab();
      });
    }

    var demoOrdBtn = $("pCtrlCreateDemoOrderBtn");
    if (demoOrdBtn) {
      demoOrdBtn.addEventListener("click", async function() {
        demoOrdBtn.disabled = true;
        demoOrdBtn.textContent = "Creating...";
        try {
          await fetchSupabase("orders", {
            method: "POST",
            headers: { "Prefer": "return=representation" },
            body: {
              profile_id: p.id,
              status: "processing",
              total_amount_inr: 499,
              courier_name: "Delhivery",
              tracking_url: "DL" + Math.floor(100000000 + Math.random() * 900000000)
            }
          });
          toast("ਸੈਂਪਲ ਸਟਿੱਕਰ ਪੈਕ ਆਰਡਰ ਬਣਾਇਆ ਗਿਆ! ✓");
          var updatedOrders = await fetchSupabase("orders?profile_id=eq." + encodeURIComponent(p.id) + "&order=created_at.desc").catch(function(){ return []; });
          renderOrdersTabInModal(updatedOrders, p);
        } catch (e) {
          toast("ਗਲਤੀ: " + e.message, "error");
        }
      });
    }

    box.querySelectorAll("[data-ord-act]").forEach(function(b) {
      b.addEventListener("click", async function() {
        var oId = b.getAttribute("data-ord-id");
        var newSt = b.getAttribute("data-ord-act");
        try {
          await fetch("/api/admin/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: p.id,
              orderUpdate: { orderId: oId, status: newSt },
              changedBy: state.user ? (state.user.name || state.user.email) : "Lead Admin"
            })
          }).catch(function(){});

          await fetchSupabase("orders?id=eq." + encodeURIComponent(oId), {
            method: "PATCH",
            body: { status: newSt, updated_at: new Date().toISOString() }
          });

          toast("ਆਰਡਰ #" + oId.slice(0, 8) + " ਸਟੇਟਸ: " + newSt.toUpperCase() + " ✓");
          var updatedOrders = await fetchSupabase("orders?profile_id=eq." + encodeURIComponent(p.id) + "&order=created_at.desc").catch(function(){ return []; });
          renderOrdersTabInModal(updatedOrders, p);
          refreshAuditHistory(p.id);
        } catch (err) {
          toast("ਗਲਤੀ: " + err.message, "error");
        }
      });
    });
  }

  function renderHistoryTabInModal(usernameHistory, auditHistory) {
    var uBox = $("pCtrlUsernameHistoryList");
    if (uBox) {
      if (!usernameHistory || usernameHistory.length === 0) {
        uBox.innerHTML = '<span style="color:var(--text-dim); font-size:0.8rem;">ਕੋਈ ਪੁਰਾਣਾ ਹੈਂਡਲ ਤਬਦੀਲ ਨਹੀਂ ਹੋਇਆ (Original handle intact).</span>';
      } else {
        uBox.innerHTML = usernameHistory.map(function(u) {
          return '<div style="padding:6px 0; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">' +
            '<span><b>@' + esc(u.old_username) + '</b> ➔ <b style="color:var(--primary);">@' + esc(u.new_username) + '</b></span>' +
            '<span style="font-size:0.75rem; color:var(--text-dim);">' + formatTs(u.changed_at) + '</span>' +
          '</div>';
        }).join("");
      }
    }

    var aBox = $("pCtrlAuditTimeline");
    if (aBox) {
      if (!auditHistory || auditHistory.length === 0) {
        aBox.innerHTML = '<div style="padding:24px; text-align:center; color:var(--text-dim); font-size:0.85rem;">' +
          'ਅਜੇ ਤੱਕ ਕੋਈ ਐਡਮਿਨ ਆਡਿਟ ਲੌਗ ਰਿਕਾਰਡ ਨਹੀਂ ਹੋਇਆ।' +
        '</div>';
        return;
      }

      aBox.innerHTML = auditHistory.map(function(entry) {
        var actTitle = (entry.action || "profile_update").replace(/_/g, " ").toUpperCase();
        var detailsStr = "";
        if (entry.old_value || entry.new_value) {
          detailsStr = '<div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">' +
            'ਫੀਲਡ: <b>' + esc(entry.field_name || "setting") + '</b> (' +
            '<span style="text-decoration:line-through; opacity:0.7;">' + esc(entry.old_value || "none") + '</span> ➔ ' +
            '<b style="color:var(--text);">' + esc(entry.new_value || "-") + '</b>)' +
          '</div>';
        }
        return '<div class="audit-item">' +
          '<div class="audit-dot"></div>' +
          '<div class="audit-body">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">' +
              '<span class="audit-action-badge">' + esc(actTitle) + '</span>' +
              '<span class="audit-time">' + formatTs(entry.created_at) + '</span>' +
            '</div>' +
            detailsStr +
            '<div style="font-size:0.72rem; color:var(--text-dim); margin-top:4px;">' +
              'ਕੀਤਾ ਗਿਆ: <b>' + esc(entry.changed_by || "Lead Admin") + '</b> ਦੁਆਰਾ' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join("");
    }
  }

  async function refreshAuditHistory(profileId) {
    try {
      var res = await fetch("/api/admin/profile?id=" + encodeURIComponent(profileId)).catch(function(){});
      if (res && res.ok) {
        var b = await res.json();
        if (b) renderHistoryTabInModal(b.usernameHistory || [], b.auditHistory || []);
      } else {
        var uHist = await fetchSupabase("username_history?profile_id=eq." + encodeURIComponent(profileId) + "&order=changed_at.desc").catch(function(){ return []; });
        var aHist = await fetchSupabase("profile_history?profile_id=eq." + encodeURIComponent(profileId) + "&order=created_at.desc").catch(function(){ return []; });
        renderHistoryTabInModal(uHist, aHist);
      }
    } catch(e) {}
  }

  async function openEditModal(profileId) {
    var p = state.profiles.find(function (x) { return x.id === profileId; });
    if (!p) return;
    state.currentModalProfile = p;

    var backdrop = $("editModalBackdrop");
    backdrop.classList.add("is-open");
    switchProfileModalTab("branding");

    // Populate immediate values
    renderProfileModalHeader(p);
    populateBrandingTab(p);

    // Deep bundle fetch
    try {
      var bundle = null;
      var res = await fetch("/api/admin/profile?id=" + encodeURIComponent(profileId)).catch(function(){});
      if (res && res.ok) {
        bundle = await res.json();
      }

      if (bundle && bundle.profile) {
        if (!bundle.analytics) {
          bundle.analytics = {
            totalViews: bundle.profile.total_views || bundle.profile.view_count || (bundle.views || []).length,
            registeredViews: bundle.profile.registered_views || 0,
            unregisteredViews: bundle.profile.unregistered_views || 0,
            uniqueIpsCount: bundle.profile.unique_ips || 0,
            saveContactCount: bundle.saveContactCount || bundle.profile.save_contact_count || (bundle.contactSaves || []).length,
            totalLinkClicks: bundle.totalLinkClicks || bundle.profile.total_link_clicks || 0,
            linkClicksLeaderboard: bundle.linkClicksLeaderboard || [],
            contactSaves: bundle.contactSaves || [],
            recentVisitors: bundle.views || []
          };
        }
      }

      if (!bundle || !bundle.profile) {
        var links = await fetchSupabase("links?profile_id=eq." + encodeURIComponent(profileId) + "&order=order_index.asc").catch(function(){ return []; });
        var orders = await fetchSupabase("orders?profile_id=eq." + encodeURIComponent(profileId) + "&order=created_at.desc").catch(function(){ return []; });
        var views = await fetchSupabase("profile_views?profile_id=eq." + encodeURIComponent(profileId) + "&order=created_at.desc&limit=50").catch(function(){ return []; });
        var uHist = await fetchSupabase("username_history?profile_id=eq." + encodeURIComponent(profileId) + "&order=changed_at.desc").catch(function(){ return []; });
        var aHist = await fetchSupabase("profile_history?profile_id=eq." + encodeURIComponent(profileId) + "&order=created_at.desc").catch(function(){ return []; });
        var saveEvents = await fetchSupabase("analytics_events?profile_id=eq." + encodeURIComponent(profileId) + "&event_type=eq.save_contact&order=created_at.desc&limit=50").catch(function(){ return []; });
        var clickEvents = await fetchSupabase("analytics_events?profile_id=eq." + encodeURIComponent(profileId) + "&event_type=eq.link_click&order=created_at.desc&limit=100").catch(function(){ return []; });

        // Aggregate leaderboard
        var clickMap = {};
        var totalClicks = 0;
        links.forEach(function(l) {
          var c = Number(l.click_count || 0);
          totalClicks += c;
          clickMap[l.title || "Link"] = {
            id: l.id,
            title: l.title || "Link",
            url: l.url || "",
            type: "custom",
            clicks: c,
            lastClicked: l.updated_at || l.created_at || ""
          };
        });

        (clickEvents || []).forEach(function(ev) {
          var meta = {};
          try { if (ev.referer && ev.referer.startsWith("{")) meta = JSON.parse(ev.referer); } catch(e){}
          var t = (meta.link_title || "Link").trim();
          if (!clickMap[t]) {
            clickMap[t] = {
              title: t,
              url: meta.link_url || "",
              type: meta.link_key || (meta.is_social ? "social" : "custom"),
              clicks: 0,
              lastClicked: ev.created_at
            };
          }
          if (!meta.link_id) {
            clickMap[t].clicks++;
            totalClicks++;
          }
          if (ev.created_at && (!clickMap[t].lastClicked || ev.created_at > clickMap[t].lastClicked)) {
            clickMap[t].lastClicked = ev.created_at;
          }
        });

        var leaderboard = Object.values(clickMap).sort(function(a, b) { return b.clicks - a.clicks; });
        var saveCount = Math.max(Number(p.save_contact_count || 0), (saveEvents || []).length);

        bundle = {
          profile: p,
          links: links,
          orders: orders,
          saveContactCount: saveCount,
          totalLinkClicks: totalClicks,
          linkClicksLeaderboard: leaderboard,
          contactSaves: (saveEvents || []).map(function(ev) {
            return {
              id: ev.id,
              ip_address: ev.ip_hash || "127.0.0.1",
              device_type: ev.device_type || "mobile",
              city: ev.city || "",
              country: ev.country || "",
              created_at: ev.created_at
            };
          }),
          analytics: {
            totalViews: p.view_count || views.length,
            registeredViews: views.filter(function(v){ return v.viewer_type === 'registered'; }).length,
            unregisteredViews: views.filter(function(v){ return v.viewer_type !== 'registered'; }).length,
            uniqueIpsCount: new Set(views.map(function(v){ return v.ip_address; }).filter(Boolean)).size,
            saveContactCount: saveCount,
            totalLinkClicks: totalClicks,
            linkClicksLeaderboard: leaderboard,
            contactSaves: (saveEvents || []).map(function(ev) {
              return {
                id: ev.id,
                ip_address: ev.ip_hash || "127.0.0.1",
                device_type: ev.device_type || "mobile",
                city: ev.city || "",
                country: ev.country || "",
                created_at: ev.created_at
              };
            }),
            recentVisitors: views
          },
          usernameHistory: uHist,
          auditHistory: aHist
        };
      }

      state.currentModalBundle = bundle;

      renderProfileModalHeader(bundle.profile, bundle.analytics);
      populateBrandingTab(bundle.profile);
      renderManifestTab(bundle);
      renderLinksTab(bundle.links || []);
      populateModesTab(bundle.profile);
      populateChatTab(bundle.profile);
      renderAnalyticsTabInModal(bundle.profile, bundle.analytics);
      renderOrdersTabInModal(bundle.orders || [], bundle.profile);
      renderHistoryTabInModal(bundle.usernameHistory || [], bundle.auditHistory || []);
    } catch (err) {
      console.warn("Deep bundle fetch error:", err);
    }
  }

  function closeEditModal() {
    $("editModalBackdrop").classList.remove("is-open");
    state.currentModalProfile = null;
    state.currentModalBundle = null;
  }

  async function saveProfileEdit(e) {
    e.preventDefault();
    var id = $("editUid").value;
    var currentProfile = state.profiles.find(function(x) { return x.id === id; });
    if (!currentProfile) return;

    var selTheme = "light";
    var checkedRadio = document.querySelector('input[name="pTheme"]:checked');
    if (checkedRadio) selTheme = checkedRadio.value;

    var updates = {
      id: id,
      displayName: $("editName").value.trim(),
      newUsername: $("editHandle").value.trim().toLowerCase(),
      bio: $("editBio").value.trim(),
      avatarUrl: $("editAvatarUrl").value.trim(),
      customAccentColor: $("editAccentColor").value,
      theme: selTheme,
      phoneNumber: $("editPhone").value.trim(),
      phoneVisible: $("editPhoneVisible").checked,
      whatsapp: $("editWhatsApp").value.trim(),
      whatsappOptIn: $("editWhatsAppOptIn").checked,
      email: $("editEmail").value.trim(),
      isLive: $("editLive").checked,
      onboardingDone: $("editOnboardingDone").checked,
      changedBy: state.user ? (state.user.name || state.user.email) : "Lead Admin"
    };

    var btn = $("modalSaveBtn");
    btn.disabled = true;
    btn.textContent = "Saving to Database...";

    try {
      var apiRes = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      }).catch(function(){});

      if (!apiRes || !apiRes.ok) {
        var directUpdates = {
          display_name: updates.displayName,
          username: updates.newUsername,
          bio: updates.bio,
          avatar_url: updates.avatarUrl,
          custom_accent_color: updates.customAccentColor,
          theme: updates.theme,
          phone_number: updates.phoneNumber,
          phone: updates.phoneNumber,
          phone_visible: updates.phoneVisible,
          whatsapp: updates.whatsapp,
          whatsapp_opt_in: updates.whatsappOptIn,
          email: updates.email,
          is_live: updates.isLive,
          onboarding_done: updates.onboardingDone,
          updated_at: new Date().toISOString()
        };
        await fetchSupabase("profiles?id=eq." + encodeURIComponent(id), {
          method: "PATCH",
          headers: { "Prefer": "return=minimal" },
          body: directUpdates
        });
      }

      var target = state.profiles.find(function (x) { return x.id === id; });
      if (target) {
        target.display_name = updates.displayName;
        target.username = updates.newUsername;
        target.bio = updates.bio;
        target.avatar_url = updates.avatarUrl;
        target.custom_accent_color = updates.customAccentColor;
        target.theme = updates.theme;
        target.phone = updates.phoneNumber;
        target.phone_number = updates.phoneNumber;
        target.phone_visible = updates.phoneVisible;
        target.whatsapp = updates.whatsapp;
        target.whatsapp_opt_in = updates.whatsappOptIn;
        target.email = updates.email;
        target.is_live = updates.isLive;
        target.onboarding_done = updates.onboardingDone;
        renderProfileModalHeader(target);
      }

      renderUsersTable();
      renderOverview();
      refreshAuditHistory(id);
      toast("ਯੂਜ਼ਰ ਪ੍ਰੋਫਾਈਲ ਸਫਲਤਾਪੂਰਵਕ ਅੱਪਡੇਟ ਹੋ ਗਈ ਅਤੇ ਹਿਸਟਰੀ ਸੇਵ ਹੋ ਗਈ! ✓");
    } catch (err) {
      toast("ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰਨ ਵਿੱਚ ਗਲਤੀ: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Save Profile Changes";
    }
  }

  function setupProfileModal() {
    var tabsEl = $("pCtrlTabs");
    if (tabsEl) {
      tabsEl.addEventListener("click", function(e) {
        var btn = e.target.closest("[data-ptab]");
        if (!btn) return;
        switchProfileModalTab(btn.getAttribute("data-ptab"));
      });
    }

    var themeSwatches = $("themeSwatches");
    if (themeSwatches) {
      themeSwatches.addEventListener("click", function(e) {
        var swatch = e.target.closest(".theme-swatch");
        if (!swatch) return;
        var radio = swatch.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          document.querySelectorAll(".theme-swatch").forEach(function(s) { s.classList.remove("is-active"); });
          swatch.classList.add("is-active");
        }
      });
    }

    var colInput = $("editAccentColor");
    var colText = $("editAccentColorText");
    if (colInput && colText) {
      colInput.addEventListener("input", function() { colText.value = colInput.value; });
      colText.addEventListener("input", function() {
        if (/^#[0-9A-Fa-f]{6}$/.test(colText.value)) colInput.value = colText.value;
      });
    }

    var addLinkBtn = $("btnAddLink");
    if (addLinkBtn) addLinkBtn.addEventListener("click", handleAddLinkForUser);
    var linksBox = $("pCtrlLinksContainer");
    if (linksBox) linksBox.addEventListener("click", handleLinksContainerAction);

    var saveModesBtn = $("btnSaveModes");
    if (saveModesBtn) saveModesBtn.addEventListener("click", handleSaveModesForUser);
    var saveChatBtn = $("btnSaveChat");
    if (saveChatBtn) saveChatBtn.addEventListener("click", handleSaveChatForUser);

    var overrideViewsBtn = $("btnOverrideViews");
    if (overrideViewsBtn) overrideViewsBtn.addEventListener("click", handleOverrideViewsForUser);
  }

  async function toggleUserLive(id, currentLive) {
    try {
      await fetchSupabase("profiles?id=eq." + encodeURIComponent(id), {
        method: "PATCH",
        headers: { "Prefer": "return=minimal" },
        body: { is_live: !currentLive, updated_at: new Date().toISOString() }
      });
      var p = state.profiles.find(function (x) { return x.id === id; });
      if (p) p.is_live = !currentLive;
      renderUsersTable();
      renderOverview();
      toast("User " + (currentLive ? "unpublished" : "published") + " successfully");
    } catch (err) {
      toast("Error: " + err.message, "error");
    }
  }

  function inspectUserInFlows(username, displayName) {
    try {
      localStorage.setItem("cm.name", displayName);
      localStorage.setItem("cm.username", username);
      localStorage.setItem("cm.handle", username);
      localStorage.setItem("cm.flow", "2-page-live");
    } catch (e) {}
    toast("Configured demo account for @" + username);
    window.open("../dashboard/2-page-live/home.html", "_blank");
  }

  /* ══ 7b. LIVE PROFILE STUDIO CONTROLLER ═════════════════════════════════ */
  var STUDIO_PLATFORMS = [
    { key: "instagram", name: "Instagram", color: "linear-gradient(135deg, #FEDA75, #FA7E1E, #D62976, #962FBF)", icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>' },
    { key: "youtube", name: "YouTube", color: "#FF0000", icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
    { key: "whatsapp", name: "WhatsApp", color: "#25D366", icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M17.472 14.382c-.301-.15-1.782-.88-2.058-.98-.276-.1-.476-.15-.676.15-.2.301-.777.98-.952 1.18-.175.2-.351.226-.652.075-.3-.15-1.267-.467-2.413-1.488-.893-.796-1.496-1.78-1.671-2.08-.176-.3-.019-.463.132-.612.135-.135.301-.35.451-.526.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.63-.926-2.233-.243-.586-.49-.506-.676-.516l-.576-.01c-.2 0-.526.075-.802.375-.275.3-1.052 1.029-1.052 2.509 0 1.48 1.077 2.91 1.227 3.11.15.2 2.119 3.236 5.134 4.538.718.31 1.278.496 1.716.634.721.229 1.377.196 1.895.119.578-.086 1.782-.728 2.033-1.431.25-.704.25-1.308.175-1.432-.075-.125-.276-.2-.577-.35zM12.04 2C6.495 2 2 6.495 2 12.04c0 1.815.485 3.593 1.408 5.16L2 22l4.945-1.378a10.024 10.024 0 0 0 5.095 1.418h.005c5.545 0 10.04-4.495 10.04-10.04C22.085 6.495 17.59 2 12.04 2z"/></svg>' },
    { key: "linkedin", name: "LinkedIn", color: "#0A66C2", icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.63 1.63 0 1 0 0-3.26 1.63 1.63 0 0 0 0 3.26m1.39 9.74v-8.37H5.07v8.37h2.78z"/></svg>' },
    { key: "x", name: "X", color: "#111214", icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
    { key: "threads", name: "Threads", color: "#111214", icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/></svg>' },
    { key: "telegram", name: "Telegram", color: "#26A5E4", icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.67c.458 0 .66-.21.917-.457l2.2-2.14 4.576 3.38c.844.465 1.45.226 1.66-.782l3-14.13c.308-1.234-.472-1.793-1.28-.148z"/></svg>' },
    { key: "spotify", name: "Spotify", color: "#1ED760", icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>' },
    { key: "website", name: "Website", color: "#6E27E6", icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>' }
  ];

  state.studioProfile = null;
  state.studioLinks = [];
  state.studioTheme = "light";
  state.studioDirty = false;

  function setStudioClean() {
    state.studioDirty = false;
    var dot = document.querySelector(".st-save-dot");
    if (dot) dot.classList.remove("is-dirty");
    if ($("stSaveBarText")) $("stSaveBarText").textContent = "Ready · All changes saved in database";
  }

  function markStudioDirty() {
    state.studioDirty = true;
    var dot = document.querySelector(".st-save-dot");
    if (dot) dot.classList.add("is-dirty");
    if ($("stSaveBarText")) $("stSaveBarText").textContent = "Unsaved changes · Click save to push to Supabase";
  }

  function populateStudioUserDropdown() {
    var select = $("studioUserSelect");
    if (!select) return;
    var curVal = select.value;
    select.innerHTML = state.profiles.map(function(p) {
      return '<option value="' + esc(p.id) + '">' + esc(p.display_name || p.username) + ' (@' + esc(p.username) + ')' + (p.is_live ? ' ● Live' : ' ○ Draft') + '</option>';
    }).join("");
    if (curVal && state.profiles.some(function(p){ return p.id === curVal; })) {
      select.value = curVal;
    } else if (state.profiles.length > 0) {
      select.value = state.profiles[0].id;
    }
  }

  function switchToStudioForUser(userId) {
    var tabs = ["overview", "users", "profile", "analytics", "flows", "chat", "modes", "referrals"];
    tabs.forEach(function (t) {
      var b = $("nav-" + t);
      var p = $("panel-" + t);
      if (b) b.classList.toggle("active", t === "profile");
      if (p) p.style.display = t === "profile" ? "flex" : "none";
    });
    state.activeTab = "profile";
    window.scrollTo({ top: 0, behavior: "instant" });
    populateStudioUserDropdown();
    if (userId) {
      $("studioUserSelect").value = userId;
      loadProfileIntoStudio(userId);
    }
  }

  function renderProfileStudioTab() {
    populateStudioUserDropdown();
    var curUid = $("studioUserSelect").value;
    if (!curUid && state.profiles.length > 0) {
      curUid = state.profiles[0].id;
      $("studioUserSelect").value = curUid;
    }
    if (curUid && (!state.studioProfile || state.studioProfile.id !== curUid)) {
      loadProfileIntoStudio(curUid);
    }
  }

  function updatePublicButtons(username) {
    var u = encodeURIComponent(username || "user");
    var pubLink = "../profile.html?u=" + u;
    if ($("stViewPublicBtn")) $("stViewPublicBtn").href = pubLink;
    if ($("previewPopoutBtn")) $("previewPopoutBtn").href = pubLink;
  }

  function renderStudioLinks() {
    var box = $("stAddedLinksBox");
    if (!box) return;
    if (!state.studioLinks || state.studioLinks.length === 0) {
      box.innerHTML = '<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.8rem; background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius-sm);">' +
        'No links added yet. Tap any icon above to add a platform.' +
      '</div>';
      if ($("stLinksCountBadge")) $("stLinksCountBadge").textContent = "0 links";
      return;
    }

    if ($("stLinksCountBadge")) $("stLinksCountBadge").textContent = state.studioLinks.length + " links";

    box.innerHTML = state.studioLinks.map(function(l, idx) {
      var pf = STUDIO_PLATFORMS.find(function(x){ return x.key === (l.icon || l.kind); }) || { name: l.title || "Custom", color: "#6E27E6", icon: "🔗" };
      var isVis = (l.is_visible !== false);
      return '<div class="st-link-item-row" data-idx="' + idx + '">' +
        '<div class="st-link-item-icon" style="background:' + pf.color + '; border-radius:50%; width:28px; height:28px;">' +
          pf.icon +
        '</div>' +
        '<div class="st-link-item-title">' + esc(l.title || pf.name) + '</div>' +
        '<input class="st-link-item-input" type="text" data-link-url="' + idx + '" value="' + esc(l.url || "") + '" placeholder="Enter handle or URL...">' +
        '<button class="st-btn-mini ' + (isVis ? '' : 'is-hidden') + '" type="button" data-link-eye="' + idx + '" title="Toggle visibility">' +
          (isVis ? '👁️' : '🙈') +
        '</button>' +
        '<button class="st-btn-mini" type="button" data-link-up="' + idx + '" title="Move Up" ' + (idx === 0 ? 'disabled style="opacity:0.3;"' : '') + '>▲</button>' +
        '<button class="st-btn-mini" type="button" data-link-down="' + idx + '" title="Move Down" ' + (idx === state.studioLinks.length - 1 ? 'disabled style="opacity:0.3;"' : '') + '>▼</button>' +
        '<button class="st-btn-mini" type="button" data-link-del="' + idx + '" style="color:var(--danger);" title="Remove">✕</button>' +
      '</div>';
    }).join("");
  }

  function syncStudioPreview() {
    var container = $("phoneMockupContent");
    var mockupFrame = $("studioPhoneMockup");
    if (!container || !mockupFrame) return;

    var name = $("stNameInput").value.trim() || "Your Name";
    var handle = $("stHandleInput").value.trim() || "handle";
    var bio = $("stBioInput").value.trim();
    var phone = $("stPhoneInput").value.trim();
    var phoneVis = !$("stPhoneEyeBtn").classList.contains("is-hidden");
    var wa = $("stWaInput").value.trim();
    var waVis = !$("stWaEyeBtn").classList.contains("is-hidden");
    var email = $("stEmailInput").value.trim();
    var emailVis = !$("stEmailEyeBtn").classList.contains("is-hidden");
    var avatar = $("stAvatarUrlInput").value.trim() || (state.studioProfile && state.studioProfile.avatar_url);
    var theme = state.studioTheme || "light";
    var accent = $("stAccentColorPicker").value || "#6366f1";
    var travelOn = $("stTravelModeOn").checked;
    var travelBuddy = $("stTravelBuddyPhone").value.trim();
    var lostOn = $("stLostModeOn").checked;
    var lostTrust = $("stLostTrustPhone").value.trim();
    var chatOn = $("stChatFeatureOn").checked;
    var isLive = $("stPageIsLive").checked;

    mockupFrame.setAttribute("data-mock-theme", theme);
    mockupFrame.style.setProperty("--accent", accent);

    var isDarkTheme = (theme === "dark" || theme === "glass-copper" || theme === "glass-bronze" || theme === "photo" || theme === "violet");
    var textColor = isDarkTheme ? "#FFFFFF" : "#101215";
    var subColor = isDarkTheme ? "rgba(255,255,255,0.7)" : "#6b7280";
    var btnBg = isDarkTheme ? "rgba(255,255,255,0.1)" : "#f4f3f7";
    var cardBorder = isDarkTheme ? "rgba(255,255,255,0.12)" : "rgba(16,18,21,0.08)";

    if (theme === "glass-bronze") {
      mockupFrame.style.background = "linear-gradient(180deg, #7A5440 0%, #38241B 100%)";
    } else if (theme === "glass-copper") {
      mockupFrame.style.background = "linear-gradient(180deg, #5A2C1D 0%, #150E0B 100%)";
    } else if (theme === "leaf") {
      mockupFrame.style.background = "linear-gradient(180deg, #A3BF5A 0%, #264A18 100%)";
    } else if (theme === "soft") {
      mockupFrame.style.background = "#E8E7E5";
    } else if (theme === "violet") {
      mockupFrame.style.background = "linear-gradient(180deg, #6E27E6 0%, #240b52 100%)";
    } else if (theme === "dark") {
      mockupFrame.style.background = "#0c0e14";
    } else {
      mockupFrame.style.background = "#FFFFFF";
    }

    var modeBannerHtml = "";
    if (lostOn) {
      modeBannerHtml = '<div class="mock-safety-banner lost">' +
        '<span style="font-size:1.1rem;">🚨</span>' +
        '<div><b>Lost Mode Active</b><div style="font-size:0.7rem; opacity:0.85;">Finder phone: ' + esc(lostTrust || "+91 98765 11111") + '</div></div>' +
      '</div>';
    } else if (travelOn) {
      modeBannerHtml = '<div class="mock-safety-banner travel">' +
        '<span style="font-size:1.1rem;">✈️</span>' +
        '<div><b>Travel Mode Active</b><div style="font-size:0.7rem; opacity:0.85;">Buddy: ' + esc(travelBuddy || "+91 98765 00000") + '</div></div>' +
      '</div>';
    }

    var contactBtnsHtml = [];
    if (phoneVis && phone) {
      contactBtnsHtml.push('<button class="mock-action-btn" type="button" style="background:' + btnBg + '; color:' + textColor + '; border:1px solid ' + cardBorder + ';">📞 Call</button>');
    }
    if (waVis && wa) {
      contactBtnsHtml.push('<button class="mock-action-btn" type="button" style="background:' + btnBg + '; color:' + textColor + '; border:1px solid ' + cardBorder + ';">💬 WhatsApp</button>');
    }
    if (emailVis && email) {
      contactBtnsHtml.push('<button class="mock-action-btn" type="button" style="background:' + btnBg + '; color:' + textColor + '; border:1px solid ' + cardBorder + ';">✉️ Email</button>');
    }

    var socialDiscsHtml = (state.studioLinks || [])
      .filter(function(l) { return l.is_visible !== false && l.kind !== "custom"; })
      .map(function(l) {
        var pf = STUDIO_PLATFORMS.find(function(x) { return x.key === (l.icon || l.kind); }) || { color: accent, icon: "🔗" };
        return '<div class="mock-soc-disc" style="background:' + pf.color + ';" title="' + esc(l.title) + '">' +
          pf.icon +
        '</div>';
      }).join("");

    var customLinksHtml = (state.studioLinks || [])
      .filter(function(l) { return l.is_visible !== false && l.kind === "custom"; })
      .map(function(l) {
        return '<div class="mock-link-card" style="background:' + btnBg + '; color:' + textColor + '; border:1px solid ' + cardBorder + ';">' +
          '<span>🔗 ' + esc(l.title || "Custom Link") + '</span>' +
          '<span style="font-family:var(--font-mono); font-size:0.75rem; opacity:0.6;">↗</span>' +
        '</div>';
      }).join("");

    var avHtml = avatar
      ? '<img src="' + esc(avatar) + '" alt="' + esc(name) + '">'
      : '<span>' + esc(name.charAt(0).toUpperCase()) + '</span>';

    var offlineNote = !isLive
      ? '<div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:10px; font-size:0.75rem; color:#ef4444; margin-bottom:12px; text-align:center;">' +
          '<b>Draft / Paused</b> — Scans currently show "This page is paused"' +
        '</div>'
      : '';

    container.innerHTML = '<div class="mock-page" style="color:' + textColor + ';">' +
      offlineNote +
      modeBannerHtml +
      '<div class="mock-avatar-disc">' + avHtml + '</div>' +
      '<h2 class="mock-name">' + esc(name) + '</h2>' +
      '<div class="mock-handle" style="color:' + subColor + ';">@' + esc(handle) + '</div>' +
      (bio ? '<p class="mock-bio" style="color:' + subColor + ';">' + esc(bio) + '</p>' : '') +
      '<div class="mock-actions-bar">' +
        (contactBtnsHtml.join("") || '') +
        '<button class="mock-action-btn" type="button" style="background:' + accent + '; color:#fff;">Save Contact</button>' +
      '</div>' +
      (socialDiscsHtml ? '<div class="mock-socials-row">' + socialDiscsHtml + '</div>' : '') +
      (customLinksHtml ? '<div class="mock-links-list">' + customLinksHtml + '</div>' : '') +
      (chatOn ? '<div style="margin-top:16px; width:100%; padding:10px 14px; background:' + btnBg + '; border:1px solid ' + cardBorder + '; border-radius:var(--radius-pill); font-size:0.75rem; display:flex; justify-content:space-between; align-items:center; opacity:0.8;">' +
        '<span>💬 Message @' + esc(handle) + '...</span>' +
        '<span style="font-weight:700; color:' + accent + ';">Send</span>' +
      '</div>' : '') +
      '<div style="margin-top:24px; font-size:0.7rem; font-family:var(--font-mono); opacity:0.5; text-align:center;">' +
        'codemarca.com/' + esc(handle) +
      '</div>' +
    '</div>';
  }

  async function loadProfileIntoStudio(profileId) {
    var p = state.profiles.find(function (x) { return x.id === profileId; });
    if (!p) return;
    state.studioProfile = p;

    $("stLiveBadge").className = p.is_live ? "badge badge-live" : "badge badge-offline";
    $("stLiveBadge").textContent = p.is_live ? "● LIVE" : "○ Draft";
    $("stMeNameDisplay").textContent = p.display_name || p.username;
    $("stMeHandleDisplay").textContent = p.username;
    $("stMeLiveStatus").innerHTML = p.is_live ? "<i></i>Live" : "<i style='background:var(--text-dim); box-shadow:none;'></i>Offline";
    $("stMeAvDisc").textContent = (p.display_name || p.username || "?").charAt(0).toUpperCase();

    $("stNameInput").value = p.display_name || "";
    $("stHandleInput").value = p.username || "";
    $("stHandleSuffix").textContent = p.username || "";
    $("stBioInput").value = p.bio || "";
    $("stBioCounter").textContent = (p.bio || "").length + "/100";
    $("stAvatarUrlInput").value = p.avatar_url || "";
    
    var photoInit = $("stPhotoInitial");
    var photoImg = $("stPhotoImg");
    if (p.avatar_url) {
      photoImg.src = p.avatar_url;
      photoImg.style.display = "block";
      photoInit.style.display = "none";
    } else {
      photoImg.style.display = "none";
      photoInit.style.display = "flex";
      photoInit.textContent = (p.display_name || p.username || "?").charAt(0).toUpperCase();
    }

    $("stPhoneInput").value = p.phone || p.phone_number || "";
    $("stPhoneEyeBtn").classList.toggle("is-hidden", p.phone_visible === false);
    $("stWaInput").value = p.whatsapp || p.phone || "";
    $("stWaEyeBtn").classList.toggle("is-hidden", p.whatsapp_opt_in === false);
    $("stWaSameAsPhone").checked = (p.whatsapp && p.phone && p.whatsapp === p.phone);
    $("stEmailInput").value = p.email || "";
    $("stEmailEyeBtn").classList.toggle("is-hidden", p.email_visible === false);

    state.studioTheme = p.theme || "light";
    document.querySelectorAll(".st-theme-tile").forEach(function(tile) {
      tile.classList.toggle("is-active", tile.getAttribute("data-theme") === state.studioTheme);
    });
    var accent = p.custom_accent_color || "#6366f1";
    $("stAccentColorPicker").value = accent;
    $("stAccentColorText").value = accent;

    $("stTravelModeOn").checked = false;
    $("stTravelBuddyPhone").value = p.phone || "";
    $("stLostModeOn").checked = false;
    $("stLostTrustPhone").value = p.phone || "";

    try {
      var rawM = localStorage.getItem("cm.mode");
      if (rawM) {
        var m = JSON.parse(rawM);
        if (m.kind === "travel") {
          $("stTravelModeOn").checked = true;
          if (m.people && m.people[0]) $("stTravelBuddyPhone").value = m.people[0].phone || p.phone;
        } else if (m.kind === "lost") {
          $("stLostModeOn").checked = true;
          if (m.people && m.people[0]) $("stLostTrustPhone").value = m.people[0].phone || p.phone;
        }
      }
    } catch(e) {}

    var qcEnabled = true;
    var qcQuota = 500;
    try {
      var rawC = localStorage.getItem("cm.chat_enabled");
      if (rawC !== null) qcEnabled = JSON.parse(rawC);
      var qVal = localStorage.getItem("cm.chat_quota");
      if (qVal) qcQuota = parseInt(qVal, 10) || 500;
    } catch(e) {}
    $("stChatFeatureOn").checked = qcEnabled;
    $("stChatDailyQuota").value = qcQuota;

    $("stPageIsLive").checked = !!p.is_live;
    $("stOnboardingCompleted").checked = p.onboarding_done !== false;

    try {
      var links = await fetchSupabase("links?profile_id=eq." + encodeURIComponent(profileId) + "&order=order_index.asc").catch(function(){ return []; });
      state.studioLinks = links || [];
    } catch(e) {
      state.studioLinks = [];
    }

    renderStudioLinks();
    updatePublicButtons(p.username);
    syncStudioPreview();
    setStudioClean();
  }

  async function handleStudioSave() {
    var p = state.studioProfile;
    if (!p) return;

    var saveBtn = $("studioSaveAllBtn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving to Database...";

    var displayName = $("stNameInput").value.trim();
    var newUsername = $("stHandleInput").value.trim().toLowerCase();
    var bio = $("stBioInput").value.trim();
    var avatarUrl = $("stAvatarUrlInput").value.trim();
    var phone = $("stPhoneInput").value.trim();
    var phoneVis = !$("stPhoneEyeBtn").classList.contains("is-hidden");
    var wa = $("stWaInput").value.trim();
    var waVis = !$("stWaEyeBtn").classList.contains("is-hidden");
    var email = $("stEmailInput").value.trim();
    var emailVis = !$("stEmailEyeBtn").classList.contains("is-hidden");
    var theme = state.studioTheme || "light";
    var accent = $("stAccentColorPicker").value || "#6366f1";
    var travelOn = $("stTravelModeOn").checked;
    var travelBuddy = $("stTravelBuddyPhone").value.trim();
    var lostOn = $("stLostModeOn").checked;
    var lostTrust = $("stLostTrustPhone").value.trim();
    var chatOn = $("stChatFeatureOn").checked;
    var chatQuota = parseInt($("stChatDailyQuota").value, 10) || 500;
    var isLive = $("stPageIsLive").checked;
    var onboardingDone = $("stOnboardingCompleted").checked;

    var payload = {
      id: p.id,
      displayName: displayName,
      newUsername: newUsername,
      bio: bio,
      avatarUrl: avatarUrl,
      customAccentColor: accent,
      theme: theme,
      phoneNumber: phone,
      phoneVisible: phoneVis,
      whatsapp: wa,
      whatsappOptIn: waVis,
      email: email,
      isLive: isLive,
      onboardingDone: onboardingDone,
      modes: {
        travel: { enabled: travelOn, buddyPhone: travelBuddy },
        lost: { enabled: lostOn, trustedPhone: lostTrust }
      },
      chatSettings: {
        enabled: chatOn,
        dailyQuota: chatQuota
      },
      links: state.studioLinks,
      changedBy: state.user ? (state.user.name || state.user.email) : "Lead Admin"
    };

    try {
      var res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(function(){});

      if (!res || !res.ok) {
        await fetchSupabase("profiles?id=eq." + encodeURIComponent(p.id), {
          method: "PATCH",
          headers: { "Prefer": "return=minimal" },
          body: {
            display_name: displayName,
            username: newUsername,
            bio: bio,
            avatar_url: avatarUrl,
            custom_accent_color: accent,
            theme: theme,
            phone_number: phone,
            phone: phone,
            phone_visible: phoneVis,
            whatsapp: wa,
            whatsapp_opt_in: waVis,
            email: email,
            is_live: isLive,
            onboarding_done: onboardingDone,
            updated_at: new Date().toISOString()
          }
        });
      }

      if (lostOn) {
        localStorage.setItem("cm.mode", JSON.stringify({
          kind: "lost",
          item: "Codemarca Device Tag",
          note: "Urgent finder contact active.",
          people: [{ name: "Emergency Contact", rel: "Emergency", phone: lostTrust || phone }]
        }));
      } else if (travelOn) {
        localStorage.setItem("cm.mode", JSON.stringify({
          kind: "travel",
          item: "Travel Buddy",
          note: "Active travel buddy mode.",
          people: [{ name: "Travel Buddy", rel: "Buddy", phone: travelBuddy || phone }]
        }));
      } else {
        localStorage.removeItem("cm.mode");
      }

      p.display_name = displayName;
      p.username = newUsername;
      p.bio = bio;
      p.avatar_url = avatarUrl;
      p.custom_accent_color = accent;
      p.theme = theme;
      p.phone = phone;
      p.phone_number = phone;
      p.phone_visible = phoneVis;
      p.whatsapp = wa;
      p.whatsapp_opt_in = waVis;
      p.email = email;
      p.is_live = isLive;
      p.onboarding_done = onboardingDone;

      renderUsersTable();
      renderOverview();
      populateStudioUserDropdown();
      setStudioClean();
      toast("ਯੂਜ਼ਰ ਪ੍ਰੋਫਾਈਲ ਦੀਆਂ ਸਾਰੀਆਂ ਸੈਟਿੰਗਾਂ ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਹੋ ਗਈਆਂ ਅਤੇ ਹਿਸਟਰੀ ਰਿਕਾਰਡ ਹੋ ਗਈ! ✓");
    } catch (err) {
      toast("ਸੇਵ ਕਰਨ ਵਿੱਚ ਗਲਤੀ: " + err.message, "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save to Database & Record History";
    }
  }

  function initProfileStudio() {
    var picksGrid = $("stPicksGrid");
    if (picksGrid) {
      picksGrid.innerHTML = STUDIO_PLATFORMS.map(function(pf) {
        return '<button class="st-pick-btn" type="button" data-pick="' + pf.key + '" title="Add ' + pf.name + '">' +
          '<div style="background:' + pf.color + '; border-radius:50%; width:28px; height:28px; display:grid; place-items:center;">' +
            pf.icon +
          '</div>' +
        '</button>';
      }).join("");

      picksGrid.addEventListener("click", function(e) {
        var b = e.target.closest("[data-pick]");
        if (!b) return;
        var key = b.getAttribute("data-pick");
        var pf = STUDIO_PLATFORMS.find(function(x){ return x.key === key; });
        if (!pf) return;
        state.studioLinks.push({
          title: pf.name,
          url: "",
          icon: pf.key,
          kind: "social",
          is_visible: true
        });
        renderStudioLinks();
        syncStudioPreview();
        markStudioDirty();
        toast(pf.name + " ਸ਼ਾਮਲ ਹੋ ਗਿਆ!");
      });
    }

    var userSel = $("studioUserSelect");
    if (userSel) {
      userSel.addEventListener("change", function(e) {
        loadProfileIntoStudio(e.target.value);
      });
    }

    var inputsToListen = [
      "stNameInput", "stHandleInput", "stBioInput", "stPhoneInput", "stWaInput",
      "stEmailInput", "stAvatarUrlInput", "stTravelBuddyPhone", "stLostTrustPhone",
      "stChatDailyQuota"
    ];
    inputsToListen.forEach(function(id) {
      var el = $(id);
      if (el) {
        el.addEventListener("input", function() {
          if (id === "stHandleInput") {
            $("stHandleSuffix").textContent = el.value.trim().toLowerCase() || "username";
          }
          if (id === "stBioInput") {
            $("stBioCounter").textContent = el.value.length + "/100";
          }
          syncStudioPreview();
          markStudioDirty();
        });
      }
    });

    var checksToListen = ["stWaSameAsPhone", "stTravelModeOn", "stLostModeOn", "stChatFeatureOn", "stPageIsLive", "stOnboardingCompleted"];
    checksToListen.forEach(function(id) {
      var el = $(id);
      if (el) {
        el.addEventListener("change", function() {
          if (id === "stWaSameAsPhone" && el.checked) {
            $("stWaInput").value = $("stPhoneInput").value;
          }
          syncStudioPreview();
          markStudioDirty();
        });
      }
    });

    var eyeBtns = ["stPhoneEyeBtn", "stWaEyeBtn", "stEmailEyeBtn"];
    eyeBtns.forEach(function(btnId) {
      var btn = $(btnId);
      if (btn) {
        btn.addEventListener("click", function() {
          btn.classList.toggle("is-hidden");
          syncStudioPreview();
          markStudioDirty();
        });
      }
    });

    var colPick = $("stAccentColorPicker");
    var colTxt = $("stAccentColorText");
    if (colPick && colTxt) {
      colPick.addEventListener("input", function() {
        colTxt.value = colPick.value;
        syncStudioPreview();
        markStudioDirty();
      });
      colTxt.addEventListener("input", function() {
        if (/^#[0-9A-Fa-f]{6}$/.test(colTxt.value)) {
          colPick.value = colTxt.value;
          syncStudioPreview();
          markStudioDirty();
        }
      });
    }

    document.querySelectorAll("[data-hex]").forEach(function(b) {
      b.addEventListener("click", function() {
        var h = b.getAttribute("data-hex");
        colPick.value = h;
        colTxt.value = h;
        syncStudioPreview();
        markStudioDirty();
      });
    });

    var themesGrid = $("stThemesGrid");
    if (themesGrid) {
      themesGrid.addEventListener("click", function(e) {
        var tile = e.target.closest(".st-theme-tile");
        if (!tile) return;
        document.querySelectorAll(".st-theme-tile").forEach(function(t) { t.classList.remove("is-active"); });
        tile.classList.add("is-active");
        state.studioTheme = tile.getAttribute("data-theme");
        syncStudioPreview();
        markStudioDirty();
      });
    }

    var addCustomBtn = $("stAddCustomLinkBtn");
    if (addCustomBtn) {
      addCustomBtn.addEventListener("click", function() {
        var title = $("stCustomLinkTitle").value.trim();
        var url = $("stCustomLinkUrl").value.trim();
        if (!title || !url) {
          toast("ਕਿਰਪਾ ਕਰਕੇ ਲਿੰਕ ਟਾਈਟਲ ਅਤੇ URL ਦਰਜ ਕਰੋ", "error");
          return;
        }
        state.studioLinks.push({
          title: title,
          url: url,
          icon: "globe",
          kind: "custom",
          is_visible: true
        });
        $("stCustomLinkTitle").value = "";
        $("stCustomLinkUrl").value = "";
        renderStudioLinks();
        syncStudioPreview();
        markStudioDirty();
        toast("ਕਸਟਮ ਲਿੰਕ ਸ਼ਾਮਲ ਹੋ ਗਿਆ! ✓");
      });
    }

    var addedBox = $("stAddedLinksBox");
    if (addedBox) {
      addedBox.addEventListener("input", function(e) {
        var inp = e.target.closest("[data-link-url]");
        if (inp) {
          var idx = parseInt(inp.getAttribute("data-link-url"), 10);
          if (state.studioLinks[idx]) {
            state.studioLinks[idx].url = inp.value.trim();
            syncStudioPreview();
            markStudioDirty();
          }
        }
      });

      addedBox.addEventListener("click", function(e) {
        var eye = e.target.closest("[data-link-eye]");
        if (eye) {
          var idx = parseInt(eye.getAttribute("data-link-eye"), 10);
          if (state.studioLinks[idx]) {
            state.studioLinks[idx].is_visible = (state.studioLinks[idx].is_visible === false) ? true : false;
            renderStudioLinks();
            syncStudioPreview();
            markStudioDirty();
          }
          return;
        }

        var up = e.target.closest("[data-link-up]");
        if (up) {
          var idx = parseInt(up.getAttribute("data-link-up"), 10);
          if (idx > 0) {
            var tmp = state.studioLinks[idx];
            state.studioLinks[idx] = state.studioLinks[idx - 1];
            state.studioLinks[idx - 1] = tmp;
            renderStudioLinks();
            syncStudioPreview();
            markStudioDirty();
          }
          return;
        }

        var down = e.target.closest("[data-link-down]");
        if (down) {
          var idx = parseInt(down.getAttribute("data-link-down"), 10);
          if (idx < state.studioLinks.length - 1) {
            var tmp = state.studioLinks[idx];
            state.studioLinks[idx] = state.studioLinks[idx + 1];
            state.studioLinks[idx + 1] = tmp;
            renderStudioLinks();
            syncStudioPreview();
            markStudioDirty();
          }
          return;
        }

        var del = e.target.closest("[data-link-del]");
        if (del) {
          var idx = parseInt(del.getAttribute("data-link-del"), 10);
          state.studioLinks.splice(idx, 1);
          renderStudioLinks();
          syncStudioPreview();
          markStudioDirty();
          toast("ਲਿੰਕ ਹਟਾਇਆ ਗਿਆ");
          return;
        }
      });
    }

    if ($("studioDiscardBtn")) {
      $("studioDiscardBtn").addEventListener("click", function() {
        if (state.studioProfile) {
          loadProfileIntoStudio(state.studioProfile.id);
          toast("ਸਾਰੀਆਂ ਤਬਦੀਲੀਆਂ ਰੀਸੈੱਟ ਹੋ ਗਈਆਂ");
        }
      });
    }

    if ($("studioSaveAllBtn")) {
      $("studioSaveAllBtn").addEventListener("click", handleStudioSave);
    }

    var photoUploadBtn = $("stPhotoUploadBtn");
    var photoFile = $("stPhotoFileInput");
    if (photoUploadBtn && photoFile) {
      photoUploadBtn.addEventListener("click", function() { photoFile.click(); });
      photoFile.addEventListener("change", function(e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        var r = new FileReader();
        r.onload = function(evt) {
          $("stAvatarUrlInput").value = evt.target.result;
          $("stPhotoImg").src = evt.target.result;
          $("stPhotoImg").style.display = "block";
          $("stPhotoInitial").style.display = "none";
          syncStudioPreview();
          markStudioDirty();
        };
        r.readAsDataURL(f);
      });
    }

    if ($("stPhotoRemoveBtn")) {
      $("stPhotoRemoveBtn").addEventListener("click", function() {
        $("stAvatarUrlInput").value = "";
        $("stPhotoImg").style.display = "none";
        $("stPhotoInitial").style.display = "flex";
        syncStudioPreview();
        markStudioDirty();
      });
    }

    if ($("stTestDemoBtn")) {
      $("stTestDemoBtn").addEventListener("click", function() {
        if (state.studioProfile) {
          inspectUserInFlows(state.studioProfile.username, state.studioProfile.display_name);
        }
      });
    }

    if ($("stCopyLinkBtn")) {
      $("stCopyLinkBtn").addEventListener("click", function() {
        if (state.studioProfile) {
          var url = window.location.origin + "/profile.html?u=" + encodeURIComponent(state.studioProfile.username);
          navigator.clipboard.writeText(url).then(function() {
            toast("ਪਬਲਿਕ ਲਿੰਕ ਕਾਪੀ ਹੋ ਗਿਆ: " + url);
          });
        }
      });
    }
  }

  /* ══ 7.5. BLANK QR & PRINT STUDIO CONTROLLER ══════════════════════════ */

  function generateCodemarcaQRSvgClient(text) {
    if (!text) return "";
    try {
      if (typeof window.qrcode === "function") {
        var qr = window.qrcode(0, "M");
        qr.addData(text);
        qr.make();
        var N = qr.getModuleCount();
        var margin = 2;
        var viewBoxSize = N + margin * 2;
        var fg = "#101215";
        var eye = "#6e27e6";
        var bg = "#ffffff";
        var elements = [];

        // Background
        elements.push('<rect width="' + viewBoxSize + '" height="' + viewBoxSize + '" fill="' + bg + '" rx="3"/>');

        // 3 Finder patterns (top-left, top-right, bottom-left)
        var finders = [
          { x: margin, y: margin },
          { x: margin + N - 7, y: margin },
          { x: margin, y: margin + N - 7 }
        ];

        finders.forEach(function (f) {
          elements.push('<rect x="' + f.x + '" y="' + f.y + '" width="7" height="7" rx="2.2" fill="' + fg + '"/>');
          elements.push('<rect x="' + (f.x + 1) + '" y="' + (f.y + 1) + '" width="5" height="5" rx="1.3" fill="' + bg + '"/>');
          elements.push('<rect x="' + (f.x + 2) + '" y="' + (f.y + 2) + '" width="3" height="3" rx="0.9" fill="' + eye + '"/>');
        });

        function isFinderPattern(r, c) {
          if (r < 8 && c < 8) return true;
          if (r >= N - 8 && c < 8) return true;
          if (r < 8 && c >= N - 8) return true;
          return false;
        }

        for (var r = 0; r < N; r++) {
          for (var c = 0; c < N; c++) {
            if (!isFinderPattern(r, c) && qr.isDark(r, c)) {
              elements.push('<rect x="' + (c + margin) + '" y="' + (r + margin) + '" width="0.92" height="0.92" rx="0.25" fill="' + fg + '"/>');
            }
          }
        }

        return '<svg viewBox="0 0 ' + viewBoxSize + ' ' + viewBoxSize + '" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; display:block;">' + elements.join('') + '</svg>';
      }
    } catch (e) {
      console.warn("QR client render notice:", e);
    }
    return '<div style="display:grid; place-items:center; width:100%; height:100%; font-family:monospace; font-size:10px; background:#fff; color:#000; border-radius:4px; font-weight:800;">QR</div>';
  }

  async function loadBlankQrData() {
    try {
      var res = await fetch("/api/admin/blank-qr").catch(function () {});
      if (res && res.ok) {
        var data = await res.json();
        if (data && data.success && Array.isArray(data.items)) {
          state.blankQrs = data.items;
          return;
        }
      }
    } catch (e) {
      console.warn("API blank-qr load notice:", e);
    }

    try {
      var directRows = await fetchSupabase("blank_qr_codes?select=*&order=created_at.desc");
      if (Array.isArray(directRows) && directRows.length > 0) {
        state.blankQrs = directRows;
        return;
      }
    } catch (e) {}

    try {
      var saved = localStorage.getItem("cm_blank_qrs_local");
      if (saved) {
        state.blankQrs = JSON.parse(saved);
        return;
      }
    } catch (e) {}

    if (!state.blankQrs || state.blankQrs.length === 0) {
      state.blankQrs = [
        {
          id: "bqr-1",
          slug: "cm-retail-882",
          target_url: "https://codemarca.com/scan.html?state=gift&code=cm-retail-882",
          batch_name: "Chandigarh Sector 17 Retail Display #1",
          category: "offline_market",
          status: "unclaimed",
          claimed_by_username: null,
          claimed_at: null,
          printed_at: "2026-10-20T10:00:00.000Z",
          notes: "Counter stand pack 4x4cm matte vinyl",
          created_at: "2026-10-20T09:40:00.000Z"
        },
        {
          id: "bqr-2",
          slug: "cm-retail-883",
          target_url: "https://codemarca.com/scan.html?state=gift&code=cm-retail-883",
          batch_name: "Chandigarh Sector 17 Retail Display #1",
          category: "offline_market",
          status: "unclaimed",
          claimed_by_username: null,
          claimed_at: null,
          printed_at: null,
          notes: "Counter stand pack 4x4cm matte vinyl",
          created_at: "2026-10-20T09:40:00.000Z"
        },
        {
          id: "bqr-3",
          slug: "cm-gift-991",
          target_url: "https://codemarca.com/scan.html?state=gift&code=cm-gift-991",
          batch_name: "Gift Order #GF-4102",
          category: "gift",
          status: "unclaimed",
          claimed_by_username: null,
          claimed_at: null,
          printed_at: "2026-10-22T14:15:00.000Z",
          notes: "Purchased by buyer for friend",
          created_at: "2026-10-22T14:00:00.000Z"
        },
        {
          id: "bqr-4",
          slug: "cm-gift-992",
          target_url: "https://codemarca.com/scan.html?state=gift&code=cm-gift-992",
          batch_name: "Gift Order #GF-4105",
          category: "gift",
          status: "claimed",
          claimed_by_username: "vikram",
          claimed_at: "2026-10-24T18:30:00.000Z",
          printed_at: "2026-10-23T11:00:00.000Z",
          notes: "Claimed & active on codemarca.com/vikram",
          created_at: "2026-10-23T10:00:00.000Z"
        },
        {
          id: "bqr-5",
          slug: "cm-promo-101",
          target_url: "https://codemarca.com/scan.html?state=gift&code=cm-promo-101",
          batch_name: "Tech Meetup Punjab 2026",
          category: "promo",
          status: "unclaimed",
          claimed_by_username: null,
          claimed_at: null,
          printed_at: null,
          notes: "Swag bag handout stickers",
          created_at: "2026-10-25T08:00:00.000Z"
        }
      ];
    }
  }

  function renderBlankQrTab() {
    var items = state.blankQrs || [];
    var total = items.length;
    var offlineCount = items.filter(function (x) { return x.category === "offline_market"; }).length;
    var giftCount = items.filter(function (x) { return x.category === "gift"; }).length;
    var claimedCount = items.filter(function (x) { return x.status === "claimed"; }).length;

    if ($("navCountBlankQr")) $("navCountBlankQr").textContent = total;
    if ($("bqrStatTotal")) $("bqrStatTotal").textContent = total;
    if ($("bqrStatOffline")) $("bqrStatOffline").textContent = offlineCount;
    if ($("bqrStatGift")) $("bqrStatGift").textContent = giftCount;
    if ($("bqrStatClaimed")) $("bqrStatClaimed").textContent = claimedCount;

    renderBlankQrTable();
  }

  function getFilteredBlankQrs() {
    var items = state.blankQrs || [];
    var cat = state.blankQrCategoryFilter || "all";
    var stat = state.blankQrStatusFilter || "all";
    var q = (state.blankQrSearchQuery || "").trim().toLowerCase();

    return items.filter(function (item) {
      if (cat !== "all" && item.category !== cat) return false;
      if (stat === "unprinted" && item.printed_at) return false;
      if (stat === "printed" && !item.printed_at) return false;
      if (stat !== "all" && stat !== "unprinted" && stat !== "printed" && item.status !== stat) return false;

      if (q) {
        var matchSlug = (item.slug || "").toLowerCase().indexOf(q) !== -1;
        var matchBatch = (item.batch_name || "").toLowerCase().indexOf(q) !== -1;
        var matchNotes = (item.notes || "").toLowerCase().indexOf(q) !== -1;
        var matchUser = (item.claimed_by_username || "").toLowerCase().indexOf(q) !== -1;
        if (!matchSlug && !matchBatch && !matchNotes && !matchUser) return false;
      }
      return true;
    });
  }

  function renderBlankQrTable() {
    var tbody = $("blankQrTableBody");
    if (!tbody) return;

    var filtered = getFilteredBlankQrs();

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:36px; color:var(--text-muted);">' +
        'ਕੋਈ Blank QR ਕੋਡ ਨਹੀਂ ਮਿਲਿਆ। ਨਵਾਂ ਕੋਡ ਬਣਾਉਣ ਲਈ "+ Mint Blank QRs" ਬਟਨ ਦਬਾਓ।</td></tr>';
      updateBlankQrFloatingBar();
      return;
    }

    var html = "";
    filtered.forEach(function (item) {
      var isChecked = state.blankQrSelectedIds.has(item.id);
      var targetUrl = item.target_url || ("https://codemarca.com/scan.html?state=gift&code=" + encodeURIComponent(item.slug));

      var catLabel = "🏪 Offline Market";
      var catClass = "bqr-cat-pill--offline";
      if (item.category === "gift") {
        catLabel = "🎁 Gift Sticker";
        catClass = "bqr-cat-pill--gift";
      } else if (item.category === "promo") {
        catLabel = "🎟️ Promo Swag";
        catClass = "bqr-cat-pill--promo";
      }

      var printPill = item.printed_at
        ? '<span class="bqr-status-pill bqr-status-pill--printed" title="Printed on ' + esc(new Date(item.printed_at).toLocaleDateString()) + '">✓ Printed</span>'
        : '<span class="bqr-status-pill bqr-status-pill--unprinted">⏳ Unprinted</span>';

      var claimPill = item.status === "claimed"
        ? '<span class="bqr-status-pill bqr-status-pill--claimed">● Claimed (@' + esc(item.claimed_by_username || "user") + ')</span>'
        : '<span class="bqr-status-pill bqr-status-pill--unclaimed">○ Blank (Unclaimed)</span>';

      var dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-";

      var qrSvg = generateCodemarcaQRSvgClient(targetUrl);

      html += '<tr data-bqr-id="' + esc(item.id) + '" class="' + (isChecked ? 'is-selected' : '') + '">' +
        '<td style="text-align:center;">' +
          '<input type="checkbox" class="bqr-row-cb" data-id="' + esc(item.id) + '" ' + (isChecked ? 'checked' : '') + '>' +
        '</td>' +
        '<td>' +
          '<div class="bqr-qr-thumb" data-bqr-slug="' + esc(item.slug) + '" data-bqr-url="' + esc(targetUrl) + '" title="ਕਲਿੱਕ ਕਰੋ: ਦਾਅਵਾ ਲਿੰਕ ਕਾਪੀ ਕਰੋ">' +
            qrSvg +
          '</div>' +
        '</td>' +
        '<td>' +
          '<div style="display:flex; flex-direction:column; gap:2px;">' +
            '<b style="font-family:var(--font-mono); font-size:0.88rem; color:var(--text-main);">' + esc(item.slug) + '</b>' +
            '<a href="' + esc(targetUrl) + '" target="_blank" rel="noopener" style="font-size:0.75rem; color:var(--primary); text-decoration:none; opacity:0.85;">' +
              '↗ Open Claim Page' +
            '</a>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<span class="bqr-cat-pill ' + catClass + '">' + catLabel + '</span>' +
        '</td>' +
        '<td>' +
          '<div style="display:flex; flex-direction:column; gap:2px; max-width:220px;">' +
            '<span style="font-size:0.84rem; font-weight:600; color:var(--text-main); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + esc(item.batch_name) + '">' +
              esc(item.batch_name || "-") +
            '</span>' +
            (item.notes ? '<span style="font-size:0.74rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + esc(item.notes) + '">' + esc(item.notes) + '</span>' : '') +
          '</div>' +
        '</td>' +
        '<td>' + printPill + '</td>' +
        '<td>' + claimPill + '</td>' +
        '<td style="font-size:0.78rem; color:var(--text-muted);">' + dateStr + '</td>' +
        '<td style="text-align:right;">' +
          '<div style="display:inline-flex; gap:6px;">' +
            '<button class="btn-table" type="button" data-bqr-action="print_single" data-id="' + esc(item.id) + '" title="Print this sticker">🖨️</button>' +
            '<button class="btn-table" type="button" data-bqr-action="toggle_print" data-id="' + esc(item.id) + '" title="Toggle printed status">' + (item.printed_at ? '↩' : '✓') + '</button>' +
            '<button class="btn-table" type="button" data-bqr-action="copy_link" data-url="' + esc(targetUrl) + '" title="Copy claim link">🔗</button>' +
            (item.status !== "claimed" ? '<button class="btn-table" type="button" data-bqr-action="delete" data-id="' + esc(item.id) + '" style="color:var(--danger);" title="Delete blank QR">🗑️</button>' : '') +
          '</div>' +
        '</td>' +
      '</tr>';
    });

    tbody.innerHTML = html;

    var selectAllCb = $("bqrSelectAll");
    if (selectAllCb) {
      var allFilteredSelected = filtered.length > 0 && filtered.every(function (x) { return state.blankQrSelectedIds.has(x.id); });
      selectAllCb.checked = allFilteredSelected;
    }

    updateBlankQrFloatingBar();
  }

  function updateBlankQrFloatingBar() {
    var count = state.blankQrSelectedIds.size;
    var bar = $("blankQrFloatingBar");
    var badge = $("bqrFloatCountBadge");
    var statSelected = $("bqrStatSelected");

    if (badge) badge.textContent = count;
    if (statSelected) statSelected.textContent = count;

    if (bar) {
      bar.style.display = count > 0 ? "flex" : "none";
    }
  }

  function toggleSelectAllBlankQrs(checked) {
    var filtered = getFilteredBlankQrs();
    if (checked) {
      filtered.forEach(function (x) { state.blankQrSelectedIds.add(x.id); });
    } else {
      filtered.forEach(function (x) { state.blankQrSelectedIds.delete(x.id); });
    }
    renderBlankQrTable();
  }

  function openMintBlankQrModal() {
    var b = $("mintBlankQrModalBackdrop");
    if (b) {
      b.style.display = "flex";
      b.classList.add("is-open");
    }
  }

  function closeMintBlankQrModal() {
    var b = $("mintBlankQrModalBackdrop");
    if (b) {
      b.classList.remove("is-open");
      b.style.display = "none";
    }
  }

  function openPrintModalBackdrop() {
    var b = $("blankQrPrintModalBackdrop");
    if (b) {
      b.style.display = "flex";
      b.classList.add("is-open");
    }
  }

  function closePrintModalBackdrop() {
    var b = $("blankQrPrintModalBackdrop");
    if (b) {
      b.classList.remove("is-open");
      b.style.display = "none";
    }
  }

  async function mintBlankQrs(payload) {
    var submitBtn = $("submitMintBtn");
    var btnText = $("mintBtnText");
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = "Minting QR Codes...";

    try {
      var res = await fetch("/api/admin/blank-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(function() {});
      var data = res && res.ok ? await res.json().catch(function () {}) : null;

      if (res && res.ok && data && data.success) {
        toast("ਸਫਲਤਾਪੂਰਵਕ " + (data.count || payload.quantity) + " Blank QR ਮਿੰਟ ਹੋ ਗਏ! 🎉");
        closeMintBlankQrModal();
        if ($("mintBlankQrForm")) $("mintBlankQrForm").reset();
        await loadBlankQrData();
        renderBlankQrTab();
        return;
      }
      throw new Error((data && data.error) || "API unavailable");
    } catch (err) {
      console.warn("Mint fallback local save:", err);
      var newItems = [];
      var qty = parseInt(payload.quantity || "1", 10);
      var prefix = payload.prefix || "cm-";
      var now = new Date().toISOString();
      for (var i = 0; i < qty; i++) {
        var rand = Math.random().toString(36).substring(2, 8);
        var slug = prefix + rand;
        newItems.push({
          id: "bqr-local-" + Date.now() + "-" + i,
          slug: slug,
          target_url: "https://codemarca.com/scan.html?state=gift&code=" + slug + "&cat=" + payload.category,
          batch_name: payload.batchName,
          category: payload.category,
          status: "unclaimed",
          claimed_by_username: null,
          claimed_at: null,
          printed_at: null,
          notes: payload.notes || "",
          created_at: now
        });
      }
      state.blankQrs = newItems.concat(state.blankQrs);
      try {
        localStorage.setItem("cm_blank_qrs_local", JSON.stringify(state.blankQrs));
      } catch (e) {}

      // Direct Supabase insert attempt
      try {
        await fetchSupabase("blank_qr_codes", {
          method: "POST",
          body: JSON.stringify(newItems.map(function(r) {
            return {
              slug: r.slug,
              target_url: r.target_url,
              batch_name: r.batch_name,
              category: r.category,
              status: r.status,
              notes: r.notes,
              created_at: r.created_at
            };
          }))
        }).catch(function() {});
      } catch (e) {}

      toast("ਸਫਲਤਾਪੂਰਵਕ " + qty + " Blank QR ਮਿੰਟ ਹੋ ਗਏ! 🎉");
      closeMintBlankQrModal();
      if ($("mintBlankQrForm")) $("mintBlankQrForm").reset();
      renderBlankQrTab();
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = "Mint QR Codes Now";
    }
  }

  async function bulkUpdateBlankQrPrinted(ids, isPrinted) {
    if (!ids || ids.length === 0) return;
    var action = isPrinted ? "mark_printed" : "mark_unprinted";

    try {
      await fetch("/api/admin/blank-qr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action, ids: ids })
      });
    } catch (e) {}

    var now = isPrinted ? new Date().toISOString() : null;
    var idSet = new Set(ids);
    state.blankQrs.forEach(function (item) {
      if (idSet.has(item.id)) {
        item.printed_at = now;
      }
    });

    try {
      localStorage.setItem("cm_blank_qrs_local", JSON.stringify(state.blankQrs));
    } catch (e) {}

    toast(ids.length + " QR Codes ਨੂੰ " + (isPrinted ? "Printed" : "Unprinted") + " ਮਾਰਕ ਕਰ ਦਿੱਤਾ ਗਿਆ");
    renderBlankQrTab();
  }

  async function bulkDeleteBlankQrs(ids) {
    if (!ids || ids.length === 0) return;
    if (!confirm("ਕੀ ਤੁਸੀਂ ਸੱਚਮੁੱਚ ਚੁਣੇ ਹੋਏ " + ids.length + " Blank QRs ਨੂੰ ਡਿਲੀਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?")) return;

    try {
      await fetch("/api/admin/blank-qr", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids })
      });
    } catch (e) {}

    var idSet = new Set(ids);
    state.blankQrs = state.blankQrs.filter(function (x) { return !idSet.has(x.id); });
    ids.forEach(function (id) { state.blankQrSelectedIds.delete(id); });

    try {
      localStorage.setItem("cm_blank_qrs_local", JSON.stringify(state.blankQrs));
    } catch (e) {}

    toast(ids.length + " Blank QRs ਡਿਲੀਟ ਕਰ ਦਿੱਤੇ ਗਏ");
    renderBlankQrTab();
  }

  var currentPrintItems = [];

  function openBlankQrPrintModal(itemsToPrint) {
    var items = itemsToPrint;
    if (!items || items.length === 0) {
      if (state.blankQrSelectedIds.size > 0) {
        items = state.blankQrs.filter(function (x) { return state.blankQrSelectedIds.has(x.id); });
      } else {
        items = getFilteredBlankQrs();
      }
    }

    if (!items || items.length === 0) {
      toast("ਕੋਈ QR ਕੋਡ ਚੁਣਿਆ ਨਹੀਂ ਗਿਆ!", "error");
      return;
    }

    currentPrintItems = items;
    renderPrintSheetPreview(items);
    openPrintModalBackdrop();
  }

  function renderPrintSheetPreview(items) {
    var printArea = $("bqrPrintSheetArea");
    if (!printArea) return;

    var list = items || currentPrintItems;
    var layout = state.blankQrPrintLayout || "stickers_20";
    printArea.className = "bqr-print-sheet bqr-print-sheet--" + layout;

    var showLogo = $("bqrPrintOptLogo") ? $("bqrPrintOptLogo").checked : true;
    var showInst = $("bqrPrintOptInstructions") ? $("bqrPrintOptInstructions").checked : true;
    var showCutLines = $("bqrPrintOptCutLines") ? $("bqrPrintOptCutLines").checked : true;

    var html = "";
    list.forEach(function (item) {
      var targetUrl = item.target_url || ("https://codemarca.com/scan.html?state=gift&code=" + encodeURIComponent(item.slug));
      var qrSvg = generateCodemarcaQRSvgClient(targetUrl);
      var borderStyle = showCutLines ? "border:1px dashed #bbb;" : "border:none;";

      html += '<div class="bqr-sticker-card" style="' + borderStyle + '">' +
        (showLogo
          ? '<div class="bqr-sticker-logo"><span class="bqr-brand-dot"></span> CODEMARCA</div>'
          : '') +
        '<div class="bqr-sticker-qr">' +
          qrSvg +
        '</div>' +
        '<div class="bqr-sticker-slug">' + esc(item.slug) + '</div>' +
        (showInst
          ? '<div class="bqr-sticker-inst">Scan to claim card</div>'
          : '') +
        (item.batch_name
          ? '<div class="bqr-sticker-batch">' + esc(item.batch_name) + '</div>'
          : '') +
      '</div>';
    });

    printArea.innerHTML = html;
  }

  function exportBlankQrCsv() {
    var items = getFilteredBlankQrs();
    if (items.length === 0) {
      toast("ਐਕਸਪੋਰਟ ਕਰਨ ਲਈ ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਹੈ!", "error");
      return;
    }

    var headers = ["ID", "Slug", "Category", "Batch Name", "Status", "Claimed User", "Printed At", "Target URL", "Notes", "Created At"];
    var rows = items.map(function (x) {
      return [
        '"' + (x.id || "") + '"',
        '"' + (x.slug || "") + '"',
        '"' + (x.category || "") + '"',
        '"' + (x.batch_name || "").replace(/"/g, '""') + '"',
        '"' + (x.status || "") + '"',
        '"' + (x.claimed_by_username || "") + '"',
        '"' + (x.printed_at || "") + '"',
        '"' + (x.target_url || "") + '"',
        '"' + (x.notes || "").replace(/"/g, '""') + '"',
        '"' + (x.created_at || "") + '"'
      ].join(",");
    });

    var csv = [headers.join(",")].concat(rows).join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "codemarca_blank_qrs_" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported " + items.length + " Blank QRs to CSV! 📥");
  }

  /* ══ 8. BOOT & NAVIGATION ═════════════════════════════════════════════ */
  function setupNavigation() {
    var tabs = ["overview", "users", "profile", "analytics", "flows", "chat", "modes", "referrals", "blankqr"];
    tabs.forEach(function (tab) {
      var btn = $("nav-" + tab);
      if (!btn) return;
      btn.addEventListener("click", function () {
        tabs.forEach(function (t) {
          var b = $("nav-" + t);
          var p = $("panel-" + t);
          if (b) b.classList.toggle("active", t === tab);
          if (p) p.style.display = t === tab ? "flex" : "none";
        });
        state.activeTab = tab;
        window.scrollTo({ top: 0, behavior: "instant" });
        if (tab === "profile") renderProfileStudioTab();
        if (tab === "analytics") renderAnalyticsTab();
        if (tab === "referrals") renderReferralsTab();
        if (tab === "modes") renderModesTab();
        if (tab === "chat") renderChatTab();
        if (tab === "blankqr") renderBlankQrTab();
      });
    });

    // Analytics Search and filters
    var aSearch = $("analyticsSearchInput");
    if (aSearch) {
      aSearch.addEventListener("input", function (e) {
        state.analyticsSearchQuery = e.target.value.trim().toLowerCase();
        renderAnalyticsTab();
      });
    }

    var aFilter = $("analyticsTypeFilter");
    if (aFilter) {
      aFilter.addEventListener("change", function (e) {
        state.analyticsTypeFilter = e.target.value;
        renderAnalyticsTab();
      });
    }

    // Search and filters
    $("userSearchInput").addEventListener("input", function (e) {
      state.searchQuery = e.target.value.trim().toLowerCase();
      renderUsersTable();
    });

    $("userStatusFilter").addEventListener("change", function (e) {
      state.statusFilter = e.target.value;
      renderUsersTable();
    });

    $("refreshBtn").addEventListener("click", loadData);

    // Flow switcher
    $("flowsGrid").addEventListener("click", function (e) {
      var b = e.target.closest("[data-flow-set]");
      if (!b) return;
      var fId = b.getAttribute("data-flow-set");
      try {
        localStorage.setItem("cm.flow", fId);
      } catch (err) {}
      renderFlows();
      toast("Active dashboard flow set to: " + fId);
    });

    // Global Quick Chat toggle
    $("globalQcToggle").addEventListener("change", function (e) {
      var val = e.target.checked;
      try {
        localStorage.setItem("cm.chat_enabled", JSON.stringify(val));
      } catch (err) {}
      renderChatTab();
      toast("Quick Chat " + (val ? "enabled globally" : "disabled globally"));
    });

    // Referral Simulator
    var simGroup = $("refSimGroup");
    if (simGroup) {
      simGroup.addEventListener("click", function (e) {
        var b = e.target.closest("[data-ref-sim]");
        if (!b) return;
        var act = b.getAttribute("data-ref-sim");
        var rData = getReferralsState();
        var username = localStorage.getItem("cm.username") || "user";

        if (act === "0") {
          rData.counted = 0;
          rData.waiting = 0;
          rData.claimed = false;
          rData.tee = null;
          rData.people = [];
          localStorage.setItem("cm.referrals", JSON.stringify(rData));
          toast("Referrals reset to 0");
        } else if (act === "23") {
          rData.counted = 23;
          rData.waiting = 6;
          rData.claimed = false;
          rData.tee = null;
          rData.people = [
            { name: "Simran K.", joined: "14 Sep", done: true },
            { name: "Arjun M.", joined: "13 Sep", done: true },
            { name: "Neha S.", joined: "11 Sep", done: true },
            { name: "Rohit B.", joined: "10 Sep", done: false },
            { name: "Karan D.", joined: "8 Sep", done: true }
          ];
          localStorage.setItem("cm.referrals", JSON.stringify(rData));
          toast("Referrals set to 23 (in progress)");
        } else if (act === "49") {
          rData.counted = 49;
          rData.waiting = 3;
          rData.claimed = false;
          rData.tee = null;
          localStorage.setItem("cm.referrals", JSON.stringify(rData));
          toast("Referrals set to 49 — 1 friend away from unlocking Free Tee!");
        } else if (act === "50") {
          rData.counted = 50;
          rData.waiting = 2;
          rData.claimed = false;
          rData.tee = null;
          localStorage.setItem("cm.referrals", JSON.stringify(rData));
          toast("Milestone 50 Reached! Free Black Tee Unlocked 🎉");
        } else if (act === "claim") {
          rData.counted = 50;
          rData.claimed = true;
          rData.tee = {
            design: "Pocket",
            size: "L",
            status: "shipped",
            eta: "Friday",
            address: "H.No 214, Sector 22-A, Chandigarh 160022",
            awb: "SR7719209931"
          };
          localStorage.setItem("cm.referrals", JSON.stringify(rData));
          toast("Sample Pocket Tee (Size L) Claimed!");
        } else if (act === "reset") {
          rData.claimed = false;
          rData.tee = null;
          localStorage.setItem("cm.referrals", JSON.stringify(rData));
          toast("Tee claim reset");
        }
        renderReferralsTab();
      });
    }

    // Modal listeners
    $("modalCloseBtn").addEventListener("click", closeEditModal);
    $("modalCancelBtn").addEventListener("click", closeEditModal);
    $("editUserForm").addEventListener("submit", saveProfileEdit);
    setupProfileModal();
    initProfileStudio();

    // Table action buttons delegation
    $("usersTableBody").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-act]");
      if (!b) return;
      var act = b.getAttribute("data-act");
      var id = b.getAttribute("data-id");
      if (act === "toggleLive") {
        toggleUserLive(id, b.getAttribute("data-live") === "1");
      } else if (act === "openStudio") {
        switchToStudioForUser(id);
      } else if (act === "editUser") {
        openEditModal(id);
      } else if (act === "inspectUser") {
        inspectUserInFlows(b.getAttribute("data-u"), b.getAttribute("data-n"));
      }
    });

    // CSV Export
    $("exportCsvBtn").addEventListener("click", function () {
      if (!state.profiles.length) {
        toast("No users to export", "error");
        return;
      }
      var headers = ["ID", "Username", "Display Name", "Email", "Phone", "Live", "Theme", "Created At"];
      var rows = state.profiles.map(function (p) {
        return [
          p.id,
          p.username,
          '"' + (p.display_name || "").replace(/"/g, '""') + '"',
          p.email || "",
          p.phone || "",
          p.is_live ? "TRUE" : "FALSE",
          p.theme || "light",
          p.created_at || ""
        ].join(",");
      });
      var csv = [headers.join(",")].concat(rows).join("\n");
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "codemarca_profiles_" + new Date().toISOString().slice(0, 10) + ".csv";
      a.click();
      URL.revokeObjectURL(url);
      toast("Exported " + state.profiles.length + " profiles to CSV");
    });

    /* ── Blank QR & Print Studio Listeners ── */
    var bqrSearch = $("bqrSearchInput");
    if (bqrSearch) {
      bqrSearch.addEventListener("input", function (e) {
        state.blankQrSearchQuery = e.target.value.trim().toLowerCase();
        renderBlankQrTable();
      });
    }

    var bqrCatFilter = $("bqrCategoryFilter");
    if (bqrCatFilter) {
      bqrCatFilter.addEventListener("change", function (e) {
        state.blankQrCategoryFilter = e.target.value;
        renderBlankQrTable();
      });
    }

    var bqrStatFilter = $("bqrStatusFilter");
    if (bqrStatFilter) {
      bqrStatFilter.addEventListener("change", function (e) {
        state.blankQrStatusFilter = e.target.value;
        renderBlankQrTable();
      });
    }

    if ($("bqrFilterOfflineOnly")) {
      $("bqrFilterOfflineOnly").addEventListener("click", function () {
        state.blankQrCategoryFilter = "offline_market";
        if ($("bqrCategoryFilter")) $("bqrCategoryFilter").value = "offline_market";
        renderBlankQrTable();
      });
    }

    if ($("bqrFilterGiftOnly")) {
      $("bqrFilterGiftOnly").addEventListener("click", function () {
        state.blankQrCategoryFilter = "gift";
        if ($("bqrCategoryFilter")) $("bqrCategoryFilter").value = "gift";
        renderBlankQrTable();
      });
    }

    if ($("bqrSelectUnprintedBtn")) {
      $("bqrSelectUnprintedBtn").addEventListener("click", function () {
        var unprinted = (state.blankQrs || []).filter(function (x) { return !x.printed_at; });
        unprinted.forEach(function (x) { state.blankQrSelectedIds.add(x.id); });
        renderBlankQrTable();
        toast(unprinted.length + " unprinted QR codes selected! 🖨️");
      });
    }

    if ($("bqrResetFilterBtn")) {
      $("bqrResetFilterBtn").addEventListener("click", function () {
        state.blankQrCategoryFilter = "all";
        state.blankQrStatusFilter = "all";
        state.blankQrSearchQuery = "";
        if ($("bqrCategoryFilter")) $("bqrCategoryFilter").value = "all";
        if ($("bqrStatusFilter")) $("bqrStatusFilter").value = "all";
        if ($("bqrSearchInput")) $("bqrSearchInput").value = "";
        renderBlankQrTable();
      });
    }

    // Top action buttons
    if ($("openMintBlankQrModalBtn")) {
      $("openMintBlankQrModalBtn").addEventListener("click", function () {
        openMintBlankQrModal();
      });
    }

    if ($("openPrintSheetBtn")) {
      $("openPrintSheetBtn").addEventListener("click", function () {
        openBlankQrPrintModal();
      });
    }

    if ($("exportBlankQrCsvBtn")) {
      $("exportBlankQrCsvBtn").addEventListener("click", exportBlankQrCsv);
    }

    if ($("refreshBlankQrBtn")) {
      $("refreshBlankQrBtn").addEventListener("click", async function () {
        $("refreshBlankQrBtn").classList.add("is-spinning");
        await loadBlankQrData();
        renderBlankQrTab();
        $("refreshBlankQrBtn").classList.remove("is-spinning");
        toast("Blank QR inventory refreshed! 🔄");
      });
    }

    // Table delegated events
    var bqrTable = $("blankQrTable");
    if (bqrTable) {
      bqrTable.addEventListener("change", function (e) {
        if (e.target.id === "bqrSelectAll") {
          toggleSelectAllBlankQrs(e.target.checked);
        } else if (e.target.classList.contains("bqr-row-cb")) {
          var id = e.target.getAttribute("data-id");
          if (e.target.checked) {
            state.blankQrSelectedIds.add(id);
          } else {
            state.blankQrSelectedIds.delete(id);
          }
          var row = e.target.closest("tr");
          if (row) row.classList.toggle("is-selected", e.target.checked);
          updateBlankQrFloatingBar();
        }
      });

      bqrTable.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-bqr-action]");
        if (btn) {
          var act = btn.getAttribute("data-bqr-action");
          var id = btn.getAttribute("data-id");
          var item = (state.blankQrs || []).find(function (x) { return x.id === id; });

          if (act === "print_single" && item) {
            openBlankQrPrintModal([item]);
          } else if (act === "toggle_print" && item) {
            bulkUpdateBlankQrPrinted([id], !item.printed_at);
          } else if (act === "copy_link") {
            var url = btn.getAttribute("data-url");
            if (url) {
              navigator.clipboard.writeText(url).then(function () {
                toast("Claim link copied: " + url);
              });
            }
          } else if (act === "delete") {
            bulkDeleteBlankQrs([id]);
          }
          return;
        }

        var thumb = e.target.closest(".bqr-qr-thumb");
        if (thumb) {
          var claimUrl = thumb.getAttribute("data-bqr-url");
          if (claimUrl) {
            navigator.clipboard.writeText(claimUrl).then(function () {
              toast("QR ਦਾਅਵਾ ਲਿੰਕ ਕਾਪੀ ਹੋ ਗਿਆ: " + claimUrl);
            });
          }
        }
      });
    }

    // Floating action bar
    if ($("bqrFloatPrintBtn")) {
      $("bqrFloatPrintBtn").addEventListener("click", function () {
        openBlankQrPrintModal();
      });
    }

    if ($("bqrFloatMarkPrintedBtn")) {
      $("bqrFloatMarkPrintedBtn").addEventListener("click", function () {
        bulkUpdateBlankQrPrinted(Array.from(state.blankQrSelectedIds), true);
      });
    }

    if ($("bqrFloatMarkUnprintedBtn")) {
      $("bqrFloatMarkUnprintedBtn").addEventListener("click", function () {
        bulkUpdateBlankQrPrinted(Array.from(state.blankQrSelectedIds), false);
      });
    }

    if ($("bqrFloatDeleteBtn")) {
      $("bqrFloatDeleteBtn").addEventListener("click", function () {
        bulkDeleteBlankQrs(Array.from(state.blankQrSelectedIds));
      });
    }

    if ($("bqrFloatClearBtn")) {
      $("bqrFloatClearBtn").addEventListener("click", function () {
        state.blankQrSelectedIds.clear();
        renderBlankQrTable();
      });
    }

    // Mint modal events
    if ($("closeMintModalBtn")) {
      $("closeMintModalBtn").addEventListener("click", function () {
        closeMintBlankQrModal();
      });
    }

    if ($("cancelMintBtn")) {
      $("cancelMintBtn").addEventListener("click", function () {
        closeMintBlankQrModal();
      });
    }

    if ($("mintBlankQrModalBackdrop")) {
      $("mintBlankQrModalBackdrop").addEventListener("click", function (e) {
        if (e.target === this) closeMintBlankQrModal();
      });
    }

    var qtyGroup = $("mintQtyPresetGroup");
    if (qtyGroup) {
      qtyGroup.addEventListener("click", function (e) {
        var b = e.target.closest("[data-qty]");
        if (!b) return;
        var q = b.getAttribute("data-qty");
        if ($("mintQuantity")) $("mintQuantity").value = q;
        qtyGroup.querySelectorAll("[data-qty]").forEach(function (btn) {
          btn.classList.toggle("btn-table-primary", btn === b);
        });
      });
    }

    var mintForm = $("mintBlankQrForm");
    if (mintForm) {
      mintForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var cat = $("mintCategory") ? $("mintCategory").value : "offline_market";
        var qty = $("mintQuantity") ? parseInt($("mintQuantity").value, 10) : 10;
        var pfx = $("mintPrefix") ? $("mintPrefix").value.trim() : "cm-";
        var bName = $("mintBatchName") ? $("mintBatchName").value.trim() : "Retail Batch";
        var nts = $("mintNotes") ? $("mintNotes").value.trim() : "";

        mintBlankQrs({
          category: cat,
          quantity: qty,
          prefix: pfx,
          batchName: bName,
          notes: nts
        });
      });
    }

    // Print sheet modal events
    if ($("closePrintModalBtn")) {
      $("closePrintModalBtn").addEventListener("click", function () {
        closePrintModalBackdrop();
      });
    }

    if ($("blankQrPrintModalBackdrop")) {
      $("blankQrPrintModalBackdrop").addEventListener("click", function (e) {
        if (e.target === this) closePrintModalBackdrop();
      });
    }

    if ($("bqrPrintLayoutSelect")) {
      $("bqrPrintLayoutSelect").addEventListener("change", function (e) {
        state.blankQrPrintLayout = e.target.value;
        renderPrintSheetPreview();
      });
    }

    ["bqrPrintOptLogo", "bqrPrintOptInstructions", "bqrPrintOptCutLines"].forEach(function (optId) {
      var el = $(optId);
      if (el) {
        el.addEventListener("change", function () {
          renderPrintSheetPreview();
        });
      }
    });

    if ($("bqrTriggerPrintBtn")) {
      $("bqrTriggerPrintBtn").addEventListener("click", function () {
        window.print();
      });
    }
  }

  function bootAdmin() {
    var sess = getSession();
    if (!sess) {
      $("authGate").style.display = "flex";
      return;
    }
    $("authGate").style.display = "none";
    $("adminNameDisplay").textContent = sess.name || sess.email || "Admin";
    $("adminRoleDisplay").textContent = sess.role || "DB Admin";
    $("adminAvLetter").textContent = (sess.name || sess.email || "A").charAt(0).toUpperCase();
    loadData();
  }

  // DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    initAuthUI();
    setupNavigation();
    bootAdmin();
  });
})();
