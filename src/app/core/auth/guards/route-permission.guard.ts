import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { DiskService } from 'app/modules/shared/services/disk.service';

export const RoutePermissionGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot
) => {
    const _deskService = inject(DiskService);
    const _router = inject(Router);

    const requiredPermissions = route.data['permissions'] as string[];

    if (_deskService.checkPermission(requiredPermissions)) {
        return true;
    } else {
        _router.navigate(['/dashboard']);
        return false;
    }
};
