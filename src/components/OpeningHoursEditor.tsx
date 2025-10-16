import React from "react";
import { Group, Select, Switch, Text, Stack, Divider } from "@mantine/core";

const days = [
    { key: "monday", label: "Poniedziałek" },
    { key: "tuesday", label: "Wtorek" },
    { key: "wednesday", label: "Środa" },
    { key: "thursday", label: "Czwartek" },
    { key: "friday", label: "Piątek" },
    { key: "saturday", label: "Sobota" },
    { key: "sunday", label: "Niedziela" },
];

const hours = Array.from({ length: 24 }, (_, h) =>
    ["00", "15", "30", "45"].map((m) => ({
        value: `${String(h).padStart(2, "0")}:${m}`,
        label: `${String(h).padStart(2, "0")}:${m}`,
    }))
).flat();

export type OpeningHours = Record<string, { open: string; close: string } | null>;

export function OpeningHoursEditor({
                                       value,
                                       onChange,
                                   }: {
    value: OpeningHours;
    onChange: (val: OpeningHours) => void;
}) {
    const updateDay = (day: string, data: any) => onChange({ ...value, [day]: data });

    return (
        <Stack gap="xs">
            {days.map((d) => {
                const dayData = value?.[d.key];
                const closed = dayData == null;
                return (
                    <React.Fragment key={d.key}>
                        <Group justify="space-between">
                            <Text w={120}>{d.label}</Text>
                            <Switch
                                label="Zamknięte"
                                checked={closed}
                                onChange={(e) =>
                                    updateDay(d.key, e.currentTarget.checked ? null : { open: "10:00", close: "22:00" })
                                }
                            />
                            {!closed && (
                                <Group>
                                    <Select
                                        data={hours}
                                        label="Od"
                                        value={dayData?.open}
                                        onChange={(v) => updateDay(d.key, { ...dayData, open: v ?? "10:00" })}
                                    />
                                    <Select
                                        data={hours}
                                        label="Do"
                                        value={dayData?.close}
                                        onChange={(v) => updateDay(d.key, { ...dayData, close: v ?? "22:00" })}
                                    />
                                </Group>
                            )}
                        </Group>
                        <Divider />
                    </React.Fragment>
                );
            })}
        </Stack>
    );
}
