import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { Table, Group, Button, TextInput, Rating } from '@mantine/core';

type Row = {
    id: number; rating: number; comment: string; date: string;
    user: { id: number; email: string };
    restaurant: { id: number; name: string };
    reservationId?: number|null;
};

export function AdminReviewsPage() {
    const [items, setItems] = useState<Row[]>([]);
    const [total, setTotal] = useState(0);
    const [restaurantId, setRestaurantId] = useState('');
    const [userId, setUserId] = useState('');

    const load = async () => {
        const params: any = {};
        if (restaurantId) params.restaurantId = Number(restaurantId);
        if (userId) params.userId = Number(userId);
        const data = await adminApi.getReviews(params);
        setItems(data.items); setTotal(data.total);
    };

    useEffect(()=>{ load(); }, []);

    const remove = async (id: number) => {
        if (!confirm('Usunąć opinię?')) return;
        await adminApi.deleteReview(id);
        await load();
    };

    return (
        <>
            <Group mb="sm">
                <TextInput placeholder="restaurantId" value={restaurantId} onChange={(e)=>setRestaurantId(e.currentTarget.value)} />
                <TextInput placeholder="userId" value={userId} onChange={(e)=>setUserId(e.currentTarget.value)} />
                <Button onClick={load}>Filtruj</Button>
            </Group>

            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Restauracja</Table.Th>
                        <Table.Th>Użytkownik</Table.Th>
                        <Table.Th>Ocena</Table.Th>
                        <Table.Th>Komentarz</Table.Th>
                        <Table.Th>Data</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map(r=>(
                        <Table.Tr key={r.id}>
                            <Table.Td>{r.id}</Table.Td>
                            <Table.Td>{r.restaurant.name}</Table.Td>
                            <Table.Td>{r.user.email}</Table.Td>
                            <Table.Td><Rating value={r.rating} readOnly /></Table.Td>
                            <Table.Td style={{maxWidth:400}}>{r.comment}</Table.Td>
                            <Table.Td>{r.date?.slice(0,10)}</Table.Td>
                            <Table.Td><Button size="xs" color="red" onClick={()=>remove(r.id)}>Usuń</Button></Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <div style={{ marginTop: 8 }}>Łącznie: {total}</div>
        </>
    );
}
