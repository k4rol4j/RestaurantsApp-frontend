import { API_URL } from "../../../config.ts";
import ky from "ky";

export const getFavorites = async (): Promise<number[]> => {
    return ky
        .get(`${API_URL}/favorites`, { credentials: "include" })
        .json<{ restaurantId: number }[]>()
        .then((data) => data.map((fav) => fav.restaurantId));
};

export const toggleFavorite = async (
    restaurantId: number,
    isCurrentlyFavorite: boolean
): Promise<void> => {
    const method = isCurrentlyFavorite ? 'DELETE' : 'POST';

    return ky(`${API_URL}/favorites/${restaurantId}`, {
        method,
        credentials: "include",
    }).then(() => {});
};

