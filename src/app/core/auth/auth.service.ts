import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { AlertService } from 'app/modules/shared/services/alert.service';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    email: BehaviorSubject<string> = new BehaviorSubject<string>('');
    password: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private _baseUrl = environment.apiUrl;
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _alertService = inject(AlertService);

    constructor(private _router: Router, private _userService: UserService) {}
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    set permissions(permissions: string) {
        localStorage.setItem('permissions', permissions);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(
        credentials: {
            email: string;
            password: string;
        },
        fcm_token: string
    ): Observable<any> {
        let payload = {
            ...credentials,
            fcm_token,
        };
        return this._httpClient.post(`${this._baseUrl}login`, payload).pipe(
            switchMap(
                (response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = response.data.token;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.data;
                    localStorage.setItem('user', JSON.stringify(response.data));

                    this.permissions = JSON.stringify(
                        response.data.permissions
                    );
                    // this._router.navigate(['/dashboard']);
                    this._router.navigate(['/example']);
                    // Return a new observable with the response
                    return of(response);
                },
                (error) => {
                    this._alertService.showOperationError(error.err.message);
                }
            )
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('permissions');
        localStorage.removeItem('user');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Check if user is authenticated
     */
    check(): Observable<boolean> {
        // Get the token from local storage
        const token = this.accessToken;

        // If there's no token, return false
        if (!token) {
            this._authenticated = false;
            return of(false);
        }

        // Optionally, you can use AuthUtils to check if the token is valid
        if (AuthUtils.isTokenExpired(token)) {
            this.signOut(); // Sign the user out if the token is expired
            return of(false);
        }

        // If token exists and is valid, return true
        this._authenticated = true;
        return of(true);
    }

    /**
     * Check the authentication status
     */
    isAuthenticated(): Observable<boolean> {
        return of(this._authenticated);
    }
}
