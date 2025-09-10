import React from 'react';
import {
    NavLink,
    Divider,
    Stack,
    Text,
    Skeleton,
} from '@mantine/core';
import {
    IconCalendar,
    IconHeart,
    IconLogout,
    IconSearch,
    IconLayoutDashboard,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../features/login/api/logout.ts';
import { api, myRestaurants } from '../api.ts';

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
            .then((r) => {
                setUser(r.data);
                const roles = r.data?.roles ?? [];
                if (roles.includes('RESTAURANT_OWNER') || roles.includes('ADMIN')) {
                    setLoadingOwned(true);
                    myRestaurants()
                        .then(setOwned)
                        .catch(() => setOwned([]))
                        .finally(() => setLoadingOwned(false));
                }
            })
            .catch(() => setUser(null));
    }, []);

    const isOwner =
        user?.roles?.includes('RESTAURANT_OWNER') || user?.roles?.includes('ADMIN');

    const go = (to: string) => () => navigate(to);

    const onLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
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

            {isOwner && (
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
                    ) : owned.length <= 1 ? (
                        <NavLink
                            label="Panel zarządzania"
                            leftSection={<IconLayoutDashboard size={16} stroke={1.5} />}
                            onClick={() =>
                                owned[0]?.id && navigate(`/owner/${owned[0].id}/dashboard`)
                            }
                            active={
                                !!owned[0]?.id && pathname.startsWith(`/owner/${owned[0].id}`)
                            }
                            variant="subtle"
                        />
                    ) : (
                        <NavLink
                            label="Panel zarządzania"
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

            <Divider my="sm" />
            <NavLink
                label="Wyloguj się"
                leftSection={<IconLogout size={16} stroke={1.5} />}
                onClick={onLogout}
                variant="subtle"
            />
        </Stack>
    );
};
