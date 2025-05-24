import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from 'app/modules/shared/components/data-table/data-table.component';
import { Router } from '@angular/router';
import { PageHeaderComponent } from 'app/modules/shared/components/page-header/page-header.component';
import { PaginationMeta } from 'app/modules/shared/models/api-response.model';
import { FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';
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
import { ImagePreviewDialogComponent } from 'app/modules/shared/components/image-preview-dialog/image-preview-dialog.component';
import { ConnectorTypesService } from '../../services/connector-types.service';

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
    templateUrl: './all-connector-types.component.html',
    styleUrls: ['./all-connector-types.component.scss']
})
export class AllConnectorTypesComponent implements OnInit {
    @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
    @ViewChild('imageTemplate') imageTemplate: TemplateRef<any>;   
    @ViewChild('symbolTemplate') symbolTemplate: TemplateRef<any>;   

    connectorTypes: any[] = [];
    columns: TableColumn[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name_en', label: 'English Name', sortable: true },
        { key: 'name_ar', label: 'Arabic Name', sortable: true },
        { key: 'image', label: 'Media', template: null },
        { key: 'symbol', label: 'Symbol', template: null },
        { key: 'created_at', label: 'Created At', sortable: true },
        // { key: 'actions', label: 'Actions' }
    ];
    loading = false;
    connectorTypesMeta: PaginationMeta;
    params = {
        page: 1,
        count: 10,
        per_page: 10,
        last_page: 1,
        sort: 'created_at,desc',
    };
    filterForm: FormGroup;

    tableActions = [
        // { 
        //     label: 'Edit', 
        //     icon: 'edit', 
        //     action: 'edit',
        //     show: (row: any) => true
        // },
        // { 
        //     label: 'Delete', 
        //     icon: 'delete', 
        //     action: 'delete',
        //     show: (row: any) => {
        //         // Don't allow deleting super admin users
        //         return row.role !== 'Super Admin';
        //     }
        // }
    ];
    sortActive = 'created_at';
    sortDirection: 'asc' | 'desc' = 'desc';

    constructor(private connectorTypeService: ConnectorTypesService, private router: Router, private _dialog: MatDialog, private _snackBar: MatSnackBar, private fb: FormBuilder) {}

    ngOnInit() {
        this.filterForm = this.fb.group({
            name_en: [''],
            name_ar: ['']
        });
        this.getAllConnectorTypes();
    }

    ngAfterViewInit() {
        // Update the columns configuration with the template references
        this.columns = this.columns.map(col => {

            if (col.key === 'symbol') {
                return { ...col, template: this.symbolTemplate };
            }
            if (col.key === 'image') {
                return { ...col, template: this.imageTemplate };
            }
            return col;
        });
    }

    getAllConnectorTypes(params: any = {}) {
        const queryParams = {
            ...this.params,
            ...params,
        };
        this.loading = true;
        this.connectorTypeService.getAllConnectorTypes(queryParams).subscribe({
            next: (res: any) => {
                this.connectorTypes = res.data;
                this.connectorTypesMeta = res.meta;
                console.log('Connector Types:', this.connectorTypes);
                console.log('Connector Types Meta:', this.connectorTypesMeta);
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    handleStatusChange(service: any, event: any): void {
        // Prevent the default toggle behavior
        // event.source.checked = service.is_active;

        // const newStatus = !service.is_active;

        // const dialogRef = this._dialog.open(StatusToggleDialogComponent, {
        //     data: {
        //         userName: service.name_en,
        //         newStatus: newStatus,
        //         entityName: 'Service',
        //         message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${service.name_en}?`            }
        // });

        // dialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         const payload = {
        //             is_active: newStatus
        //         }
        //         this.service.toggleServiceStatus(service.id, payload).subscribe({
        //             next: () => {
        //                 service.is_active = newStatus;
        //                 event.source.checked = newStatus;
        //                 this._snackBar.open(
        //                     `Service ${newStatus ? 'activated' : 'deactivated'} successfully`,
        //                     'Close',
        //                     { duration: 3000 }
        //                 );
        //             },
        //             error: (error) => {
        //                 console.error('Error toggling Service status:', error);
        //                 this._snackBar.open(
        //                     'Error updating Service status',
        //                     'Close',
        //                     { duration: 3000 }
        //                 );
        //             }
        //         });
        //     }
        // });
    }

    onFilter() {
        const filters = this.filterForm.value;
        console.log(filters);
        this.getAllConnectorTypes({ ...filters });
    }

    onResetFilters() {
        this.filterForm.reset();
        this.getAllConnectorTypes();
    }

    pageChanger(event: number): void {
        this.params.page = event;
        this.getAllConnectorTypes();
    }

    onPageSizeChange(newSize: number): void {
        this.params.count = newSize;
        this.params.per_page = newSize;;
        this.getAllConnectorTypes();
    }

    // reorderCategories() {
    //     this.router.navigate(['/treatment-categories/reorder']);
    // }

    // goToAddCategory() {
    //     this.router.navigate(['/treatment-categories/add-treatment-category']);
    // }

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
        this.getAllConnectorTypes();
    }

    openImagePreview(imageUrl: string, title: string): void {
        this._dialog.open(ImagePreviewDialogComponent, {
            data: {
                imageUrl,
                title: title
            },
            maxWidth: '90vw',
            maxHeight: '90vh'
        });
    }
} 
