import { useEffect, useRef, useState } from 'react';
import { API_URL } from '../config';

export const useIsLogged = (): boolean | undefined => {
    const [isLogged, setIsLogged] = useState<boolean | undefined>(undefined);
    const abortRef = useRef<AbortController | null>(null);
    const inFlight = useRef(false);

    useEffect(() => {
        let cancelled = false;
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const tries = [0, 200, 400, 800, 1200]; // 5 prób, ~2.6s max
        const run = async () => {
            if (inFlight.current) return;
            inFlight.current = true;

            for (let i = 0; i < tries.length; i++) {
                if (cancelled) return;
                if (tries[i]) await new Promise(r => setTimeout(r, tries[i]));

                try {
                    const res = await fetch(`${API_URL}/auth/me`, {
                        credentials: 'include',
                        signal: abortRef.current?.signal,
                        cache: 'no-store',
                    });
                    if (cancelled) return;

                    if (res.ok) {
                        setIsLogged(true);
                        inFlight.current = false;
                        return;
                    }
                } catch {
                    if (cancelled) return;
                }
            }
            if (!cancelled) setIsLogged(false);
            inFlight.current = false;
        };
        setIsLogged(undefined);
        run();

        return () => {
            cancelled = true;
            abortRef.current?.abort();
        };
    }, []);

    return isLogged;
};
