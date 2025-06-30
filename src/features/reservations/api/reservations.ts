import { API_URL } from "../../../config.ts";
import { RestaurantsType } from "../hooks/useMakeReservation.ts";
import ky from "ky";

// Lista restauracji
export const listRestaurants = async () => {
    return ky.get(`${API_URL}/restaurants`, { credentials: "include" }).json<RestaurantsType>();
};

//Tworzenie rezerwacji
export const makeReservation = async ({
                                          restaurantId,
                                          date,
                                          time,
                                          people,
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

//Pobieranie rezerwacji zalogowanego użytkownika
export const getMyReservations = async () => {
    return ky.get(`${API_URL}/reservations/my`, {
        credentials: "include",
    }).json();
};
