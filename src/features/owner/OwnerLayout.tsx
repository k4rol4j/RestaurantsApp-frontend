import { Link, Outlet, useParams } from 'react-router-dom';

export default function OwnerLayout() {
    const { rid } = useParams();
    return (
        <div style={{display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'100vh'}}>
            <aside style={{padding:16, borderRight:'1px solid #eee', display:'grid', gap:8}}>
                <b>Panel właściciela</b>
                <Link to={`/owner/${rid}/dashboard`}>Dashboard</Link>
                <Link to={`/owner/${rid}/profile`}>Profil</Link>
                <Link to={`/owner/${rid}/tables`}>Stoły</Link>
                <Link to={`/owner/${rid}/reservations`}>Rezerwacje</Link>
            </aside>
            <main style={{padding:24}}>
                <Outlet />
            </main>
        </div>
    );
}
