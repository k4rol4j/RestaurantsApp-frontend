import { useEffect, useState } from "react";
import { Title, Text, Loader, SimpleGrid } from "@mantine/core";
import {FavoriteRestaurantCard} from "../favorites/FavoriteRestaurantCard.tsx";
import {API_URL} from "../../config.ts";

interface Favorite {
    restaurant: {
        id: number;
        name: string;
        location: string;
        cuisine: string;
    };
}

export const Favorites = () => {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/favorites`, {
                credentials: "include",
            });
            const data = await res.json();
            setFavorites(data);
        } catch (err) {
            console.error("Błąd pobierania ulubionych restauracji:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title order={2} mb="lg">Ulubione restauracje</Title>

            {loading ? (
                <Loader />
            ) : favorites.length === 0 ? (
                <Text>Brak ulubionych restauracji.</Text>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {favorites.map((fav) => (
                        <FavoriteRestaurantCard
                            key={fav.restaurant.id}
                            id={fav.restaurant.id}
                            name={fav.restaurant.name}
                            location={fav.restaurant.location}
                            cuisine={fav.restaurant.cuisine}
                        />
                    ))}
                </SimpleGrid>
            )}
        </div>
    );
};
