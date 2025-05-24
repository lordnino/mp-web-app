import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class ConnectorTypesService {
    private _connectorTypesBaseUrl = `${environment.apiUrl}connector-types`;

    constructor(private http: HttpClient) {}

    getAllConnectorTypes(params: any = {}): Observable<any> {
        return this.http.get<any>(this._connectorTypesBaseUrl, { params });
    }
} 