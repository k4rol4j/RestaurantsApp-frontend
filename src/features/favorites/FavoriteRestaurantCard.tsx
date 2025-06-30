import { Card, Text, Group, Badge, Button } from "@mantine/core";
import { Link } from "react-router-dom";

interface FavoriteRestaurantCardProps {
    id: number;
    name: string;
    location: string;
    cuisine: string;
}

export const FavoriteRestaurantCard = ({
                                           id,
                                           name,
                                           location,
                                           cuisine,
                                       }: FavoriteRestaurantCardProps) => {
    return (
        <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group justify="space-between" mt="md">
                <Text fw={700}>{name}</Text>
                <Badge color="blue" variant="light">
                    {cuisine}
                </Badge>
            </Group>
            <Text size="sm" c="dimmed">
                {location}
            </Text>
            <Link to={`/reservations/${id}`}>
                <Button variant="light" color="blue" fullWidth mt="md" radius="md">
                    Zobacz szczegóły
                </Button>
            </Link>
        </Card>
    );
};
