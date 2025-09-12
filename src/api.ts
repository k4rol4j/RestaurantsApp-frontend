import axios from 'axios';

// Upewnij się, że to jest pełny HTTPS URL, np.
// VITE_API_URL=https://restaurantsapp-backend.onrender.com/api
const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // cookies always
});

// helper do Basic (obsługa nie-ASCII)
const toBasic = (email: string, password: string) =>
    'Basic ' + btoa(unescape(encodeURIComponent(`${email}:${password}`)));

// --- AUTH
export async function login(email: string, password: string) {
    await api.post('/auth/login', null, {
        headers: { Authorization: toBasic(email, password) },
    });
    return me();
}

export const me = () => api.get('/auth/me').then(r => r.data);
export const logout = () => api.post('/auth/logout').then(r => r.data);

// --- OWNER PANEL
export const getProfile = (rid: number) =>
    api.get(`/restaurants/${rid}/panel/profile`).then(r => r.data);

export const updateProfile = (rid: number, dto: any) =>
    api.patch(`/restaurants/${rid}/panel/profile`, dto).then(r => r.data);

export const listTables = (rid: number) =>
    api.get(`/restaurants/${rid}/panel/tables`).then(r => r.data);

export const createTable = (rid: number, dto: { name?: string; seats: number; isActive?: boolean }) =>
    api.post(`/restaurants/${rid}/panel/tables`, dto).then(r => r.data);

export const updateTable = (rid: number, tableId: number, dto: any) =>
    api.patch(`/restaurants/${rid}/panel/tables/${tableId}`, dto).then(r => r.data);

export const listReservations = (
    rid: number,
    params?: { date?: string; status?: 'PENDING'|'CONFIRMED'|'REJECTED'|'CANCELLED' }
) => api.get(`/restaurants/${rid}/panel/reservations`, { params }).then(r => r.data);

export const setReservationStatus = (
    rid: number, reservationId: number, status: 'PENDING'|'CONFIRMED'|'REJECTED'|'CANCELLED'
) => api.patch(`/restaurants/${rid}/panel/reservations/${reservationId}/status`, { status }).then(r => r.data);

export const assignTable = (rid: number, reservationId: number, tableId: number) =>
    api.post(`/restaurants/${rid}/panel/reservations/${reservationId}/assign-table`, { tableId }).then(r => r.data);

export const unassignTable = (rid: number, reservationId: number, tableId: number) =>
    api.post(`/restaurants/${rid}/panel/reservations/${reservationId}/unassign-table`, { tableId }).then(r => r.data);

export const getDashboard = (rid: number) =>
    api.get(`/restaurants/${rid}/panel/dashboard`).then(r => r.data);

export const myRestaurants = () =>
    api.get('/restaurants/my').then(r => r.data as { id: number; name: string }[]);
