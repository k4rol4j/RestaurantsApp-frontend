import { useState } from "react";
import {makeReservation} from "../api/reservations.ts";

export type Restaurant = {
    id: number;
    name: string;
    rating: number;
    imageUrl: string | null;
    description: string | null;
    capacity?: number;
    imageGallery?: string;
    openingHours?: string;

    address: {
        id: number;
        city: string;
        district: string | null;
        street: string | null;
        streetNumber: string | null;
        latitude: number;
        longitude: number;
    } | null;

    cuisines: {
        cuisine: {
            id: number;
            name: string;
        };
    }[];
};


// Typ dla listy restauracji
export type RestaurantsType = Restaurant[];

// Typ dla danych rezerwacji
export type MakeReservationValues = {
    name: string;
    guests: number;
    date: string;
    restaurantId: number | null;
    durationMinutes: number;
};

export const useMakeReservation = () => {
    // Stan formularza z typem MakeReservationValues
    const [formData, setFormData] = useState<MakeReservationValues>({
        name: "",
        guests: 1,
        date: "",
        restaurantId: null,
        durationMinutes: 90,
    });

    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

    const [error, setError] = useState<string | null>(null);

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (formData.name.length < 3) {
            setError("Name must be at least 3 characters.");
            return;
        }
        if (!formData.date) {
            setError("Please select a date.");
            return;
        }
        if (!formData.restaurantId) {
            setError("Please select a restaurant.");
            return;
        }

        try {
            const time = "18:00";
            await makeReservation({
                restaurantId: formData.restaurantId,
                date: formData.date,
                time,
                people: formData.guests,
                durationMinutes: 90
            });
            setError(null);
            setSubmitted(true);
        } catch (error: any) {
            console.error(error);
            setError(error?.response?.data?.message || "Błąd podczas rezerwacji.");
        }
    };


    return {
        formData,
        setFormData,
        selectedRestaurant,
        setSelectedRestaurant,
        error,
        setError,
        submitted,
        setSubmitted,
        handleSubmit,
    };
};
