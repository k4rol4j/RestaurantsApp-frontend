import { Navigate, Outlet } from 'react-router-dom';
import { useIsLogged } from '../../hooks/useIsLogged';
import { Center, Loader } from '@mantine/core';

export default function RequireAuth() {
    const isLogged = useIsLogged();

    if (isLogged === undefined) {
        return (
            <Center h="100vh">
                <Loader />
            </Center>
        );
    }
    if (!isLogged) return <Navigate to="/login" replace />;
    return <Outlet />;
}
