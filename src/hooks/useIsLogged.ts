import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export const useIsLogged = (): boolean | undefined => {
    const [isLogged, setIsLogged] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();

        const probe = async (retried = false) => {
            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    credentials: 'include',
                    signal: controller.signal,
                });

                if (cancelled) return;

                if (res.ok) {
                    setIsLogged(true);
                } else if (!retried) {
                    setTimeout(() => probe(true), 250);
                } else {
                    setIsLogged(false);
                }
            } catch {
                if (!cancelled) setIsLogged(false);
            }
        };

        probe();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, []);

    return isLogged;
};
