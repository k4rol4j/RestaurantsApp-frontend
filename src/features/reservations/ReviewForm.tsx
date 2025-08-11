import { useState } from "react";
import {
    Box,
    Button,
    Notification,
    Select,
    Textarea,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import {API_URL} from "../../config.ts";


export const ReviewForm = ({
                               restaurantId,
                               reservationId,
                           }: {
    restaurantId: number;
    reservationId: number;
}) => {
    const [rating, setRating] = useState<string | null>(null);
    const [comment, setComment] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!rating) {
            setError("Wybierz ocenę");
            return;
        }
        if (comment.trim().length < 5) {
            setError("Komentarz musi mieć min. 5 znaków");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/restaurants/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    restaurantId,
                    reservationId,
                    rating: Number(rating),
                    comment: comment.trim(),
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Błąd dodawania opinii");
            }

            setSuccess(true);
            setError(null);
            setRating(null);
            setComment("");
        } catch (e: any) {
            setSuccess(false);
            setError(e.message || "Błąd dodawania opinii");
        }
    };

    return (
        <Box
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxWidth: 400,
                marginTop: 24,
            }}
        >
            <Select
                label="Ocena"
                placeholder="Wybierz ocenę"
                data={[
                    { value: "1", label: "1 - Bardzo źle" },
                    { value: "2", label: "2 - Słabo" },
                    { value: "3", label: "3 - Średnio" },
                    { value: "4", label: "4 - Dobrze" },
                    { value: "5", label: "5 - Świetnie" },
                ]}
                value={rating}
                onChange={setRating}
            />

            <Textarea
                label="Komentarz"
                placeholder="Napisz swoją opinię..."
                value={comment}
                onChange={(e) => setComment(e.currentTarget.value)}
                minRows={3}
            />

            <Button onClick={handleSubmit}>Dodaj opinię</Button>

            {success && (
                <Notification
                    icon={<IconCheck size="1.1rem" />}
                    color="teal"
                    title="Sukces"
                    onClose={() => setSuccess(false)}
                >
                    Opinia została zapisana!
                </Notification>
            )}

            {error && (
                <Notification
                    icon={<IconX size="1.1rem" />}
                    color="red"
                    title="Błąd"
                    onClose={() => setError(null)}
                >
                    {error}
                </Notification>
            )}
        </Box>
    );
};
