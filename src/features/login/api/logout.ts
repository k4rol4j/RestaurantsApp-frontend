import { API_URL } from '../../../config.ts';

export const logout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
};
