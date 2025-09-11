import { API_URL } from "../../../config";

export const login = async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
        credentials: 'include', // WAŻNE
    });
    if (!res.ok) throw new Error('Login failed');

    const data = await res.json(); // { message, access_token }
    return data;
};
