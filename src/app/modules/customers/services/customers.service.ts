import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { CustomersResponse, Customer } from '../models/customer.model';

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
}