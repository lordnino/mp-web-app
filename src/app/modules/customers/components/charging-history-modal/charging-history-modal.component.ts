import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';
import { PaginationComponent } from 'app/modules/shared/components/pagination/pagination.component';
import { PaginationMeta } from 'app/modules/shared/models/api-response.model';

export interface ChargingHistory {
    id: number;
    user_name: string;
    cost: number;
    consumed_kw?: number;
    transaction_id: string;
    connector_type: string;
    charging_power?: string;
    charging_point_serial?: string;
    serial_number?: string;
    charging_point?: {
        serial_number?: string;
    };
    soc?: number;
    energy_consumed: number;
    end_time: string;
    station_name?: string;
    created_at: string;
    session_price?: string;
    is_finished?: boolean;
}

@Component({
    selector: 'app-charging-history-modal',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        ReactiveFormsModule,
        PaginationComponent
    ],
    templateUrl: './charging-history-modal.component.html',
    styleUrls: ['./charging-history-modal.component.scss']
})
export class ChargingHistoryModalComponent implements OnInit {
    customer: Customer;
    chargingHistory: ChargingHistory[] = [];
    loading = false;
    filterForm: FormGroup;
    chargingHistoryMeta: PaginationMeta;
    
    params = {
        page: 1,
        per_page: 10
    };

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { customer: Customer },
        private dialogRef: MatDialogRef<ChargingHistoryModalComponent>,
        private customersService: CustomersService,
        private fb: FormBuilder
    ) {
        this.customer = data.customer;
    }

    ngOnInit(): void {
        this.initializeForm();
        this.loadChargingHistory();
    }

    initializeForm(): void {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        this.filterForm = this.fb.group({
            from_date: [thirtyDaysAgo],
            to_date: [today]
        });
    }

    loadChargingHistory(): void {
        this.loading = true;
        const filters = {
            ...this.params,
            ...this.getFormFilters()
        };

        this.customersService.getCustomerChargingHistory(this.customer.id, filters).subscribe({
            next: (response) => {
                this.chargingHistory = response.data;
                this.chargingHistoryMeta = response.meta;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading charging history:', error);
                this.loading = false;
            }
        });
    }

    getFormFilters(): any {
        const formValue = this.filterForm.value;
        const filters: any = {};

        if (formValue.from_date) {
            filters.from_date = this.formatDate(formValue.from_date);
        }

        if (formValue.to_date) {
            filters.to_date = this.formatDate(formValue.to_date);
        }

        return filters;
    }

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    onFilter(): void {
        this.params.page = 1;
        this.loadChargingHistory();
    }

    onResetFilters(): void {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        this.filterForm.reset({
            from_date: thirtyDaysAgo,
            to_date: today
        });
        this.params.page = 1;
        this.loadChargingHistory();
    }

    pageChanger(page: number): void {
        this.params.page = page;
        this.loadChargingHistory();
    }

    onPageSizeChange(newSize: number): void {
        this.params.per_page = newSize;
        this.params.page = 1;
        this.loadChargingHistory();
    }

    getSerialNumber(history: ChargingHistory): string {
        return history.charging_point_serial || 
               history.serial_number || 
               history.charging_point?.serial_number || 
               'N/A';
    }

    close(): void {
        this.dialogRef.close();
    }

    get hasActiveFilters(): boolean {
        return true; // Always allow reset for date filters
    }

    getConnectorTypeColor(connectorType: string): string {
        // Return color based on connector type
        // Using similar colors as shown in the screenshot
        const colors = {
            'CCS Combo 2': '#10b981', // Green
            'AC Type 2': '#3b82f6', // Blue
            'CHAdeMO': '#f59e0b', // Orange
            'GB/T': '#8b5cf6' // Purple
        };
        return colors[connectorType] || '#6b7280'; // Default gray
    }

    formatAmount(amount: number | string): string {
        if (!amount || amount === 0) return '0.00';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return numAmount.toFixed(2);
    }
}