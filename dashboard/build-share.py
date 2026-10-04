# -*- coding: utf-8 -*-
"""Bundle dashboard/1-empty (six tabs) into ONE self-contained share file."""
import json, os, re

ROOT  = "/Users/the-gill/Work Space/Clients/QR/v3/web"
FLOW  = os.path.join(ROOT, "dashboard", "1-empty")
OUT   = "/Users/the-gill/Work Space/Clients/QR/share/dashboard-empty/dashboard-empty.html"
ORDER = ["home", "profile", "orders", "qr", "gift", "settings"]

def read(p):
    with open(p, encoding="utf-8") as fh:
        return fh.read()

def js(s):
    """JS string literal that is safe inside <script> and inside srcdoc."""
    return json.dumps(s).replace("</", "<\\/")

# ── split one tab page into css / markup / js ────────────────────────────
SCRIPT = re.compile(r"<script\b([^>]*)>(.*?)</script>", re.S | re.I)
STYLE  = re.compile(r"<style\b[^>]*>(.*?)</style>",     re.S | re.I)
HEADT  = re.compile(r"^\s*<(?:title|meta|link)\b[^>]*>(?:[^<]*</title>)?\s*$", re.I | re.M)
TITLE  = re.compile(r"<title>(.*?)</title>", re.S | re.I)

CORE_SRC = ("state.js", "../../dashboard.js", "../../pack.js")

def split(name):
    src = read(os.path.join(FLOW, name + ".html"))
    title = TITLE.search(src).group(1).strip()

    tab_css, tab_js = [], []
    for attrs, body in SCRIPT.findall(src):
        m = re.search(r'src\s*=\s*"([^"]+)"', attrs)
        if m:
            href = m.group(1)
            if href in CORE_SRC:
                continue                      # shared kernel, inlined once
            tab_js.append(read(os.path.join(ROOT, href.replace("../../", ""))))
        else:
            tab_js.append(body)
    src = SCRIPT.sub("", src)

    inline_css = "\n".join(STYLE.findall(src))
    src = STYLE.sub("", src)

    for href in re.findall(r'<link[^>]+href="\.\./\.\./([^"]+\.css)"', src):
        if href != "dashboard.css":           # dashboard.css is in the kernel
            tab_css.append(read(os.path.join(ROOT, href)))
    if inline_css:
        tab_css.append(inline_css)

    body = HEADT.sub("", src).strip()
    return {"title": title, "css": "\n".join(tab_css), "body": body,
            "js": "\n;\n".join(tab_js)}

TABS = {n: split(n) for n in ORDER}

# ── the shared kernel ────────────────────────────────────────────────────
CSS_CORE = read(os.path.join(ROOT, "dashboard.css"))
JS_CORE  = "\n;\n".join([
    read(os.path.join(FLOW, "state.js")),
    read(os.path.join(ROOT, "pack.js")),
    read(os.path.join(ROOT, "dashboard.js")),
])

# every hard navigation becomes a note instead of a dead file
def unnav(s):
    return re.sub(r"window\.location\.href\s*=\s*([^;]+);", r"window.CMSHARE_NAV(\1);", s)

JS_CORE = unnav(JS_CORE)
for t in TABS.values():
    t["js"] = unnav(t["js"])

BRIDGE = r"""
/* ── SHARE BRIDGE ──────────────────────────────────────────────────────
   Six pages became six frames in one file. Everything that used to be a
   page load is a message to the shell instead:
     · a link to another tab  → the shell swaps the frame
     · the demo switcher      → the shell rebuilds the frame in that state
     · anything outside the dashboard (onboarding, pack, homepage) → a note
   Nothing else about the screens changes.
   ------------------------------------------------------------------- */
(function () {
  "use strict";
  var TABS = ["home", "profile", "orders", "qr", "gift", "settings"];
  var K = window.__CM_STATE;
  if (!window.CM_STATES || !window.CM_STATES[K]) { K = null; }
  var first = (window.CM_FLOW && CM_FLOW.states[0] && CM_FLOW.states[0].k) || null;

  CM.account  = function () { return CM_STATES[K] || CM_STATES[first] || {}; };
  CM.setState = function (k) { parent.postMessage({ cm: "state", k: k }, "*"); };

  function away() { CM.toast("Ye screen is share mein nahi hai"); }
  window.CMSHARE_NAV = away;

  document.addEventListener("click", function (e) {
    var n = e.target;
    while (n && n.nodeType === 1 && String(n.tagName).toLowerCase() !== "a") { n = n.parentNode; }
    if (!n || n.nodeType !== 1) { return; }
    var h = n.getAttribute("href");
    if (!h || h.charAt(0) === "#") { return; }
    if (/^(mailto:|tel:|https?:)/i.test(h)) { return; }
    e.preventDefault();
    var m = /(?:^|\/)([a-z-]+)\.html/i.exec(h);
    if (h.indexOf("..") < 0 && m && TABS.indexOf(m[1]) >= 0) {
      parent.postMessage({ cm: "tab", id: m[1] }, "*");
    } else { away(); }
  }, true);
})();
"""

SHELL = u"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Codemarca — Dashboard · empty account</title>

<!-- ==========================================================================
     CODEMARCA — DASHBOARD, FLOW 1 (EMPTY ACCOUNT) · SHARE BUILD
     Generated from v3/web/dashboard/1-empty/ — do not edit by hand, edit
     there and build again.

     The real dashboard is six pages that share dashboard.css / dashboard.js.
     A single file cannot link to them, so this one CARRIES them: the shared
     CSS and JS are inlined once as a kernel, each tab keeps its own markup,
     styles and script, and the shell below assembles whichever tab is asked
     for into the frame. Tab links and the demo-state switcher talk to the
     shell by postMessage; links that leave the dashboard (onboarding, pack,
     homepage, log out) say so in a toast instead of opening nothing.

     Tabs      Home · Profile · Orders · My QR · Gift & Refer · Settings
     States    just signed up · came back, still empty · gifted sticker
     Open it   double-click. No server, no internet needed except the fonts.
     ========================================================================== -->

<style>
  html, body { margin: 0; height: 100%; background: #F4F3F7; }
  #frame { position: fixed; inset: 0; width: 100%; height: 100%; border: 0; display: block; }
</style>
</head>
<body>

<iframe id="frame" title="Codemarca dashboard"></iframe>

<script>
(function () {
  "use strict";

  var ORDER = __ORDER__;
  var FONTS =
    '<link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap">';

  var CSS_CORE = __CSS_CORE__;
  var JS_CORE  = __JS_CORE__;
  var BRIDGE   = __BRIDGE__;
  var TABS     = __TABS__;

  var S = "<" + "script>", E = "<" + "/" + "script>";

  function build(id, state) {
    var t = TABS[id];
    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      "<title>" + t.title + "</title>" + FONTS +
      "<style>" + CSS_CORE + "</style>" +
      "<style>" + t.css + "</style>" +
      "</head><body>" + t.body +
      S + "window.__CM_STATE = " + JSON.stringify(state) + ";" + E +
      S + JS_CORE + E +
      S + BRIDGE  + E +
      S + t.js    + E +
      "</body></html>";
  }

  var frame = document.getElementById("frame");
  var tab = "home", state = null, mine = false;

  function go(id, st) {
    if (!TABS[id]) { id = "home"; }
    tab = id; state = st || null;
    frame.srcdoc = build(tab, state);
    mine = true;
    /* a hash is a nicety, not a feature — some contexts refuse to set one */
    try { location.hash = tab + (state ? "/" + state : ""); } catch (e) {}
  }

  window.addEventListener("message", function (e) {
    var d = e.data || {};
    if (d.cm === "tab")        { go(d.id, state); }
    else if (d.cm === "state") { go(tab, d.k); }
  });

  window.addEventListener("hashchange", function () {
    if (mine) { mine = false; return; }
    var p = location.hash.replace(/^#/, "").split("/");
    go(p[0] || "home", p[1] || null);
  });

  var p = location.hash.replace(/^#/, "").split("/");
  go(p[0] || "home", p[1] || null);
})();
</script>
</body>
</html>
"""

html = SHELL
for key, val in {
    "__ORDER__":    json.dumps(ORDER),
    "__CSS_CORE__": js(CSS_CORE),
    "__JS_CORE__":  js(JS_CORE),
    "__BRIDGE__":   js(BRIDGE),
    "__TABS__":     "{\n" + ",\n".join(
        '    %s: { title: %s, css: %s, body: %s, js: %s }'
        % (n, js(TABS[n]["title"]), js(TABS[n]["css"]), js(TABS[n]["body"]), js(TABS[n]["js"]))
        for n in ORDER) + "\n  }",
}.items():
    html = html.replace(key, val)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(html)

print("wrote", OUT, os.path.getsize(OUT), "bytes")
for n in ORDER:
    print("  %-9s css %6d  body %6d  js %6d" % (n, len(TABS[n]["css"]), len(TABS[n]["body"]), len(TABS[n]["js"])))
