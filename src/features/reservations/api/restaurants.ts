import {API_URL} from "../../../config.ts";
import {Restaurant} from "../hooks/useMakeReservation.ts";
import ky from "ky";

interface FilterParams {
    cuisine?: string[];
    location?: string;
    name?: string;
    minRating?: number;
    maxRating?: number;
    availableDate?: string;
}

export const searchRestaurants = async (filters: {
    cuisine?: string[];
    name?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
}): Promise<Restaurant[]> => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.cuisine && Array.isArray(filters.cuisine)) {
            filters.cuisine.forEach(c => queryParams.append('cuisine', c));
        }

        const trimmedName = typeof filters.name === 'string' ? filters.name.trim() : '';
        if (trimmedName) queryParams.append('name', trimmedName);

        if (filters.location) queryParams.append('location', filters.location);
        if (typeof filters.latitude === 'number') queryParams.append('latitude', String(filters.latitude));
        if (typeof filters.longitude === 'number') queryParams.append('longitude', String(filters.longitude));
        if (typeof filters.radius === 'number') queryParams.append('radius', String(filters.radius));

        const qs = queryParams.toString(); 
        const response = await fetch(`${API_URL}/restaurants/search?${qs}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Błąd podczas wyszukiwania restauracji:', error);
        throw error;
    }
};

export const getRestaurantById = async (id: number): Promise<Restaurant> => {
    const res = await fetch(`${API_URL}/restaurants/${id}`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Nie udało się pobrać danych restauracji.");
    }

    return await res.json();
};


export const getRestaurantReviews = async (id: number): Promise<{ rating: number; comment: string; date: string }[]> => {
    const res = await fetch(`${API_URL}/restaurants/reviews/${id}`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Błąd pobierania recenzji");
    }

    return await res.json();
};

export const addReview = async ({
                                    restaurantId,
                                    reservationId,
                                    rating,
                                    comment,
                                }: {
    restaurantId: number;
    reservationId: number;
    rating: number;
    comment: string;
}) => {
    return ky.post(`${API_URL}/restaurants/reviews`, {
        json: { restaurantId, reservationId, rating, comment },
        credentials: "include",
    }).json();
};


export const filterRestaurants = async (filters: FilterParams): Promise<Restaurant[]> => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.cuisine && Array.isArray(filters.cuisine)) {
            filters.cuisine.forEach(c => queryParams.append('cuisine', c));
        }
        if (filters.minRating) queryParams.append('minRating', String(filters.minRating));
        if (filters.maxRating) queryParams.append('maxRating', String(filters.maxRating));

        const response = await fetch(`${API_URL}/restaurants/filter?${queryParams}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return await response.json();
    } catch (error) {
        console.error('Błąd filtrowania restauracji:', error);
        throw error;
    }
};

export const getNearbyRestaurants = async ({
    latitude,
    longitude,
    radius,
    }: {
    latitude: number;
    longitude: number;
    radius: number;
}): Promise<Restaurant[]> => {
    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
    });

    const response = await fetch(`${API_URL}/restaurants/nearby?${params.toString()}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Błąd pobierania restauracji w pobliżu.");
    }

    return await response.json();
};

