import React from 'react';
import { useParams } from 'react-router-dom';
import { getProfile, updateProfile } from '../../../api';
import {
    Card, TextInput, Textarea, NumberInput, Button, Title, Grid, Stack,
    Group, Table, Switch, ActionIcon, Tooltip, Divider
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash } from '@tabler/icons-react';

type MenuItem = {
    name: string;
    price: number;
    category?: string;
    isAvailable?: boolean;
    description?: string;
};

export default function Profile() {
    const { rid } = useParams();
    const [data, setData] = React.useState<any>(null);
    const [menu, setMenu] = React.useState<MenuItem[]>([]);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        getProfile(Number(rid)).then((d) => {
            setData(d);
            setMenu(Array.isArray(d?.menu) ? d.menu : []);
        });
    }, [rid]);

    const addItem = () =>
        setMenu((m) => [...m, { name: '', price: 0, category: '', isAvailable: true }]);

    const removeItem = (idx: number) =>
        setMenu((m) => m.filter((_, i) => i !== idx));

    const changeItem = (idx: number, patch: Partial<MenuItem>) =>
        setMenu((m) => m.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

    const save = async () => {
        setSaving(true);
        try {
            await updateProfile(Number(rid), {
                description: data.description,
                openingHours: data.openingHours,
                capacity: Number(data.capacity ?? 0),
                imageUrl: data.imageUrl,
                // ⬇️ Zapis całego menu jako JSON
                menu,
            });
            notifications.show({ color: 'green', message: 'Zapisano profil i menu' });
        } catch {
            notifications.show({ color: 'red', message: 'Błąd zapisu' });
        } finally {
            setSaving(false);
        }
    };

    if (!data) return null;

    return (
        <Stack gap="lg">
            <Title order={2}>Profil restauracji</Title>

            <Card withBorder radius="md" p="lg">
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput label="Nazwa" value={data.name} readOnly />
                        <TextInput
                            mt="md" label="Godziny otwarcia"
                            value={data.openingHours || ''}
                            onChange={(e) => setData({ ...data, openingHours: e.currentTarget.value })}
                        />
                        <NumberInput
                            mt="md" label="Pojemność (miejsca)" min={0}
                            value={data.capacity ?? 0}
                            onChange={(v) => setData({ ...data, capacity: Number(v || 0) })}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput
                            label="Adres obrazka (baner)"
                            value={data.imageUrl || ''}
                            onChange={(e) => setData({ ...data, imageUrl: e.currentTarget.value })}
                        />
                        <Textarea
                            mt="md" label="Opis" minRows={6}
                            value={data.description || ''}
                            onChange={(e) => setData({ ...data, description: e.currentTarget.value })}
                        />
                    </Grid.Col>
                </Grid>
            </Card>

            <Divider label="Menu" />

            <Card withBorder radius="md" p="lg">
                <Group justify="space-between" mb="sm">
                    <Title order={4}>Pozycje menu</Title>
                    <Button leftSection={<IconPlus size={16} />} onClick={addItem} variant="light" size="sm">
                        Dodaj pozycję
                    </Button>
                </Group>

                <Table striped highlightOnHover withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Nazwa</Table.Th>
                            <Table.Th>Kategoria</Table.Th>
                            <Table.Th>Cena</Table.Th>
                            <Table.Th>Dostępne</Table.Th>
                            <Table.Th>Opis</Table.Th>
                            <Table.Th />
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {menu.map((it, idx) => (
                            <Table.Tr key={idx}>
                                <Table.Td>
                                    <TextInput
                                        placeholder="np. Margherita"
                                        value={it.name}
                                        onChange={(e) => changeItem(idx, { name: e.currentTarget.value })}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <TextInput
                                        placeholder="np. Pizza"
                                        value={it.category || ''}
                                        onChange={(e) => changeItem(idx, { category: e.currentTarget.value })}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <NumberInput
                                        min={0} step={0.5} thousandSeparator=" "
                                        value={it.price}
                                        onChange={(v) => changeItem(idx, { price: Number(v || 0) })}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Switch
                                        checked={!!it.isAvailable}
                                        onChange={(e) => changeItem(idx, { isAvailable: e.currentTarget.checked })}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <TextInput
                                        placeholder="krótki opis"
                                        value={it.description || ''}
                                        onChange={(e) => changeItem(idx, { description: e.currentTarget.value })}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Tooltip label="Usuń">
                                        <ActionIcon variant="light" color="red" onClick={() => removeItem(idx)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>

                <Group justify="flex-end" mt="lg">
                    <Button onClick={save} loading={saving}>Zapisz</Button>
                </Group>
            </Card>
        </Stack>
    );
}
