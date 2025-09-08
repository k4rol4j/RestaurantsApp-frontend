import React from 'react';
import { useParams } from 'react-router-dom';
import { getDashboard } from '../../../api';
import { Card, Group, Stack, Title, Text, Progress, Loader, Grid, Badge } from '@mantine/core';

export default function Dashboard() {
    const { rid } = useParams();
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        getDashboard(Number(rid)).then(setData).finally(() => setLoading(false));
    }, [rid]);

    if (loading) return <Loader />;
    if (!data) return <Text>Brak danych</Text>;

    return (
        <Stack gap="lg">
            <Title order={2}>{data.restaurant.name}</Title>

            <Card withBorder radius="md" p="lg">
                <Text fw={600} mb="xs">Dzisiejsze obłożenie</Text>
                <Group align="center" gap="sm">
                    <Progress value={data.occupancy} w={280} />
                    <Text fw={700}>{data.occupancy}%</Text>
                </Group>
            </Card>

            <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder radius="md" p="lg">
                        <Text fw={600} mb="sm">Dzisiaj</Text>
                        {data.today.length === 0 && <Text c="dimmed">Brak rezerwacji</Text>}
                        <Stack gap="xs">
                            {data.today.map((x: any) => (
                                <Group key={x.id} gap="sm" justify="space-between">
                                    <Text>{new Date(x.date).toLocaleString()}</Text>
                                    <Group gap="xs">
                                        <Badge>{x.people} os.</Badge>
                                        <Badge color={x.status === 'CONFIRMED' ? 'green' : x.status === 'PENDING' ? 'yellow' : 'red'}>
                                            {x.status}
                                        </Badge>
                                    </Group>
                                </Group>
                            ))}
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder radius="md" p="lg">
                        <Text fw={600} mb="sm">Jutro</Text>
                        {data.tomorrow.length === 0 && <Text c="dimmed">Brak rezerwacji</Text>}
                        <Stack gap="xs">
                            {data.tomorrow.map((x: any) => (
                                <Group key={x.id} gap="sm" justify="space-between">
                                    <Text>{new Date(x.date).toLocaleString()}</Text>
                                    <Group gap="xs">
                                        <Badge>{x.people} os.</Badge>
                                        <Badge color={x.status === 'CONFIRMED' ? 'green' : x.status === 'PENDING' ? 'yellow' : 'red'}>
                                            {x.status}
                                        </Badge>
                                    </Group>
                                </Group>
                            ))}
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
