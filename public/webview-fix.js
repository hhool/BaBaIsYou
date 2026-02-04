/* WebView fixups for VS Code HTML Preview / file-like origins.
 *
 * VS Code HTML Preview often injects a <base href="https://file+.vscode-resource.../">.
 * That base is REQUIRED for loading local assets inside the webview.
 *
 * However, some routers (vue-router) may accidentally use document.baseURI to build
 * history URLs, which can become cross-origin. Calling history.replaceState/pushState
 * with a cross-origin URL throws a SecurityError and can black-screen the app.
 *
 * Strategy: keep <base> untouched (so assets load), but sanitize history URLs.
 */
;(function () {
  function getHashFromUrlLike(urlLike) {
    try {
      var s = String(urlLike)
      var idx = s.indexOf('#')
      if (idx >= 0) return s.slice(idx)
    } catch (_) {}
    try {
      return new URL(String(urlLike), location.href).hash || ''
    } catch (_) {}
    return ''
  }

  function toAbsoluteSameOriginUrl(urlLike) {
    // Always return an absolute URL on the current origin.
    // This avoids <base href> affecting resolution inside history.replaceState.
    var hash = getHashFromUrlLike(urlLike)
    try {
      return String(location.origin) + String(location.pathname) + String(location.search) + String(hash || '')
    } catch {
      return String(location.pathname) + String(location.search) + String(hash || '')
    }
  }

  function resolveAgainstLocation(urlLike) {
    try {
      return new URL(String(urlLike), location.href)
    } catch {
      return null
    }
  }

  function patchHistory(methodName) {
    try {
      var original = history[methodName]
      if (typeof original !== 'function') return
      history[methodName] = function (state, title, url) {
        if (url != null) {
          var resolved = resolveAgainstLocation(url)
          if (resolved) {
            // If resolved becomes cross-origin (because url was absolute to another origin), force same-origin.
            url = (resolved.origin === location.origin) ? resolved.href : toAbsoluteSameOriginUrl(url)
          } else {
            url = toAbsoluteSameOriginUrl(url)
          }
        }
        try {
          return original.call(this, state, title, url)
        } catch (e) {
          // If we still hit SecurityError, retry with a safe same-origin URL.
          try {
            if (url != null) {
              return original.call(this, state, title, toAbsoluteSameOriginUrl(url))
            }
          } catch (_) {}
          throw e
        }
      }
    } catch (_) {}
  }

  patchHistory('replaceState')
  patchHistory('pushState')
})();
