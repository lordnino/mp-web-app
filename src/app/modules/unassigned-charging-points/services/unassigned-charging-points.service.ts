import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class UnassignedChargingPointsService {
    private _baseUrl = `${environment.apiUrl}charging-points`;

    constructor(private http: HttpClient) {}

    getUnassignedChargingPoints(params: any = {}): Observable<any> {
        return this.http.get<any>(`${this._baseUrl}/unassigned`, { params });
    }

    assignChargingPointToStation(chargingPointId: number, stationId: number): Observable<any> {
        const payload = {
            station_id: stationId
        };
        return this.http.patch<any>(`${this._baseUrl}/${chargingPointId}/assign`, payload);
    }
}