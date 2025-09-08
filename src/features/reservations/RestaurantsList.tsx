// RestaurantsList.tsx

import {
    Text,
    Group,
    Button,
    SimpleGrid,
    Select,
    Loader,
    NumberInput,
    Box,
    TextInput,
    MultiSelect,
    Checkbox,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Restaurant } from "./hooks/useMakeReservation.ts";
import { listRestaurants } from "./api/reservations.ts";
import { getFavorites, toggleFavorite } from "./api/favorites.ts";
import { API_URL } from "../../config.ts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RestaurantCard } from "./RestaurantCard";
import { useMap } from "react-leaflet";

const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

function FlyToMarkers({ restaurants, radius }: { restaurants: Restaurant[], radius: number }) {
    const map = useMap();
    useEffect(() => {
        const validCoords = restaurants.filter(r => r.latitude && r.longitude);
        if (validCoords.length > 0) {
            const bounds = L.latLngBounds(validCoords.map(r => [r.latitude!, r.longitude!]));
            map.flyToBounds(bounds, { padding: [radius * 2, radius * 2] });
        } else {
            map.setView([52.069167, 19.480556], 6);
        }
    }, [restaurants, radius]);
    return null;
}

interface FilterParams {
    cuisine?: string[];
    location?: string;
    name?: string;
    minRating?: number;
    sortOrder?: "asc" | "desc";
    latitude?: number;
    longitude?: number;
    radius?: number;
    sortByDistance?: boolean;
    date?: string; // "YYYY-MM-DD"
    time?: string; // "HH:mm"
    partySize?: number;
}

export const RestaurantsList = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [cuisineFilter, setCuisineFilter] = useState<string[]>([]);
    const [nameFilter, setNameFilter] = useState<string>("");
    const [minRating, setMinRating] = useState<number | null>(null);
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [sortByDistance, setSortByDistance] = useState<boolean>(false);
    const [locationFilters, setLocationFilters] = useState<FilterParams | null>(null);

    const [cities, setCities] = useState<{ label: string; value: string; latitude: number; longitude: number }[]>([]);
    const [selectedCity, setSelectedCity] = useState<typeof cities[0] | null>(null);
    const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState<number>(0);

    // Nowe stany dla dostępności
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>("19:00");
    const [people, setPeople] = useState<number>(2);

    useEffect(() => {
        fetchRestaurants();
        fetchCuisines();
        fetchFavorites();
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const res = await fetch(`${API_URL}/restaurants/cities`);
            const data = await res.json();
            setCities(data);
        } catch (error) {
            console.error("Błąd pobierania miast:", error);
        }
    };

    useEffect(() => {
        if (selectedCity) {
            setMapLocation({ lat: selectedCity.latitude, lng: selectedCity.longitude });
        }
    }, [selectedCity]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const response = await listRestaurants();
            setRestaurants(response);
        } catch (error) {
            console.error("Błąd pobierania restauracji:", error);
        }
        setLoading(false);
    };

    const fetchFavorites = async () => {
        try {
            const favs = await getFavorites();
            setFavorites(favs);
        } catch (error) {
            console.error("Błąd pobierania ulubionych:", error);
        }
    };

    const fetchCuisines = async () => {
        try {
            const response = await fetch(`${API_URL}/restaurants/cuisines`);
            const data = await response.json();
            setCuisines(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Błąd pobierania kuchni:", error);
            setCuisines([]);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const filters: FilterParams = {};
            if (nameFilter.trim()) filters.name = nameFilter.trim();
            if (selectedCity) {
                filters.location = selectedCity.label;
                filters.latitude = selectedCity.latitude;
                filters.longitude = selectedCity.longitude;
                filters.radius = radius;
            }

            if (selectedDate) {
                filters.date = toYMD(selectedDate);
            }
            if (selectedTime) {
                filters.time = selectedTime.slice(0, 5);
            }
            if (people && people > 0) {
                filters.partySize = people;
            }

            setLocationFilters({
                location: filters.location,
                latitude: filters.latitude,
                longitude: filters.longitude,
                radius: filters.radius,
            });

            const res = await fetch(`${API_URL}/restaurants/filter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            setRestaurants(await res.json());
        } catch (e) {
            console.error("Błąd szukania", e);
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    const toYMD = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const handleFilter = async () => {
        setLoading(true);
        try {
            const filters: FilterParams = locationFilters ? { ...locationFilters } : {};
            if (cuisineFilter) filters.cuisine = cuisineFilter;
            if (minRating !== null) filters.minRating = minRating;
            if (sortOrder) filters.sortOrder = sortOrder;
            if (sortByDistance) filters.sortByDistance = true;

            console.log('filters', filters);

            const response = await fetch(`${API_URL}/restaurants/filter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const filtered = await response.json();
            setRestaurants(filtered);
        } catch (error) {
            console.error("Błąd filtrowania restauracji:", error);
            setRestaurants([]);
        }
        setLoading(false);
    };

    const handleToggleFavorite = async (id: number) => {
        const isFav = favorites.includes(id);
        try {
            await toggleFavorite(id, isFav);
            fetchFavorites();
        } catch (error) {
            console.error("Błąd zmiany ulubionych:", error);
        }
    };

    return (
        <div style={{ width: "100%" }}>
            <Box style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                <TextInput
                    label="Nazwa restauracji"
                    placeholder="Wpisz nazwę restauracji"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.currentTarget.value)}
                />
                <Select
                    label="Miasto"
                    placeholder="Wybierz miasto"
                    data={cities.map((c) => ({ value: c.value, label: c.label }))}
                    value={selectedCity?.value || null}
                    onChange={(val) => {
                        const city = cities.find((c) => c.value === val);
                        setSelectedCity(city || null);
                    }}
                    searchable
                    clearable
                />
                <NumberInput
                    label="Promień wyszukiwania (km)"
                    value={radius}
                    onChange={(val) => setRadius(typeof val === "number" ? val : 0)}
                    min={0}
                    max={50}
                    disabled={!selectedCity}
                />

                {/* NOWE pola dostępności */}
                <Group grow>
                    <DateInput
                        label="Data dostępności"
                        placeholder="Wybierz datę"
                        value={selectedDate}
                        onChange={setSelectedDate}
                    />
                    <TimeInput
                        label="Godzina"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.currentTarget.value.slice(0, 5))}
                    />
                    <NumberInput
                        label="Liczba osób"
                        min={1}
                        value={people}
                        onChange={(v) => setPeople(typeof v === "number" ? v : 1)}
                    />
                </Group>

                <Button onClick={handleSearch} disabled={loading}>
                    {loading ? <Loader size="sm" /> : "Szukaj"}
                </Button>

                <MultiSelect
                    label="Filtruj według kuchni"
                    placeholder="Wybierz kuchnię"
                    data={cuisines}
                    value={cuisineFilter}
                    onChange={setCuisineFilter}
                    clearable
                    searchable
                />
                <NumberInput
                    label="Minimalna ocena"
                    placeholder="Podaj ocenę (1-5)"
                    min={1}
                    max={5}
                    step={0.5}
                    value={minRating ?? undefined}
                    onChange={(value) => (typeof value === "number" ? setMinRating(value) : setMinRating(null))}
                />
                <Select
                    label="Sortuj wg oceny"
                    placeholder="Wybierz sortowanie"
                    data={[
                        { label: "Od najwyższej", value: "desc" },
                        { label: "Od najniższej", value: "asc" },
                    ]}
                    value={sortOrder}
                    onChange={(val) => setSortOrder(val as "asc" | "desc")}
                    clearable
                />
                <Checkbox
                    label="Sortuj wg odległości od wybranej lokalizacji"
                    checked={sortByDistance}
                    onChange={(event) => setSortByDistance(event.currentTarget.checked)}
                    disabled={!selectedCity && (!mapLocation || radius === 0)}
                />
                <Group>
                    <Button onClick={handleFilter} disabled={loading}>
                        {loading ? <Loader size="sm" /> : "Filtruj"}
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => {
                            setCuisineFilter([]);
                            setMinRating(null);
                            setSelectedCity(null);
                            setSortOrder(null);
                            setRadius(0);
                            setSelectedDate(null);
                            setSelectedTime("19:00");
                            setPeople(2);
                            fetchRestaurants();
                            setLocationFilters(null);
                            fetchFavorites();
                        }}
                    >
                        Wyczyść filtry
                    </Button>
                </Group>
            </Box>

            {mapLocation && (
                <MapContainer
                    center={[mapLocation.lat, mapLocation.lng]}
                    zoom={13}
                    style={{ height: 300, marginBottom: 24, borderRadius: 12 }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <FlyToMarkers restaurants={restaurants} radius={radius} />
                    {restaurants.map((r) =>
                        r.latitude && r.longitude ? (
                            <Marker key={r.id} position={[r.latitude, r.longitude]} icon={markerIcon}>
                                <Popup>
                                    <Text fw={700}>{r.name}</Text>
                                    <Text size="sm">{r.cuisine}</Text>
                                    <Group mt={4}>
                                        <Button variant="light" size="xs" onClick={() => navigate(`/reservations/${r.id}`)}>
                                            Szczegóły
                                        </Button>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="outline" size="xs">
                                                Trasa
                                            </Button>
                                        </a>
                                    </Group>
                                </Popup>
                            </Marker>
                        ) : null
                    )}
                </MapContainer>
            )}

            {!loading && (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {[...restaurants]
                        .sort((a, b) => {
                            if (sortOrder === "asc") return a.rating - b.rating;
                            if (sortOrder === "desc") return b.rating - a.rating;
                            return 0;
                        })
                        .map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                isFavorite={favorites.includes(restaurant.id)}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))}
                </SimpleGrid>
            )}
            {loading && <Loader size="lg" />}
        </div>
    );
};
