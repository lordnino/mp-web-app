import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    Validators,
    FormGroup
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RolesAndPermissionsService } from '../../Services/roles-and-permissions.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LoadingButtonComponent } from '../../../shared/components/loading-button/loading-button.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MatCardModule } from '@angular/material/card';

interface Permission {
    name: string;
    value: string;
}

interface ModulePermissions {
    module: string;
    permissions: Permission[];
}

@Component({
    selector: 'app-role-form',
    templateUrl: './role-form.component.html',
    styleUrls: ['./role-form.component.scss'],
    standalone: true,
    imports: [
        MatIconModule,
        FormsModule,
        MatFormFieldModule,
        NgClass,
        MatInputModule,
        TextFieldModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatSelectModule,
        MatOptionModule,
        MatChipsModule,
        MatDatepickerModule,
        RouterModule,
        MatCheckboxModule,
        LoadingButtonComponent,
        MatSnackBarModule,
        PageHeaderComponent,
        MatCardModule
    ],
})
export class RoleFormComponent implements OnInit {
    formFieldHelpers: string[] = [''];
    modulePermissions: ModulePermissions[] = [];
    selectedPermissions: string[] = [];
    isLoading = false;
    formErrors: { [key: string]: string } = {};
    isEditMode = false;
    roleId: number | null = null;

    roleForm = this._formBuilder.group({
        name: ['', Validators.required],
        permissions: [[], Validators.required]
    });

    constructor(
        private _rolesAndPermissionsService: RolesAndPermissionsService,
        private _formBuilder: UntypedFormBuilder,
        private _snackBar: MatSnackBar,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        // Check if we're in edit mode
        this._activatedRoute.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.roleId = +params['id'];
                this.getRoleData();
            }
        });

        this.getAllPermissions();
    }

    getRoleData() {
        if (!this.roleId) return;
        
        this.isLoading = true;
        this._rolesAndPermissionsService.getSingleRole(this.roleId).subscribe({
            next: (res) => {
                const role = res.data;
                this.roleForm.patchValue({
                    name: role.name
                });
                this.selectedPermissions = [...role.permissions];
                this.roleForm.patchValue({ permissions: this.selectedPermissions });
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
                this._snackBar.open(err.error.message, 'Close', {
                    duration: 3000
                });
                this._router.navigate(['/roles-and-permissions/all-roles']);
            }
        });
    }

    getAllPermissions() {
        this._rolesAndPermissionsService.getAllPermissions().subscribe((res) => {
            this.modulePermissions = res.data;
        });
    }

    onPermissionChange(permission: string, isChecked: boolean) {
        if (isChecked) {
            this.selectedPermissions.push(permission);
        } else {
            const index = this.selectedPermissions.indexOf(permission);
            if (index > -1) {
                this.selectedPermissions.splice(index, 1);
            }
        }
        this.roleForm.patchValue({ permissions: this.selectedPermissions });
        this.formErrors['permissions'] = '';
    }

    onSubmit() {
        if (this.roleForm.valid) {
            this.isLoading = true;
            this.formErrors = {};
            
            const payload = {
                name: this.roleForm.get('name')?.value,
                permissions: this.selectedPermissions
            };

            const apiCall = this.isEditMode && this.roleId
                ? this._rolesAndPermissionsService.editRole(this.roleId, payload)
                : this._rolesAndPermissionsService.addNewRole(payload);
            
            apiCall.subscribe({
                next: (res) => {
                    this.isLoading = false;
                    this._snackBar.open(
                        `Role ${this.isEditMode ? 'updated' : 'created'} successfully`, 
                        'Close', 
                        { duration: 3000 }
                    );
                    this._router.navigate(['/roles-and-permissions/all-roles']);
                },
                error: (err) => {
                    this.isLoading = false;
                    if (err.error?.errors) {
                        Object.keys(err.error.errors).forEach(key => {
                            this.formErrors[key] = err.error.errors[key][0];
                        });
                    }
                    this._snackBar.open(err.error.message, 'Close', {
                        duration: 3000
                    });
                }
            });
        }
    }
} 