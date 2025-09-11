import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { Table, Group, Button, TextInput } from '@mantine/core';

type Row = {
    id: number; name: string; location: string; cuisine: string; rating: number;
    ownerId: number; owner?: { id: number; email: string };
};

export function AdminRestaurantsPage() {
    const [items, setItems] = useState<Row[]>([]);
    const [total, setTotal] = useState(0);
    const [q, setQ] = useState('');

    const load = async () => {
        const data = await adminApi.getRestaurants(q);
        setItems(data.items); setTotal(data.total);
    };

    useEffect(()=>{ load(); }, []);

    const remove = async (id: number) => {
        if (!confirm('Usunąć restaurację?')) return;
        await adminApi.deleteRestaurant(id);
        await load();
    };

    return (
        <>
            <Group mb="sm">
                <TextInput placeholder="Szukaj po nazwie" value={q} onChange={(e)=>setQ(e.currentTarget.value)} />
                <Button onClick={load}>Szukaj</Button>
            </Group>

            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Nazwa</Table.Th>
                        <Table.Th>Lokalizacja</Table.Th>
                        <Table.Th>Kuchnia</Table.Th>
                        <Table.Th>Ocena</Table.Th>
                        <Table.Th>Owner</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map(r => (
                        <Table.Tr key={r.id}>
                            <Table.Td>{r.id}</Table.Td>
                            <Table.Td>{r.name}</Table.Td>
                            <Table.Td>{r.location}</Table.Td>
                            <Table.Td>{r.cuisine}</Table.Td>
                            <Table.Td>{Number.isFinite(r.rating) ? r.rating.toFixed(1) : '-'}</Table.Td>
                            <Table.Td>{r.owner?.email ?? r.ownerId}</Table.Td>
                            <Table.Td>
                                <Button size="xs" color="red" onClick={()=>remove(r.id)}>Usuń</Button>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <div style={{ marginTop: 8 }}>Łącznie: {total}</div>
        </>
    );
}
