import { API_URL } from "../../../config.ts";
import ky from "ky";

export const makeReservation = async ({
                                          restaurantId,
                                          date,
                                          time,
                                          people
                                      }: {
    restaurantId: number;
    date: string;
    time: string;
    people: number;
}) => {
    return ky.post(`${API_URL}/reservations`, {
        json: { restaurantId, date, time, people },
        credentials: "include",
    }).json();
};
