import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) => {
                // Get user permissions from localStorage
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userPermissions: string[] = user.permissions || [];

                // Filter all navigation variants
                const filteredNavigation: Navigation = {} as Navigation;
                for (const key of Object.keys(navigation)) {
                    filteredNavigation[key] = filterNavigationByPermissions(navigation[key], userPermissions);
                }
                // Emit the filtered navigation
                this._navigation.next(filteredNavigation);
            })
        );
    }
}

function filterNavigationByPermissions(
    navigation: any[],
    userPermissions: string[]
): any[] {
    return navigation
        .filter(item => {
            if (!item.permission) return true;
            if (Array.isArray(item.permission)) {
                return item.permission.some(p => userPermissions.includes(p));
            }
            return userPermissions.includes(item.permission);
        })
        .map(item => ({
            ...item,
            children: item.children
                ? filterNavigationByPermissions(item.children, userPermissions)
                : undefined,
        }));
}
