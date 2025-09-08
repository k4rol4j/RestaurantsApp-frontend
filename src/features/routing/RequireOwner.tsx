import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../../api';

type User = { id: number; email: string; roles: string[] };

export default function RequireOwner() {
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        api.get('/auth/me')
            .then(r => setUser(r.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Ładowanie…</div>;
    if (!user) return <Navigate to="/login" replace />;

    const ok = user.roles?.includes('RESTAURANT_OWNER') || user.roles?.includes('ADMIN');
    if (!ok) return <div>Brak uprawnień</div>;

    return <Outlet />;
}
