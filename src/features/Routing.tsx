import { Navigate, RouteObject, useRoutes } from "react-router-dom";
import { Layout } from "../components/Layout.tsx";
import { RestaurantsList } from "./reservations/RestaurantsList.tsx";
import { RestaurantDetails } from "./reservations/RestaurantDetails.tsx";
import { LoginPage } from "./login/LoginPage.tsx";
import { useIsLogged } from "../hooks/useIsLogged.ts";
import {MyReservations} from "./reservations/MyReservations.tsx";
import {Favorites} from "./reservations/Favorites.tsx";
import {RestaurantSearchByLocation} from "./reservations/RestaurantSearchByLocation.tsx";

const publicRoutes: RouteObject[] = [
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '*',
        element: <Navigate to="/login" replace />,
    },
];

const privateRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: 'reservations',
                element: <RestaurantsList />,
            },
            {
                path: 'reservations/my',
                element: <MyReservations />,
            },
            {
                path: 'reservations/:id',
                element: <RestaurantDetails />,
            },
            {
                path: 'favorites',
                element: <Favorites />,
            },
            {
                path: '*',
                element: <Navigate to="/reservations" replace />  // Przekierowanie do strony głównej, jeśli trasa nie istnieje
            },
            {
                path: 'search-location',
                element: <RestaurantSearchByLocation />,
            },

        ],
    },
];

export const Routing = () => {
    const isLogged = useIsLogged();

    if (isLogged === undefined) {
        return <div>Loading...</div>;
    }

    const routes = isLogged ? privateRoutes : publicRoutes;
    console.log('Routing to:', routes);  // Dodaj logowanie tras

    return useRoutes(routes);
};
