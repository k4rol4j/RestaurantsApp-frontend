import { Link, Outlet, useLocation, useParams, useNavigate } from 'react-router-dom';
import {
    AppShell, NavLink, ScrollArea, Title, Stack, Divider, Flex, Box,
} from '@mantine/core';
import { IconArrowLeft, IconLogout } from '@tabler/icons-react';
// Upewnij się, że ścieżka do logout jest poprawna u Ciebie:
import { logout } from '../login/api/logout'; // jeśli inna ścieżka – popraw

export default function OwnerLayout() {
    const { rid } = useParams();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const links = [
        { to: `/owner/${rid}/dashboard`, label: 'Dashboard' },
        { to: `/owner/${rid}/profile`, label: 'Profil' },
        { to: `/owner/${rid}/tables`, label: 'Stoły' },
        { to: `/owner/${rid}/reservations`, label: 'Rezerwacje' },
    ];

    const onLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <AppShell padding="lg" navbar={{ width: 240, breakpoint: 'sm' }}>
            <AppShell.Navbar p={0}>
                <Flex direction="column" h="100%">
                    {/* przewijana część */}
                    <ScrollArea.Autosize mah="100%" type="auto">
                        <Box p="md">
                            <Title order={4} mb="sm">Panel właściciela</Title>
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
                        </Box>
                    </ScrollArea.Autosize>

                    {/* przypięte na dole */}
                    <Divider />
                    <Box p="md">
                        <Stack gap={6}>
                            <NavLink
                                label="Wróć do aplikacji"
                                leftSection={<IconArrowLeft size={16} />}
                                component={Link}
                                to="/reservations"
                            />
                            <NavLink
                                label="Wyloguj się"
                                leftSection={<IconLogout size={16} />}
                                onClick={onLogout}
                            />
                        </Stack>
                    </Box>
                </Flex>
            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}
