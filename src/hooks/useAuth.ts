import { useEffect, useState } from 'react';
import { api } from '../api';

export type CurrentUser = { id: number; email: string; roles: string[] } | null;

export function useAuth() {
    const [user, setUser] = useState<CurrentUser>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await api.get('/auth/me');
                if (mounted) setUser(data);
            } catch {
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const isAdmin = !!user?.roles?.includes('ADMIN');
    const isOwner = !!user?.roles?.includes('RESTAURANT_OWNER');

    return { user, isAdmin, isOwner, loading };
}
