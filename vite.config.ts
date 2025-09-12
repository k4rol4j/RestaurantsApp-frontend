import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
    base: '/',
    build: { outDir: 'dist' },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'), // <── teraz zadziała
        },
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            workbox: {
                cleanupOutdatedCaches: true,
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [
                    /^\/api\//,
                    /\.(?:png|jpe?g|svg|webp|gif)$/i,
                ],
                runtimeCaching: [
                    {
                        urlPattern: /\.(?:png|jpe?g|svg|webp|gif)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images',
                            expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
                        },
                    },
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
                    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
                    { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
                ],
            },
        }),
    ],
});
