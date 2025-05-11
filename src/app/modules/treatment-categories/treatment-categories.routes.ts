import { Routes } from '@angular/router';
import { AllTreatmentCategoriesComponent } from './components/all-treatment-categories/all-treatment-categories.component';
import { TreatmentCategoryFormComponent } from './components/treatment-category-form/treatment-category-form.component';
import { ReorderCategoriesComponent } from './components/reorder-categories/reorder-categories.component';
import { AllTreatmentsComponent } from './components/all-treatments/all-treatments.component';
import { HealthGoalsComponent } from './components/health-goals/health-goals.component';
import { ServicesComponent } from './components/services/services.component';

export default [
    {
        path: 'all-treatment-categories',
        component: AllTreatmentCategoriesComponent
    },
    {
        path: 'add-treatment-category',
        component: TreatmentCategoryFormComponent
    },
    {
        path: 'edit-treatment-category/:id',
        component: TreatmentCategoryFormComponent
    },
    {
        path: 'all-treatments',
        component: AllTreatmentsComponent
    },
    {
        path: 'services',
        component: ServicesComponent
    },
    {
        path: 'health-goals',
        component: HealthGoalsComponent
    },
    {
        path: 'reorder',
        component: ReorderCategoriesComponent
    }
] as Routes; 