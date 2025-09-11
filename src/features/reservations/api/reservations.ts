import { api } from '../../../api';

/** Spójny typ rezerwacji do frontu */
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

/**
 * Zwraca ZAWSZE tablicę rezerwacji.
 * Backend może zwracać {items: [...] } albo samą tablicę — normalizujemy tutaj.
 */
export async function getMyReservations(): Promise<Reservation[]> {
    const res = await api.get('/reservations/my');
    const data = res.data;
    if (Array.isArray(data)) return data as Reservation[];
    if (data && Array.isArray(data.items)) return data.items as Reservation[];
    return [];
}

/** Miękkie anulowanie własnej rezerwacji (tylko PENDING) */
export async function cancelMyReservation(id: number): Promise<{ id: number; status: ReservationStatus } | any> {
    const res = await api.patch(`/reservations/${id}/cancel`);
    return res.data;
}

/** Alias zgodności wstecznej – jeśli gdzieś było deleteReservation, użyje PATCH */
export const deleteReservation = cancelMyReservation;
