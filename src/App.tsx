import {BrowserRouter} from "react-router-dom";
import {Routing} from "./features/routing/Routing.tsx";
import '@mantine/core/styles.css';
import {createTheme, MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import "leaflet/dist/leaflet.css";

const theme = createTheme({});

function App() {
    return (
        <MantineProvider theme={theme}>
            <Notifications/>
            <BrowserRouter>
                <Routing/>
            </BrowserRouter>
        </MantineProvider>


    )
}

export default App