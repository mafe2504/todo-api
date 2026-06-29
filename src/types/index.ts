export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    created_at: string;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

export interface JWTPayload {
    userId: number;
    email: string;
}

export interface Todo {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface TodoResponse {
    id: number;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
}