import { Navigate } from 'react-router-dom';
import { useIsLogged } from '../../hooks/useIsLogged';
import { LoginPage } from '../login/LoginPage';
import { Center, Loader } from '@mantine/core';

export default function RedirectIfAuthed() {
    const isLogged = useIsLogged();
    if (isLogged === undefined) return <Center h="100vh"><Loader /></Center>;
    if (isLogged) return <Navigate to="/reservations" replace />;
    return <LoginPage />;
}