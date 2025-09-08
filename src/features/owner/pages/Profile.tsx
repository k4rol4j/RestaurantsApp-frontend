import React from 'react';
import { useParams } from 'react-router-dom';
import { getProfile, updateProfile } from '../../../api';
import { Card, TextInput, Textarea, NumberInput, Button, Title, Grid, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function Profile() {
    const { rid } = useParams();
    const [data, setData] = React.useState<any>(null);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        getProfile(Number(rid)).then(setData);
    }, [rid]);

    const save = async () => {
        setSaving(true);
        try {
            await updateProfile(Number(rid), {
                description: data.description,
                openingHours: data.openingHours,
                capacity: Number(data.capacity ?? 0),
                imageUrl: data.imageUrl,
            });
            notifications.show({ color: 'green', message: 'Zapisano profil' });
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
                        <TextInput mt="md" label="Godziny otwarcia" value={data.openingHours || ''} onChange={(e) => setData({ ...data, openingHours: e.currentTarget.value })} />
                        <NumberInput mt="md" label="Pojemność (miejsca)" value={data.capacity ?? 0} min={0}
                                     onChange={(v) => setData({ ...data, capacity: Number(v) })} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput label="Adres obrazka (baner)" value={data.imageUrl || ''} onChange={(e) => setData({ ...data, imageUrl: e.currentTarget.value })} />
                        <Textarea mt="md" label="Opis" minRows={6} value={data.description || ''} onChange={(e) => setData({ ...data, description: e.currentTarget.value })} />
                    </Grid.Col>
                </Grid>

                <Button mt="lg" onClick={save} loading={saving}>
                    Zapisz
                </Button>
            </Card>
        </Stack>
    );
}
