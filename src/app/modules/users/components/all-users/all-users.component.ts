import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { DeleteDialogComponent } from 'app/modules/shared/components/delete-dialog/delete-dialog.component';
import { MultipleDropDownComponent } from '../../../shared/components/multiple-drop-down/multiple-drop-down.component';
import { UsersService } from '../../Services/users.service';
import { FuseConfigService } from '@fuse/services/config';
import { removeNullishFieldsParams } from 'app/core/helpers/helpers-methods';
import { User, UsersResponse } from '../../models/user.model';
import { PaginationMeta } from 'app/modules/shared/models/api-response.model';
import { PageHeaderComponent } from 'app/modules/shared/components/page-header/page-header.component';
import { PaginationComponent } from 'app/modules/shared/components/pagination/pagination.component';
import { DataTableComponent } from 'app/modules/shared/components/data-table/data-table.component';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StatusToggleDialogComponent } from '../status-toggle-dialog/status-toggle-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CheckPermissionDirective } from 'app/modules/shared/directives/check-permission.directive';
import { MatButtonModule } from '@angular/material/button';
interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    template?: TemplateRef<any>;
}

@Component({
    selector: 'app-all-users',
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
        CheckPermissionDirective,
        MatButtonModule
    ],
    templateUrl: './all-users.component.html',
    styleUrl: './all-users.component.scss',
})
export class AllUsersComponent implements OnInit, AfterViewInit {
    @ViewChild('roleTemplate') roleTemplate: TemplateRef<any>;
    @ViewChild('statusTemplate') statusTemplate: TemplateRef<any>;

    users: User[] = [];
    usersMeta: PaginationMeta;
    loading = false;
    params = {
        page: 1,
        count: 10,
        last_page: 1,
        per_page: 10,
        sort: 'created_at,desc',
    };

    // Table configuration
    columns: TableColumn[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'roles', label: 'Role', sortable: true },
        { key: 'is_active', label: 'Status', template: null },
        { key: 'created_at', label: 'Created At', sortable: true },
        { key: 'actions', label: 'Actions' }
    ];

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

    filterForm: FormGroup;
    sortActive = 'created_at';
    sortDirection: 'asc' | 'desc' = 'desc';

    constructor(
        private _usersService: UsersService,
        private _fuseConfigService: FuseConfigService,
        private _dialog: MatDialog,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.filterForm = this.fb.group({
            name: [''],
            email: ['']
        });
        this.getUsers();
    }

    ngAfterViewInit() {
        // Update the columns configuration with the template references
        this.columns = this.columns.map(col => {
            if (col.key === 'roles') {
                return { ...col, template: this.roleTemplate };
            }
            if (col.key === 'is_active') {
                return { ...col, template: this.statusTemplate };
            }
            return col;
        });
    }

    toggleStatus(user: User, newStatus: boolean) {
        const dialogRef = this._dialog.open(StatusToggleDialogComponent, {
            data: {
                newStatus,
                entityName: 'User',
                message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${user.name}?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._usersService.toggleUserStatus(user.id, newStatus).subscribe({
                    next: () => {
                        this.getUsers();
                        this._snackBar.open(
                            `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
                            'Close',
                            { duration: 3000 }
                        );
                    },
                    error: (error) => {
                        console.error('Error toggling user status:', error);
                        this._snackBar.open(
                            'Error updating user status',
                            'Close',
                            { duration: 3000 }
                        );
                    }
                });
            }
        });
    }

    getUsers(params: any = {}) {
        this.loading = true;
        const queryParams = {
            ...this.params,
            ...params,
        };
        this._usersService.getUsers(queryParams)
            .pipe(finalize(() => this.loading = false))
            .subscribe((res: UsersResponse) => {
                this.users = res.data;
                this.usersMeta = res.meta;
            });
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
        this.getUsers();
    }

    onActionClick(event: {action: string, row: any}) {
        switch (event.action) {
            case 'edit':
                this._router.navigate(['/users/edit-user', event.row.id]);
                break;
            case 'delete':
                const dialogRef = this._dialog.open(DeleteDialogComponent, {
                    data: {
                        title: 'Delete User',
                        message: `Are you sure you want to delete user ${event.row.name}?`,
                        deleteFn: () => this._usersService.deleteUser(event.row.id)
                    }
                });

                dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                        this.getUsers();
                        this._snackBar.open(
                            'Role deleted successfully',
                            'Close',
                            { duration: 3000 }
                        );
                    }
                });
                break;
        }
    }

    pageChanger(event: number): void {
        this.params.page = event;
        this.getUsers();
    }

    onPageSizeChange(newSize: number): void {
        this.params.count = newSize;
        this.params.per_page = newSize;
        this.getUsers();
    }

    onFilter() {
        const filters = this.filterForm.value;
        console.log(filters);
        this.getUsers({ ...filters });
    }

    onResetFilters() {
        this.filterForm.reset();
        this.getUsers();
    }

    private compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    goToAddUser() {
        this._router.navigate(['/users/add-user']);
    }
} 