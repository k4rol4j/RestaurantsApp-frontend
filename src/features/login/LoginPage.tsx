import { useState } from 'react';
import {
    Button,
    Stack,
    TextInput,
    Tabs,
    rem,
    Container,
    Paper,
    Title,
    Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { login } from './api/login';
import { register } from '../register/api/register';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconAt, IconLock } from '@tabler/icons-react';
import {API_URL} from "../../config.ts";

export const LoginPage = () => {
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const navigate = useNavigate();

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        },
        validate: {
            email: (value) =>
                /^\S+@\S+\.\S+$/.test(value) ? null : 'Niepoprawny adres email',
            password: (value) =>
                value.length >= 8 ? null : 'Hasło musi mieć min. 8 znaków',
        },
    });

    const handleLogin = async () => {
        try {
            await login(form.values.email, form.values.password);

            // natychmiastowa weryfikacja sesji (cookie + JWT)
            const meRes = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include',
            });
            if (!meRes.ok) {
                throw new Error('Session not established');
            }

            navigate('/reservations', { replace: true });
        } catch (error: any) {
            const status = error?.response?.status;
            const message =
                status === 401
                    ? 'Nieprawidłowy email lub hasło'
                    : 'Wystąpił błąd logowania';

            notifications.show({
                title: 'Błąd logowania',
                message,
                color: 'red',
            });
        }
    };


    const handleRegister = async () => {
        try {
            await register(form.values.email, form.values.password);
            notifications.show({
                title: 'Rejestracja zakończona',
                message: 'Możesz się teraz zalogować',
                color: 'green',
            });
            setTab('login');
        } catch (error: any) {
            const status = error?.response?.status;
            const message =
                status === 409
                    ? 'Użytkownik z takim emailem już istnieje'
                    : 'Nie udało się założyć konto';

            notifications.show({
                title: 'Błąd rejestracji',
                message,
                color: 'red',
            });
        }
    };

    return (
        <Box
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(to bottom right, #f7f9fc, #dee2e6)',
                padding: '2rem',
            }}
        >
            <Box>
                <Title ta="center" order={1} c="blue.7" fw={700} mb="xl">
                    Eating 🍽️
                </Title>

                <Container size={420}>
                    <Paper withBorder shadow="md" p="xl" radius="lg">
                        <Title ta="center" order={3} mb="lg">
                            {tab === 'login' ? 'Zaloguj się' : 'Załóż konto'}
                        </Title>

                        <Tabs
                            value={tab}
                            onChange={(value) => setTab(value as 'login' | 'register')}
                            variant="default"
                            defaultValue="login"
                        >
                            <Tabs.List grow>
                                <Tabs.Tab value="login">MAM JUŻ KONTO</Tabs.Tab>
                                <Tabs.Tab value="register">ZAŁÓŻ KONTO</Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="login" pt="lg">
                                <form onSubmit={form.onSubmit(handleLogin)}>
                                    <Stack>
                                        <TextInput
                                            label="Email"
                                            placeholder="Email"
                                            leftSection={<IconAt style={{ width: rem(16) }} />}
                                            {...form.getInputProps('email')}
                                        />
                                        <TextInput
                                            label="Hasło"
                                            type="password"
                                            placeholder="Hasło"
                                            leftSection={<IconLock style={{ width: rem(16) }} />}
                                            {...form.getInputProps('password')}
                                        />
                                        <Button type="submit" fullWidth radius="xl">
                                            ZALOGUJ
                                        </Button>
                                    </Stack>
                                </form>
                            </Tabs.Panel>

                            <Tabs.Panel value="register" pt="lg">
                                <form onSubmit={form.onSubmit(handleRegister)}>
                                    <Stack>
                                        <TextInput
                                            label="Email"
                                            placeholder="Email"
                                            leftSection={<IconAt style={{ width: rem(16) }} />}
                                            {...form.getInputProps('email')}
                                        />
                                        <TextInput
                                            label="Hasło"
                                            type="password"
                                            placeholder="Hasło"
                                            leftSection={<IconLock style={{ width: rem(16) }} />}
                                            {...form.getInputProps('password')}
                                        />
                                        <Button type="submit" fullWidth radius="xl">
                                            ZAŁÓŻ KONTO
                                        </Button>
                                    </Stack>
                                </form>
                            </Tabs.Panel>
                        </Tabs>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};
