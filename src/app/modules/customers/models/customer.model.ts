export interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    is_active?: boolean | 0 | 1;  // Backend sends boolean, we display/filter as 0/1
    created_at: string;
    updated_at?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    loyalty_points?: number;
    total_charges?: number;
    last_charge_date?: string;
    registration_date?: string;
}

export interface CustomersResponse {
    data: Customer[];
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}