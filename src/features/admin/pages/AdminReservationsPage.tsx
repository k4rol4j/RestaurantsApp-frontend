import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { Table, Group, Button, TextInput, Badge, Stack } from '@mantine/core';

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
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getReservations({ from, to });
            setItems(data.items);
            setTotal(data.total);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cancelRes = async (id: number) => {
        if (!confirm('Anulować rezerwację (soft — status CANCELLED)?')) return;
        await adminApi.cancelReservation(id);
        await load();
    };

    const hardDelete = async (id: number) => {
        if (!confirm('USUNĄĆ rezerwację na stałe? Tej operacji nie można cofnąć.')) return;
        await adminApi.deleteReservation(id);
        await load();
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
                    <Button onClick={load} loading={loading}>
                        Filtruj
                    </Button>
                </Group>
                <div>Łącznie: {total}</div>
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
        </>
    );
}
