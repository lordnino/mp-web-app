import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    Validators,
    FormGroup,
    AbstractControl,
    ValidationErrors
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
import { UsersService } from '../../Services/users.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LoadingButtonComponent } from '../../../shared/components/loading-button/loading-button.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MatCardModule } from '@angular/material/card';
import { RolesAndPermissionsService } from '../../../roles-and-permissions/Services/roles-and-permissions.service';
import { Role } from '../../../roles-and-permissions/models/role.model';
import { User, UserPayload } from '../../models/user.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

interface ApiError {
    message: string;
    errors: {
        [key: string]: string[];
    };
}

@Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.scss'],
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
export class UserFormComponent implements OnInit {
    formFieldHelpers: string[] = [''];
    roles: Role[] = [];
    isLoading = false;
    formErrors: { [key: string]: string[] } = {};
    isEditMode = false;
    userId: number | null = null;
    hidePassword = true;
    hideConfirmPassword = true;

    userForm: FormGroup;

    constructor(
        private _usersService: UsersService,
        private _rolesAndPermissionsService: RolesAndPermissionsService,
        private _formBuilder: UntypedFormBuilder,
        private _snackBar: MatSnackBar,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    ) {
        this.userForm = this._formBuilder.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(8)]],
            confirmPassword: [''],
            roles: [[], [Validators.required]]
        });

        // Add confirm password validator
        this.userForm.get('confirmPassword')?.setValidators([
            (control: AbstractControl): ValidationErrors | null => {
                if (!control.value) {
                    return null;
                }
                const password = this.userForm.get('password')?.value;
                if (control.value !== password) {
                    return { passwordMismatch: true };
                }
                return null;
            }
        ]);

        // Subscribe to password changes
        this.userForm.get('password')?.valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                this.userForm.get('confirmPassword')?.updateValueAndValidity();
            });
    }

    ngOnInit(): void {
        this.loadRoles();
        this.checkEditMode();
    }

    private loadRoles(): void {
        this._rolesAndPermissionsService.getRoles({}).subscribe({
            next: (res) => {
                this.roles = res.data.map((role: any) => ({
                    name: role.name
                }));
            },
            error: (error) => {
                console.error('Error loading roles:', error);
                this._snackBar.open('Error loading roles', 'Close', { duration: 3000 });
            }
        });
    }

    private checkEditMode(): void {
        const id = this._activatedRoute.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.userId = +id;
            this.userForm.get('password')?.clearValidators();
            this.userForm.get('confirmPassword')?.clearValidators();
            this.userForm.get('password')?.updateValueAndValidity();
            this.userForm.get('confirmPassword')?.updateValueAndValidity();
            this.loadUserData();
        } else {
            // Add required validator for password in add mode
            this.userForm.get('password')?.addValidators([Validators.required]);
            this.userForm.get('password')?.updateValueAndValidity();
        }
    }

    private loadUserData(): void {
        if (this.userId) {
            this.isLoading = true;
            this._usersService.getSingleUser(this.userId).subscribe({
                next: (res) => {
                    const user = res.data;
                    console.log(user);
                    this.userForm.patchValue({
                        name: user.name,
                        email: user.email,
                        roles: user.roles
                    });
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading user:', error);
                    this._snackBar.open('Error loading user data', 'Close', { duration: 3000 });
                    this.isLoading = false;
                }
            });
        }
    }

    onSubmit(): void {
        if (this.userForm.valid) {
            this.isLoading = true;
            this.formErrors = {}; // Clear previous errors
            const formData = this.userForm.value;
            const userData = {
                name: formData.name,
                email: formData.email,
                roles: formData.roles
            };

            if (!this.isEditMode && formData.password) {
                userData['password'] = formData.password;
            }

            const operation = this.isEditMode && this.userId
                ? this._usersService.updateUser(this.userId, userData)
                : this._usersService.addNewUser(userData);

            operation.subscribe({
                next: () => {
                    this._snackBar.open(
                        `User ${this.isEditMode ? 'updated' : 'created'} successfully`,
                        'Close',
                        { duration: 3000 }
                    );
                    this._router.navigate(['/users']);
                },
                error: (error: HttpErrorResponse) => {
                    console.error('Error saving user:', error);
                    if (error.error?.errors) {
                        this.formErrors = error.error.errors;
                        // Mark fields as touched to show errors
                        Object.keys(this.formErrors).forEach(key => {
                            const control = this.userForm.get(key);
                            if (control) {
                                control.markAsTouched();
                                control.setErrors({ serverError: true });
                            }
                        });
                    }
                    this._snackBar.open(error.error?.message || 'Error saving user', 'Close', { duration: 3000 });
                    this.isLoading = false;
                }
            });
        } else {
            // Mark all fields as touched to trigger validation display
            Object.keys(this.userForm.controls).forEach(key => {
                const control = this.userForm.get(key);
                control?.markAsTouched();
            });
        }
    }

    togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
        if (field === 'password') {
            this.hidePassword = !this.hidePassword;
        } else {
            this.hideConfirmPassword = !this.hideConfirmPassword;
        }
    }

    getPasswordError(): string[] {
        const control = this.userForm.get('password');
        const errors: string[] = [];
        
        if (control?.hasError('required')) {
            errors.push('Password is required');
        }
        
        if (control?.hasError('minlength')) {
            errors.push('Password must be at least 8 characters');
        }
        
        if (this.formErrors['password']) {
            errors.push(...this.formErrors['password']);
        }
        
        return errors;
    }

    getConfirmPasswordError(): string | null {
        const control = this.userForm.get('confirmPassword');
        if (control?.hasError('passwordMismatch')) {
            return 'Passwords do not match';
        }
        return null;
    }

    getFieldErrors(fieldName: string): string[] {
        return this.formErrors[fieldName] || [];
    }
} 