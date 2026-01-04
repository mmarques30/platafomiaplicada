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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo-simbolo.png', 'logo-mariana.png'],
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
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/supabase/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\.(js|css)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'assets-cache-v2',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7200 // 2 horas
              }
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'images-cache-v2',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 14400 // 4 horas
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
