import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { Station } from '../services/firebase.service';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class StationsService {
    private _httpClient = inject(HttpClient);

    getStationsDetails(stationId: string) {
        return this._httpClient.get<Station>(`${environment.apiUrl}stations/${stationId}`);
    }
}
