import { Card, Text, Group, Badge, Button, ActionIcon, Box } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import SafeImage from "../../components/SafeImage";
import { Restaurant } from "./hooks/useMakeReservation";

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
                <ActionIcon variant="transparent" onClick={() => onToggleFavorite(restaurant.id)}>
                    {isFavorite ? <IconHeartFilled color="red" /> : <IconHeart color="gray" />}
                </ActionIcon>
            </Group>

            <Badge color="blue" variant="light">{restaurant.cuisine}</Badge>
            <Text size="sm" c="dimmed">{restaurant.location}</Text>
            <Text size="sm" mt="xs">Ocena: {restaurant.rating} ⭐</Text>

            <Link to={`/reservations/${restaurant.id}`}>
                <Button variant="light" color="blue" fullWidth mt="md" radius="md">
                    Zobacz szczegóły
                </Button>
            </Link>
        </Card>
    );
};