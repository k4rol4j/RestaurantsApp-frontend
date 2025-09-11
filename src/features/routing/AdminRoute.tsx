import {GenericRoleRoute} from "./GenericRoleRoute.tsx";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => (
    <GenericRoleRoute allowedRoles={['ADMIN']}>{children}</GenericRoleRoute>
);
