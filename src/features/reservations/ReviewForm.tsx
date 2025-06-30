import {
    Button,
    Card,
    Rating,
    Stack,
    Text,
    Textarea,
    Group,
} from "@mantine/core";
import { useState } from "react";
import { addReview } from "./api/restaurants";

interface ReviewFormProps {
    restaurantId: number;
    onSubmit?: () => void;
    onCancel?: () => void;
}

export const ReviewForm = ({
                               restaurantId,
                               onSubmit,
                               onCancel,
                           }: ReviewFormProps) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const handleSubmit = async () => {
        if (rating === 0 || comment.trim() === "") return;

        try {
            await addReview({ restaurantId, rating, comment });
            setRating(0);
            setComment("");
            if (onSubmit) onSubmit(); // odświeżenie listy
        } catch (e) {
            console.error("Błąd przy dodawaniu opinii", e);
        }
    };

    return (
        <Card withBorder p="md" mt="md">
            <Stack>
                <Text fw={700}>Dodaj swoją opinię</Text>
                <Rating value={rating} onChange={setRating} />
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.currentTarget.value)}
                    placeholder="Napisz swoją opinię..."
                />
                <Group justify="flex-end">
                    <Button variant="default" onClick={onCancel}>
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || comment.trim() === ""}
                    >
                        Dodaj opinię
                    </Button>
                </Group>
            </Stack>
        </Card>
    );
};
