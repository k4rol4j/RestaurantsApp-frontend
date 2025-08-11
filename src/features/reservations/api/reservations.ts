import ky from "ky";
import { API_URL } from "../../../config.ts";
import { RestaurantsType } from "../hooks/useMakeReservation.ts";

async function dataFrom(response: Response) {
    try {
        return await response.clone().json();
    } catch {
        try {
            return await response.text();
        } catch {
            return null;
        }
    }
}

function extractMessage(data: any, status: number) {
    if (!data) return `Błąd (${status})`;
    if (typeof data === "string") return data;
    const msg = Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message || data?.error;
    return msg || `Błąd (${status})`;
}

const api = ky.create({
    credentials: "include",
    hooks: {
        afterResponse: [
            async (_req, _opts, res) => {
                if (!res.ok) {
                    const data = await dataFrom(res);
                    const msg = extractMessage(data, res.status);
                    const err = new Error(msg) as any;
                    err.status = res.status;
                    throw err;
                }
            },
        ],
    },
});

//restauracje
export const listRestaurants = async () => {
    return api.get(`${API_URL}/restaurants`, { cache: "no-store" }).json<RestaurantsType>();
};

//rezerwacje
export const makeReservation = async ({
                                          restaurantId,
                                          date,
                                          time,
                                          people,
                                          durationMinutes,
                                      }: {
    restaurantId: number;
    date: string;
    time: string;
    people: number;
    durationMinutes: number;
}) => {
    return api
        .post(`${API_URL}/reservations`, {
            json: { restaurantId, date, time, people, durationMinutes },
        })
        .json();
};

export const getMyReservations = async () => {
    // Upewnij się, że ścieżka zgadza się z backendem: /reservations/my vs /reservations/mine
    return api.get(`${API_URL}/reservations/my`, { cache: "no-store" }).json();
};

export const deleteReservation = async (id: number) => {
    // używamy ky, dziedziczy credentials i obsługę błędów
    // backend może zwrócić { ok: true } lub 204 – oba będą OK
    const res = await api.delete(`${API_URL}/reservations/${id}`);
    try {
        return await res.json();
    } catch {
        return { ok: true };
    }
};
