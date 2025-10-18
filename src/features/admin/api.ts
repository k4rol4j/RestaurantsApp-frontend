import {api} from "../../api.ts";


export const adminApi = {
    // USERS
    getUsers: (q = '', skip = 0, take = 20) =>
        api.get(`/admin/users`, { params: { q, skip, take } }).then(r => r.data),
    patchOneRole: (id: number, role: 'ADMIN'|'RESTAURANT_OWNER'|'USER', add: boolean) =>
        api.patch(`/admin/users/${id}/role`, { role, add }).then(r => r.data),
    setRoles: (id: number, roles: string[]) =>
        api.put(`/admin/users/${id}/roles`, { roles }).then(r => r.data),

    // RESTAURANTS
    getRestaurants: (q = '', skip = 0, take = 20) =>
        api.get(`/admin/restaurants`, { params: { q, skip, take } }).then(r => r.data),
    deleteRestaurant: (id: number) =>
        api.delete(`/admin/restaurants/${id}`).then(r => r.data),

    // RESERVATIONS
    getReservations: (params: { from?: string; to?: string; status?: string; userId?: number; restaurantId?: number; skip?: number; take?: number }) =>
        api.get(`/admin/reservations`, { params }).then(r => r.data),
    cancelReservation: (id: number) =>
        api.patch(`/admin/reservations/${id}/cancel`, {}).then(r => r.data),

    // REVIEWS
    getReviews: (params: { userId?: number; restaurantId?: number; skip?: number; take?: number }) =>
        api.get(`/admin/reviews`, { params }).then(r => r.data),
    deleteReview: (id: number) =>
        api.delete(`/admin/reviews/${id}`).then(r => r.data),

    createRestaurant: (dto: {
        name: string;
        location: string;
        cuisine: string;
        ownerId: number;
        rating?: number;
        description?: string;
        capacity?: number;
    }) =>
        api.post('/admin/restaurants', dto).then(r => r.data),

    deleteReservation: (id: number) =>
        api.delete(`/admin/reservations/${id}`).then(r => r.data),

    restoreReservation: (id: number) =>
        api.patch(`/admin/reservations/${id}/restore`, {}).then(r => r.data),
};
