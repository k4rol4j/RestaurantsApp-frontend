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
            // na czas kilku deployów pomoże uniknąć „stary index.html”:
            workbox: {
                cleanupOutdatedCaches: true,
                navigateFallback: '/index.html',
            },
            devOptions: { enabled: false },
            manifest: {
                name: 'Eating App',
                short_name: 'Eating',
                start_url: '/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#ffffff',
                icons: [
                    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
                ],
            },
            // selfDestroying: true,
        }),
    ],
});
