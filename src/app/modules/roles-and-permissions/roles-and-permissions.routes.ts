import { Routes } from '@angular/router';
import { AllRolesComponent } from './components/all-roles/all-roles.component';
import { RoleFormComponent } from './components/role-form/role-form.component';

export default [
    { path: '', pathMatch: 'full', redirectTo: 'all-roles' },
    { path: 'add-role', component: RoleFormComponent },
    { path: 'edit-role/:id', component: RoleFormComponent },
    {
        path: 'all-roles',
        component: AllRolesComponent,
    },
] as Routes;
