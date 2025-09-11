import {GenericRoleRoute} from "../routing/GenericRoleRoute.tsx";

export const OwnerRoute = ({ children }: { children: React.ReactNode }) => (
    <GenericRoleRoute allowedRoles={['RESTAURANT_OWNER', 'ADMIN']}>{children}</GenericRoleRoute>
);