// src/components/AppNavbar.tsx
import React from 'react';
import {
    NavLink,
    Divider,
    Stack,
    Text,
    Skeleton,
    ScrollArea,
    Flex,
    Box,
} from '@mantine/core';
import {
    IconCalendar,
    IconHeart,
    IconLogout,
    IconSearch,
    IconLayoutDashboard,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../features/login/api/logout';
import { api, myRestaurants } from '../api';

type User = { id: number; email: string; roles: string[] };

export const AppNavbar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const [user, setUser] = React.useState<User | null>(null);
    const [owned, setOwned] = React.useState<{ id: number; name: string }[]>([]);
    const [loadingOwned, setLoadingOwned] = React.useState(false);

    React.useEffect(() => {
        api
            .get('/auth/me')
            .then((r) => setUser(r.data))
            .catch(() => setUser(null));

        setLoadingOwned(true);
        myRestaurants()
            .then(setOwned)
            .catch(() => setOwned([]))
            .finally(() => setLoadingOwned(false));
    }, []);

    const isOwner = user?.roles?.includes('RESTAURANT_OWNER');
    const isAdmin = user?.roles?.includes('ADMIN');
    const showOwnerSection = isOwner && owned.length > 0;

    const go =
        (to: string) =>
            () =>
                navigate(to);

    const onLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Flex direction="column" h="100%">
            {/* GÓRNA CZĘŚĆ – przewijana */}
            <ScrollArea.Autosize mah="100%" type="auto" scrollbarSize={6}>
                <Box p="md">
                    <Stack gap="xs">
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase" ml="xs">
                            Nawigacja
                        </Text>

                        <NavLink
                            label="Szukaj"
                            leftSection={<IconSearch size={16} stroke={1.5} />}
                            onClick={go('/reservations')}
                            active={pathname === '/reservations'}
                            variant="subtle"
                        />
                        <NavLink
                            label="Moje rezerwacje"
                            leftSection={<IconCalendar size={16} stroke={1.5} />}
                            onClick={go('/reservations/my')}
                            active={pathname === '/reservations/my'}
                            variant="subtle"
                        />
                        <NavLink
                            label="Ulubione"
                            leftSection={<IconHeart size={16} stroke={1.5} />}
                            onClick={go('/favorites')}
                            active={pathname === '/favorites'}
                            variant="subtle"
                        />

                        {showOwnerSection && (
                            <>
                                <Divider my="sm" />
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase" ml="xs">
                                    Zarządzanie
                                </Text>

                                {loadingOwned ? (
                                    <Stack gap={6} px="xs">
                                        <Skeleton h={32} radius="sm" />
                                        <Skeleton h={32} radius="sm" />
                                    </Stack>
                                ) : owned.length === 1 ? (
                                    <NavLink
                                        label="Panel właściciela"
                                        leftSection={<IconLayoutDashboard size={16} stroke={1.5} />}
                                        onClick={() =>
                                            owned[0]?.id &&
                                            navigate(`/owner/${owned[0].id}/dashboard`)
                                        }
                                        active={
                                            !!owned[0]?.id && pathname.startsWith(`/owner/${owned[0].id}`)
                                        }
                                        variant="subtle"
                                    />
                                ) : (
                                    <NavLink
                                        label="Panel właściciela"
                                        leftSection={<IconLayoutDashboard size={16} stroke={1.5} />}
                                        defaultOpened
                                        variant="subtle"
                                    >
                                        {owned.map((r) => (
                                            <NavLink
                                                key={r.id}
                                                label={r.name}
                                                onClick={go(`/owner/${r.id}/dashboard`)}
                                                active={pathname.startsWith(`/owner/${r.id}`)}
                                                variant="subtle"
                                            />
                                        ))}
                                    </NavLink>
                                )}
                            </>
                        )}

                        {isAdmin && (
                            <>
                                <Divider my="sm" />
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase" ml="xs">
                                    Administracja
                                </Text>

                                <NavLink
                                    label="Panel administratora"
                                    leftSection={<IconLayoutDashboard size={16} stroke={1.5} />}
                                    onClick={go('/admin')}
                                    active={pathname.startsWith('/admin')}
                                    variant="subtle"
                                />
                            </>
                        )}
                    </Stack>
                </Box>
            </ScrollArea.Autosize>

            <Divider />
            <Box p="md">
                <NavLink
                    label="Wyloguj się"
                    leftSection={<IconLogout size={16} stroke={1.5} />}
                    onClick={onLogout}
                    variant="subtle"
                />
            </Box>
        </Flex>
    );
};
