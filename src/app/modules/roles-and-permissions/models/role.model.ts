import { ApiResponse, SingleApiResponse } from "../../shared/models/api-response.model";

export interface Role {
    id: number;
    name: string;
    permissions: string[];
}

export interface RolePayload {
    name: string;
    permissions: string[];
}

export type RolesResponse = ApiResponse<Role[]>;
export type RoleResponse = SingleApiResponse<Role>;
