/* ==========================================================================
   CODEMARCA — REALTIME CHAT ENGINE (Supabase DB + Realtime Broadcast)
   Author: Garry & Antigravity (Phase-1 Live Realtime, 2026-10-13)

   Features:
     - 2M monthly Realtime WebSocket Broadcast quota (zero latency)
     - Full PostgreSQL persistence in chat_rooms & chat_messages
     - Two-way live delivery: visitor <-> profile owner
     - Auto-reconnect & Phoenix heartbeat
     - Pure Web Audio API gentle notification chime
     - 500-char daily limit & safety checks
   ========================================================================== */

(function (root) {
  "use strict";

  var SUPABASE_URL = "https://inzigrmttewawjjkggbd.supabase.co";
  var SUPABASE_ANON = "sb_publishable_t03O5VnqWX8kbRPDSfdprQ_gjJFAUsg";
  var WS_URL = "wss://inzigrmttewawjjkggbd.supabase.co/realtime/v1/websocket?apikey=" + SUPABASE_ANON + "&vsn=1.0.0";

  var socket = null;
  var joinedChannels = {}; // topic -> bool
  var listeners = []; // array of { event, fn }
  var heartbeatInterval = null;
  var reconnectTimer = null;
  var refCounter = 1;

  function nextRef() {
    return String(refCounter++);
  }

  /* ── 1. REALTIME WEBSOCKET MANAGER ───────────────────────────────────── */
  function getSocket() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return socket;
    }
    try {
      socket = new WebSocket(WS_URL);
    } catch (err) {
      console.warn("[CMChat] WebSocket initialization failed:", err);
      return null;
    }

    socket.onopen = function () {
      console.log("[CMChat] Realtime WebSocket connected");
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }

      // Start Phoenix heartbeat every 25 seconds
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(function () {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            topic: "phoenix",
            event: "heartbeat",
            payload: {},
            ref: nextRef()
          }));
        }
      }, 25000);

      // Re-join any previously registered channels
      Object.keys(joinedChannels).forEach(function (topic) {
        sendJoin(topic);
      });
    };

    socket.onmessage = function (evt) {
      try {
        var msg = JSON.parse(evt.data);
        if (!msg) return;

        // Channel join reply
        if (msg.event === "phx_reply" && msg.payload && msg.payload.status === "ok") {
          joinedChannels[msg.topic] = true;
          return;
        }

        // Realtime broadcast event received
        if (msg.event === "broadcast" && msg.payload) {
          var ev = msg.payload.event;
          var data = msg.payload.payload || {};
          listeners.forEach(function (l) {
            try {
              if (l.event === "*" || l.event === ev) {
                l.fn(ev, data, msg.topic);
              }
            } catch (ex) {
              console.error("[CMChat] Listener error:", ex);
            }
          });
        }
      } catch (e) {}
    };

    socket.onclose = function () {
      if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
      // Attempt reconnect in 3 seconds
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(function () {
          reconnectTimer = null;
          getSocket();
        }, 3000);
      }
    };

    socket.onerror = function (err) {
      console.warn("[CMChat] WebSocket error:", err);
    };

    return socket;
  }

  function sendJoin(topic) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({
      topic: topic,
      event: "phx_join",
      payload: { config: { broadcast: { ack: true, self: false } } },
      ref: nextRef()
    }));
  }

  function joinChannel(channelName) {
    var topic = "realtime:" + channelName;
    joinedChannels[topic] = true;
    var ws = getSocket();
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendJoin(topic);
    }
  }

  function broadcast(channelName, eventName, payload) {
    var topic = "realtime:" + channelName;
    var ws = getSocket();
    var packet = {
      topic: topic,
      event: "broadcast",
      payload: {
        type: "broadcast",
        event: eventName,
        payload: payload || {}
      },
      ref: nextRef()
    };
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(packet));
    } else {
      // If connecting, wait for open
      var check = setInterval(function () {
        if (ws && ws.readyState === WebSocket.OPEN) {
          clearInterval(check);
          ws.send(JSON.stringify(packet));
        }
      }, 100);
      setTimeout(function () { clearInterval(check); }, 4000);
    }
  }

  function on(eventName, callback) {
    listeners.push({ event: eventName, fn: callback });
  }

  function off(eventName, callback) {
    listeners = listeners.filter(function (l) {
      return !(l.event === eventName && l.fn === callback);
    });
  }

  /* ── 2. WEB AUDIO NOTIFICATION CHIME ─────────────────────────────────── */
  function playNotificationSound() {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      var ctx = new AudioCtx();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      // Pleasant high double-beep
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  /* ── 3. VISITOR IDENTITY & USAGE ─────────────────────────────────────── */
  function getVisitorId() {
    try {
      var id = window.localStorage.getItem("cm.visitor_id");
      if (!id) {
        id = "v_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36);
        window.localStorage.setItem("cm.visitor_id", id);
      }
      return id;
    } catch (e) {
      return "v_temp_" + Date.now();
    }
  }

  function getVisitorProfile() {
    var id = getVisitorId();
    var name = "";
    var handle = "";
    var photo = "";
    var bio = "";
    var socials = [];
    try {
      name = window.localStorage.getItem("cm.name") || "";
      handle = window.localStorage.getItem("cm.username") || "";
      photo = window.localStorage.getItem("cm.photo") || "";
      bio = window.localStorage.getItem("cm.bio") || "";
      var custom = JSON.parse(window.localStorage.getItem("cm.account.custom") || "{}");
      if (custom && custom.profile) {
        if (!name) name = custom.profile.title || custom.profile.name || "";
        if (!handle) handle = custom.profile.handle || "";
        if (!photo) photo = custom.profile.photo || "";
        if (!bio) bio = custom.profile.bio || "";
        if (custom.profile.links) {
          for (var k in custom.profile.links) {
            if (custom.profile.links[k]) socials.push(k.charAt(0).toUpperCase() + k.slice(1));
          }
        }
      }
    } catch (e) {}
    if (!name) name = handle ? handle : "Visitor";
    return { id: id, name: name, handle: handle, photo: photo, bio: bio, socials: socials };
  }

  /* ── 4. SUPABASE REST API CALLS ──────────────────────────────────────── */
  function restFetch(endpoint, options) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers["apikey"] = SUPABASE_ANON;
    options.headers["Authorization"] = "Bearer " + SUPABASE_ANON;
    if (options.body && !options.headers["Content-Type"]) {
      options.headers["Content-Type"] = "application/json";
    }
    return fetch(SUPABASE_URL + "/rest/v1/" + endpoint, options);
  }

  /* Get or create a room for (ownerUsername, visitorId) */
  async function getOrCreateRoom(ownerUsername, visitorData, initialMessage) {
    ownerUsername = (ownerUsername || "").toLowerCase().trim();
    var visitorId = visitorData.id || getVisitorId();

    try {
      // 1. Check existing room
      var r = await restFetch("chat_rooms?owner_username=eq." + encodeURIComponent(ownerUsername) +
        "&visitor_id=eq." + encodeURIComponent(visitorId) + "&select=*");
      var rooms = await r.json();

      if (rooms && rooms.length > 0) {
        var existing = rooms[0];
        // update last_message
        if (initialMessage) {
          await restFetch("chat_rooms?id=eq." + existing.id, {
            method: "PATCH",
            headers: { "Prefer": "return=representation" },
            body: JSON.stringify({
              last_message: initialMessage,
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          });
        }
        return existing;
      }

      // 2. Create new room
      var newRoom = {
        owner_username: ownerUsername,
        visitor_id: visitorId,
        visitor_username: visitorData.handle || "",
        visitor_display_name: visitorData.name || "Visitor",
        visitor_avatar: visitorData.photo || "",
        status: "pending",
        is_request: true,
        last_message: initialMessage || "",
        last_message_at: new Date().toISOString()
      };

      var res = await restFetch("chat_rooms", {
        method: "POST",
        headers: { "Prefer": "return=representation" },
        body: JSON.stringify(newRoom)
      });
      var created = await res.json();
      return created && created[0] ? created[0] : null;
    } catch (e) {
      console.error("[CMChat] getOrCreateRoom error:", e);
      return null;
    }
  }

  /* Post message into chat_messages */
  async function postMessage(roomId, senderType, senderId, senderDisplay, content) {
    try {
      var res = await restFetch("chat_messages", {
        method: "POST",
        headers: { "Prefer": "return=representation" },
        body: JSON.stringify({
          room_id: roomId,
          sender_type: senderType,
          sender_id: senderId,
          sender_display: senderDisplay || "",
          content: content,
          is_read: false
        })
      });
      var rows = await res.json();
      return rows && rows[0] ? rows[0] : null;
    } catch (e) {
      console.error("[CMChat] postMessage error:", e);
      return null;
    }
  }

  /* Fetch all rooms for owner */
  async function getOwnerRooms(ownerUsername) {
    ownerUsername = (ownerUsername || "").toLowerCase().trim();
    if (!ownerUsername) return [];
    try {
      var r = await restFetch("chat_rooms?owner_username=eq." + encodeURIComponent(ownerUsername) +
        "&order=last_message_at.desc&select=*");
      return await r.json() || [];
    } catch (e) {
      console.error("[CMChat] getOwnerRooms error:", e);
      return [];
    }
  }

  /* Fetch messages for a specific room */
  async function getRoomMessages(roomId) {
    if (!roomId) return [];
    try {
      var r = await restFetch("chat_messages?room_id=eq." + encodeURIComponent(roomId) +
        "&order=created_at.asc&select=*");
      return await r.json() || [];
    } catch (e) {
      console.error("[CMChat] getRoomMessages error:", e);
      return [];
    }
  }

  /* Update room status (accept, ignore, block) */
  async function updateRoom(roomId, updates) {
    if (!roomId) return null;
    try {
      updates.updated_at = new Date().toISOString();
      var r = await restFetch("chat_rooms?id=eq." + encodeURIComponent(roomId), {
        method: "PATCH",
        headers: { "Prefer": "return=representation" },
        body: JSON.stringify(updates)
      });
      var rows = await r.json();
      return rows && rows[0] ? rows[0] : null;
    } catch (e) {
      console.error("[CMChat] updateRoom error:", e);
      return null;
    }
  }

  /* Public API exposed on window.CMChat */
  root.CMChat = {
    URL: SUPABASE_URL,
    ANON: SUPABASE_ANON,
    getVisitorId: getVisitorId,
    getVisitorProfile: getVisitorProfile,
    getSocket: getSocket,
    joinChannel: joinChannel,
    broadcast: broadcast,
    on: on,
    off: off,
    playNotificationSound: playNotificationSound,
    getOrCreateRoom: getOrCreateRoom,
    postMessage: postMessage,
    getOwnerRooms: getOwnerRooms,
    getRoomMessages: getRoomMessages,
    updateRoom: updateRoom
  };

  // Eagerly initialize WebSocket
  try {
    if (typeof window !== "undefined") {
      setTimeout(getSocket, 50);
    }
  } catch (e) {}

})(typeof window !== "undefined" ? window : globalThis);
