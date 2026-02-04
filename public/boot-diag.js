/* Boot diagnostics for WebView / file-like origins.
 * This file is copied as-is into dist/ via Vite publicDir.
 */
;(function () {
  var STORAGE_KEY = 'baba.bootDiag'
  var enabled = false
  var pending = []

  function readEnabledFromUrl() {
    try {
      var qs = String(location && location.search || '')
      var h = String(location && location.hash || '')
      return /[?&]bootdiag=1\b/i.test(qs) || /bootdiag=1\b/i.test(h)
    } catch (_) {
      return false
    }
  }

  function readEnabledFromStorage() {
    try {
      return String(localStorage.getItem(STORAGE_KEY) || '') === '1'
    } catch (_) {
      return false
    }
  }

  function persistEnabled() {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
    } catch (_) {}
  }

  enabled = readEnabledFromUrl() || readEnabledFromStorage()

  function ensureBadge() {
    var el = document.getElementById('boot-diag-badge')
    if (el) return el
    el = document.createElement('div')
    el.id = 'boot-diag-badge'
    el.textContent = 'BOOT-DIAG'
    el.style.cssText = [
      'position:fixed',
      'left:8px',
      'top:8px',
      'z-index:2147483647',
      'background:rgba(255, 215, 0, 0.95)',
      'color:#111',
      'padding:6px 10px',
      'border-radius:10px',
      'border:2px solid rgba(0,0,0,0.6)',
      'font:700 12px/1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
    ].join(';')
    document.body.appendChild(el)
    return el
  }

  function ensureBox() {
    var el = document.getElementById('boot-diag')
    if (el) return el
    if (!document.body) return null
    ensureBadge()
    el = document.createElement('pre')
    el.id = 'boot-diag'
    el.style.cssText = [
      'position:fixed',
      'left:8px',
      'right:8px',
      'bottom:8px',
      'max-height:55vh',
      'overflow:auto',
      'z-index:2147483647',
      'background:rgba(255,255,255,0.92)',
      'color:#111',
      'padding:10px',
      'border-radius:10px',
      'border:2px solid rgba(0,0,0,0.55)',
      'box-shadow:0 10px 30px rgba(0,0,0,0.35)',
      'font:12px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      'white-space:pre-wrap',
      'word-break:break-word'
    ].join(';')
    document.body.appendChild(el)
    return el
  }

  function renderLine(line) {
    try {
      var el = ensureBox()
      if (!el) return
      el.textContent += line + '\n'
    } catch (_) {}
  }

  function show(line) {
    pending.push(line)
    if (!enabled) return
    renderLine(line)
  }

  function setUiVisible(isVisible) {
    try {
      var box = document.getElementById('boot-diag')
      var badge = document.getElementById('boot-diag-badge')
      if (box) box.style.display = isVisible ? 'block' : 'none'
      if (badge) badge.style.display = isVisible ? 'block' : 'none'
    } catch (_) {}
  }

  function flushPending() {
    if (!enabled) return
    try {
      // Ensure DOM exists.
      if (!document.body) return
      ensureBadge()
      ensureBox()
      setUiVisible(true)

      // Re-render into a fresh box to avoid partial state.
      var box = document.getElementById('boot-diag')
      if (box) box.textContent = ''
      for (var i = 0; i < pending.length; i++) renderLine(pending[i])
    } catch (_) {}
  }

  function toggle() {
    enabled = !enabled
    persistEnabled()
    if (enabled) {
      flushPending()
    } else {
      setUiVisible(false)
    }
  }

  // Always show a one-line marker so we know JS executed.
  try {
    show('[boot] boot-diag.js running')
    show('[boot] href=' + String(location && location.href))
    show('[boot] origin=' + String(location && location.origin) + ' protocol=' + String(location && location.protocol))
    show('[boot] pathname=' + String(location && location.pathname) + ' hash=' + String(location && location.hash))
    show('[boot] tip: press H=Home, L=Level, G=Game')
    show('[boot] tip: toggle diag with Ctrl/Cmd+Alt+D (or add ?bootdiag=1)')
  } catch (_) {}

  // Quick route switching when the UI is blank.
  try {
    window.addEventListener('keydown', function (e) {
      var k = String(e && e.key || '').toLowerCase()
      // Toggle diagnostics overlay.
      if (k === 'd' && e && e.altKey && (e.ctrlKey || e.metaKey)) {
        try { e.preventDefault() } catch (_) {}
        toggle()
        return
      }
      if (k === 'h') location.hash = '#/'
      if (k === 'l') location.hash = '#/level'
      if (k === 'g') location.hash = '#/game'
    }, true)
  } catch (_) {}

  function styleSummary(el) {
    try {
      if (!el) return 'null'
      var cs = getComputedStyle(el)
      return [
        'display=' + cs.display,
        'visibility=' + cs.visibility,
        'opacity=' + cs.opacity,
        'position=' + cs.position,
        'bg=' + cs.backgroundColor
      ].join(' ')
    } catch (_) {
      return 'style=?'
    }
  }

  function rectSummary(el) {
    try {
      if (!el || !el.getBoundingClientRect) return 'rect=null'
      var r = el.getBoundingClientRect()
      return 'rect=' + [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(',')
    } catch (_) {
      return 'rect=?'
    }
  }

  function dumpDom(tag) {
    try {
      var app = document.getElementById('app')
      var main = document.querySelector('main')
      var buttons = document.querySelectorAll('button')
      var canvases = document.querySelectorAll('canvas')
      show('[' + tag + '] #app nodes=' + String(app ? app.childNodes.length : -1) + ' ' + rectSummary(app) + ' ' + styleSummary(app))
      show('[' + tag + '] <main> ' + (main ? ('id=' + (main.id || '(none)') + ' class=' + (main.className || '(none)')) : 'null') + ' ' + rectSummary(main) + ' ' + styleSummary(main))
      show('[' + tag + '] buttons=' + String(buttons ? buttons.length : 0) + ' canvases=' + String(canvases ? canvases.length : 0))
      if (main && main.firstElementChild) {
        show('[' + tag + '] <main> child0 <' + String(main.firstElementChild.tagName).toLowerCase() + '> ' + rectSummary(main.firstElementChild) + ' ' + styleSummary(main.firstElementChild))
      }
      if (main) {
        var text = (main.textContent || '').trim().replace(/\s+/g, ' ')
        if (text) show('[' + tag + '] mainText=' + text.slice(0, 140))
      }
      if (canvases && canvases[0]) {
        var c0 = canvases[0]
        show('[' + tag + '] canvas0 size=' + String(c0.width) + 'x' + String(c0.height) + ' css=' + rectSummary(c0) + ' ' + styleSummary(c0))
      }
      var cx = Math.floor(innerWidth / 2)
      var cy = Math.floor(innerHeight / 2)
      var hit = document.elementFromPoint(cx, cy)
      if (hit) {
        show('[' + tag + '] elementFromPoint(' + cx + ',' + cy + ')=<' + String(hit.tagName).toLowerCase() + '>#' + (hit.id || '') + '.' + String(hit.className || ''))
      }
    } catch (e) {
      show('[' + tag + '] dump error ' + String(e && (e.stack || e.message) || e))
    }
  }

  window.addEventListener('error', function (ev) {
    try {
      var msg = ev && ev.message ? ev.message : String(ev)
      show('[window.error] ' + msg)
      if (ev && ev.filename) show('  at ' + ev.filename + ':' + ev.lineno + ':' + ev.colno)
    } catch (_) {}
  })

  // Resource load errors (script/link/img), including module script failures.
  window.addEventListener(
    'error',
    function (ev) {
      try {
        var t = ev && ev.target
        if (!t || !t.tagName) return
        var tag = String(t.tagName).toLowerCase()
        if (tag !== 'script' && tag !== 'link' && tag !== 'img') return

        var url = ''
        if (tag === 'script') url = t.src || ''
        else if (tag === 'link') url = t.href || ''
        else if (tag === 'img') url = t.currentSrc || t.src || ''

        show('[resource.error] <' + tag + '> failed to load')
        if (url) show('  url=' + url)
        if (tag === 'script' && t.type) show('  type=' + t.type)
        if (tag === 'link' && t.rel) show('  rel=' + t.rel)
      } catch (_) {}
    },
    true
  )

  window.addEventListener('unhandledrejection', function (ev) {
    try {
      var r = ev && ev.reason
      show('[unhandledrejection] ' + String((r && (r.stack || r.message)) || r))
    } catch (_) {}
  })

  setTimeout(function () {
    try {
      var app = document.getElementById('app')
      var mounted = !!(app && app.childNodes && app.childNodes.length)
      show('[boot] mounted=' + String(mounted) + ' appNodes=' + String(app ? app.childNodes.length : -1))
      dumpDom('t+2500ms')
      if (!mounted) {
        show('Hint: If you opened via file:// in a desktop browser, ES modules may be blocked by browser policy.')
        show('Hint: For Android WebView, prefer WebViewAssetLoader (https://appassets.androidplatform.net/...).')
      }
    } catch (_) {}
  }, 2500)

  // Observe DOM changes under #app (router-view swaps).
  try {
    var appRoot = document.getElementById('app')
    if (appRoot && typeof MutationObserver !== 'undefined') {
      var mo = new MutationObserver(function () {
        try {
          dumpDom('mutation')
        } catch (_) {}
      })
      mo.observe(appRoot, { childList: true, subtree: true })
    }
  } catch (_) {}

  setTimeout(function () { dumpDom('t+200ms') }, 200)
  setTimeout(function () { dumpDom('t+1000ms') }, 1000)

  // If enabled at boot, show UI when DOM is ready.
  try {
    if (enabled) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { flushPending() }, { once: true })
      } else {
        flushPending()
      }
    } else {
      // Ensure nothing is visible by default.
      setUiVisible(false)
    }
  } catch (_) {}
})()
