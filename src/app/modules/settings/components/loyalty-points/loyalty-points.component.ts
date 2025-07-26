import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoyaltyPointsService } from '../../services/loyalty-points.service';

@Component({
    selector: 'app-loyalty-points',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
    ],
    templateUrl: './loyalty-points.component.html',
    styleUrls: ['./loyalty-points.component.scss'],
})
export class LoyaltyPointsComponent {
    loyaltyPointsForm: FormGroup;
    isSaving = false;
    showSuccess = false;
    showCancel = false;
    history = [];
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    perPage = 30;
    Math = Math; // Make Math available in template
    currentLoyaltyPointsId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private loyaltyPointsService: LoyaltyPointsService
    ) {
        this.loyaltyPointsForm = this.fb.group({
            earnedPointPrice: [
                null,
                [
                    Validators.required,
                    Validators.pattern(/^(\d{1,5})(\.\d{1,2})?$/),
                    Validators.max(99999.99),
                    Validators.min(0),
                ],
            ],
            burnedPointPrice: [
                null,
                [
                    Validators.required,
                    Validators.pattern(/^(\d{1,5})(\.\d{1,2})?$/),
                    Validators.max(99999.99),
                    Validators.min(0),
                ],
            ],
            isActive: [true],
        });
    }

    get earnedPointPrice() {
        return this.loyaltyPointsForm.get('earnedPointPrice');
    }
    get burnedPointPrice() {
        return this.loyaltyPointsForm.get('burnedPointPrice');
    }
    get isActive() {
        return this.loyaltyPointsForm.get('isActive');
    }

    ngOnInit() {
        this.getLoyaltyPoints();
        this.getLoyaltyPointsHistory();
    }

    getLoyaltyPoints() {
        this.loyaltyPointsService.getLoyaltyPoints().subscribe((res) => {
            if (res && res.data) {
                this.loyaltyPointsForm.patchValue({
                    earnedPointPrice: res.data.earned_points_price,
                    burnedPointPrice: res.data.burned_points_price,
                    isActive: res.data.is_active
                });
                this.currentLoyaltyPointsId = res.data.id;
            }
        });
    }

    getLoyaltyPointsHistory(page: number = 1) {
        this.loyaltyPointsService.getLoyaltyPointsHistory(page, this.perPage).subscribe((res) => {
            if (res && res.data) {
                this.history = res.data.map((item: any) => ({
                    date: new Date(item.created_at),
                    by: item.user?.name || 'Unknown User',
                    old: {
                        earnedPointPrice: item.old_earned_points_price,
                        burnedPointPrice: item.old_burned_points_price,
                        isActive: item.old_active_status
                    },
                    new: {
                        earnedPointPrice: item.new_earned_points_price,
                        burnedPointPrice: item.new_burned_points_price,
                        isActive: item.new_active_status
                    }
                }));
                
                // Update pagination metadata
                this.currentPage = res.current_page || 1;
                this.totalPages = res.last_page || 1;
                this.totalItems = res.total || 0;
            } else {
                this.history = [];
            }
        });
    }

    onPageChange(page: number) {
        this.currentPage = page;
        this.getLoyaltyPointsHistory(page);
    }

    save() {
        if (this.loyaltyPointsForm.valid) {
            this.isSaving = true;
            const payload = {
                earned_points_price: this.earnedPointPrice?.value,
                burned_points_price: this.burnedPointPrice?.value,
                is_active: this.isActive?.value,
            };

            this.loyaltyPointsService.updateLoyaltyPoints(this.currentLoyaltyPointsId!, payload).subscribe(
                (res) => {
                    this.isSaving = false;
                    this.showSuccess = true;
                    // Refresh history after successful update
                    this.getLoyaltyPointsHistory(this.currentPage);
                    // Hide success message after 3 seconds
                    setTimeout(() => {
                        this.showSuccess = false;
                    }, 3000);
                },
                (error) => {
                    this.isSaving = false;
                    console.error('Error updating loyalty points:', error);
                }
            );
        } else {
            this.loyaltyPointsForm.markAllAsTouched();
        }
    }

    cancel() {
        this.loyaltyPointsForm.reset({ isActive: true });
        this.showCancel = true;
    }
}
