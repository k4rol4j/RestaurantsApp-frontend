// src/features/admin/pages/AdminRestaurantsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api';
import {
    Table,
    Group,
    Button,
    TextInput,
    NumberInput,
    Select,
    Stack,
    Paper,
    Title,
    Divider,
    rem,
} from '@mantine/core';

type Row = {
    id: number;
    name: string;
    location: string;
    cuisine: string;
    rating: number;
    ownerId: number;
    owner?: { id: number; email: string };
};

type UserLite = { id: number; email: string };

export function AdminRestaurantsPage() {
    const [items, setItems] = useState<Row[]>([]);
    const [total, setTotal] = useState(0);
    const [q, setQ] = useState('');

    // --- Formularz dodawania
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [capacity, setCapacity] = useState<number | ''>(50);
    const [ownerId, setOwnerId] = useState<string>(''); // Select zwraca string
    const [users, setUsers] = useState<UserLite[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const ownerOptions = useMemo(
        () => users.map((u) => ({ value: String(u.id), label: u.email })),
        [users]
    );

    const load = async () => {
        const data = await adminApi.getRestaurants(q);
        setItems(data.items);
        setTotal(data.total);
    };

    useEffect(() => {
        // lista restauracji
        load();
        // lista użytkowników do selecta
        adminApi
            .getUsers('', 0, 50)
            .then((d: { items: UserLite[] }) => setUsers(d.items))
            .catch(() => setUsers([]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const remove = async (id: number) => {
        if (!confirm('Usunąć restaurację?')) return;
        await adminApi.deleteRestaurant(id);
        await load();
    };

    const resetForm = () => {
        setName('');
        setLocation('');
        setCuisine('');
        setCapacity(50);
        setOwnerId('');
    };

    const canSubmit =
        name.trim().length > 0 &&
        location.trim().length > 0 &&
        cuisine.trim().length > 0 &&
        ownerId !== '' &&
        typeof capacity === 'number' &&
        capacity > 0;

    const handleCreate = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            await adminApi.createRestaurant({
                name: name.trim(),
                location: location.trim(),
                cuisine: cuisine.trim(),
                ownerId: Number(ownerId),
                capacity: typeof capacity === 'number' ? capacity : 50,
            });
            resetForm();
            await load();
        } catch (e) {
            alert('Nie udało się dodać restauracji');
        } finally {
            setSubmitting(false);
        }
    };

    // handler dla NumberInput (żeby zgadzały się typy)
    const handleCapacityChange = (val: string | number) => {
        setCapacity(val === '' ? '' : Number(val));
    };

    return (
        <>
            {/* FORMULARZ DODAWANIA */}
            <Paper withBorder p="md" radius="md" mb="md">
                <Group justify="space-between" mb="sm">
                    <Title order={4} style={{ lineHeight: 1 }}>
                        Dodaj restaurację
                    </Title>
                </Group>
                <Stack gap="sm">
                    <Group grow align="end">
                        <TextInput
                            label="Nazwa"
                            placeholder="np. Trattoria Bella"
                            value={name}
                            onChange={(e) => setName(e.currentTarget.value)}
                        />
                        <TextInput
                            label="Lokalizacja"
                            placeholder="np. Kraków, ul. Długa 5"
                            value={location}
                            onChange={(e) => setLocation(e.currentTarget.value)}
                        />
                        <TextInput
                            label="Kuchnia"
                            placeholder="np. włoska"
                            value={cuisine}
                            onChange={(e) => setCuisine(e.currentTarget.value)}
                        />
                    </Group>

                    <Group grow align="end">
                        <Select
                            label="Właściciel (owner)"
                            placeholder="Wybierz właściciela"
                            value={ownerId}
                            onChange={(v) => setOwnerId(v ?? '')}
                            searchable
                            data={ownerOptions}
                            nothingFoundMessage="Brak wyników"
                        />
                        <NumberInput
                            label="Pojemność"
                            placeholder="50"
                            value={capacity}
                            onChange={handleCapacityChange}
                            min={1}
                            clampBehavior="strict"
                        />
                        <div style={{ width: rem(180) }}>
                            <Button
                                fullWidth
                                mt="xs"
                                onClick={handleCreate}
                                loading={submitting}
                                disabled={!canSubmit}
                            >
                                Dodaj
                            </Button>
                        </div>
                    </Group>
                </Stack>
            </Paper>

            <Divider my="sm" />

            {/* WYSZUKIWANIE */}
            <Group mb="sm">
                <TextInput
                    placeholder="Szukaj po nazwie"
                    value={q}
                    onChange={(e) => setQ(e.currentTarget.value)}
                />
                <Button onClick={load}>Szukaj</Button>
            </Group>

            {/* TABELA */}
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
                    {items.map((r) => (
                        <Table.Tr key={r.id}>
                            <Table.Td>{r.id}</Table.Td>
                            <Table.Td>{r.name}</Table.Td>
                            <Table.Td>{r.location}</Table.Td>
                            <Table.Td>{r.cuisine}</Table.Td>
                            <Table.Td>
                                {Number.isFinite(r.rating) ? r.rating.toFixed(1) : '-'}
                            </Table.Td>
                            <Table.Td>{r.owner?.email ?? r.ownerId}</Table.Td>
                            <Table.Td>
                                <Button size="xs" color="red" onClick={() => remove(r.id)}>
                                    Usuń
                                </Button>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <div style={{ marginTop: 8 }}>Łącznie: {total}</div>
        </>
    );
}
