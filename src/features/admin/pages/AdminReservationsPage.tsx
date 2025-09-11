import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { Table, Group, Button, TextInput } from '@mantine/core';

type Row = {
    id: number; date: string; time: string; people: number; durationMinutes: number; endAt: string;
    status: 'PENDING'|'CONFIRMED'|'REJECTED'|'CANCELLED';
    user: { id: number; email: string };
    restaurant: { id: number; name: string };
    tables: { table: { id: number; name: string|null; seats: number } }[];
};

export function AdminReservationsPage() {
    const [items, setItems] = useState<Row[]>([]);
    const [total, setTotal] = useState(0);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const load = async () => {
        const data = await adminApi.getReservations({ from, to });
        setItems(data.items); setTotal(data.total);
    };

    useEffect(()=>{ load(); }, []);

    const cancelRes = async (id: number) => {
        if (!confirm('Anulować rezerwację?')) return;
        await adminApi.cancelReservation(id);
        await load();
    };

    return (
        <>
            <Group mb="sm">
                <TextInput placeholder="od (YYYY-MM-DD)" value={from} onChange={(e)=>setFrom(e.currentTarget.value)} />
                <TextInput placeholder="do (YYYY-MM-DD)" value={to} onChange={(e)=>setTo(e.currentTarget.value)} />
                <Button onClick={load}>Filtruj</Button>
            </Group>

            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Restauracja</Table.Th>
                        <Table.Th>Użytkownik</Table.Th>
                        <Table.Th>Data / Godz.</Table.Th>
                        <Table.Th>Osoby</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Stoły</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map(r => (
                        <Table.Tr key={r.id}>
                            <Table.Td>{r.id}</Table.Td>
                            <Table.Td>{r.restaurant.name}</Table.Td>
                            <Table.Td>{r.user.email}</Table.Td>
                            <Table.Td>{r.date?.slice(0,10)} {r.time}</Table.Td>
                            <Table.Td>{r.people}</Table.Td>
                            <Table.Td>{r.status}</Table.Td>
                            <Table.Td>{r.tables.map(t => t.table.name ?? `T${t.table.id}`).join(', ')}</Table.Td>
                            <Table.Td>
                                {r.status !== 'CANCELLED' && (
                                    <Button size="xs" variant="light" color="red" onClick={()=>cancelRes(r.id)}>Anuluj</Button>
                                )}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <div style={{ marginTop: 8 }}>Łącznie: {total}</div>
        </>
    );
}
