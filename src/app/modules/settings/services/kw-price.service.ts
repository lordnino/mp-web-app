import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class KwPriceService {
    private _kwPriceBaseUrl = `${environment.apiUrl}connector-prices`;

    constructor(private http: HttpClient) {}

    getKwPrice(): Observable<any> {
        return this.http.get<any>(this._kwPriceBaseUrl);
    }

    updateKwPrice(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this._kwPriceBaseUrl}/${id}`, data);
    }

    getKwPriceHistory(page: number = 1, perPage: number = 30): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}connector-price-logs?page=${page}&per_page=${perPage}`);
    }
} 