import { Routes } from '@angular/router';
import { AllCustomersComponent } from './components/all-customers/all-customers.component';

export default [
    {
        path: 'all-customers',
        component: AllCustomersComponent
    },
    {
        path: '',
        redirectTo: 'all-customers',
        pathMatch: 'full'
    }
] as Routes;