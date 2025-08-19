export interface Transaction {
    id: number;
    customer_id: number;
    type: 'credit' | 'debit' | 'charge' | 'refund';
    amount: number;
    balance_before: number;
    balance_after: number;
    description?: string;
    reference_id?: string;
    created_at: string;
    updated_at?: string;
}

export interface TransactionsResponse {
    data: Transaction[];
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

export interface TransactionFilters {
    type?: 'credit' | 'debit' | 'charge' | 'refund';
    from_date?: string;
    to_date?: string;
    page?: number;
    per_page?: number;
}