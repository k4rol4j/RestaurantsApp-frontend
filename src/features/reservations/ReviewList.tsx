import { Card, Text } from "@mantine/core";

export const ReviewList = ({
                               reviews,
                           }: {
    reviews: { rating: number; comment: string; date: string }[];
}) => {
    return (
        <>
            {reviews.map((r, i) => (
                <Card key={i} withBorder mb="sm">
                    <Text>Ocena: {r.rating} ⭐</Text>
                    <Text>{r.comment}</Text>
                    <Text size="xs" c="dimmed">
                        {new Date(r.date).toLocaleDateString()}
                    </Text>
                </Card>
            ))}
        </>
    );
};
