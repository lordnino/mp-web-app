import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DiskService {
    readonly baseurl = environment.apiUrl;
    private _permissions;

    constructor(
        private _httpClient: HttpClient,
        private router: Router
    ) {}

    get permissions() {
        const storedPermissions = localStorage.getItem('permissions');
        console.log('!!!!!storedPermissions', storedPermissions);
        if (storedPermissions) {
            const parsedPermissions = JSON.parse(storedPermissions);
            if (Array.isArray(parsedPermissions)) {
                this._permissions = parsedPermissions.reduce((obj, perm) => {
                    obj[perm] = true;
                    return obj;
                }, {});
            } else {
                this._permissions = parsedPermissions;
            }
        } else {
            this._permissions = {};
        }
        return this._permissions;
    }

    // permissions
    checkPermission(permissions: string | string[]) {
        return (Array.isArray(permissions) ? permissions : [permissions]).some(
            (permission) => this.permissions[permission] || false
        );
    }

    downloadFile(url: string): Observable<any> {
        return this._httpClient.get(url);
    }

    // params
    setQueryParams(params = {}, route) {
        const filterParmas = Object.entries(Object.assign({}, params))
            .filter(([k, v]) => v !== undefined)
            .reduce((obj, [k, v]) => {
                obj[k] = v;
                return obj;
            }, {});

        this.router.navigate([], {
            relativeTo: route,
            queryParams: filterParmas,
            queryParamsHandling: 'merge',
            preserveFragment: true,
        });
    }

    resetQueryParams(route) {
        this.router.navigate([], {
            relativeTo: route,
            queryParams: {},
            preserveFragment: true,
        });
    }
}
