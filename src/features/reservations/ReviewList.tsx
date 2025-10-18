import { Card, Text } from "@mantine/core";

type Review = {
    rating: number;
    comment: string;
    date: string;
};

// 🧩 Bez nieużywanego propsa – czysto i bez ostrzeżeń
type Props = {
    reviews: Review[];
};

export const ReviewList = ({ reviews }: Props) => {
    return (
        <>
            {reviews.length === 0 ? (
                <Text c="dimmed">Brak opinii.</Text>
            ) : (
                reviews.map((r, i) => (
                    <Card key={i} withBorder mb="sm">
                        <Text>Ocena: {r.rating} ⭐</Text>
                        <Text>{r.comment}</Text>
                        <Text size="xs" c="dimmed">
                            {new Date(r.date).toLocaleDateString()}
                        </Text>
                    </Card>
                ))
            )}
        </>
    );
};
