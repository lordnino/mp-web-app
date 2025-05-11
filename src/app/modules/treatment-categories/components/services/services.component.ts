import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreatmentCategoriesService } from '../../Services/treatment-categories.service';
import { TreatmentCategory } from '../../models/treatment-category.model';
import { DataTableComponent } from 'app/modules/shared/components/data-table/data-table.component';
import { Router } from '@angular/router';
import { PageHeaderComponent } from 'app/modules/shared/components/page-header/page-header.component';
import { PaginationMeta } from 'app/modules/shared/models/api-response.model';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MultipleDropDownComponent } from 'app/modules/shared/components/multiple-drop-down/multiple-drop-down.component';
import { PaginationComponent } from 'app/modules/shared/components/pagination/pagination.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteDialogComponent } from 'app/modules/shared/components/delete-dialog/delete-dialog.component';
import { StatusToggleDialogComponent } from 'app/modules/users/components/status-toggle-dialog/status-toggle-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { CheckPermissionDirective } from 'app/modules/shared/directives/check-permission.directive';
import { Sort } from '@angular/material/sort';
interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    template?: TemplateRef<any>;
}

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MultipleDropDownComponent,
        PageHeaderComponent,
        PaginationComponent,
        DataTableComponent,
        MatSlideToggleModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        CheckPermissionDirective
    ],
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
    @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
    @ViewChild('statusTemplate') statusTemplate: TemplateRef<any>;
    services: any[] = [];
    columns: TableColumn[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name_en', label: 'English Name', sortable: true },
        { key: 'name_ar', label: 'Arabic Name', sortable: true },
        // { key: 'is_active', label: 'Status', template: null },
        { key: 'created_at', label: 'Created At', sortable: true },
        // { key: 'actions', label: 'Actions', template: null }
    ];
    loading = false;
    servicesMeta: PaginationMeta;
    params = {
        page: 1,
        count: 10,
        per_page: 10,
        last_page: 1,
        sort: 'created_at,desc',
    };

    tableActions = [
        { 
            label: 'Edit', 
            icon: 'edit', 
            action: 'edit',
            show: (row: any) => true
        },
        { 
            label: 'Delete', 
            icon: 'delete', 
            action: 'delete',
            show: (row: any) => {
                // Don't allow deleting super admin users
                return row.role !== 'Super Admin';
            }
        }
    ];
    sortActive = 'created_at';
    sortDirection: 'asc' | 'desc' = 'desc';

    constructor(private service: TreatmentCategoriesService, private router: Router, private _dialog: MatDialog, private _snackBar: MatSnackBar) {}

    ngOnInit() {
        this.getAllServices();
    }

    ngAfterViewInit() {
        // Update the columns configuration with the template references
        this.columns = this.columns.map(col => {

            if (col.key === 'is_active') {
                return { ...col, template: this.statusTemplate };
            }
            return col;
        });
    }

    getAllServices(params: any = {}) {
        const queryParams = {
            ...this.params,
            ...params,
        };
        this.loading = true;
        this.service.getAllServices(queryParams).subscribe({
            next: (res: any) => {
                this.services = res.data;
                this.servicesMeta = res.meta;
                console.log('Services:', this.services);
                console.log('Services Meta:', this.servicesMeta);
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    onActionClick(event: {action: string, row: TreatmentCategory}) {
        // if (event.action === 'edit') {
        //     this.router.navigate(['/treatment-categories/edit-treatment-category', event.row.id]);
        // } else if (event.action === 'delete') {
        //     // Implement delete logic here
        // }

        switch (event.action) {
            case 'edit':
                this.router.navigate(['/treatment-categories/edit-treatment-category', event.row.id]);
                break;
            case 'delete':
                const dialogRef = this._dialog.open(DeleteDialogComponent, {
                    data: {
                        title: 'Delete Treatment Category',
                        message: `Are you sure you want to delete treatment category ${event.row.name_en}?`,
                        deleteFn: () => this.service.delete(event.row.id)
                    }
                });

                dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                        this.getAllServices();
                        this._snackBar.open(
                            'Treatment category deleted successfully',
                            'Close',
                            { duration: 3000 }
                        );
                    }
                });
                break;
        }
    }

    handleStatusChange(category: TreatmentCategory, event: any): void {
        // Prevent the default toggle behavior
        event.source.checked = category.is_active;

        const newStatus = !category.is_active;

        const dialogRef = this._dialog.open(StatusToggleDialogComponent, {
            data: {
                userName: category.name_en,
                newStatus: newStatus,
                entityName: 'Treatment Category',
                message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${category.name_en}?`            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service.toggleStatus(category.id, newStatus).subscribe({
                    next: () => {
                        category.is_active = newStatus;
                        event.source.checked = newStatus;
                        this._snackBar.open(
                            `Treatment Category ${newStatus ? 'activated' : 'deactivated'} successfully`,
                            'Close',
                            { duration: 3000 }
                        );
                    },
                    error: (error) => {
                        console.error('Error toggling Category status:', error);
                        this._snackBar.open(
                            'Error updating Category status',
                            'Close',
                            { duration: 3000 }
                        );
                    }
                });
            }
        });
    }

    pageChanger(event: number): void {
        this.params.page = event;
        this.getAllServices();
    }

    onPageSizeChange(newSize: number): void {
        this.params.count = newSize;
        this.params.per_page = newSize;;
        this.getAllServices();
    }

    reorderCategories() {
        this.router.navigate(['/treatment-categories/reorder']);
    }

    goToAddCategory() {
        this.router.navigate(['/treatment-categories/add-treatment-category']);
    }

    onSortChange(sort: Sort) {
        console.log(sort);
        // If direction is empty, force it to 'desc'
        if (!sort.direction) {
            this.sortActive = 'created_at';
            this.sortDirection = 'desc';
            this.params.sort = 'created_at,desc';
            return;
        }
        this.sortActive = sort.active;
        this.sortDirection = sort.direction as 'asc' | 'desc';
        this.params.sort = `${sort.active},${sort.direction}`;
        this.getAllServices();
    }
} 
