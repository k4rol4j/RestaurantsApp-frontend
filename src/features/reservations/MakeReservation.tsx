import { Box, Title, TextInput, NumberInput, Group, Button, Stack, Notification, Card, Text, Badge, rem } from "@mantine/core";
import {Restaurant, useMakeReservation} from "./hooks/useMakeReservation.ts";
import { useEffect, useState } from "react";
import { listRestaurants } from "./api/reservations.ts"; // Wczytaj funkcję listRestaurants

export const MakeReservation = () => {
    const {
        formData,
        setFormData,
        selectedRestaurant,
        setSelectedRestaurant,
        error,
        setError,
        submitted,
        setSubmitted,
        handleSubmit,
    } = useMakeReservation();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

    // Wykonaj zapytanie do API, aby pobrać restauracje
    useEffect(() => {
        listRestaurants()
            .then((response) => setRestaurants(response)) // Pobierz restauracje
            .catch((error) => console.error("Błąd podczas ładowania restauracji", error));
    }, []); // Pusty array oznacza, że efekt wykona się tylko raz przy załadowaniu komponentu

    return (
        <Box w={rem(400)} mx="auto" p="lg">
            <Title order={2} mb="lg">
                Dokonaj rezerwacji
            </Title>
            {submitted ? (
                <Notification color="teal" title="Rezerwacja potwierdzona" withCloseButton onClose={() => setSubmitted(false)}>
                    Twoja rezerwacja dla {formData.guests} gości w {selectedRestaurant?.name} jest potwierdzona na {formData.date}.
                </Notification>
            ) : (
                <>
                    <TextInput
                        label="Imię"
                        placeholder="Twoje imię"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        mb="sm"
                    />
                    <TextInput
                        label="Data"
                        placeholder="Wybierz datę"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        mb="sm"
                    />
                    <NumberInput
                        label="Liczba gości"
                        placeholder="1"
                        value={formData.guests}
                        onChange={(value: string | number) => setFormData({ ...formData, guests: typeof value === "number" ? value : 1 })}
                        min={1}
                        mb="sm"
                    />
                    <div>
                        <Title order={3} mt="md">Wybierz restaurację:</Title>
                        <Stack gap={rem(8)}>
                            {restaurants.map((restaurant) => (
                                <Card
                                    key={restaurant.id}
                                    shadow="sm"
                                    p="md"
                                    radius="md"
                                    withBorder
                                    onClick={() => {
                                        setFormData({ ...formData, restaurantId: restaurant.id });
                                        setSelectedRestaurant(restaurant);
                                    }}
                                    style={{
                                        cursor: "pointer",
                                        backgroundColor: formData.restaurantId === restaurant.id ? "#e0f7fa" : "white"
                                    }}
                                >
                                    <Group justify="space-between">
                                        <Text fw={700}>{restaurant.name}</Text>
                                        <Badge color="blue" variant="light">
                                            {restaurant.cuisine}
                                        </Badge>
                                    </Group>
                                </Card>
                            ))}
                        </Stack>
                    </div>
                    {error && (
                        <Notification color="red" title="Błąd" withCloseButton onClose={() => setError(null)}>
                            {error}
                        </Notification>
                    )}
                    <Group justify="space-between" mt="lg">
                        <Button variant="default" onClick={() => setFormData({ name: "", guests: 1, date: "", restaurantId: null , durationMinutes: 90})}>
                            Reset
                        </Button>
                        <Button onClick={handleSubmit}>Rezerwuj</Button>
                    </Group>
                </>
            )}
        </Box>
    );
};
