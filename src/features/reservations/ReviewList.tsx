import { Card, Text } from "@mantine/core";

type Review = {
    rating: number;
    comment: string;
    date: string;
};

type Props = {
    reviews: Review[];
    onReviewsUpdated?: () => Promise<void>;
};

export const ReviewList = ({ reviews, onReviewsUpdated }: Props) => {
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
