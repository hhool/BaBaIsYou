import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () =>
      import(
        '@/pages/HomePage.vue'
        )
  },

  {
    path: '/level',
    name: 'Level',
    component: () =>
      import(
        '@/pages/LevelList.vue'
        )
  },
  {
    path: '/game',
    name: 'Game',
    component: () =>
      import(
        '@/pages/GameLayout.vue'
        )
  }
]

export const router = createRouter({
  history: (() => {
    const base = import.meta.env.BASE_URL
    try {
      if (typeof location === 'undefined') return createWebHashHistory('/')

      const protocol = location.protocol
      const isHttp = protocol === 'http:' || protocol === 'https:'
      const isNullOrigin = location.origin === 'null' || !location.origin
      const isHtmlEntry = /\.html(?:$|[?#])/.test(location.pathname)

      // Hash history is the safest for WebView / file-like environments and static hosting without SPA fallback.
      // In VS Code Preview the pathname is often '/index.html', which would not match history-mode routes.
      // IMPORTANT: In VS Code Preview / WebView, a <base href="https://file+.vscode-resource.../"> tag
      // may be injected. If we let vue-router infer base from <base>, it can become cross-origin and
      // history.replaceState() will throw a SecurityError.
      const safeHashBase = location.pathname || '/'

      // Hash history is the safest for WebView / file-like environments and static hosting without SPA fallback.
      return (!isHttp || isNullOrigin || isHtmlEntry) ? createWebHashHistory(safeHashBase) : createWebHistory(base)
    } catch {
      return createWebHashHistory('/')
    }
  })(),
  routes
})
