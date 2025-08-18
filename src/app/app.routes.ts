import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { RoutePermissionGuard } from './core/auth/guards/route-permission.guard';
import { StationDetailsComponent } from './modules/admin/station-details/station-details.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/stations'
    { path: '', pathMatch: 'full', redirectTo: 'stations' },
    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    // {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'example'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'stations', loadChildren: () => import('app/modules/admin/stations/stations.routes')},
            {path: 'station/:id', component: StationDetailsComponent},
        ]
    },

    // roles routes
    {
        path: 'roles-and-permissions',
        component: LayoutComponent,
        canActivate: [AuthGuard, RoutePermissionGuard],
        resolve: {
            initialData: initialDataResolver,
        },
        data: {
            permissions: [
                'create_role',
                'update_role',
                'delete_role',
                'view_role'
            ],
        },
        children: [
            {
                path: '',
                loadChildren: () =>
                    import(
                        'app/modules/roles-and-permissions/roles-and-permissions.routes'
                    ),
            },
        ],
    },

    // users routes
    {
        path: 'users',
        component: LayoutComponent,
        canActivate: [AuthGuard, RoutePermissionGuard],
        resolve: {
            initialData: initialDataResolver,
        },
        data: {
            permissions: ['view_user', 'create_user', 'update_user', 'delete_user'],
        },  
        children: [
            {
                path: '',
                loadChildren: () => import('app/modules/users/users.routes'),
            },
        ],
    },

    // treatment-categories routes
    {
        path: 'treatment-categories',
        component: LayoutComponent,
        canActivate: [AuthGuard, RoutePermissionGuard],
        resolve: {
            initialData: initialDataResolver,
        },
        data: {
            permissions: ['view_treatment_category', 'create_treatment_category', 'update_treatment_category', 'delete_treatment_category'],
        },
        children: [
            {
                path: '',
                loadChildren: () => import('app/modules/treatment-categories/treatment-categories.routes'),
            },
        ],
    },

    {
        path: 'connector-types',
        component: LayoutComponent,
        canActivate: [AuthGuard, RoutePermissionGuard],
        resolve: {
            initialData: initialDataResolver,
        },
        data: {
            permissions: ['view_connector_type'],
        },
        children: [
            {
                path: '',
                loadChildren: () => import('app/modules/connector-types/connector-types.routes'),
            },
        ],
    },
    {
        path: 'settings',
        component: LayoutComponent,
        canActivate: [AuthGuard, RoutePermissionGuard],
        resolve: {
            initialData: initialDataResolver,
        },
        data: {
            permissions: ['view_connector_type'],
        },
        children: [
            {
                path: '',
                loadChildren: () => import('app/modules/settings/main-settings.routes'),
            },
        ],
    },
    { path: '**', redirectTo: 'stations' },
];
