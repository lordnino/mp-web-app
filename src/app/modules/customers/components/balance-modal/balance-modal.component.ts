import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';

export interface CustomerBalance {
    balance: number;
    loyalty_points: number;
    currency?: string;
}

@Component({
    selector: 'app-balance-modal',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './balance-modal.component.html',
    styleUrls: ['./balance-modal.component.scss']
})
export class BalanceModalComponent implements OnInit {
    customer: Customer;
    balanceData: CustomerBalance | null = null;
    loading = false;
    error: string | null = null;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { customer: Customer },
        private dialogRef: MatDialogRef<BalanceModalComponent>,
        private customersService: CustomersService
    ) {
        this.customer = data.customer;
    }

    ngOnInit(): void {
        this.loadBalance();
    }

    loadBalance(): void {
        this.loading = true;
        this.error = null;

        this.customersService.getCustomerBalance(this.customer.id).subscribe({
            next: (response) => {
                this.balanceData = response.data || response;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading balance:', error);
                this.error = 'Failed to load balance information';
                this.loading = false;
            }
        });
    }

    formatAmount(amount: number): string {
        if (!amount || amount === 0) return '0.00';
        return amount.toFixed(2);
    }

    close(): void {
        this.dialogRef.close();
    }
}