import { useState } from "react";
import { Slider, Button, Stack, Text, Title, Card } from "@mantine/core";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    useMapEvents
} from "react-leaflet";
import { getNearbyRestaurants } from "./api/restaurants";
import { Restaurant } from "./hooks/useMakeReservation";

interface Location {
    lat: number;
    lng: number;
}

// 🔹 Kiedy zmieni się współrzędna → przesuń mapę
function MapCenter({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    map.flyTo([lat, lng], 13);
    return null;
}

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
        lat: 50.0647,
        lng: 19.945,
    });

    const [radius, setRadius] = useState(5);
    const [results, setResults] = useState<Restaurant[]>([]);

    const handleSearch = async () => {
        try {
            const res = await getNearbyRestaurants({
                latitude: location.lat,
                longitude: location.lng,
                radius: radius,
            });
            setResults(res);
        } catch (e) {
            console.error("Błąd podczas pobierania restauracji:", e);
        }
    };

    return (
        <Stack>
            <Title order={2}>Wyszukiwanie po lokalizacji</Title>

            <MapContainer
                center={[location.lat, location.lng]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "300px", width: "100%", borderRadius: "10px" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {/* 🔥 DODANO: automatyczne centrowanie */}
                <MapCenter lat={location.lat} lng={location.lng} />

                <LocationSelector onChange={setLocation} />

                {/* 🔹 marker użytkownika */}
                <Marker position={[location.lat, location.lng]}>
                    <Popup>Wybrana lokalizacja</Popup>
                </Marker>

                {/* 🔥 MARKERY RESTAURACJI */}
                {results.map((r) =>
                    r.address ? (
                        <Marker
                            key={r.id}
                            position={[
                                r.address.latitude,
                                r.address.longitude,
                            ]}
                        >
                            <Popup>{r.name}</Popup>
                        </Marker>
                    ) : null
                )}
            </MapContainer>

            <Text mt="md">Zasięg wyszukiwania: {radius} km</Text>
            <Slider value={radius} onChange={setRadius} min={1} max={20} step={1} />

            <Button mt="md" onClick={handleSearch}>
                Szukaj
            </Button>

            {results.map((r) => (
                <Card key={r.id} shadow="sm" mt="md">
                    <Title order={4}>{r.name}</Title>
                    <Text>{r.address?.city}</Text>
                    <Text size="sm" c="dimmed">
                        {r.cuisines?.map((c) => c.cuisine.name).join(", ")}
                    </Text>
                </Card>
            ))}
        </Stack>
    );
};
