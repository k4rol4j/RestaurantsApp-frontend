// src/features/reservations/MakeReservation.tsx
import { useEffect, useState } from "react";
import { Card, Stack, Title, Text, Group, Button, Select, NumberInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    listRestaurants,
    makeReservation,
    type RestaurantLite,
} from "./api/reservations";
import {DateInput} from "@mantine/dates";

export default function MakeReservation() {
    const [restaurants, setRestaurants] = useState<RestaurantLite[]>([]);
    const [restaurantId, setRestaurantId] = useState<number | null>(null);
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<string>("18:00");
    const [people, setPeople] = useState<number>(2);
    const [submitting, setSubmitting] = useState(false);

    // wczytaj listę restauracji
    useEffect(() => {
        (async () => {
            try {
                const data = await listRestaurants();
                setRestaurants(data); // <- RestaurantLite[]
            } catch (e) {
                console.error(e);
                notifications.show({
                    color: "red",
                    title: "Błąd",
                    message: "Nie udało się pobrać restauracji",
                });
            }
        })();
    }, []);

    const options = restaurants.map((r) => ({
        value: String(r.id),
        label: `${r.name} — ${r.location} (${r.cuisine})`,
    }));

    const onSubmit = async () => {
        if (!restaurantId || !date || !time || !people) {
            notifications.show({
                color: "yellow",
                title: "Uzupełnij dane",
                message: "Wybierz restaurację, datę, godzinę i liczbę osób.",
            });
            return;
        }
        setSubmitting(true);
        try {
            await makeReservation({
                restaurantId,
                date: date.toISOString(), // backend i tak normalizuje startAt
                time,
                people,
            });
            notifications.show({
                color: "green",
                title: "Sukces",
                message: "Rezerwacja utworzona jako PENDING.",
            });
        } catch (e: unknown) {
            console.error(e);
            notifications.show({
                color: "red",
                title: "Błąd",
                message: "Nie udało się utworzyć rezerwacji.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Stack>
            <Title order={2}>Zrób rezerwację</Title>
            <Card withBorder>
                <Stack>
                    <Select
                        label="Restauracja"
                        placeholder="Wybierz restaurację"
                        data={options}
                        searchable
                        value={restaurantId ? String(restaurantId) : null}
                        onChange={(v) => setRestaurantId(v ? Number(v) : null)}
                    />
                    <Group grow>
                        <DateInput
                            label="Data"
                            placeholder="Wybierz datę"
                            value={date}
                            onChange={(d) => setDate(d)}
                        />
                        <Select
                            label="Godzina"
                            value={time}
                            onChange={(v) => setTime(v || "18:00")}
                            data={[
                                "12:00","12:30","13:00","13:30","14:00",
                                "17:00","17:30","18:00","18:30","19:00","19:30","20:00",
                            ]}
                        />
                        <NumberInput
                            label="Osoby"
                            min={1}
                            max={12}
                            value={people}
                            onChange={(v) => setPeople(Number(v) || 1)}
                        />
                    </Group>
                    <Button onClick={onSubmit} loading={submitting}>
                        Zarezerwuj
                    </Button>
                    <Text size="sm" c="dimmed">
                        Rezerwacja zostanie utworzona ze statusem <b>PENDING</b>. Właściciel ją
                        potwierdzi lub odrzuci. Możesz anulować rezerwację dopóki ma status PENDING.
                    </Text>
                </Stack>
            </Card>
        </Stack>
    );
}
