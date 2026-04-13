import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicSupabaseUrl = env.VITE_SUPABASE_URL || "https://ocwpsanqtfubixerjive.supabase.co";
  const publicSupabasePublishableKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd3BzYW5xdGZ1Yml4ZXJqaXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTMxMTUsImV4cCI6MjA3NDk2OTExNX0.g0_rxkifPQe7gN5-7WzYO_6y6NtHagzZlWLSycOh3bk";

  return {
    define: {
      __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(publicSupabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(publicSupabasePublishableKey),
    },
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
          'logo-simbolo.png?v=10',
          'logo-marca-completa.png',
          'logo-marca-completa-clara.png',
          'logo-marca-completa-escura.png',
          'logo-mariana.png?v=10',
          'logo-3d.png?v=10',
          'apple-touch-icon-180.png?v=10',
          'icon-192.png?v=10',
          'icon-512.png?v=10',
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
              src: '/icon-192.png?v=10',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512.png?v=10',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icon-512.png?v=10',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
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
                cacheName: 'html-cache-v14',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 3600
                }
              }
            },
            {
              urlPattern: /\.(js|css)$/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'assets-cache-v14',
                networkTimeoutSeconds: 3,
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
                cacheName: 'images-cache-v14',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 7 * 24 * 60 * 60 // 7 dias
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
      dedupe: ["react", "react-dom", "react/jsx-runtime"],
    },
    optimizeDeps: {
      include: ["@tanstack/react-query"],
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
