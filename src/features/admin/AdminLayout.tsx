// src/features/admin/AdminLayout.tsx
import { Tabs, Group, Button, Container } from '@mantine/core';
import {useLocation, useNavigate, Link, Navigate, Outlet} from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function AdminLayout() {
    const { isAdmin, loading } = useAuth();
    const loc = useLocation();
    const navigate = useNavigate();

    if (loading) return null;
    if (!isAdmin) return <Navigate to="/" replace />;

    const current = loc.pathname.split('/')[2] ?? 'users';

    return (
        <Container size="lg" py="lg">
            <Group justify="space-between" mb="md">
                <h2>Panel administratora</h2>
                <Button component={Link} to="/" variant="light">← Wróć</Button>
            </Group>

            <Tabs value={current} onChange={(v) => v && navigate(`/admin/${v}`)}>
                <Tabs.List>
                    <Tabs.Tab value="users">Użytkownicy</Tabs.Tab>
                    <Tabs.Tab value="restaurants">Restauracje</Tabs.Tab>
                    <Tabs.Tab value="reservations">Rezerwacje</Tabs.Tab>
                    <Tabs.Tab value="reviews">Opinie</Tabs.Tab>
                </Tabs.List>
            </Tabs>

            <div style={{ marginTop: 16 }}>
                <Outlet />
            </div>
        </Container>
    );
}
