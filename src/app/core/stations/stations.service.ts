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
}
