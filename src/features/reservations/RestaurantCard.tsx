import { useEffect, useState } from "react";
import { Card, Text, Group, Badge, Button, ActionIcon, Box } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import SafeImage from "../../components/SafeImage";
import { Restaurant } from "./hooks/useMakeReservation";
import { getRestaurantReviews } from "./api/restaurants"; // ⬅️ importujemy, żeby pobrać opinie

interface Props {
    restaurant: Restaurant;
    isFavorite: boolean;
    onToggleFavorite: (id: number) => void;
}

export const RestaurantCard = ({ restaurant, isFavorite, onToggleFavorite }: Props) => {
    const images =
        typeof restaurant.imageGallery === "string" && restaurant.imageGallery.length > 0
            ? restaurant.imageGallery.split(",").map((url) => url.trim()).filter(Boolean)
            : [];

    // 🟡 Dodajemy stan na średnią ocen
    const [avgRating, setAvgRating] = useState<number | null>(null);

    // 🔄 Pobieramy opinie i liczymy średnią
    useEffect(() => {
        (async () => {
            try {
                const reviews = await getRestaurantReviews(restaurant.id);
                if (reviews.length > 0) {
                    const avg =
                        reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
                        reviews.length;
                    setAvgRating(Number(avg.toFixed(1)));
                } else {
                    setAvgRating(null);
                }
            } catch (err) {
                console.warn("Nie udało się pobrać opinii:", err);
            }
        })();
    }, [restaurant.id]);

    return (
        <Card shadow="sm" p="lg" radius="md" withBorder>
            {images.length > 0 ? (
                <Box mb="sm">
                    <Carousel
                        height={180}
                        withIndicators
                        loop
                        slideGap="md"
                        slideSize="100%"
                        align="start"
                        styles={{
                            indicator: { backgroundColor: "gray" },
                            control: { color: "black" },
                        }}
                    >
                        {images.map((url, index) => (
                            <Carousel.Slide key={index}>
                                <Box style={{ borderRadius: 8, overflow: "hidden" }}>
                                    <SafeImage
                                        src={url}
                                        alt={`${restaurant.name} ${index + 1}`}
                                        style={{ width: "100%", height: 180 }}
                                    />
                                </Box>
                            </Carousel.Slide>
                        ))}
                    </Carousel>
                </Box>
            ) : (
                <Box mb="sm" style={{ borderRadius: 8, overflow: "hidden" }}>
                    <SafeImage
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        style={{ width: "100%", height: 180 }}
                    />
                </Box>
            )}

            <Group justify="space-between" mt="md">
                <Text fw={700}>{restaurant.name}</Text>
                <ActionIcon
                    variant="transparent"
                    onClick={() => onToggleFavorite(restaurant.id)}
                >
                    {isFavorite ? <IconHeartFilled color="red" /> : <IconHeart color="gray" />}
                </ActionIcon>
            </Group>

            <Badge color="blue" variant="light">
                {restaurant.cuisines?.map(c => c.cuisine.name).join(", ")}
            </Badge>

            <Text size="sm" c="dimmed">
                {restaurant.address?.city ?? "Brak adresu"}
            </Text>

            {/* ⭐ Ocena – jeśli średnia istnieje */}
            {avgRating ? (
                <Text size="sm" mt="xs">
                    Ocena: {avgRating} ⭐
                </Text>
            ) : (
                <Text size="sm" mt="xs" c="dimmed">
                    Brak ocen
                </Text>
            )}

            <Link to={`/reservations/${restaurant.id}`}>
                <Button variant="light" color="blue" fullWidth mt="md" radius="md">
                    Zobacz szczegóły
                </Button>
            </Link>
        </Card>
    );
};
