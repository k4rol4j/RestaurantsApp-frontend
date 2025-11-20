// RestaurantSearchByLocation.tsx
import {useState } from "react";
import {
    Slider,
    Button,
    Stack,
    Text,
    Title,
    Card,
    Group,
    Badge,
    Alert,
    Loader,
} from "@mantine/core";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
    Circle,
} from "react-leaflet";
import { getNearbyRestaurants } from "./api/restaurants";
import { Restaurant as BaseRestaurant } from "./hooks/useMakeReservation";

interface Location {
    lat: number;
    lng: number;
}

// Rozszerzamy typ Restaurant o nowe pola z backendu
type RestaurantWithLocation = BaseRestaurant & {
    address?: {
        city: string;
        district?: string | null;
        street?: string | null;
        streetNumber?: string | null;
        latitude: number;
        longitude: number;
    } | null;
    cuisines?: { cuisine: { id: number; name: string } }[];
};

/**
 * Komponent nasłuchuje kliknięć na mapie i zwraca nowe współrzędne.
 */
function LocationSelector({ onChange }: { onChange: (loc: Location) => void }) {
    useMapEvents({
        click(e) {
            onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

export const RestaurantSearchByLocation = () => {
    const [location, setLocation] = useState<Location>({
        lat: 50.0647, // Kraków
        lng: 19.945,
    });
    const [radius, setRadius] = useState(5); // km
    const [results, setResults] = useState<RestaurantWithLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getNearbyRestaurants({
                latitude: location.lat,
                longitude: location.lng,
                radius: radius,
            });

            // zakładamy, że backend zwraca już address + cuisines
            setResults(res as RestaurantWithLocation[]);
        } catch (e) {
            console.error("Błąd podczas pobierania restauracji:", e);
            setError("Nie udało się pobrać restauracji. Spróbuj ponownie.");
        } finally {
            setLoading(false);
        }
    };

    // Opcjonalnie: automatyczne wyszukiwanie przy zmianie promienia / lokalizacji
    // useEffect(() => {
    //   handleSearch();
    // }, [location, radius]);

    const formatCuisines = (r: RestaurantWithLocation) =>
        r.cuisines && r.cuisines.length
            ? r.cuisines.map((c) => c.cuisine.name).join(", ")
            : "Brak danych o kuchni";

    const formatAddressLine = (r: RestaurantWithLocation) => {
        if (!r.address) return "Brak danych o lokalizacji";

        const { city, district, street, streetNumber } = r.address;
        const parts = [
            city,
            district || undefined,
            [street, streetNumber].filter(Boolean).join(" ") || undefined,
        ].filter(Boolean);

        return parts.join(" • ");
    };

    return (
        <Stack gap="md">
            <Title order={2}>Wyszukiwanie po lokalizacji</Title>

            <Text c="dimmed" size="sm">
                Kliknij na mapie, aby ustawić punkt startowy. Następnie wybierz zasięg
                w kilometrach i wyszukaj restauracje w okolicy.
            </Text>

            <MapContainer
                center={[location.lat, location.lng]}
                zoom={13}
                scrollWheelZoom
                style={{ height: "350px", width: "100%", borderRadius: "12px" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Zaznaczony punkt użytkownika */}
                <Marker position={[location.lat, location.lng]}>
                    <Popup>Wybrana lokalizacja</Popup>
                </Marker>

                {/* Okrąg promienia (Leaflet używa metrów) */}
                <Circle
                    center={[location.lat, location.lng]}
                    radius={radius * 1000}
                    pathOptions={{ fillOpacity: 0.1 }}
                />

                {/* Markery restauracji */}
                {results.map(
                    (r) =>
                        r.address && (
                            <Marker
                                key={r.id}
                                position={[r.address.latitude, r.address.longitude]}
                            >
                                <Popup>
                                    <b>{r.name}</b>
                                    <br />
                                    {formatAddressLine(r)}
                                    <br />
                                    {formatCuisines(r)}
                                </Popup>
                            </Marker>
                        ),
                )}

                {/* Komponent nasłuchujący kliknięć */}
                <LocationSelector onChange={setLocation} />
            </MapContainer>

            <Stack gap="xs">
                <Group justify="space-between" align="center">
                    <Text>Zasięg wyszukiwania: {radius} km</Text>
                    <Text c="dimmed" size="xs">
                        Kliknij na mapie, aby zmienić punkt odniesienia
                    </Text>
                </Group>
                <Slider
                    value={radius}
                    onChange={setRadius}
                    min={1}
                    max={20}
                    step={1}
                    marks={[
                        { value: 1, label: "1 km" },
                        { value: 5, label: "5 km" },
                        { value: 10, label: "10 km" },
                        { value: 20, label: "20 km" },
                    ]}
                />
            </Stack>

            <Group justify="flex-start">
                <Button onClick={handleSearch} disabled={loading}>
                    {loading ? "Szukam..." : "Szukaj"}
                </Button>
                {results.length > 0 && (
                    <Badge color="green" variant="light">
                        Znaleziono: {results.length}
                    </Badge>
                )}
            </Group>

            {error && (
                <Alert color="red" variant="light">
                    {error}
                </Alert>
            )}

            {loading && (
                <Group justify="center" mt="md">
                    <Loader />
                </Group>
            )}

            {!loading && results.length === 0 && !error && (
                <Text c="dimmed" size="sm">
                    Brak wyników. Zmień lokalizację na mapie lub zwiększ promień
                    wyszukiwania.
                </Text>
            )}

            {/* Lista wyników poniżej mapy */}
            {!loading &&
                results.map((r) => (
                    <Card key={r.id} shadow="sm" radius="md" withBorder>
                        <Group justify="space-between" align="flex-start" mb="xs">
                            <div>
                                <Title order={4}>{r.name}</Title>
                                <Text size="sm" c="dimmed">
                                    {formatAddressLine(r)}
                                </Text>
                            </div>
                            <Badge color="yellow" variant="light">
                                ⭐ {r.rating?.toFixed ? r.rating.toFixed(1) : r.rating ?? "–"}
                            </Badge>
                        </Group>

                        <Text size="sm" mt="xs">
                            {formatCuisines(r)}
                        </Text>
                    </Card>
                ))}
        </Stack>
    );
};
