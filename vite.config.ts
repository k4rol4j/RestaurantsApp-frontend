import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/',
    build: { outDir: 'dist' },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto', // wstrzyknie rejestrację sw
            includeAssets: [
                'favicon.ico',
                'robots.txt',
                'apple-touch-icon.png',
            ],
            workbox: {
                cleanupOutdatedCaches: true,
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [
                    /^\/api\//,
                    /\.(?:png|jpe?g|svg|webp|gif)$/i,
                ],
                runtimeCaching: [
                    // Obrazy: cache-first
                    {
                        urlPattern: /\.(?:png|jpe?g|svg|webp|gif)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images',
                            expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
                        },
                    },
                    // API: network-first
                    {
                        urlPattern: /^\/api\//,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api',
                            networkTimeoutSeconds: 5,
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
                        },
                    },
                ],
            },
            devOptions: { enabled: false },
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
                    // klasyczne
                    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
                    // maskable (żeby ładnie wyglądało na Androidzie)
                    { src: 'icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
                    { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
                ],
            },
        }),
    ],
});
