import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

// ⚠️ Ustal backend pod PWA (pełny https)
const API_URL = process.env.VITE_API_URL || 'https://restaurantsapp-backend.onrender.com/api';
const API_ORIGIN = new URL(API_URL).origin; // np. https://restaurantsapp-backend.onrender.com

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    base: '/',
    build: { outDir: 'dist' },
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            devOptions: { enabled: false },
            // szybkie aktualizacje SW
            workbox: {
                skipWaiting: true,
                clientsClaim: true,

                cleanupOutdatedCaches: true,
                navigateFallback: '/index.html',
                // nie przechwytuj nawigacji do API ani obrazów
                navigateFallbackDenylist: [/^\/api\//, /\.(?:png|jpe?g|svg|webp|gif)$/i],

                runtimeCaching: [
                    // OBRAZY - ok, CacheFirst
                    {
                        urlPattern: /\.(?:png|jpe?g|svg|webp|gif)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images',
                            expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
                        },
                    },

                    // API (same-origin /api/*) – bez cache
                    // API (same-origin /api/*) – bez cache
                    {
                        urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
                        handler: 'NetworkOnly',
                        options: { cacheName: 'api-no-cache' },
                    },


                    // API (cross-origin na backend) – bez cache
                    {
                        urlPattern: ({ url }) => url.origin === API_ORIGIN,
                        handler: 'NetworkOnly',
                        options: { cacheName: 'api-no-cache-x' },
                    },
                ],
            },

            includeAssets: [
                'favicon.ico',
                'robots.txt',
                'apple-touch-icon.png',
                'placeholder-restaurant.svg',
            ],
            manifest: {
                id: '/?source=pwa',
                name: 'Eating App',
                short_name: 'Eating',
                description: 'Rezerwacje restauracji — wygodnie na telefonie.',
                start_url: '/?source=pwa',
                scope: '/',
                display: 'standalone',
                display_override: ['standalone'],
                background_color: '#ffffff',
                theme_color: '#ffffff',
                orientation: 'portrait',
                icons: [
                    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
                ],
            },
        }),
    ],
});
