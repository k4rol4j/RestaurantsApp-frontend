import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { Table, Group, Button, TextInput, Badge, Stack } from '@mantine/core';
import {modals} from "@mantine/modals";

type Row = {
    id: number;
    date: string; // ISO
    time: string; // "HH:mm"
    people: number;
    durationMinutes: number;
    endAt: string; // ISO
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
    user: { id: number; email: string };
    restaurant: { id: number; name: string };
    tables: { table: { id: number; name: string | null; seats: number } }[];
};

export function AdminReservationsPage() {
    const [items, setItems] = useState<Row[]>([]);
    const [total, setTotal] = useState(0);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const take = 20; // ile rekordów na stronę

    const load = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getReservations({
                from,
                to,
                skip: page * take,
                take,
            });
            setItems(data.items);
            setTotal(data.total);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const applyFilters = async () => {
        setPage(0);
        await load();
    };

    const cancelRes = (id: number) => {
        modals.openConfirmModal({
            title: 'Anulować rezerwację?',
            centered: true,
            labels: { confirm: 'Tak, anuluj', cancel: 'Anuluj' },
            confirmProps: { color: 'yellow' },
            children: (
                <p>
                    Czy na pewno chcesz oznaczyć tę rezerwację jako <b>ANULOWANĄ</b>?<br />
                    Użytkownik nie będzie mógł już z niej skorzystać.
                </p>
            ),
            onConfirm: async () => {
                await adminApi.cancelReservation(id);
                await load();
            },
        });
    };

    const hardDelete = (id: number) => {
        modals.openConfirmModal({
            title: 'Usunąć rezerwację na stałe?',
            centered: true,
            labels: { confirm: 'Usuń', cancel: 'Anuluj' },
            confirmProps: { color: 'red' },
            children: (
                <p>
                    Czy na pewno chcesz <b>usunąć rezerwację</b>? <br />
                    Tej operacji nie można cofnąć.
                </p>
            ),
            onConfirm: async () => {
                await adminApi.deleteReservation(id);
                await load();
            },
        });
    };


    const prettyTables = (r: Row) =>
        r.tables.map((t) => t.table.name ?? `T${t.table.id}`).join(', ');

    const statusBadge = (s: Row['status']) => {
        const color =
            s === 'CONFIRMED' ? 'green' :
                s === 'PENDING'   ? 'yellow' :
                    s === 'REJECTED'  ? 'orange' :
                        'gray';
        return <Badge color={color}>{s}</Badge>;
    };

    return (
        <>
            <Stack gap="xs" mb="sm">
                <Group>
                    <TextInput
                        placeholder="od (YYYY-MM-DD)"
                        value={from}
                        onChange={(e) => setFrom(e.currentTarget.value)}
                    />
                    <TextInput
                        placeholder="do (YYYY-MM-DD)"
                        value={to}
                        onChange={(e) => setTo(e.currentTarget.value)}
                    />
                    <Button onClick={applyFilters} loading={loading}>
                        Filtruj
                    </Button>
                </Group>

                <div>
                    Widoczne: {items.length} / Łącznie: {total}
                </div>
            </Stack>

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Restauracja</Table.Th>
                        <Table.Th>Użytkownik</Table.Th>
                        <Table.Th>Data / Godz.</Table.Th>
                        <Table.Th>Osoby</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Stoły</Table.Th>
                        <Table.Th style={{ width: 220 }}></Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {items.map((r) => (
                        <Table.Tr key={r.id}>
                            <Table.Td>{r.id}</Table.Td>
                            <Table.Td>{r.restaurant.name}</Table.Td>
                            <Table.Td>{r.user.email}</Table.Td>
                            <Table.Td>
                                {r.date?.slice(0, 10)} {r.time}
                            </Table.Td>
                            <Table.Td>{r.people}</Table.Td>
                            <Table.Td>{statusBadge(r.status)}</Table.Td>
                            <Table.Td>{prettyTables(r)}</Table.Td>
                            <Table.Td>
                                <Group gap="xs" justify="flex-start">
                                    {r.status !== 'CANCELLED' && (
                                        <Button
                                            size="xs"
                                            variant="light"
                                            color="red"
                                            onClick={() => cancelRes(r.id)}
                                        >
                                            Anuluj (soft)
                                        </Button>
                                    )}
                                    <Button
                                        size="xs"
                                        variant="filled"
                                        color="red"
                                        onClick={() => hardDelete(r.id)}
                                    >
                                        Usuń (hard)
                                    </Button>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    {items.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={8} style={{ textAlign: 'center', opacity: 0.7 }}>
                                Brak rezerwacji do wyświetlenia
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>

            <Group mt="md" justify="center">
                <Button
                    disabled={page === 0 || loading}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                    ← Poprzednia
                </Button>
                <Button
                    disabled={(page + 1) * take >= total || loading}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Następna →
                </Button>
            </Group>
        </>
    );
}
