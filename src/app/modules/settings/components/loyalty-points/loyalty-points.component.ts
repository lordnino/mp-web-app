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
    initialValues: any = null; // Store initial values from API

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
                const formValues = {
                    earnedPointPrice: res.data.earned_points_price,
                    burnedPointPrice: res.data.burned_points_price,
                    isActive: res.data.is_active
                };
                
                // Store initial values for cancel functionality
                this.initialValues = { ...formValues };
                
                this.loyaltyPointsForm.patchValue(formValues);
                this.currentLoyaltyPointsId = res.data.id;
            }
        });
    }

    getLoyaltyPointsHistory(page: number = 1) {
        this.loyaltyPointsService.getLoyaltyPointsHistory(page, this.perPage).subscribe((res) => {
            console.log('Loyalty Points History API Response:', res);
            // Check if data is directly in res.data or res.data.data
            const historyData = res?.data?.data || res?.data;
            if (res && historyData && Array.isArray(historyData)) {
                console.log('Processing history data:', historyData);
                // Group changes by timestamp to combine all changes
                const groupedChanges = new Map();
                
                historyData.forEach((item: any) => {
                    const timestamp = item.created_at;
                    const user = item.user?.name || 'Unknown User';
                    
                    if (!groupedChanges.has(timestamp)) {
                        groupedChanges.set(timestamp, {
                            date: new Date(timestamp),
                            by: user,
                            old: { 
                                earnedPointPrice: null, 
                                burnedPointPrice: null, 
                                isActive: null 
                            },
                            new: { 
                                earnedPointPrice: null, 
                                burnedPointPrice: null, 
                                isActive: null 
                            }
                        });
                    }
                    
                    const change = groupedChanges.get(timestamp);
                    // Map the fields based on the API response structure
                    if (item.old_earned_points_price !== undefined) {
                        change.old.earnedPointPrice = item.old_earned_points_price;
                        change.new.earnedPointPrice = item.new_earned_points_price;
                    }
                    if (item.old_burned_points_price !== undefined) {
                        change.old.burnedPointPrice = item.old_burned_points_price;
                        change.new.burnedPointPrice = item.new_burned_points_price;
                    }
                    if (item.old_is_active !== undefined) {
                        change.old.isActive = item.old_is_active;
                        change.new.isActive = item.new_is_active;
                    }
                });
                
                console.log('Grouped changes:', Array.from(groupedChanges.values()));
                
                // Convert to array and filter out entries with no actual changes
                this.history = Array.from(groupedChanges.values())
                    .filter(change => {
                        const earnedChanged = change.old.earnedPointPrice !== change.new.earnedPointPrice;
                        const burnedChanged = change.old.burnedPointPrice !== change.new.burnedPointPrice;
                        const statusChanged = change.old.isActive !== change.new.isActive;
                        const hasChange = earnedChanged || burnedChanged || statusChanged;
                        console.log('Change check:', { earnedChanged, burnedChanged, statusChanged, hasChange, change });
                        return hasChange;
                    })
                    .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
                
                console.log('Final history:', this.history);
                
                // Update pagination metadata - handle both possible structures
                const meta = res.data || res;
                this.currentPage = meta.current_page || 1;
                this.totalPages = meta.last_page || 1;
                this.totalItems = meta.total || 0;
            } else {
                console.log('No valid data structure found');
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
                    // Update the baseline values so Cancel reverts to the latest saved values
                    this.initialValues = {
                        earnedPointPrice: this.earnedPointPrice?.value,
                        burnedPointPrice: this.burnedPointPrice?.value,
                        isActive: this.isActive?.value,
                    };
                    // Mark the form pristine/untouched after save
                    this.loyaltyPointsForm.markAsPristine();
                    this.loyaltyPointsForm.markAsUntouched();
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
        if (this.initialValues) {
            this.loyaltyPointsForm.patchValue(this.initialValues);
        } else {
            this.loyaltyPointsForm.reset({ isActive: true });
        }
        this.showCancel = true;
        // Mark the form pristine/untouched when discarding changes
        this.loyaltyPointsForm.markAsPristine();
        this.loyaltyPointsForm.markAsUntouched();
        // Hide cancel message after a short delay for consistency
        setTimeout(() => {
            this.showCancel = false;
        }, 2000);
    }

    // Helper methods for template
    hasEarnedChange(entry: any): boolean {
        return entry.old.earnedPointPrice !== entry.new.earnedPointPrice;
    }

    hasBurnedChange(entry: any): boolean {
        return entry.old.burnedPointPrice !== entry.new.burnedPointPrice;
    }

    hasStatusChange(entry: any): boolean {
        return entry.old.isActive !== entry.new.isActive;
    }

    formatValue(value: any): string {
        if (value !== null && value !== undefined) {
            // Convert to number and round to 2 decimal places
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                return numValue.toFixed(2);
            }
            return value.toString();
        }
        return '—';
    }

    formatStatus(value: boolean): string {
        return value ? 'Active' : 'Inactive';
    }
}
