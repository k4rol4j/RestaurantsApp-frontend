import { Card, Text, Group, Badge, Button, ActionIcon, Image } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import { Restaurant } from "./hooks/useMakeReservation";
import "@mantine/carousel/styles.css";

interface Props {
    restaurant: Restaurant;
    isFavorite: boolean;
    onToggleFavorite: (id: number) => void;
}

export const RestaurantCard = ({ restaurant, isFavorite, onToggleFavorite }: Props) => {
    const images =
        typeof restaurant.imageGallery === "string" && restaurant.imageGallery.length > 0
            ? restaurant.imageGallery.split(",").map((url) => url.trim())
            : [];

    return (
        <Card shadow="sm" p="lg" radius="md" withBorder>
            {images.length > 0 ? (
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
                    mb="sm"
                >
                    {images.map((url, index) => (
                        <CarouselSlide key={index}>
                            <Image
                                src={url}
                                height={180}
                                fit="cover"
                                radius="md"
                                alt={`${restaurant.name} ${index + 1}`}
                            />
                        </CarouselSlide>
                    ))}
                </Carousel>
            ) : (
                <Image
                    src="https://via.placeholder.com/400x180?text=Brak+zdjęcia"
                    height={180}
                    fit="cover"
                    radius="md"
                    alt="Brak zdjęcia"
                    mb="sm"
                />
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
