import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { AppShell, NavLink, ScrollArea, Title, Stack } from '@mantine/core';

export default function OwnerLayout() {
    const { rid } = useParams();
    const { pathname } = useLocation();

    const links = [
        { to: `/owner/${rid}/dashboard`, label: 'Dashboard' },
        { to: `/owner/${rid}/profile`, label: 'Profil' },
        { to: `/owner/${rid}/tables`, label: 'Stoły' },
        { to: `/owner/${rid}/reservations`, label: 'Rezerwacje' },
    ];

    return (
        <AppShell
            padding="lg"
            navbar={{ width: 240, breakpoint: 'sm' }} // ← konfiguracja
        >
            <AppShell.Navbar p="md">
                <Title order={4} mb="sm">Panel właściciela</Title>

                <ScrollArea style={{ flex: 1 }}>
                    <Stack gap={6}>
                        {links.map((l) => (
                            <NavLink
                                key={l.to}
                                label={l.label}
                                component={Link}
                                to={l.to}
                                active={pathname.startsWith(l.to)}
                            />
                        ))}
                    </Stack>
                </ScrollArea>
            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}
