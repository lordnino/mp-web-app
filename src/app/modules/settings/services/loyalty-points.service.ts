import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class LoyaltyPointsService {
    private _loyaltyPointsBaseUrl = `${environment.apiUrl}loyalty-points-settings`;

    constructor(private http: HttpClient) {}

    getLoyaltyPoints(): Observable<any> {
        return this.http.get<any>(this._loyaltyPointsBaseUrl);
    }

    updateLoyaltyPoints(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this._loyaltyPointsBaseUrl}/${id}`, data);
    }

    getLoyaltyPointsHistory(page: number = 1, perPage: number = 30): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}loyalty-points-logs?page=${page}&per_page=${perPage}`);
    }
} 