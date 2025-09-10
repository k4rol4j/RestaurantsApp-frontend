import {AppShell, Burger, Title} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {Outlet} from "react-router-dom";
import {AppNavbar} from "./AppNavbar.tsx";

export const Layout = () => {
    const [opened, { toggle }] = useDisclosure();
    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            <AppShell.Header>
                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="sm"
                    size="sm"
                />
                <div>
                    <Title order={2} mb="lg">
                        Eating
                    </Title>
                </div>
            </AppShell.Header>

            <AppShell.Navbar p="0">
                <AppNavbar/>
            </AppShell.Navbar>
            <AppShell.Main><Outlet/></AppShell.Main>
        </AppShell>
    );
};