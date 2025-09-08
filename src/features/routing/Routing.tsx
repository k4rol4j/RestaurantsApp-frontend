import { useRoutes, Navigate } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import RedirectIfAuthed from './RedirectIfAuthed';
import { Layout } from '../../components/Layout';
import { RestaurantsList } from '../reservations/RestaurantsList';
import { MyReservations } from '../reservations/MyReservations';
import { RestaurantDetails } from '../reservations/RestaurantDetails';
import { Favorites } from '../reservations/Favorites';
import { RestaurantSearchByLocation } from '../reservations/RestaurantSearchByLocation';
import OwnerLayout from "../owner/OwnerLayout.tsx";
import Dashboard from "../owner/pages/Dashboard.tsx";
import Profile from "../owner/pages/Profile.tsx";
import Tables from "../owner/pages/Tables.tsx";
import Reservations from "../owner/pages/Reservations.tsx";
import RequireOwner from "./RequireOwner.tsx";

export const Routing = () => {
    const routes = useRoutes([
        { path: '/login', element: <RedirectIfAuthed /> },

        {
            path: '/',
            element: <Layout />,
            children: [
                {
                    element: <RequireAuth />,
                    children: [
                        { index: true, element: <Navigate to="/reservations" replace /> },
                        { path: 'reservations', element: <RestaurantsList /> },
                        { path: 'reservations/my', element: <MyReservations /> },
                        { path: 'reservations/:id', element: <RestaurantDetails /> },
                        { path: 'favorites', element: <Favorites /> },
                        { path: 'search-location', element: <RestaurantSearchByLocation /> },
                    ],
                },
                { path: '*', element: <Navigate to="/login" replace /> },
            ],
        },
        {
            path: 'owner/:rid',
            element: <RequireOwner />,
            children: [
                {
                    element: <OwnerLayout />,
                    children: [
                        { index: true, element: <Navigate to="dashboard" replace /> },
                        { path: 'dashboard', element: <Dashboard /> },
                        { path: 'profile', element: <Profile /> },
                        { path: 'tables', element: <Tables /> },
                        { path: 'reservations', element: <Reservations /> },
                    ],
                },
            ],
        },

        { path: '*', element: <Navigate to="/login" replace /> },
    ]);

    return routes;
};
