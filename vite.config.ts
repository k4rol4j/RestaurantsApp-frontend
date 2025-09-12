import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

// ⚠️ pełny URL do backendu, np. VITE_API_URL=https://restaurantsapp-backend.onrender.com/api
const API_URL = process.env.VITE_API_URL || 'https://restaurantsapp-backend.onrender.com/api';
const API_ORIGIN = new URL(API_URL).origin;

// pomocniczo zamieniamy string originu na RegExp
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const API_ORIGIN_RE = new RegExp(`^${escapeRe(API_ORIGIN)}/`);

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
            workbox: {
                skipWaiting: true,
                clientsClaim: true,
                cleanupOutdatedCaches: true,
                navigateFallback: '/index.html',
                // nie przechwytuj nawigacji do API ani obrazów
                navigateFallbackDenylist: [/^\/api\//, /\.(?:png|jpe?g|svg|webp|gif)$/i],

                runtimeCaching: [
                    // obrazy — CacheFirst
                    {
                        urlPattern: /\.(?:png|jpe?g|svg|webp|gif)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images',
                            expiration: {
                                maxEntries: 80,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dni
                            },
                        },
                    },

                    // API same-origin (/api/*) — NetworkOnly (bez cache)
                    {
                        urlPattern: /^\/api\//,
                        handler: 'NetworkOnly',
                        options: { cacheName: 'api-no-cache' },
                    },

                    // API cross-origin (pełny backend origin) — NetworkOnly
                    {
                        urlPattern: API_ORIGIN_RE,
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
