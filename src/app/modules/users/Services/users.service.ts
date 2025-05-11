import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    private _baseUrl = environment.apiUrl;

    constructor(private _httpClient: HttpClient) { }

    getUsers(params: any): Observable<any> {
        return this._httpClient.get(`${this._baseUrl}users`, { params });
    }

    getSingleUser(id: number): Observable<any> {
        return this._httpClient.get(`${this._baseUrl}users/${id}`);
    }

    addNewUser(user: any): Observable<any> {
        return this._httpClient.post(`${this._baseUrl}users`, user);
    }

    updateUser(id: number, user: any): Observable<any> {
        return this._httpClient.put(`${this._baseUrl}users/${id}`, user);
    }

    deleteUser(id: number): Observable<any> {
        return this._httpClient.delete(`${this._baseUrl}users/${id}`);
    }

    toggleUserStatus(userId: number, status: boolean): Observable<any> {
        return this._httpClient.patch(`${this._baseUrl}users/${userId}/active-status`, {
            is_active: status
        });
    }
} 