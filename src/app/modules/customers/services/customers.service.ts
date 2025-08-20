import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { CustomersResponse, Customer } from '../models/customer.model';
import { TransactionsResponse, TransactionFilters } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class CustomersService {
    private _customersBaseUrl = `${environment.apiUrl}customers`;

    constructor(private http: HttpClient) {}

    getAllCustomers(params: any = {}): Observable<CustomersResponse> {
        return this.http.get<CustomersResponse>(this._customersBaseUrl, { params });
    }

    getCustomerById(id: number): Observable<Customer> {
        return this.http.get<Customer>(`${this._customersBaseUrl}/${id}`);
    }

    createCustomer(customer: Partial<Customer>): Observable<Customer> {
        return this.http.post<Customer>(this._customersBaseUrl, customer);
    }

    updateCustomer(id: number, customer: Partial<Customer>): Observable<Customer> {
        return this.http.put<Customer>(`${this._customersBaseUrl}/${id}`, customer);
    }

    deleteCustomer(id: number): Observable<void> {
        return this.http.delete<void>(`${this._customersBaseUrl}/${id}`);
    }

    getCustomerTransactions(customerId: number, filters?: TransactionFilters): Observable<TransactionsResponse> {
        const params: any = {};
        
        if (filters) {
            if (filters.type) params.type = filters.type;
            if (filters.from_date) params.from_date = filters.from_date;
            if (filters.to_date) params.to_date = filters.to_date;
            if (filters.page) params.page = filters.page;
            if (filters.per_page) params.per_page = filters.per_page;
        }

        return this.http.get<TransactionsResponse>(
            `${environment.apiUrl}customers/${customerId}/transactions`,
            { params }
        );
    }

    getCustomerChargingHistory(customerId: number, filters?: any): Observable<any> {
        const params: any = {};
        
        if (filters) {
            if (filters.from_date) params.from_date = filters.from_date;
            if (filters.to_date) params.to_date = filters.to_date;
            if (filters.page) params.page = filters.page;
            if (filters.per_page) params.per_page = filters.per_page;
        }

        return this.http.get<any>(
            `${environment.apiUrl}customers/${customerId}/charging-history`,
            { params }
        );
    }

    getCustomerBalance(customerId: number): Observable<any> {
        return this.http.get<any>(
            `${environment.apiUrl}admin/customers/${customerId}/balance`
        );
    }
}