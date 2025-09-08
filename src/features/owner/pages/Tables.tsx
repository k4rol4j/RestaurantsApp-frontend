import React from 'react';
import { useParams } from 'react-router-dom';
import { listTables, createTable, updateTable } from '../../../api';
import { Card, Title, Table, Text, Group, TextInput, NumberInput, Button, Switch, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';

type TableRow = { id: number; name: string | null; seats: number; isActive: boolean };

export default function Tables() {
    const { rid } = useParams();
    const restaurantId = Number(rid);

    const [rows, setRows] = React.useState<TableRow[]>([]);
    const [formName, setFormName] = React.useState('');
    const [formSeats, setFormSeats] = React.useState<number | ''>(4);
    const [loading, setLoading] = React.useState(true);

    const load = React.useCallback(() => {
        if (!Number.isFinite(restaurantId)) return;
        setLoading(true);
        listTables(restaurantId).then(setRows).finally(() => setLoading(false));
    }, [restaurantId]);

    React.useEffect(() => { load(); }, [load]);

    const add = async () => {
        await createTable(restaurantId, { name: formName || undefined, seats: Number(formSeats) });
        notifications.show({ color: 'green', message: 'Dodano stół' });
        setFormName(''); setFormSeats(4);
        load();
    };

    const toggle = async (id: number, isActive: boolean) => {
        await updateTable(restaurantId, id, { isActive: !isActive });
        notifications.show({ color: 'green', message: isActive ? 'Stół dezaktywowany' : 'Stół aktywowany' });
        load();
    };

    return (
        <Stack gap="lg">
            <Title order={2}>Stoły</Title>

            <Card withBorder radius="md" p="lg">
                <Group align="end" gap="md">
                    <TextInput label="Nazwa (opcjonalnie)" placeholder="np. A1" value={formName} onChange={(e) => setFormName(e.currentTarget.value)} />
                    <NumberInput
                        label="Miejsca"
                        min={1}
                        value={formSeats}
                        onChange={(val) => setFormSeats(val === '' ? '' : Number(val))}
                    />
                    <Button onClick={add} disabled={!formSeats}>Dodaj</Button>
                </Group>
            </Card>

            <Card withBorder radius="md" p="lg">
                {loading ? (
                    <Text c="dimmed">Ładowanie…</Text>
                ) : rows.length === 0 ? (
                    <Text c="dimmed">Brak stołów</Text>
                ) : (
                    <Table striped highlightOnHover withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>ID</Table.Th>
                                <Table.Th>Nazwa</Table.Th>
                                <Table.Th>Miejsca</Table.Th>
                                <Table.Th>Aktywny</Table.Th>
                                <Table.Th />
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.map((r) => (
                                <Table.Tr key={r.id}>
                                    <Table.Td>{r.id}</Table.Td>
                                    <Table.Td>{r.name || '-'}</Table.Td>
                                    <Table.Td>{r.seats}</Table.Td>
                                    <Table.Td><Switch checked={r.isActive} readOnly /></Table.Td>
                                    <Table.Td>
                                        <Button variant="light" size="xs" onClick={() => toggle(r.id, r.isActive)}>
                                            {r.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                                        </Button>
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
