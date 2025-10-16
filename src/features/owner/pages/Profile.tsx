import { Group, Text, Switch, Box, Stack, Divider } from "@mantine/core";
import {TimeInput} from "@mantine/dates";

type DayHours = {
    open: string;
    close: string;
};

type OpeningHours = {
    [day: string]: DayHours | null; // null = zamknięte
};

const DAYS: { key: string; label: string }[] = [
    { key: "monday", label: "Poniedziałek" },
    { key: "tuesday", label: "Wtorek" },
    { key: "wednesday", label: "Środa" },
    { key: "thursday", label: "Czwartek" },
    { key: "friday", label: "Piątek" },
    { key: "saturday", label: "Sobota" },
    { key: "sunday", label: "Niedziela" },
];

type Props = {
    value: OpeningHours;
    onChange: (v: OpeningHours) => void;
};

export function OpeningHoursEditor({ value, onChange }: Props) {
    const updateDay = (day: string, patch: Partial<DayHours> | null) => {
        const copy: OpeningHours = { ...value };
        if (patch === null) {
            copy[day] = null; // zamknięte
        } else {
            copy[day] = { ...(copy[day] ?? { open: "09:00", close: "17:00" }), ...patch };
        }
        onChange(copy);
    };

    return (
        <Stack gap="xs">
            {DAYS.map(({ key, label }, i) => {
                const day = value[key] ?? { open: "09:00", close: "17:00" };
                const closed = value[key] === null;

                return (
                    <Box
                        key={key}
                        style={{
                            backgroundColor: closed ? "rgba(240,240,240,0.6)" : "white",
                            borderRadius: 8,
                            border: "1px solid #e0e0e0",
                            padding: "0.6rem 0.8rem",
                        }}
                    >
                        <Group justify="space-between" align="center">
                            <Text fw={500} w={120}>
                                {label}
                            </Text>
                            <Group gap="xs" grow>
                                <TimeInput
                                    label="od"
                                    value={day.open}
                                    onChange={(e) => updateDay(key, { open: e.currentTarget.value })}
                                    disabled={closed}
                                    styles={{
                                        input: { textAlign: "center" },
                                    }}
                                />
                                <TimeInput
                                    label="do"
                                    value={day.close}
                                    onChange={(e) => updateDay(key, { close: e.currentTarget.value })}
                                    disabled={closed}
                                    styles={{
                                        input: { textAlign: "center" },
                                    }}
                                />
                            </Group>

                            <Switch
                                label="Zamknięte"
                                checked={closed}
                                onChange={(e) => updateDay(key, e.currentTarget.checked ? null : day)}
                                color="gray"
                            />
                        </Group>
                        {i < DAYS.length - 1 && <Divider mt="xs" />}
                    </Box>
                );
            })}
        </Stack>
    );
}
