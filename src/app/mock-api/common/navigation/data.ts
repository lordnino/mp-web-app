/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
    // {
    //     id: 'roles-and-permissions',
    //     title: 'Roles & Permissions',
    //     type: 'basic',
    //     icon: 'heroicons_outline:role',
    //     link: '/roles-and-permissions',
    //     permission: [
    //         'view_role',
    //     ],
    // },
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
        id: 'treatment-categories',
        title: 'Treatments & Services',
        type: 'collapsable',
        icon: 'heroicons_outline:tag',
        permission: ['view_treatment_category'],
        children: [
            {
                id: 'view-treatment-categories',
                title: 'View Treatment Categories',
                type: 'basic',
                link: '/treatment-categories/all-treatment-categories',
                permission: ['view_treatment_category'],
            },
            {
                id: 'add-treatment-category',
                title: 'Add Treatment Category',
                type: 'basic',
                link: '/treatment-categories/add-treatment-category',
                permission: ['create_treatment_category'],
            },
            {
                id: 'view-treatments',
                title: 'View Treatments',
                type: 'basic',
                link: '/treatment-categories/all-treatments',
            },
            {
                id: 'view-services',
                title: 'View Services',
                type: 'basic',
                link: '/treatment-categories/services',
            },
            {
                id: 'view-health-goals',
                title: 'View Health Goals',
                type: 'basic',
                link: '/treatment-categories/health-goals',
            },
        ],
    },
];
