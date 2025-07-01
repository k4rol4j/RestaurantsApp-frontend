import { API_URL } from "../../../config.ts";

export const login = async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            email: username,   // lub login: username jeśli backend tak oczekuje
            password: password,
        }),
    });
    if (!response.ok) throw new Error('Login failed.');
    return await response.text();
};
