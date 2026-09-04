import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/**
 * TLS for the dev server, using the wildcard *.eterminals.com certificate.
 *
 * The key is read from outside the repo on purpose — a private key committed
 * to source control is a private key you have to reissue. Override the folder
 * with ISCOPE_CERT_DIR on another machine.
 *
 * `cert` is the leaf FOLLOWED BY the GoDaddy intermediate bundle. Serving the
 * leaf alone validates in browsers that happen to have cached the intermediate
 * and fails in everything else, which is a miserable bug to chase.
 *
 * If the files are missing, this resolves to undefined and Vite falls back to
 * plain HTTP rather than refusing to start.
 */
function loadHttps() {
  const dir =
    process.env.ISCOPE_CERT_DIR ||
    'C:/Users/mcsbe/Desktop/Eterminals SSL cert 2026'

  const keyPath = path.join(dir, 'eterminals.key')
  const leafPath = path.join(dir, '1ed193e9cc0157f1.crt')
  const bundlePath = path.join(dir, 'gd_bundle-g2.crt')

  if (!fs.existsSync(keyPath) || !fs.existsSync(leafPath)) {
    console.warn(`[iron-scope] no TLS material in ${dir} — serving over HTTP`)
    return undefined
  }

  const leaf = fs.readFileSync(leafPath, 'utf8').trim()
  const bundle = fs.existsSync(bundlePath)
    ? fs.readFileSync(bundlePath, 'utf8').trim()
    : ''

  return {
    key: fs.readFileSync(keyPath),
    cert: [leaf, bundle].filter(Boolean).join('\n') + '\n',
  }
}

const https = loadHttps()

export default defineConfig({
  plugins: [vue(), tailwindcss()],

  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },

  /**
   * Compile-time flags. These let the bundler drop whole branches of the Vue
   * runtime this app never reaches — most importantly the entire Options API,
   * which is dead weight in a `<script setup>`-only codebase.
   */
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },

  build: {
    target: 'es2022',
    cssCodeSplit: true,
    modulePreload: { polyfill: false },

    rollupOptions: {
      /**
       * Vite 8 bundles with ROLLDOWN, not Rollup, and the treeshake schema is
       * different: there is no `preset` and no `moduleSideEffects` key here.
       * Passing either is rejected at config validation with a warning that is
       * easy to scroll past, leaving a config that silently does nothing.
       *
       * Two further options are valid but dangerous and are left at default:
       *   propertyWriteSideEffects: false — lets Rolldown discard `obj.x = y`
       *     when the result looks unused. Vue's reactivity is built out of
       *     exactly those assignments, so the app mounts and renders NOTHING.
       *     It fails only in the production build; dev looks perfectly fine.
       *   unknownGlobalSideEffects: false — same class of risk around the
       *     runtime's global feature detection.
       * Together they saved ~1.5 kB. Not worth a silently blank site.
       */
      treeshake: {
        annotations: true,
        propertyReadSideEffects: false,
        invalidImportSideEffects: false,
      },

      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](vue|@vue|vue-router)[\\/]/.test(id)) {
            return 'vendor-vue'
          }
        },
        assetFileNames: (info) => {
          const name = info.names?.[0] ?? info.name ?? ''
          if (/\.(woff2?|ttf|otf)$/.test(name)) return 'assets/fonts/[name]-[hash][extname]'
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/.test(name)) {
            return 'assets/img/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },

  /**
   * `strictPort` makes Vite FAIL rather than quietly hop to the next free port
   * when 4173 is taken. A silent hop is how you end up chasing the app across
   * 4174, 4175, 4176 without noticing a stray server is holding the one you
   * wanted. Preview moves off 4173 so the two can never collide.
   */
  /**
   * `host: true` binds every interface. Vite's default is the string
   * "localhost", which Node resolves to a SINGLE address — on Windows that is
   * the IPv6 loopback ::1, so http://127.0.0.1:4173 gets connection-refused
   * while http://localhost:4173 works. That asymmetry reads exactly like a
   * firewall block and isn't one; Windows Firewall never filters loopback.
   *
   * Binding all interfaces also makes the server reachable from other devices
   * on the local network (useful for testing on a phone). That IS a real
   * exposure — set this back to the default if you'd rather it stay local-only.
   */
  /**
   * `allowedHosts` whitelists the Host headers the dev server will answer to.
   * Vite rejects unknown hosts to blunt DNS-rebinding attacks, so anything
   * reaching the server through a proxy or tunnel has to be named here.
   * Listed explicitly rather than using `true`, which would disable the check
   * for every hostname.
   */
  server: {
    port: 4173,
    strictPort: true,
    host: true,
    allowedHosts: ['remote.eterminals.com', 'localhost'],
    https,
    /**
     * Backend migration plan (Phase 0): the API stays on the existing
     * Next.js app (mitigation-platform), running separately on :3000 in
     * dev. Proxying /api/* here means fetch("/api/...") calls in this app
     * are same-origin from the browser's point of view, so the NextAuth
     * session cookie behaves exactly like it does in the current site —
     * no CORS config, no cross-origin cookie handling needed either now
     * or after a same-origin production cutover.
     */
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4273,
    strictPort: true,
    allowedHosts: ['remote.eterminals.com', 'localhost'],
    https,
  },
})
