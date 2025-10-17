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
import { getFreeTables } from "./api/tables";
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
    const [durationMinutes, setDurationMinutes] = useState<number>(90);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeSlots, setTimeSlots] = useState<
        { value: string; label: string }[]
    >([]);

    const [freeSummary, setFreeSummary] = useState<string>("");
    const [checkingFree, setCheckingFree] = useState(false);

    const summarizeTables = (tables: { seats: number }[]) => {
        const counts = tables.reduce<Record<number, number>>((acc, t) => {
            acc[t.seats] = (acc[t.seats] || 0) + 1;
            return acc;
        }, {});
        const order = [1, 2, 4, 6, 8];
        const parts = order
            .filter((s) => counts[s])
            .map((s) => `${counts[s]}×${s}-os.`);
        return parts.length
            ? `Dostępne: ${parts.join(", ")}`
            : "Brak wolnych stolików w tym czasie";
    };

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

    useEffect(() => {
        const canFetch = restaurantId && date && time && durationMinutes;
        if (!canFetch) {
            setFreeSummary("");
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                setCheckingFree(true);
                const free = await getFreeTables({
                    restaurantId,
                    date,
                    time,
                    durationMinutes,
                });
                if (!cancelled) {
                    setFreeSummary(summarizeTables(free));
                }
            } catch {
                if (!cancelled) {
                    setFreeSummary("Nie udało się pobrać dostępności stolików");
                }
            } finally {
                if (!cancelled) setCheckingFree(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [restaurantId, date, time, durationMinutes]);

    const handleSubmit = async () => {
        try {
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
            const hours = JSON.parse(restaurant.openingHours || "{}")[day];

            if (hours?.open && hours?.close && time) {
                const [startH, startM] = time.split(":").map(Number);
                const [openH, openM] = hours.open.split(":").map(Number);
                const [closeH, closeM] = hours.close.split(":").map(Number);

                const start = dayjs().hour(startH).minute(startM);
                const openTime = dayjs().hour(openH).minute(openM);
                const closeTime = dayjs().hour(closeH).minute(closeM);
                const end = start.add(durationMinutes, "minute");

                if (start.isBefore(openTime)) {
                    setError(`Restauracja otwiera się o ${hours.open}`);
                    return;
                }
                if (end.isAfter(closeTime)) {
                    setError(
                        `Wybierz krótszy czas trwania — restauracja zamyka się o ${hours.close}`
                    );
                    return;
                }
            }
        } catch (e) {
            console.warn("Nie udało się zweryfikować godzin otwarcia:", e);
        }

        try {
            await makeReservation({
                restaurantId,
                date,
                time,
                people,
                durationMinutes,
            });
            setSuccess(true);
            setError(null);
        } catch (e: any) {
            console.error("Błąd rezerwacji:", e);
            setSuccess(false);

            if (e?.response?.status === 400 || e?.response?.status === 404) {
                setError(
                    "Nie można zarezerwować — sprawdź godzinę i długość rezerwacji."
                );
            } else {
                setError(e?.message || "Wystąpił błąd podczas rezerwacji.");
            }
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

            <Select
                label="Przewidywany czas trwania"
                placeholder="Wybierz czas trwania"
                data={[
                    { value: "30", label: "30 minut" },
                    { value: "60", label: "1 godzina" },
                    { value: "90", label: "1,5 godziny" },
                    { value: "120", label: "2 godziny" },
                    { value: "180", label: "3 godziny" },
                ]}
                value={String(durationMinutes)}
                onChange={(val) => setDurationMinutes(val ? parseInt(val) : 90)}
            />

            {date && time && (
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {checkingFree
                        ? "Sprawdzam dostępność stolików…"
                        : freeSummary}
                </div>
            )}

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
