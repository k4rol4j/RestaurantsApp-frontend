import {NavLink} from "@mantine/core";
import {IconCalendar, IconHeart, IconLogout, IconSearch} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";
import {logout} from "../features/login/api/logout.ts";


export const AppNavbar = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    return (
        <div>
            <NavLink onClick={() => navigate('/reservations')} label="Szukaj" leftSection={<IconSearch size={16} stroke={1.5} />} />
            <NavLink onClick={() => navigate('/reservations/my')} label="Moje rezerwacje" leftSection={<IconCalendar size={16} stroke={1.5} />} />
            <NavLink onClick={handleLogout} label="Wyloguj się" leftSection={<IconLogout size={16} stroke={1.5} />} />
            <NavLink onClick={() => navigate('/favorites')} label="Ulubione" leftSection={<IconHeart size={16} stroke={1.5} />}/>
        </div>
    )
}