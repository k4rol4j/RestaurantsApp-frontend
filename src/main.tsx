import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {MantineProvider} from "@mantine/core";
import {ModalsProvider} from "@mantine/modals";
import {registerSW} from "virtual:pwa-register";


createRoot(document.getElementById('root')!).render(
    <MantineProvider>
        <ModalsProvider>
            <App />
        </ModalsProvider>
    </MantineProvider>
)

registerSW();
