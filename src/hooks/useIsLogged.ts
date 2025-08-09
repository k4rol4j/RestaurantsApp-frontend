import { useEffect, useState } from 'react';
import { API_URL } from '../config';

export const useIsLogged = (): boolean | undefined => {
    const [isLogged, setIsLogged] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        // Jeżeli dopiero co zalogowaliśmy się, pomijamy sprawdzanie
        if (sessionStorage.getItem('justLoggedIn') === '1') {
            sessionStorage.removeItem('justLoggedIn');
            setIsLogged(true);
            return;
        }

        fetch(`${API_URL}/auth/me`, {
            credentials: 'include',
            cache: 'no-store',
        })
            .then(res => setIsLogged(res.ok))
            .catch(() => setIsLogged(false));
    }, []);

    return isLogged;
};
