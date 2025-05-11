import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RolesAndPermissionsService {
    private _baseUrl = environment.apiUrl;

    constructor(private _httpClient: HttpClient) { }

    getRoles(param: any): Observable<any> {
        return this._httpClient.get(`${this._baseUrl}roles`, { params: param });
    }

    getSingleRole(id): Observable<any> {
        return this._httpClient.get(`${this._baseUrl}roles/${id}`);
    }

    getAllPermissions(): Observable<any> {
        return this._httpClient.get(`${this._baseUrl}permissions`);
    }

    addNewRole(role: any): Observable<any> {
        return this._httpClient.post(`${this._baseUrl}roles`, role);
    }

    editRole(id, role: any): Observable<any> {
        return this._httpClient.put(`${this._baseUrl}roles/${id}`, role);
    }

    assignPermissionsToRole(role: any): Observable<any> {
        return this._httpClient.post(
            `${this._baseUrl}assign/role/to/permissions`,
            role
        );
    }

    deleteRole(role_id: any): Observable<any> {
        return this._httpClient.delete(`${this._baseUrl}roles/${role_id}`);
    }
}
