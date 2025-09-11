// src/features/routing/Routing.tsx
import { useRoutes, Navigate } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import RedirectIfAuthed from './RedirectIfAuthed';
import { Layout } from '../../components/Layout';
import { RestaurantsList } from '../reservations/RestaurantsList';
import { MyReservations } from '../reservations/MyReservations';
import { RestaurantDetails } from '../reservations/RestaurantDetails';
import { Favorites } from '../reservations/Favorites';
import { RestaurantSearchByLocation } from '../reservations/RestaurantSearchByLocation';

import OwnerLayout from '../owner/OwnerLayout';
import Dashboard from '../owner/pages/Dashboard';
import Profile from '../owner/pages/Profile';
import Tables from '../owner/pages/Tables';
import Reservations from '../owner/pages/Reservations';

import { GenericRoleRoute } from './GenericRoleRoute';

// --- ADMIN (utwórz te komponenty, jeśli jeszcze nie masz) ---
import { AdminLayout } from '../admin/AdminLayout';
import { AdminUsersPage } from '../admin/pages/AdminUsersPage';
import { AdminRestaurantsPage } from '../admin/pages/AdminRestaurantsPage';
import { AdminReservationsPage } from '../admin/pages/AdminReservationsPage';
import { AdminReviewsPage } from '../admin/pages/AdminReviewsPage';

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

        // OWNER: używamy GenericRoleRoute zamiast RequireOwner/OwnerRoute
        {
            path: 'owner/:rid',
            element: (
                <GenericRoleRoute allowedRoles={['RESTAURANT_OWNER', 'ADMIN']}>
                    <OwnerLayout />
                </GenericRoleRoute>
            ),
            children: [
                { index: true, element: <Navigate to="dashboard" replace /> },
                { path: 'dashboard', element: <Dashboard /> },
                { path: 'profile', element: <Profile /> },
                { path: 'tables', element: <Tables /> },
                { path: 'reservations', element: <Reservations /> },
            ],
        },

        // ADMIN: nowa sekcja panelu administratora
        {
            path: 'admin',
            element: (
                <GenericRoleRoute allowedRoles={['ADMIN']}>
                    <AdminLayout />
                </GenericRoleRoute>
            ),
            children: [
                { index: true, element: <Navigate to="users" replace /> },
                { path: 'users', element: <AdminUsersPage /> },
                { path: 'restaurants', element: <AdminRestaurantsPage /> },
                { path: 'reservations', element: <AdminReservationsPage /> },
                { path: 'reviews', element: <AdminReviewsPage /> },
            ],
        },

        { path: '*', element: <Navigate to="/login" replace /> },
    ]);

    return routes;
};
