import { useEffect, useState } from "react";
import {
    Card, Text, Badge, Stack, Title, Group, Divider, Button, Rating, Textarea,
} from "@mantine/core";
import { getMyReservations } from "./api/reservations";
import { addReview } from "./api/restaurants";

type ReservationTable = {
    table: { id: number; name: string | null; seats: number };
};

interface Reservation {
    id: number;
    date: string;
    time: string;
    people: number;
    review?: { id: number };
    restaurant: { id: number; name: string; location: string; cuisine: string };
    tables?: ReservationTable[]; // 👈 stoliki dołączone z backendu
}

const formatTables = (tables?: ReservationTable[]) => {
    if (!tables || tables.length === 0) return "—";
    // zliczamy po liczbie miejsc
    const counts = tables.reduce<Record<number, number>>((acc, t) => {
        const s = t.table.seats;
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});
    const parts = Object.entries(counts)
        .sort((a, b) => Number(b[0]) - Number(a[0])) // 6,4,2,1...
        .map(([seats, qty]) => `${qty}×${seats}-os.`);

    // nazwy stolików w nawiasie, jeśli są
    const names = tables
        .map((t) => t.table.name)
        .filter(Boolean)
        .join(", ");

    return names ? `${parts.join(", ")} (${names})` : parts.join(", ");
};

export const MyReservations = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [reviewingId, setReviewingId] = useState<number | null>(null);

    const now = new Date();

    const formatDate = (isoDate: string) =>
        new Date(isoDate).toLocaleDateString("pl-PL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

    const fetchReservations = async () => {
        try {
            const data = await getMyReservations();
            setReservations(data as Reservation[]);
        } catch (err) {
            console.error("Błąd pobierania rezerwacji", err);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const upcoming = reservations.filter((r) => new Date(r.date) >= now);
    const past = reservations.filter((r) => new Date(r.date) < now);

    const handleAddReview = async (reservationId: number, restaurantId: number) => {
        if (!rating || !comment.trim()) return;
        try {
            await addReview({ reservationId, restaurantId, rating, comment });
            setComment("");
            setRating(0);
            setReviewingId(null);
            await fetchReservations();
        } catch (e) {
            console.error("Błąd dodawania opinii", e);
        }
    };

    return (
        <Stack>
            <Title order={2}>Moje Rezerwacje</Title>

            <Divider label="Nadchodzące" labelPosition="center" />

            {upcoming.length === 0 ? (
                <Text>Brak nadchodzących rezerwacji.</Text>
            ) : (
                upcoming.map((res) => (
                    <Card key={res.id} withBorder shadow="sm">
                        <Group justify="space-between">
                            <Text fw={700}>{res.restaurant.name}</Text>
                            <Badge>{res.restaurant.cuisine}</Badge>
                        </Group>
                        <Text size="sm" c="dimmed">
                            {res.restaurant.location}
                        </Text>
                        <Text size="sm">
                            {formatDate(res.date)} o {res.time} — {res.people} osób
                        </Text>
                        <Text size="sm" mt={4} c="dimmed">
                            Stoliki: {formatTables(res.tables)}
                        </Text>
                    </Card>
                ))
            )}

            <Divider label="Historia" labelPosition="center" mt="lg" />

            {past.length === 0 ? (
                <Text>Brak przeszłych rezerwacji.</Text>
            ) : (
                past.map((res) => (
                    <Card key={res.id} withBorder shadow="xs">
                        <Group justify="space-between">
                            <Text fw={700}>{res.restaurant.name}</Text>
                            <Badge color="gray">{res.restaurant.cuisine}</Badge>
                        </Group>
                        <Text size="sm" c="dimmed">
                            {res.restaurant.location}
                        </Text>
                        <Text size="sm">
                            {formatDate(res.date)} o {res.time} — {res.people} osób
                        </Text>
                        <Text size="sm" mt={4} c="dimmed">
                            Stoliki: {formatTables(res.tables)}
                        </Text>

                        {res.review ? (
                            <Text mt="sm" size="sm" c="green">
                                Opinia została już dodana
                            </Text>
                        ) : reviewingId === res.id ? (
                            <Stack mt="sm">
                                <Rating value={rating} onChange={setRating} />
                                <Textarea
                                    placeholder="Dodaj komentarz"
                                    value={comment}
                                    onChange={(e) => setComment(e.currentTarget.value)}
                                />
                                <Group>
                                    <Button onClick={() => handleAddReview(res.id, res.restaurant.id)}>
                                        Dodaj opinię
                                    </Button>
                                    <Button variant="default" onClick={() => setReviewingId(null)}>
                                        Anuluj
                                    </Button>
                                </Group>
                            </Stack>
                        ) : (
                            <Button mt="sm" onClick={() => setReviewingId(res.id)}>
                                Dodaj opinię
                            </Button>
                        )}
                    </Card>
                ))
            )}
        </Stack>
    );
};
