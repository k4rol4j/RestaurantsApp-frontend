import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export const useIsLogged = (): boolean | undefined => {
    const [isLogged, setIsLogged] = useState<boolean|undefined>(undefined);

    useEffect(() => {
        fetch(`${API_URL}/auth/me`, {
            credentials: 'include',
        })
            .then(res => setIsLogged(res.ok))
            .catch(() => setIsLogged(false));
    }, []);

    return isLogged;
};
