import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { Station } from '../services/firebase.service';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class StationsService {
    private _httpClient = inject(HttpClient);

    getStationsDetails(stationId: string) {
        return this._httpClient.get<Station>(`${environment.apiUrl}stations/${stationId}/details`);
    }

    getStationStats(stationId: string, period: string, metric: string) {
        const params = new HttpParams().set('period', period).set('metric', metric);
        return this._httpClient.get<any>(`${environment.apiUrl}stations/${stationId}/statistics?${params.toString()}`);
    }

    getStationFiltersSettings() {
        return this._httpClient.get<any>(`${environment.apiUrl}filter-stations-setting`);
    }

    filterStations(params: any) {
        console.log('Filter params:', params);
        
        // Build query parameters
        let queryParams = new HttpParams();
        
        // Handle each parameter
        Object.keys(params).forEach(key => {
            const value = params[key];
            
            if (Array.isArray(value)) {
                // Handle array parameters like charging_powers[]
                value.forEach(item => {
                    queryParams = queryParams.append(`${key}[]`, item.toString());
                });
            } else if (value !== null && value !== undefined && value !== '') {
                // Handle regular parameters
                queryParams = queryParams.set(key, value.toString());
            }
        });
        
        // Send parameters as query parameters for GET request
        return this._httpClient.get<any>(`${environment.apiUrl}stations/list?${queryParams.toString()}`);
    }

    toggleStationStatus(stationId: string, isActive: boolean): Observable<any> {
        return this._httpClient.patch<any>(`${environment.apiUrl}stations/${stationId}/toggle-status`, { is_active: isActive });
    }

    /**
     * Toggles the active status of a charging point
     * @param chargingPointId - The ID of the charging point to toggle
     * @param isActive - The new active status (true to enable, false to disable)
     * @returns Observable with the API response
     */
    toggleChargingPointStatus(chargingPointId: string, isActive: boolean): Observable<any> {
        return this._httpClient.patch<any>(`${environment.apiUrl}charging-points/${chargingPointId}/toggle-status`, { is_active: isActive });
    }

    /**
     * Moves a charging point from its current station to another station
     * @param chargingPointId - The ID of the charging point to move
     * @param targetStationId - The ID of the target station
     * @returns Observable with the API response
     */
    moveChargingPoint(chargingPointId: number, targetStationId: number): Observable<any> {
        const payload = {
            target_station_id: targetStationId
        };
        return this._httpClient.patch<any>(`${environment.apiUrl}charging-points/${chargingPointId}/move`, payload);
    }
}
