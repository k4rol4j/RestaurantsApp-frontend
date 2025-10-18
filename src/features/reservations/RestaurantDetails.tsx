import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Tabs,
    Text,
    Image,
    Badge,
    Stack,
    Loader,
    Button,
    Box,
    Table,
    Group,
} from "@mantine/core";
import { ReservationForm } from "./ReservationForm";
import { ReviewList } from "./ReviewList";
import {
    getRestaurantById,
    getRestaurantReviews,
} from "./api/restaurants.ts";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { Restaurant } from "./hooks/useMakeReservation.ts";
import dayjs from "dayjs";

// --- typy lokalne dla menu ---
type MenuItem = {
    name: string;
    price: number;
    category?: string;
    description?: string;
    isAvailable?: boolean;
};

// rozszerzamy typ restauracji o menu
type RestaurantWithMenu = Restaurant & { menu?: MenuItem[] };

const customMarker = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface Review {
    rating: number;
    comment: string;
    date: string;
}

export const RestaurantDetails = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState<RestaurantWithMenu | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);

    // 🔄 Pobieranie danych restauracji i opinii
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getRestaurantById(Number(id));
                const rev = await getRestaurantReviews(Number(id));
                setRestaurant({
                    ...res,
                    latitude: res.latitude ?? 50.0647,
                    longitude: res.longitude ?? 19.945,
                });
                setReviews(rev);
            } catch (e) {
                console.error("Błąd wczytywania danych restauracji", e);
            }
            setLoading(false);
        };

        fetchData();
    }, [id]);

    if (loading) return <Loader />;
    if (!restaurant) return <Text>Restauracja nie znaleziona</Text>;

    // helper formatowania ceny
    const formatPrice = (n: number) =>
        (Number(n) || 0).toFixed(2).replace(".", ",") + " zł";

    // ⭐ Liczenie średniej ocen z bazy
    const avgRating =
        reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null;
    return (
        <Stack>
            <Box
                style={{
                    height: 250,
                    width: "30%",
                    overflow: "hidden",
                    borderRadius: 12,
                }}
            >
                <Image
                    src={
                        restaurant.imageUrl ??
                        "https://via.placeholder.com/400x250?text=Brak+zdjęcia"
                    }
                    height={250}
                    fit="cover"
                    radius="md"
                />
            </Box>

            <Text fw={700} size="xl">
                {restaurant.name}
            </Text>

            <Group gap="sm" align="center">
                <Badge color="blue">{restaurant.cuisine}</Badge>
                {avgRating && (
                    <Badge color="yellow" variant="filled">
                        ⭐ {avgRating} / 5 ({reviews.length})
                    </Badge>
                )}
            </Group>

            <Text c="dimmed">{restaurant.location}</Text>

            <Tabs defaultValue="about">
                <Tabs.List>
                    <Tabs.Tab value="about">O nas</Tabs.Tab>
                    <Tabs.Tab value="menu">Menu</Tabs.Tab>
                    <Tabs.Tab value="reviews">Opinie</Tabs.Tab>
                    <Tabs.Tab value="reservation">Rezerwacja</Tabs.Tab>
                </Tabs.List>

                {/* --- O NAS --- */}
                <Tabs.Panel value="about" pt="md">
                    <Text>
                        {restaurant.description ?? "Brak opisu tej restauracji."}
                    </Text>

                    {/* 🕒 Godziny otwarcia */}
                    {restaurant.openingHours && (
                        <div style={{ marginTop: 24 }}>
                            <Text fw={700} mb="xs" size="lg">
                                Godziny otwarcia
                            </Text>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: 14,
                                    background: "#fafafa",
                                    borderRadius: 8,
                                    overflow: "hidden",
                                }}
                            >
                                <tbody>
                                {Object.entries(JSON.parse(restaurant.openingHours)).map(
                                    ([day, info]: any) => {
                                        const map: Record<string, string> = {
                                            monday: "Poniedziałek",
                                            tuesday: "Wtorek",
                                            wednesday: "Środa",
                                            thursday: "Czwartek",
                                            friday: "Piątek",
                                            saturday: "Sobota",
                                            sunday: "Niedziela",
                                        };
                                        const today = dayjs().format("dddd").toLowerCase();
                                        const isToday = map[day]?.toLowerCase().includes(today);

                                        return (
                                            <tr
                                                key={day}
                                                style={{
                                                    background: isToday ? "#e8fbe8" : "transparent",
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: "6px 10px",
                                                        fontWeight: 500,
                                                        textTransform: "capitalize",
                                                    }}
                                                >
                                                    {map[day] ?? day}
                                                </td>
                                                <td style={{ padding: "6px 10px", color: "#555" }}>
                                                    {info.closed
                                                        ? "Zamknięte"
                                                        : `${info.open} – ${info.close}`}
                                                    {isToday && !info.closed && (
                                                        <span style={{ color: "#2b8a3e", marginLeft: 8 }}>
                                (Dziś)
                              </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 📍 Mapa */}
                    <div style={{ height: "300px", marginTop: "1rem" }}>
                        <MapContainer
                            center={[restaurant.latitude, restaurant.longitude]}
                            zoom={15}
                            scrollWheelZoom={false}
                            style={{ height: "100%", width: "100%", borderRadius: "10px" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker
                                position={[restaurant.latitude, restaurant.longitude]}
                                icon={customMarker}
                            >
                                <Popup>
                                    <Text fw={700}>{restaurant.name}</Text>
                                    <Text size="sm" c="dimmed">
                                        {restaurant.location}
                                    </Text>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <Button variant="outline" size="xs" mt={4}>
                                            Trasa
                                        </Button>
                                    </a>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </Tabs.Panel>

                {/* --- MENU --- */}
                <Tabs.Panel value="menu" pt="md">
                    {Array.isArray(restaurant.menu) && restaurant.menu.length > 0 ? (
                        <Stack gap="lg">
                            {(() => {
                                const groups = new Map<string, MenuItem[]>();
                                (restaurant.menu || []).forEach((it) => {
                                    const key = (it.category || "Pozostałe").trim();
                                    if (!groups.has(key)) groups.set(key, []);
                                    groups.get(key)!.push(it);
                                });

                                return [...groups.entries()]
                                    .sort((a, b) => a[0].localeCompare(b[0]))
                                    .map(([cat, items]) => (
                                        <Box key={cat}>
                                            <Text fw={700} mb="xs">
                                                {cat}
                                            </Text>
                                            <Table striped highlightOnHover withColumnBorders>
                                                <Table.Thead>
                                                    <Table.Tr>
                                                        <Table.Th>Nazwa</Table.Th>
                                                        <Table.Th>Opis</Table.Th>
                                                        <Table.Th>Cena</Table.Th>
                                                        <Table.Th>Status</Table.Th>
                                                    </Table.Tr>
                                                </Table.Thead>
                                                <Table.Tbody>
                                                    {items.map((it, idx) => (
                                                        <Table.Tr key={idx}>
                                                            <Table.Td style={{ whiteSpace: "nowrap" }}>
                                                                {it.name}
                                                            </Table.Td>
                                                            <Table.Td>{it.description || "-"}</Table.Td>
                                                            <Table.Td style={{ whiteSpace: "nowrap" }}>
                                                                {formatPrice(it.price)}
                                                            </Table.Td>
                                                            <Table.Td>
                                                                {it.isAvailable === false ? (
                                                                    <Badge color="red" variant="light">
                                                                        Niedostępne
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge color="green" variant="light">
                                                                        Dostępne
                                                                    </Badge>
                                                                )}
                                                            </Table.Td>
                                                        </Table.Tr>
                                                    ))}
                                                </Table.Tbody>
                                            </Table>
                                        </Box>
                                    ));
                            })()}
                        </Stack>
                    ) : (
                        <Text c="dimmed">Menu nie zostało jeszcze dodane.</Text>
                    )}
                </Tabs.Panel>

                {/* --- OPINIE --- */}
                <Tabs.Panel value="reviews" pt="md">
                    <ReviewList reviews={reviews} />
                </Tabs.Panel>

                {/* --- REZERWACJA --- */}
                <Tabs.Panel value="reservation" pt="md">
                    <ReservationForm restaurantId={restaurant.id} restaurant={restaurant} />
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
};
