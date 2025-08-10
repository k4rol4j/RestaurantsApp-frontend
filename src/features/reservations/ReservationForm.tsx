import React, { useEffect, useState } from "react";
import {
    Button,
    NumberInput,
    Box,
    Notification,
    Select,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCheck, IconX } from "@tabler/icons-react";
import { makeReservation } from "./api/reservations";
import dayjs from "dayjs";
import "dayjs/locale/pl";
dayjs.locale("pl");

const generateTimeSlots = (open: string, close: string, stepMinutes = 30) => {
    const slots: { value: string; label: string }[] = [];
    let [h, m] = open.split(":").map(Number);
    const [endH, endM] = close.split(":").map(Number);

    while (h < endH || (h === endH && m < endM)) {
        const timeStr = `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}`;
        slots.push({ value: timeStr, label: timeStr });
        m += stepMinutes;
        if (m >= 60) {
            h += 1;
            m -= 60;
        }
    }
    return slots;
};

export const ReservationForm: React.FC<{
    restaurantId: number;
    restaurant: any;
}> = ({ restaurantId, restaurant }) => {
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState("");
    const [people, setPeople] = useState<number>(2);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeSlots, setTimeSlots] = useState<{ value: string; label: string }[]>(
        []
    );

    useEffect(() => {
        if (!restaurant?.openingHours || !date) {
            setTimeSlots([]);
            return;
        }

        const plToEnDays: Record<string, string> = {
            "poniedziałek": "monday",
            "wtorek": "tuesday",
            "środa": "wednesday",
            "czwartek": "thursday",
            "piątek": "friday",
            "sobota": "saturday",
            "niedziela": "sunday",
        };

        const plDay = dayjs(date).format("dddd").toLowerCase();
        const day = plToEnDays[plDay];

        try {
            const hours = JSON.parse(restaurant.openingHours)[day];
            if (hours) {
                setTimeSlots(generateTimeSlots(hours.open, hours.close));
            } else {
                setTimeSlots([]);
            }
        } catch {
            setTimeSlots([]);
        }
    }, [restaurant, date]);

    const handleSubmit = async () => {
        try {
            await makeReservation({ restaurantId, date, time, people });
            setSuccess(true);
            setError(null);
        } catch (e: any) {
            console.error("Błąd rezerwacji:", e);
            setSuccess(false);
            setError(e?.message || "Wystąpił błąd podczas rezerwacji.");
        }
    };

    const isDisabled =
        !date || !time || !people || typeof people !== "number" || people < 1;

    return (
        <Box
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxWidth: 400,
                marginTop: 24,
            }}
        >
            <DatePickerInput
                label="Data"
                placeholder="Wybierz datę"
                value={date ? new Date(date) : null}
                onChange={(value) => {
                    if (value) setDate(dayjs(value).format("YYYY-MM-DD"));
                }}
                valueFormat="YYYY-MM-DD"
                locale="pl"
            />

            <Select
                label="Godzina"
                placeholder="Wybierz godzinę"
                data={timeSlots}
                value={time}
                onChange={(val) => setTime(val ?? "")}
                disabled={timeSlots.length === 0}
                searchable
                nothingFoundMessage="Brak godzin"
            />

            <NumberInput
                label="Liczba osób"
                min={1}
                value={people}
                onChange={(value) => {
                    if (typeof value === "number") setPeople(value);
                }}
            />

            <Button onClick={handleSubmit} disabled={isDisabled}>
                Rezerwuj
            </Button>

            {success && (
                <Notification
                    icon={<IconCheck size="1.1rem" />}
                    color="teal"
                    title="Sukces"
                    onClose={() => setSuccess(false)}
                    mt="sm"
                >
                    Rezerwacja została zapisana!
                </Notification>
            )}

            {error && (
                <Notification
                    icon={<IconX size="1.1rem" />}
                    color="red"
                    title="Błąd"
                    onClose={() => setError(null)}
                    mt="sm"
                >
                    {error}
                </Notification>
            )}
        </Box>
    );
};
