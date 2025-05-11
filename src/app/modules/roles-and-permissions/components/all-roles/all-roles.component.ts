import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { DeleteDialogComponent } from 'app/modules/shared/components/delete-dialog/delete-dialog.component';
import { MultipleDropDownComponent } from '../../../shared/components/multiple-drop-down/multiple-drop-down.component';
import { RolesAndPermissionsService } from '../../Services/roles-and-permissions.service';
import { FuseConfigService } from '@fuse/services/config';
import { removeNullishFieldsParams } from 'app/core/helpers/helpers-methods';
import { Role, RolesResponse } from '../../models/role.model';
import { PaginationMeta } from 'app/modules/shared/models/api-response.model';
import { PageHeaderComponent } from 'app/modules/shared/components/page-header/page-header.component';
import { PaginationComponent } from 'app/modules/shared/components/pagination/pagination.component';
import { DataTableComponent } from 'app/modules/shared/components/data-table/data-table.component';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckPermissionDirective } from 'app/modules/shared/directives/check-permission.directive';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    template?: TemplateRef<any>;
}

@Component({
    selector: 'app-all-roles',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MultipleDropDownComponent,
        PageHeaderComponent,
        PaginationComponent,
        DataTableComponent,
        CheckPermissionDirective,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './all-roles.component.html',
    styleUrl: './all-roles.component.scss',
})
export class AllRolesComponent implements OnInit, AfterViewInit {
    @ViewChild('permissionsTemplate') permissionsTemplate: TemplateRef<any>;

    roles: Role[] = [];
    rolesMeta: PaginationMeta;
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
        { key: 'name', label: 'Role Name', sortable: true },
        { key: 'permissions', label: 'Permissions', sortable: false },
        { key: 'actions', label: 'Actions' }
    ];

    tableActions = [
        { 
            label: 'Edit', 
            icon: 'edit', 
            action: 'edit',
            show: (row: any) => {
                return row.name !== 'Super Admin';
            }// Always show edit
        },
        { 
            label: 'Delete', 
            icon: 'delete', 
            action: 'delete',
            show: (row: any) => {
                return row.name !== 'Super Admin';
            }
        }
    ];
    sortActive = 'created_at';
    sortDirection: 'asc' | 'desc' = 'desc';

    constructor(
        private _rolesAndPermissionsService: RolesAndPermissionsService,
        private _fuseConfigService: FuseConfigService,
        private _dialog: MatDialog,
        private _router: Router,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.getRoles();
    }

    // isAdmin() {
    //     const user = JSON.parse(window.localStorage.getItem('user'));
    //     console.log(user);
    //     return user.role === 'Super Admin';
    // }

    ngAfterViewInit() {
        // Update the columns configuration with the template reference
        this.columns = this.columns.map(col => 
            col.key === 'permissions' 
                ? { ...col, template: this.permissionsTemplate }
                : col
        );
    }

    getRoles(params: any = {}) {
        this.loading = true;
        const queryParams = {
            ...this.params,
            ...params,
        };
        this._rolesAndPermissionsService.getRoles(queryParams)
            .pipe(finalize(() => this.loading = false))
            .subscribe((res: RolesResponse) => {
                this.roles = res.data;
                this.rolesMeta = res.meta;
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
        this.getRoles();
    }

    onActionClick(event: {action: string, row: any}) {
        switch (event.action) {
            case 'edit':
                this._router.navigate(['/roles-and-permissions/edit-role', event.row.id]);
                break;
            case 'delete':
                const dialogRef = this._dialog.open(DeleteDialogComponent, {
                    data: {
                        title: 'Delete Role',
                        message: `Are you sure you want to delete role ${event.row.name}? This will remove all associated permissions and cannot be undone.`,
                        deleteFn: () => this._rolesAndPermissionsService.deleteRole(event.row.id)
                    }
                });

                dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                        this.getRoles();
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
        this.getRoles();
    }

    onPageSizeChange(newSize: number): void {
        this.params.count = newSize;
        this.params.per_page = newSize;
        this.getRoles();
    }

    private compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    goToAddRole() {
        this._router.navigate(['/roles-and-permissions/add-role']);
    }
}
