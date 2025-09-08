import React from 'react';
import { useParams } from 'react-router-dom';
import { getDashboard } from '../../../api';

export default function Dashboard() {
    const { rid } = useParams();
    const [data, setData] = React.useState<any>(null);

    React.useEffect(() => { getDashboard(Number(rid)).then(setData); }, [rid]);
    if (!data) return <div>Ładowanie…</div>;

    return (
        <div>
            <h2>{data.restaurant.name}</h2>
            <p>Obłożenie dziś: <b>{data.occupancy}%</b></p>
            <h3>Dzisiaj</h3>
            <ul>{data.today.map((x:any)=> <li key={x.id}>{new Date(x.date).toLocaleString()} — {x.people} os. — {x.status}</li>)}</ul>
            <h3>Jutro</h3>
            <ul>{data.tomorrow.map((x:any)=> <li key={x.id}>{new Date(x.date).toLocaleString()} — {x.people} os. — {x.status}</li>)}</ul>
        </div>
    );
}
