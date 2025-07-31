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
        return this._httpClient.get<any>(`${environment.apiUrl}stations/filter?${queryParams.toString()}`);
    }
}
