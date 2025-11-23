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
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Restaurant } from "./hooks/useMakeReservation";
import { getFavorites, toggleFavorite } from "./api/favorites";
import { API_URL } from "../../config";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RestaurantCard } from "./RestaurantCard";

const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

type City = { label: string; value: string; latitude: number; longitude: number };

function FlyToMarkers({ restaurants, radius }: { restaurants: Restaurant[]; radius: number }) {
    const map = useMap();
    useEffect(() => {
        const valid = restaurants.filter((r) => r.address?.latitude && r.address?.longitude);
        if (valid.length > 0) {
            const bounds = L.latLngBounds(
                valid.map((r) => [r.address!.latitude, r.address!.longitude] as [number, number])
            );
            map.flyToBounds(bounds, { padding: [radius * 2, radius * 2] as any });
        } else {
            map.setView([52.069167, 19.480556], 6);
        }
    }, [restaurants, radius, map]);
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
    date?: string;
    time?: string;
    partySize?: number;
}

export const RestaurantsList: React.FC = () => {
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);

    // filtry
    const [cuisineFilter, setCuisineFilter] = useState<string[]>([]);
    const [nameFilter, setNameFilter] = useState<string>("");
    const [minRating, setMinRating] = useState<number | null>(null);
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [sortByDistance, setSortByDistance] = useState<boolean>(false);

    // lokalizacja
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [districts, setDistricts] = useState<string[]>([]);
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

    const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState<number>(0);
    const [locationFilters, setLocationFilters] = useState<FilterParams | null>(null);

    // dostępność
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>("19:00");
    const [people, setPeople] = useState<number>(2);

    // helper: lokalizacja jako string
    const getLocationString = (): string | undefined => {
        if (!selectedCity) return undefined;
        if (!selectedDistricts.length) return selectedCity.label;
        return `${selectedCity.label},${selectedDistricts.join(",")}`;
    };

    // pierwsze ładowanie
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = () => {
        fetchRestaurants();
        fetchCuisines();
        fetchFavorites();
        fetchCities();
    };

    // pobieranie miast
    const fetchCities = async () => {
        try {
            const res = await fetch(`${API_URL}/restaurants/cities`);
            const data = await res.json();
            setCities(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Błąd pobierania miast:", error);
        }
    };

    // ustawienie mapy po mieście
    useEffect(() => {
        if (selectedCity) {
            setMapLocation({ lat: selectedCity.latitude, lng: selectedCity.longitude });
        } else {
            setMapLocation(null);
        }
    }, [selectedCity]);

    // pobieranie dzielnic
    useEffect(() => {
        const loadDistricts = async () => {
            if (!selectedCity) {
                setDistricts([]);
                setSelectedDistricts([]);
                return;
            }
            try {
                const res = await fetch(`${API_URL}/restaurants/districts/${selectedCity.label}`);
                const data = await res.json();
                setDistricts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Błąd pobierania dzielnic:", err);
                setDistricts([]);
            }
        };
        loadDistricts();
    }, [selectedCity]);

    // lokalizacja przechowywana globalnie
    useEffect(() => {
        if (selectedCity) {
            const loc = getLocationString();
            setLocationFilters({
                location: loc,
                latitude: selectedCity.latitude,
                longitude: selectedCity.longitude,
                radius: radius,
            });
        } else {
            setLocationFilters(null);
        }
    }, [selectedCity, selectedDistricts, radius]);

    // lista początkowa
    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/restaurants/filter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            setRestaurants(data);
        } catch (error) {
            console.error("Błąd pobierania restauracji:", error);
        } finally {
            setLoading(false);
        }
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
        } catch {
            setCuisines([]);
        }
    };

    // SZUKAJ → używa /filter
    const handleSearch = async () => {
        setLoading(true);
        try {
            const params: FilterParams = {};

            if (nameFilter.trim()) params.name = nameFilter.trim();

            if (locationFilters?.location) {
                params.location = locationFilters.location;
            }

            if (radius > 0 && selectedCity) {
                params.latitude = selectedCity.latitude;
                params.longitude = selectedCity.longitude;
                params.radius = radius;
            }

            const res = await fetch(`${API_URL}/restaurants/filter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            });

            const data = await res.json();
            setRestaurants(data);
        } catch (e) {
            console.error("Błąd szukania", e);
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    const toYMD = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
        ).padStart(2, "0")}`;

    // FILTER → kompletne filtrowanie
    const handleFilter = async () => {
        setLoading(true);
        try {
            const filters: FilterParams = {};

            const loc = getLocationString();
            if (loc) filters.location = loc;

            if (radius > 0 && selectedCity) {
                filters.latitude = selectedCity.latitude;
                filters.longitude = selectedCity.longitude;
                filters.radius = radius;
            }

            if (cuisineFilter.length) filters.cuisine = cuisineFilter;
            if (minRating !== null) filters.minRating = minRating;
            if (sortOrder) filters.sortOrder = sortOrder;
            if (sortByDistance) filters.sortByDistance = true;

            if (selectedDate) filters.date = toYMD(selectedDate);
            if (selectedTime) filters.time = selectedTime;
            if (people > 0) filters.partySize = people;

            const res = await fetch(`${API_URL}/restaurants/filter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            });

            const filtered = await res.json();
            setRestaurants(filtered);
        } catch (error) {
            console.error("Błąd filtrowania restauracji:", error);
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
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
                        const city = cities.find((c) => c.value === val) || null;
                        setSelectedCity(city);
                        setSelectedDistricts([]);
                    }}
                    searchable
                    clearable
                />

                {/* MultiSelect dzielnic */}
                <MultiSelect
                    label="Dzielnice"
                    placeholder={selectedCity ? "Wybierz dzielnice" : "Najpierw wybierz miasto"}
                    data={districts.map((d) => ({ value: d, label: d }))}
                    value={selectedDistricts}
                    onChange={setSelectedDistricts}
                    disabled={!selectedCity}
                    clearable
                    searchable
                />

                <NumberInput
                    label="Promień wyszukiwania (km)"
                    value={radius}
                    onChange={(val) => setRadius(Number(val))}
                    min={0}
                    max={50}
                    disabled={!selectedCity}
                />

                <Group>
                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? <Loader size="sm" /> : "Szukaj"}
                    </Button>

                    <Button
                        variant="default"
                        onClick={() => {
                            setNameFilter("");
                            setCuisineFilter([]);
                            setMinRating(null);
                            setSelectedCity(null);
                            setSelectedDistricts([]);
                            setSortOrder(null);
                            setRadius(0);
                            setSelectedDate(null);
                            setSelectedTime("19:00");
                            setPeople(2);
                            setLocationFilters(null);
                            fetchRestaurants();
                        }}
                    >
                        Wyczyść
                    </Button>
                </Group>

                <MultiSelect
                    label="Kuchnia"
                    placeholder="Wybierz kuchnie"
                    data={cuisines}
                    value={cuisineFilter}
                    onChange={setCuisineFilter}
                    clearable
                    searchable
                />

                <NumberInput
                    label="Minimalna ocena"
                    placeholder="1-5"
                    min={1}
                    max={5}
                    step={0.5}
                    value={minRating ?? undefined}
                    onChange={(value) =>
                        typeof value === "number" ? setMinRating(value) : setMinRating(null)
                    }
                />

                <Select
                    label="Sortowanie wg oceny"
                    placeholder="Wybierz sortowanie"
                    data={[
                        { label: "Od najwyższej", value: "desc" },
                        { label: "Od najniższej", value: "asc" },
                    ]}
                    value={sortOrder}
                    onChange={(val) => setSortOrder((val as "asc" | "desc") ?? null)}
                    clearable
                />

                <Checkbox
                    label="Sortuj wg odległości"
                    checked={sortByDistance}
                    onChange={(e) => setSortByDistance(e.currentTarget.checked)}
                    disabled={!selectedCity || radius === 0}
                />

                <Group>
                    <Button onClick={handleFilter} disabled={loading}>
                        {loading ? <Loader size="sm" /> : "Filtruj"}
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
                        r.address?.latitude && r.address?.longitude ? (
                            <Marker
                                key={r.id}
                                position={[r.address.latitude, r.address.longitude]}
                                icon={markerIcon}
                            >
                                <Popup>
                                    <Text fw={700}>{r.name}</Text>
                                    <Text size="sm">
                                        {r.cuisines?.map((c) => c.cuisine.name).join(", ")}
                                    </Text>
                                    <Group mt={4}>
                                        <Button
                                            variant="light"
                                            size="xs"
                                            onClick={() => navigate(`/reservations/${r.id}`)}
                                        >
                                            Szczegóły
                                        </Button>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${r.address.latitude},${r.address.longitude}`}
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
                            if (sortOrder === "asc")
                                return (a.avgRating ?? 0) - (b.avgRating ?? 0);
                            if (sortOrder === "desc")
                                return (b.avgRating ?? 0) - (a.avgRating ?? 0);
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
