/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
    import { RegisterSWOptions } from 'vite-plugin-pwa/types';
    export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => void;
}
