import { Routes } from '@angular/router';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { UserFormComponent } from './components/user-form/user-form.component';

export default [
    { path: '', pathMatch: 'full', redirectTo: 'all-users' },
    { path: 'add-user', component: UserFormComponent },
    { path: 'edit-user/:id', component: UserFormComponent },
    {
        path: 'all-users',
        component: AllUsersComponent,
    },
] as Routes; 