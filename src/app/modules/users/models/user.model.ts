import { ApiResponse, SingleApiResponse } from "../../shared/models/api-response.model";

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    roles: string[];
    is_active: boolean;
}

export interface UserPayload {
    name: string;
    email: string;
    password?: string;
    roles: string[];
}

export type UsersResponse = ApiResponse<User[]>;
export type UserResponse = SingleApiResponse<User>; 