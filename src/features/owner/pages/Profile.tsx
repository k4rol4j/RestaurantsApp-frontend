import React from 'react';
import { useParams } from 'react-router-dom';
import { getProfile, updateProfile } from '../../../api';

export default function Profile() {
    const { rid } = useParams();
    const [data, setData] = React.useState<any>(null);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => { getProfile(Number(rid)).then(setData); }, [rid]);

    const save = async () => {
        setSaving(true);
        await updateProfile(Number(rid), {
            description: data.description,
            openingHours: data.openingHours,
            capacity: Number(data.capacity ?? 0),
        });
        setSaving(false);
    };

    if (!data) return <div>Ładowanie…</div>;
    return (
        <div style={{display:'grid', gap:12, maxWidth:600}}>
            <h2>Profil</h2>
            <label>Nazwa: <input value={data.name} readOnly /></label>
            <label>Opis: <textarea value={data.description||''} onChange={e=>setData({...data, description:e.target.value})}/></label>
            <label>Godziny: <input value={data.openingHours||''} onChange={e=>setData({...data, openingHours:e.target.value})}/></label>
            <label>Pojemność: <input type="number" value={data.capacity??0} onChange={e=>setData({...data, capacity:e.target.value})}/></label>
            <button onClick={save} disabled={saving}>{saving?'Zapisywanie…':'Zapisz'}</button>
        </div>
    );
}
