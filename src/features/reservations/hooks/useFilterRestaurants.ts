import { useState } from "react";
import { filterRestaurants } from "../api/restaurants";
import { Restaurant } from "../hooks/useMakeReservation.ts";

type Filters = {
    cuisine?: string[];
    minRating?: number;
    availableDate?: string;
};

export const useFilterRestaurants = () => {
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [filters, setFilters] = useState<Filters>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const applyFilters = async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await filterRestaurants(filters);
            setFilteredRestaurants(results);
        } catch (err) {
            setError("Nie udało się pobrać restauracji.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        filteredRestaurants,
        setFilters,
        applyFilters,
        loading,
        error,
    };
};
