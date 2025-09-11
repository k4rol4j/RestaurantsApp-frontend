import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';

export function GenericRoleRoute({
                                     children,
                                     allowedRoles,
                                 }: {
    children: React.ReactNode;
    allowedRoles: string[];
}) {
    const { user, loading } = useAuth();

    if (loading) return <div>Ładowanie…</div>;
    if (!user) return <Navigate to="/login" replace />;

    const ok = user.roles?.some((r) => allowedRoles.includes(r));
    if (!ok) return <div>Brak uprawnień</div>;

    return <>{children}</>;
}
