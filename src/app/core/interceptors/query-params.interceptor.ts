import { HttpEvent, HttpHandlerFn, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interceptor to remove query parameters with null or undefined values
 */
export const queryParamsInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    // Get current query params
    let params = req.params;

    // Filter out null and undefined values
    let filteredParams = new HttpParams();
    params.keys().forEach(key => {
        const value = params.get(key);
        if (value !== null && value !== undefined && value !== 'null' && value !== 'undefined') {
            filteredParams = filteredParams.set(key, value);
        }
    });

    // Clone the request with filtered params
    const newReq = req.clone({
        params: filteredParams
    });

    return next(newReq);
}; 