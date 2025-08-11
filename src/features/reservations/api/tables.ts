import ky from "ky";
import { API_URL } from "../../../config";

const api = ky.create({ credentials: "include" });

export type TableDto = {
    id: number;
    seats: number;
    name?: string | null;
    isActive: boolean;
    restaurantId: number;
};

export async function getFreeTables(params: {
    restaurantId: number;
    date: string;        // "YYYY-MM-DD"
    time: string;        // "HH:mm"
    durationMinutes: number;
}): Promise<TableDto[]> {
    const { restaurantId, date, time, durationMinutes } = params;
    const qs = new URLSearchParams({
        date,
        time,
        durationMinutes: String(durationMinutes),
    }).toString();

    return api
        .get(`${API_URL}/restaurants/${restaurantId}/tables/free?${qs}`)
        .json<TableDto[]>();
}
