import { FC, memo } from "react";
import { Card, Image, Text, Badge, ActionIcon, Group } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";

interface Restaurant {
    id: number;
    name: string;
    cuisine: string;
    imageUrl?: string;
}

interface RestaurantListItemProps {
    restaurant: Restaurant;
    isFavorite: boolean;
    onToggleFavorite: (id: number) => void;
}

export const RestaurantListItem: FC<RestaurantListItemProps> = memo(
    ({ restaurant, isFavorite, onToggleFavorite }) => {
        return (
            <Card shadow="sm" padding="md" radius="md" withBorder>
                <Card.Section>
                    {restaurant.imageUrl ? (
                        <Image src={restaurant.imageUrl} height={200} alt={restaurant.name} />
                    ) : (
                        <div style={{ height: 200, backgroundColor: "#f0f0f0" }}>No Image</div>
                    )}
                </Card.Section>

                <Group justify="space-between" mt="md">
                    <Text fw={500} size="lg">
                        {restaurant.name}
                    </Text>
                    <ActionIcon onClick={() => onToggleFavorite(restaurant.id)} variant="transparent">
                        {isFavorite ? <IconHeartFilled color="red" /> : <IconHeart color="gray" />}
                    </ActionIcon>
                </Group>

                <Text mt="xs" c="dimmed" size="sm">
                    {restaurant.cuisine}
                </Text>

                <Badge color="blue" variant="light" mt="md">
                    {restaurant.cuisine}
                </Badge>
            </Card>
        );
    }
);
