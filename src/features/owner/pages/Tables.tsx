import React from 'react';
import { useParams } from 'react-router-dom';
import { listTables, createTable, updateTable } from '../../../api';

export default function Tables() {
    const { rid } = useParams();
    const [rows, setRows] = React.useState<any[]>([]);
    const [form, setForm] = React.useState({ name:'', seats:4 });

    const load = React.useCallback(() => {
        listTables(Number(rid)).then(setRows);
    }, [rid]);

    React.useEffect(() => {
        load();
    }, [load]);

    const add = async () => {
        await createTable(Number(rid), { name: form.name || undefined, seats: Number(form.seats) });
        setForm({ name:'', seats:4 });
        load();
    };
    const toggle = async (id:number, isActive:boolean) => {
        await updateTable(Number(rid), id, { isActive: !isActive });
        load();
    };

    return (
        <div>
            <h2>Stoły</h2>
            <div style={{display:'flex', gap:8, marginBottom:12}}>
                <input placeholder="Nazwa (opcjonalnie)" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
                <input type="number" value={form.seats} onChange={e=>setForm({...form, seats:Number(e.target.value)})}/>
                <button onClick={add}>Dodaj</button>
            </div>
            <table><thead><tr><th>ID</th><th>Nazwa</th><th>Miejsca</th><th>Aktywny</th><th/></tr></thead>
                <tbody>
                {rows.map(r=>(
                    <tr key={r.id}>
                        <td>{r.id}</td><td>{r.name||'-'}</td><td>{r.seats}</td>
                        <td>{String(r.isActive)}</td>
                        <td><button onClick={()=>toggle(r.id, r.isActive)}>{r.isActive?'Dezaktywuj':'Aktywuj'}</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
