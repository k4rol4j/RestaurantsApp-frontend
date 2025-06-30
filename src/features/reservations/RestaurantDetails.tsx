import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Tabs,
    Text,
    Image,
    Badge,
    Stack,
    Loader, Button, Box,
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
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getRestaurantById(Number(id));
                console.log("DEBUG restaurant:", res);
                console.log("DEBUG openingHours:", res.openingHours);
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

    return (
        <Stack>
            <Box style={{ height: 250, width: "30%", overflow: "hidden", borderRadius: 12,}} >
                <Image src={restaurant.imageUrl ?? "https://via.placeholder.com/400x250?text=Brak+zdjęcia"} height={250} fit="cover" radius="md" />
            </Box>
            <Text fw={700} size="xl">{restaurant.name}</Text>
            <Badge color="blue">{restaurant.cuisine}</Badge>
            <Text c="dimmed">{restaurant.location}</Text>

            <Tabs defaultValue="about">
                <Tabs.List>
                    <Tabs.Tab value="about">O nas</Tabs.Tab>
                    <Tabs.Tab value="menu">Menu</Tabs.Tab>
                    <Tabs.Tab value="reviews">Opinie</Tabs.Tab>
                    <Tabs.Tab value="reservation">Rezerwacja</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="about" pt="md">
                    <Text>{restaurant.description ?? "Brak opisu tej restauracji."}</Text>
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
                            <Marker position={[restaurant.latitude, restaurant.longitude]} icon={customMarker}>
                                <Popup>
                                    <Text fw={700}>{restaurant.name}</Text>
                                    <Text size="sm" c="dimmed">{restaurant.location}</Text>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{textDecoration: "none"}}
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

                <Tabs.Panel value="menu" pt="md">
                    <Text>Menu wkrótce!</Text>
                </Tabs.Panel>

                <Tabs.Panel value="reviews" pt="md">
                    <ReviewList reviews={reviews} />
                </Tabs.Panel>

                <Tabs.Panel value="reservation" pt="md">
                    <ReservationForm restaurantId={restaurant.id} restaurant={restaurant} />
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
};
