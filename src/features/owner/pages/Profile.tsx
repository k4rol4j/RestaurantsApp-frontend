import React from 'react';
import { useParams } from 'react-router-dom';
import { getProfile, updateProfile, uploadImage } from '../../../api';
import {
    Card,
    Textarea,
    NumberInput,
    Button,
    Title,
    Grid,
    Stack,
    Group,
    Table,
    Switch,
    ActionIcon,
    Tooltip,
    Divider,
    TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {IconPlus, IconTrash, IconX} from '@tabler/icons-react';
import { OpeningHoursEditor } from '../../../components/OpeningHoursEditor';
import SafeImage from '../../../components/SafeImage';

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
    const [uploading, setUploading] = React.useState(false);

    React.useEffect(() => {
        getProfile(Number(rid)).then((d) => {
            setData(d);
            setMenu(Array.isArray(d?.menu) ? d.menu : []);
        });
    }, [rid]);

    const addItem = () =>
        setMenu((m) => [...m, { name: '', price: 0, category: '', isAvailable: true }]);

    const removeItem = (idx: number) => setMenu((m) => m.filter((_, i) => i !== idx));

    const changeItem = (idx: number, patch: Partial<MenuItem>) =>
        setMenu((m) => m.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

    // ✅ poprawione przesyłanie zdjęcia
    const handleImageUpload = async (file: File | null) => {
        if (!file) return;
        try {
            setUploading(true);
            const res = await uploadImage(file);
            // backend zwraca { url, fullUrl }
            setData({ ...data, imageUrl: res });
            notifications.show({ color: 'green', message: 'Zdjęcie przesłane pomyślnie' });
        } catch (err) {
            console.error(err);
            notifications.show({ color: 'red', message: 'Błąd przesyłania zdjęcia' });
        } finally {
            setUploading(false);
        }
    };

    const save = async () => {
        setSaving(true);
        try {
            await updateProfile(Number(rid), {
                description: data.description,
                openingHours: data.openingHours,
                capacity: Number(data.capacity ?? 0),
                imageUrl: data.imageUrl,
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

                        <Title order={5} mt="md" mb="xs">
                            Godziny otwarcia
                        </Title>
                        <OpeningHoursEditor
                            value={(() => {
                                try {
                                    return data.openingHours ? JSON.parse(data.openingHours) : {};
                                } catch {
                                    return {};
                                }
                            })()}
                            onChange={(val) =>
                                setData({ ...data, openingHours: JSON.stringify(val) })
                            }
                        />

                        <NumberInput
                            mt="md"
                            label="Pojemność (miejsca)"
                            min={0}
                            value={data.capacity ?? 0}
                            onChange={(v) => setData({ ...data, capacity: Number(v || 0) })}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                        {/* 🖼 Upload + podgląd */}
                        <Title order={5} mb="xs">
                            Obrazek (baner)
                        </Title>
                        <Group align="flex-start" gap="md">
                            <Button
                                component="label"
                                loading={uploading}
                                disabled={uploading}
                            >
                                {uploading ? 'Wysyłanie...' : 'Wybierz obrazek'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) =>
                                        handleImageUpload(e.target.files?.[0] ?? null)
                                    }
                                />
                            </Button>

                            <Button
                                variant="light"
                                color="red"
                                leftSection={<IconX size={14} />}
                                onClick={() => setData({ ...data, imageUrl: null })}
                                disabled={!data.imageUrl}
                            >
                                Usuń zdjęcie
                            </Button>

                            <div
                                style={{
                                    width: 220,
                                    height: 150,
                                    borderRadius: 8,
                                    border: '1px solid #ddd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f4f5f7',
                                }}
                            >
                                {data.imageUrl ? (
                                    <SafeImage
                                        src={data.imageUrl}
                                        alt="Podgląd"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: 8,
                                            objectFit: 'cover',
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#999' }}>Brak zdjęcia</p>
                                )}
                            </div>
                        </Group>

                        <Textarea
                            mt="md"
                            label="Opis restauracji"
                            autosize
                            minRows={6}
                            maxRows={20}
                            styles={{
                                input: {
                                    fontSize: '15px',
                                    lineHeight: 1.6,
                                    padding: '12px',
                                },
                            }}
                            value={data.description || ''}
                            onChange={(e) =>
                                setData({ ...data, description: e.currentTarget.value })
                            }
                        />
                    </Grid.Col>
                </Grid>
            </Card>

            <Divider label="Menu" />

            <Card withBorder radius="md" p="lg">
                <Group justify="space-between" mb="sm">
                    <Title order={4}>Pozycje menu</Title>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={addItem}
                        variant="light"
                        size="sm"
                    >
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
                                        onChange={(e) =>
                                            changeItem(idx, { name: e.currentTarget.value })
                                        }
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <TextInput
                                        placeholder="np. Pizza"
                                        value={it.category || ''}
                                        onChange={(e) =>
                                            changeItem(idx, { category: e.currentTarget.value })
                                        }
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <NumberInput
                                        min={0}
                                        step={0.5}
                                        thousandSeparator=" "
                                        value={it.price}
                                        onChange={(v) =>
                                            changeItem(idx, { price: Number(v || 0) })
                                        }
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Switch
                                        checked={!!it.isAvailable}
                                        onChange={(e) =>
                                            changeItem(idx, {
                                                isAvailable: e.currentTarget.checked,
                                            })
                                        }
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <TextInput
                                        placeholder="krótki opis"
                                        value={it.description || ''}
                                        onChange={(e) =>
                                            changeItem(idx, { description: e.currentTarget.value })
                                        }
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Tooltip label="Usuń">
                                        <ActionIcon
                                            variant="light"
                                            color="red"
                                            onClick={() => removeItem(idx)}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>

                <Group justify="flex-end" mt="lg">
                    <Button onClick={save} loading={saving}>
                        Zapisz
                    </Button>
                </Group>
            </Card>
        </Stack>
    );
}
