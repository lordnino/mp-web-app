import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { TreatmentCategoriesService } from '../../Services/treatment-categories.service';
import { TreatmentCategory } from '../../models/treatment-category.model';
import { PageHeaderComponent } from 'app/modules/shared/components/page-header/page-header.component';

@Component({
    selector: 'app-reorder-categories',
    standalone: true,
    imports: [
        CommonModule,
        DragDropModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
        PageHeaderComponent
    ],
    templateUrl: './reorder-categories.component.html',
    styleUrls: ['./reorder-categories.component.scss']
})
export class ReorderCategoriesComponent implements OnInit {
    categories: TreatmentCategory[] = [];
    loading = false;
    saving = false;

    constructor(
        private service: TreatmentCategoriesService,
        private snackBar: MatSnackBar,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.loading = true;
        this.service.getAllCategories().subscribe({
            next: (response) => {
                this.categories = response.data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.snackBar.open('Error loading categories', 'Close', { duration: 3000 });
            }
        });
    }

    onDrop(event: CdkDragDrop<TreatmentCategory[]>) {
        moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    }

    saveOrder() {
        this.saving = true;
        const categories = this.categories.map((cat, index) => ({
            id: cat.id,
            display_order: index + 1
        }));
        
        this.service.updateCategoriesOrder({ categories }).subscribe({
            next: () => {
                this.saving = false;
                this.snackBar.open('Categories order updated successfully', 'Close', { duration: 3000 });
                this.router.navigate(['/treatment-categories/all-treatment-categories']);
            },
            error: () => {
                this.saving = false;
                this.snackBar.open('Error updating categories order', 'Close', { duration: 3000 });
            }
        });
    }

    cancel() {
        this.router.navigate(['/treatment-categories/all-treatment-categories']);
    }
} 