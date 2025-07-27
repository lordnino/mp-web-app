/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Stations',
        type: 'basic',
        icon: 'heroicons_outline:building-office',
        link: '/example',
        permission: ['view_station'],
    },
    {
        id: 'connector-type',
        title: 'Connector Types',
        type: 'basic',
        icon: 'heroicons_outline:bolt',
        link: '/connector-types/all-connector-types',
        permission: ['view_connector_type'],
    },
    {
        id: 'users',
        title: 'Users',
        type: 'collapsable',
        icon: 'heroicons_outline:user',
        permission: ['view_user'],
        children: [
            {
                id: 'view-users',
                title: 'View Users',
                type: 'basic',
                link: '/users/all-users',
            },
            {
                id: 'add-user',
                title: 'Add User',
                type: 'basic',
                link: '/users/add-user',
                permission: ['create_user']
            },
        ],
    },
    {
        id: 'roles-and-permissions',
        title: 'Roles & Permissions',
        type: 'collapsable',
        icon: 'heroicons_outline:role',
        permission: ['view_role'],
        children: [
            {
                id: 'view-roles',
                title: 'View Roles',
                type: 'basic',
                link: '/roles-and-permissions/all-roles',
            },
            {
                id: 'add-role',
                title: 'Add Role',
                type: 'basic',
                link: '/roles-and-permissions/add-role',
                permission: ['create_role'],
            },
        ],
    },
    {
        id: 'main-settings',
        title: 'Settings',
        type: 'basic',
        icon: 'heroicons_outline:cog',
        link: '/settings/main-settings',
        permission: ['view_connector_type'],
    },
];
