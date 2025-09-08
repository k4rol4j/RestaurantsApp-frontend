import React from 'react';
import { useParams } from 'react-router-dom';
import { listReservations, setReservationStatus, assignTable, listTables } from '../../../api';

export default function Reservations() {
    const { rid } = useParams();
    const [rows, setRows] = React.useState<any[]>([]);
    const [date, setDate] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [tables, setTables] = React.useState<any[]>([]);

    const load = () => listReservations(Number(rid), { date: date || undefined, status: (status as any) || undefined }).then(setRows);
    React.useEffect(() => { load(); listTables(Number(rid)).then(setTables); }, [rid]);

    const updateStatus = async (id:number, st:'PENDING'|'CONFIRMED'|'REJECTED'|'CANCELLED') => { await setReservationStatus(Number(rid), id, st); load(); };
    const doAssign = async (resId:number, tblId:number) => { await assignTable(Number(rid), resId, tblId); load(); };

    return (
        <div>
            <h2>Rezerwacje</h2>
            <div style={{display:'flex', gap:8, marginBottom:12}}>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
                <select value={status} onChange={e=>setStatus(e.target.value)}>
                    <option value="">(wszystkie)</option>
                    <option>PENDING</option><option>CONFIRMED</option><option>REJECTED</option><option>CANCELLED</option>
                </select>
                <button onClick={load}>Filtruj</button>
            </div>
            <table><thead><tr><th>Data</th><th>Godz.</th><th>Osób</th><th>Status</th><th>Przypisz stół</th><th>Akcje</th></tr></thead>
                <tbody>
                {rows.map(r=>(
                    <tr key={r.id}>
                        <td>{new Date(r.date).toLocaleDateString()}</td>
                        <td>{r.time}</td>
                        <td>{r.people}</td>
                        <td>{r.status}</td>
                        <td>
                            <select onChange={e => doAssign(r.id, Number(e.target.value))} defaultValue="">
                                <option value="" disabled>Wybierz stół</option>
                                {tables.filter(t=>t.isActive).map(t=> <option key={t.id} value={t.id}>{t.name||`Stół ${t.id}`} ({t.seats})</option>)}
                            </select>
                        </td>
                        <td>
                            <button onClick={()=>updateStatus(r.id, 'CONFIRMED')}>Potwierdź</button>
                            <button onClick={()=>updateStatus(r.id, 'REJECTED')}>Odrzuć</button>
                            <button onClick={()=>updateStatus(r.id, 'CANCELLED')}>Anuluj</button>
                            {/* Przykład odpięcia stołu: <button onClick={()=>doUnassign(r.id, tables[0]?.id)}>Odepnij</button> */}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
