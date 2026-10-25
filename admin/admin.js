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
    stats: {
      totalUsers: 0,
      livePages: 0,
      totalScans: 0,
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

      // 2. Load orders
      var orders = await fetchSupabase("orders?select=*&order=created_at.desc").catch(function () { return []; });
      state.orders = orders || [];

      // 3. Compute stats
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
        activeModes: activeModesCount,
        quickChats: state.profiles.filter(function (p) { return p.is_live; }).length,
        totalOrders: state.orders.length
      };

      renderOverview();
      renderUsersTable();
      renderFlows();
      renderChatTab();
      renderModesTab();
      renderReferralsTab();
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
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-dim);">' +
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
        '<td style="font-size:0.78rem; font-family:var(--font-mono);">' + dateStr + '</td>' +
        '<td>' +
          '<div class="action-btns">' +
            '<a class="btn-table btn-table-primary" href="../profile.html?handle=' + encodeURIComponent(p.username) + '&theme=' + encodeURIComponent((p.theme || "light").toLowerCase()) + '" target="_blank" rel="noopener">Preview</a>' +
            '<button class="btn-table" type="button" data-act="toggleLive" data-id="' + esc(p.id) + '" data-live="' + (p.is_live ? "1" : "0") + '">' + (p.is_live ? "Unpublish" : "Make Live") + '</button>' +
            '<button class="btn-table" type="button" data-act="editUser" data-id="' + esc(p.id) + '">Edit</button>' +
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

  /* ══ 7. ACTIONS & USER MODAL ══════════════════════════════════════════ */
  function openEditModal(profileId) {
    var p = state.profiles.find(function (x) { return x.id === profileId; });
    if (!p) return;

    var backdrop = $("editModalBackdrop");
    $("editUid").value = p.id;
    $("editName").value = p.display_name || "";
    $("editHandle").value = p.username || "";
    $("editBio").value = p.bio || "";
    $("editPhone").value = p.phone || "";
    $("editTheme").value = p.theme || "light";
    $("editLive").checked = !!p.is_live;

    backdrop.classList.add("is-open");
  }

  function closeEditModal() {
    $("editModalBackdrop").classList.remove("is-open");
  }

  async function saveProfileEdit(e) {
    e.preventDefault();
    var id = $("editUid").value;
    var updates = {
      display_name: $("editName").value.trim(),
      bio: $("editBio").value.trim(),
      phone: $("editPhone").value.trim(),
      theme: $("editTheme").value,
      is_live: $("editLive").checked,
      updated_at: new Date().toISOString()
    };

    var btn = $("modalSaveBtn");
    btn.disabled = true;
    btn.textContent = "Saving to Supabase...";

    try {
      await fetchSupabase("profiles?id=eq." + encodeURIComponent(id), {
        method: "PATCH",
        headers: { "Prefer": "return=minimal" },
        body: updates
      });

      // Update local state
      var target = state.profiles.find(function (x) { return x.id === id; });
      if (target) {
        Object.assign(target, updates);
      }
      renderUsersTable();
      renderOverview();
      closeEditModal();
      toast("Profile updated in database!");
    } catch (err) {
      toast("Error saving profile: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Save Changes";
    }
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

  /* ══ 8. BOOT & NAVIGATION ═════════════════════════════════════════════ */
  function setupNavigation() {
    var tabs = ["overview", "users", "flows", "chat", "modes", "referrals"];
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
        if (tab === "referrals") renderReferralsTab();
        if (tab === "modes") renderModesTab();
        if (tab === "chat") renderChatTab();
      });
    });

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

    // Table action buttons delegation
    $("usersTableBody").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-act]");
      if (!b) return;
      var act = b.getAttribute("data-act");
      var id = b.getAttribute("data-id");
      if (act === "toggleLive") {
        toggleUserLive(id, b.getAttribute("data-live") === "1");
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
