import { useRoutes, Navigate } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import RedirectIfAuthed from './RedirectIfAuthed';
import { Layout } from '../../components/Layout';
import { RestaurantsList } from '../reservations/RestaurantsList';
import { MyReservations } from '../reservations/MyReservations';
import { RestaurantDetails } from '../reservations/RestaurantDetails';
import { Favorites } from '../reservations/Favorites';
import { RestaurantSearchByLocation } from '../reservations/RestaurantSearchByLocation';

export const Routing = () => {
    const routes = useRoutes([
        // public
        { path: '/login', element: <RedirectIfAuthed /> },

        // private (chronione całe gniazdo przez RequireAuth + Outlet)
        {
            path: '/',
            element: <Layout />,
            children: [
                { index: true, element: <Navigate to="/reservations" replace /> },
                {
                    element: <RequireAuth />,
                    children: [
                        { path: 'reservations', element: <RestaurantsList /> },
                        { path: 'reservations/my', element: <MyReservations /> },
                        { path: 'reservations/:id', element: <RestaurantDetails /> },
                        { path: 'favorites', element: <Favorites /> },
                        { path: 'search-location', element: <RestaurantSearchByLocation /> },
                    ],
                },
                { path: '*', element: <Navigate to="/reservations" replace /> },
            ],
        },
        { path: '*', element: <Navigate to="/login' " replace /> },
    ]);

    return routes;
};
