import { api } from '../../../api';

/** ===== Typy wspólne do frontu ===== */
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

export type ReservationTable = {
    table: { id: number; name: string | null; seats: number };
};

export type Reservation = {
    id: number;
    date: string;      // ISO
    time: string;      // "HH:mm"
    people: number;
    status: ReservationStatus;
    review?: { id: number } | null;
    restaurant: { id: number; name: string; location: string; cuisine: string };
    tables?: ReservationTable[];
};

export type RestaurantLite = {
    id: number;
    name: string;
    location: string;
    cuisine: string;
    rating: number;
};

/** ====== LISTA RESTAURACJI (front potrzebuje) ====== */
export async function listRestaurants(params?: {
    q?: string;
    location?: string;
    cuisine?: string;
    skip?: number;
    take?: number;
}): Promise<RestaurantLite[]> {
    const res = await api.get('/restaurants', { params });
    const data = res.data;
    // backend zwykle zwraca { items, total }
    if (data && Array.isArray(data.items)) return data.items as RestaurantLite[];
    // lub samą tablicę
    if (Array.isArray(data)) return data as RestaurantLite[];
    return [];
}

/** ====== SZCZEGÓŁY RESTAURACJI (opcjonalnie) ====== */
export async function getRestaurant(id: number): Promise<RestaurantLite & { description?: string }> {
    const res = await api.get(`/restaurants/${id}`);
    return res.data;
}

/** ====== UTWORZENIE REZERWACJI ======
 *  Backend (service) oczekuje: restaurantId, date (ISO), time ("HH:mm"), people, opcj. durationMinutes
 */
export async function makeReservation(dto: {
    restaurantId: number;
    date: string;           // ISO date 'YYYY-MM-DD' lub pełny ISO — po stronie serwera i tak składamy startAt
    time: string;           // "HH:mm"
    people: number;
    durationMinutes?: number;
}): Promise<Reservation> {
    const res = await api.post('/reservations', dto);
    return res.data as Reservation;
}

/** ====== MOJE REZERWACJE ====== */
export async function getMyReservations(): Promise<Reservation[]> {
    const res = await api.get('/reservations/my');
    const data = res.data;
    if (Array.isArray(data)) return data as Reservation[];
    if (data && Array.isArray(data.items)) return data.items as Reservation[];
    return [];
}

/** ====== ANULOWANIE WŁASNEJ REZERWACJI (soft: status -> CANCELLED) ====== */
export async function cancelMyReservation(id: number): Promise<{ id: number; status: ReservationStatus } | any> {
    const res = await api.patch(`/reservations/${id}/cancel`);
    return res.data;
}

/** Alias dla zgodności – jeśli gdzieś było deleteReservation, wywoła PATCH */
export const deleteReservation = cancelMyReservation;
