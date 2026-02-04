import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'
import Unocss from 'unocss/vite'
import { join } from 'path'

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': `${join(__dirname, 'src')}`
    }
  },
  plugins: [
    vue({
      isProduction: true
    }),
    Unocss(),
    createHtmlPlugin(),
    {
      name: 'strip-crossorigin-for-webview',
      enforce: 'post',
      transformIndexHtml(html) {
        // When opening dist/index.html from a WebView/file-like origin,
        // `crossorigin` on module scripts/preloads can trigger CORS failures.
        return html.replace(/\s+crossorigin(=("[^"]*"|'[^']*'))?/g, '')
      }
    }
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 50000,
    minify: true,
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  esbuild: {
    legalComments: 'none',
    minify: true,
    minifySyntax: true,
    minifyWhitespace: true,
    minifyIdentifiers: true,
    platform: 'browser',
    include: './src/**/*.{js,ts,jsx,tsx,css,json,text,base64,dataurl,file,binary}',
  }
})
