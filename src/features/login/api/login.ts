import { API_URL } from "../../../config";

export const login = async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // WAŻNE
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
        body: JSON.stringify({})
    });
    if (!res.ok) throw new Error('Login failed');

    const data = await res.json(); // { message, access_token }
    return data;
};
