import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from 'app/modules/shared/components/data-table/data-table.component';
import { Router } from '@angular/router';
import { PageHeaderComponent } from 'app/modules/shared/components/page-header/page-header.component';
import { PaginationMeta } from 'app/modules/shared/models/api-response.model';
import { FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from 'app/modules/shared/components/pagination/pagination.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { CheckPermissionDirective } from 'app/modules/shared/directives/check-permission.directive';
import { Sort } from '@angular/material/sort';
import { CustomersService } from '../../services/customers.service';
import { Customer } from '../../models/customer.model';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { TransactionModalComponent } from '../transaction-modal/transaction-modal.component';
import { ChargingHistoryModalComponent } from '../charging-history-modal/charging-history-modal.component';

interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    template?: TemplateRef<any>;
}

@Component({
    selector: 'app-all-customers',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        PageHeaderComponent,
        PaginationComponent,
        DataTableComponent,
        MatSlideToggleModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatMenuModule,
        CheckPermissionDirective
    ],
    templateUrl: './all-customers.component.html',
    styleUrls: ['./all-customers.component.scss']
})
export class AllCustomersComponent implements OnInit, AfterViewInit {
    @ViewChild('avatarTemplate') avatarTemplate: TemplateRef<any>;
    @ViewChild('statusTemplate') statusTemplate: TemplateRef<any>;
    @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

    customers: Customer[] = [];
    columns: TableColumn[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'avatar', label: 'Avatar', template: null },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'phone', label: 'Phone', sortable: false },
        { key: 'is_active', label: 'Status', template: null },
        { key: 'loyalty_points', label: 'Loyalty Points', sortable: true },
        { key: 'created_at', label: 'Created At', sortable: true },
        { key: 'actions', label: 'Actions', template: null }
    ];
    loading = false;
    customersMeta: PaginationMeta;
    params = {
        page: 1,
        count: 10,
        per_page: 10,
        last_page: 1,
        sort: 'created_at,desc',
    };
    filterForm: FormGroup;

    tableActions = [
        { 
            label: 'View Transactions', 
            icon: 'receipt_long', 
            action: 'view_transactions',
            show: (row: any) => true
        },
        { 
            label: 'View Charging History', 
            icon: 'ev_station', 
            action: 'view_charging_history',
            show: (row: any) => true
        }
    ];
    sortActive = 'created_at';
    sortDirection: 'asc' | 'desc' = 'desc';

    constructor(
        private customersService: CustomersService, 
        private router: Router, 
        private _dialog: MatDialog, 
        private _snackBar: MatSnackBar, 
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.filterForm = this.fb.group({
            name: [''],
            email: [''],
            phone: [''],
            is_active: [null]
        });
        this.getAllCustomers();
    }

    ngAfterViewInit() {
        this.updateColumnsWithTemplates();
    }

    updateColumnsWithTemplates() {
        if (this.avatarTemplate && this.statusTemplate && this.actionsTemplate) {
            this.columns = this.columns.map(col => {
                if (col.key === 'avatar') {
                    return { ...col, template: this.avatarTemplate };
                }
                if (col.key === 'is_active') {
                    return { ...col, template: this.statusTemplate };
                }
                if (col.key === 'actions') {
                    return { ...col, template: this.actionsTemplate };
                }
                return col;
            });
        }
    }

    getAllCustomers(params: any = {}) {
        const queryParams = {
            ...this.params,
            ...params,
        };
        this.loading = true;
        this.customersService.getAllCustomers(queryParams).subscribe({
            next: (res) => {
                this.customers = res.data;
                this.customersMeta = res.meta;
                this.loading = false;
                
                setTimeout(() => {
                    this.updateColumnsWithTemplates();
                });
            },
            error: (error) => { 
                console.error('Error loading customers:', error);
                this.loading = false;
                this._snackBar.open(
                    'Error loading customers',
                    'Close',
                    { duration: 3000 }
                );
            }
        });
    }

    onFilter() {
        const filters = this.filterForm.value;
        const cleanedFilters = Object.keys(filters).reduce((acc, key) => {
            // Handle is_active separately since it's 0 or 1
            if (key === 'is_active') {
                // Only include is_active if it's explicitly 0 or 1 (not null)
                if (filters[key] !== null && filters[key] !== undefined) {
                    acc[key] = filters[key];
                }
            } else if (filters[key]) {
                // For other fields, include if they have a value
                acc[key] = filters[key];
            }
            return acc;
        }, {});
        this.getAllCustomers(cleanedFilters);
    }

    onResetFilters() {
        this.filterForm.reset({
            name: '',
            email: '',
            phone: '',
            is_active: null
        });
        this.getAllCustomers();
    }

    pageChanger(event: number): void {
        this.params.page = event;
        this.getAllCustomers();
    }

    onPageSizeChange(newSize: number): void {
        this.params.count = newSize;
        this.params.per_page = newSize;
        this.params.page = 1;
        this.getAllCustomers();
    }

    onSortChange(sort: Sort) {
        if (!sort.direction) {
            this.sortActive = 'created_at';
            this.sortDirection = 'desc';
            this.params.sort = 'created_at,desc';
            this.getAllCustomers();
            return;
        }
        this.sortActive = sort.active;
        this.sortDirection = sort.direction as 'asc' | 'desc';
        this.params.sort = `${sort.active},${sort.direction}`;
        this.getAllCustomers();
    }

    onActionClick(event: {action: string, row: Customer}) {
        const { action, row: customer } = event;
        
        switch(action) {
            case 'view_transactions':
                this.openTransactionModal(customer);
                break;
            case 'view_charging_history':
                this.openChargingHistoryModal(customer);
                break;
            case 'view':
                this.router.navigate(['/customers/view', customer.id]);
                break;
            case 'edit':
                this.router.navigate(['/customers/edit', customer.id]);
                break;
            case 'delete':
                // Implement delete logic with confirmation dialog
                break;
        }
    }

    openTransactionModal(customer: Customer): void {
        this._dialog.open(TransactionModalComponent, {
            width: '90vw',
            maxWidth: '1200px',
            data: { customer },
            panelClass: 'transaction-modal'
        });
    }

    openChargingHistoryModal(customer: Customer): void {
        this._dialog.open(ChargingHistoryModalComponent, {
            width: '90vw',
            maxWidth: '1200px',
            data: { customer },
            panelClass: 'charging-history-modal'
        });
    }

    formatDate(date: string): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    onAvatarError(event: any): void {
        // Hide the broken image and show the default icon instead
        event.target.style.display = 'none';
        // You could also set a default image here
        // event.target.src = '/assets/images/default-avatar.png';
    }

    get hasActiveFilters(): boolean {
        const filters = this.filterForm.value;
        return Object.keys(filters).some(key => filters[key] !== '' && filters[key] !== null && filters[key] !== undefined);
    }
}