import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { Table, Group, Button, TextInput, Pill } from '@mantine/core';

type UserRow = { id: number; email: string; createdAt: string; roles: string[] };

export function AdminUsersPage() {
    const [items, setItems] = useState<UserRow[]>([]);
    const [total, setTotal] = useState(0);
    const [q, setQ] = useState('');

    const load = async () => {
        const data = await adminApi.getUsers(q);
        setItems(data.items); setTotal(data.total);
    };

    useEffect(() => { load(); }, []);

    const toggleRole = async (u: UserRow, role: 'ADMIN'|'RESTAURANT_OWNER'|'USER') => {
        const add = !u.roles.includes(role);
        await adminApi.patchOneRole(u.id, role, add);
        await load();
    };

    return (
        <>
            <Group mb="sm">
                <TextInput placeholder="Szukaj po email" value={q} onChange={(e)=>setQ(e.currentTarget.value)} />
                <Button onClick={load}>Szukaj</Button>
            </Group>

            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Role</Table.Th>
                        <Table.Th>Akcje</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map(u => (
                        <Table.Tr key={u.id}>
                            <Table.Td>{u.id}</Table.Td>
                            <Table.Td>{u.email}</Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    {u.roles.length ? u.roles.map(r => <Pill key={r}>{r}</Pill>) : <Pill>USER</Pill>}
                                </Group>
                            </Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <Button size="xs" variant={u.roles.includes('ADMIN')?'filled':'light'} onClick={()=>toggleRole(u,'ADMIN')}>ADMIN</Button>
                                    <Button size="xs" variant={u.roles.includes('RESTAURANT_OWNER')?'filled':'light'} onClick={()=>toggleRole(u,'RESTAURANT_OWNER')}>OWNER</Button>
                                    <Button size="xs" variant={u.roles.includes('USER')?'filled':'light'} onClick={()=>toggleRole(u,'USER')}>USER</Button>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <div style={{ marginTop: 8 }}>Łącznie: {total}</div>
        </>
    );
}
