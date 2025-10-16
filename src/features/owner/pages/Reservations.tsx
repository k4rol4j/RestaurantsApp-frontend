import React from 'react';
import { useParams } from 'react-router-dom';
import { listReservations, setReservationStatus, assignTable, unassignTable, listTables } from '../../../api';
import { Card, Title, Table, Group, Button, Select, Text, Badge, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';

type TableType = { id: number; name: string | null; seats: number };
type ReservationType = {
    id: number;
    date: string;
    time: string;
    people: number;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
    tables?: { table: TableType }[];
};

type T = { id: number; name: string | null; seats: number; isActive: boolean };

const statusColor = (s: ReservationType['status']) =>
    s === 'CONFIRMED' ? 'green' : s === 'PENDING' ? 'yellow' : 'red';

export default function Reservations() {
    const { rid } = useParams();
    const restaurantId = Number(rid);

    const [rows, setRows] = React.useState<ReservationType[]>([]);
    const [tables, setTables] = React.useState<T[]>([]);
    const [date, setDate] = React.useState<Date | null>(null);
    const [status, setStatus] = React.useState<ReservationType['status'] | ''>('');
    const [loading, setLoading] = React.useState(true);

    const fetchAll = React.useCallback(() => {
        setLoading(true);
        const params = {
            date: date ? date.toISOString().slice(0, 10) : undefined,
            status: status || undefined,
        };
        Promise.all([
            listReservations(restaurantId, params),
            listTables(restaurantId),
        ])
            .then(([r, t]) => {
                setRows(r);
                setTables(t);
            })
            .finally(() => setLoading(false));
    }, [restaurantId, date, status]);

    React.useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const updateStatus = async (id: number, s: ReservationType['status']) => {
        await setReservationStatus(restaurantId, id, s);
        notifications.show({ color: 'green', message: 'Zmieniono status' });
        fetchAll();
    };

    const doAssign = async (resId: number, tblId: number) => {
        await assignTable(restaurantId, resId, tblId);
        notifications.show({ color: 'green', message: 'Przypisano stół' });
        fetchAll();
    };

    const doUnassign = async (resId: number, tblId: number) => {
        await unassignTable(restaurantId, resId, tblId);
        notifications.show({ color: 'red', message: 'Usunięto stół' });
        fetchAll();
    };

    return (
        <Stack gap="lg">
            <Title order={2}>Rezerwacje</Title>

            <Card withBorder radius="md" p="lg">
                <Group align="end" gap="md">
                    <DateInput
                        label="Data"
                        placeholder="dd.mm.rrrr"
                        value={date}
                        onChange={setDate}
                        valueFormat="DD.MM.YYYY"
                    />
                    <Select
                        label="Status"
                        placeholder="(wszystkie)"
                        clearable
                        data={['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED']}
                        value={status || null}
                        onChange={(v) => setStatus((v as any) ?? '')}
                    />
                    <Button onClick={fetchAll}>Filtruj</Button>
                </Group>
            </Card>

            <Card withBorder radius="md" p="lg">
                {loading ? (
                    <Text c="dimmed">Ładowanie…</Text>
                ) : rows.length === 0 ? (
                    <Text c="dimmed">Brak rezerwacji</Text>
                ) : (
                    <Table striped highlightOnHover withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Data</Table.Th>
                                <Table.Th>Godz.</Table.Th>
                                <Table.Th>Osób</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Stoliki</Table.Th>
                                <Table.Th>Przypisz stół</Table.Th>
                                <Table.Th>Akcje</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.map((r) => (
                                <Table.Tr key={r.id}>
                                    <Table.Td>{new Date(r.date).toLocaleDateString()}</Table.Td>
                                    <Table.Td>{r.time}</Table.Td>
                                    <Table.Td>{r.people}</Table.Td>
                                    <Table.Td>
                                        <Badge color={statusColor(r.status)}>{r.status}</Badge>
                                    </Table.Td>

                                    {/* Stoliki przypisane */}
                                    <Table.Td>
                                        {r.tables && r.tables.length ? (
                                            <Group gap="xs">
                                                {r.tables.map((t) => (
                                                    <Badge
                                                        key={t.table.id}
                                                        color="blue"
                                                        variant="filled"
                                                        rightSection={
                                                            <Button
                                                                variant="subtle"
                                                                color="red"
                                                                size="compact-xs"
                                                                onClick={() => doUnassign(r.id, t.table.id)}
                                                                px={6}
                                                            >
                                                                ✕
                                                            </Button>
                                                        }
                                                    >
                                                        {t.table.name || `Stół ${t.table.id}`} ({t.table.seats})
                                                    </Badge>
                                                ))}
                                            </Group>
                                        ) : (
                                            <Text c="dimmed">Brak</Text>
                                        )}
                                    </Table.Td>

                                    {/* Select przypisania */}
                                    <Table.Td>
                                        <Select
                                            placeholder="Wybierz stół"
                                            data={tables
                                                .filter((t) => t.isActive)
                                                .map((t) => ({
                                                    value: String(t.id),
                                                    label: `${t.name || `Stół ${t.id}`} (${t.seats})`,
                                                }))}
                                            onChange={(v) => v && doAssign(r.id, Number(v))}
                                            searchable
                                            clearable
                                            nothingFoundMessage="Brak aktywnych stołów"
                                            checkIconPosition="right"
                                            w={220}
                                        />
                                    </Table.Td>

                                    {/* Akcje statusów */}
                                    <Table.Td>
                                        <Group gap="xs">
                                            <Button
                                                size="xs"
                                                variant="light"
                                                onClick={() => updateStatus(r.id, 'CONFIRMED')}
                                            >
                                                Potwierdź
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant="light"
                                                color="yellow"
                                                onClick={() => updateStatus(r.id, 'PENDING')}
                                            >
                                                Oczek.
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant="light"
                                                color="red"
                                                onClick={() => updateStatus(r.id, 'REJECTED')}
                                            >
                                                Odrzuć
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant="light"
                                                color="red"
                                                onClick={() => updateStatus(r.id, 'CANCELLED')}
                                            >
                                                Anuluj
                                            </Button>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Card>
        </Stack>
    );
}
