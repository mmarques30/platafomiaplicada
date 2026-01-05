import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'logo-simbolo.png',
        'logo-marca-completa.png',
        'logo-marca-completa-clara.png',
        'logo-mariana.png',
        'logo-3d.png',
        'apple-touch-icon-180.png',
        'icon-192.png',
        'icon-512.png',
        'background-symbol.png',
        'background-symbol-soft.png',
        'offline.html',
        'logos/notion-logo.png',
        'logos/claude-logo.png',
        'logos/manus-logo.png',
        'logos/lovable-logo.png',
        'logos/gpt-pilot-logo.png',
        'logos/chatgpt-logo.png',
        'logos/tango-logo.png',
      ],
      manifest: {
        name: 'IAplicada Academy',
        short_name: 'IAplicada',
        description: 'Área dos alunos Aplicados',
        theme_color: '#9EB038',
        background_color: '#2F302B',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/logo-simbolo.png?v=5',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-simbolo.png?v=5',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/logo-simbolo.png?v=5',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/supabase/],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /\.html$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache-v5',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 3600
              }
            }
          },
          {
            urlPattern: /\.(js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-cache-v5',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400
              }
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache-v5',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 86400
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
