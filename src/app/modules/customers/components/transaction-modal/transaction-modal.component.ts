import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Customer } from '../../models/customer.model';
import { Transaction, TransactionFilters } from '../../models/transaction.model';
import { CustomersService } from '../../services/customers.service';
import { PaginationComponent } from 'app/modules/shared/components/pagination/pagination.component';
import { PaginationMeta } from 'app/modules/shared/models/api-response.model';

@Component({
    selector: 'app-transaction-modal',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatChipsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        ReactiveFormsModule,
        PaginationComponent
    ],
    templateUrl: './transaction-modal.component.html',
    styleUrls: ['./transaction-modal.component.scss']
})
export class TransactionModalComponent implements OnInit {
    customer: Customer;
    transactions: Transaction[] = [];
    loading = false;
    filterForm: FormGroup;
    transactionsMeta: PaginationMeta;
    
    displayedColumns: string[] = ['id', 'type', 'amount', 'description', 'created_at'];
    

    params = {
        page: 1,
        per_page: 10
    };

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { customer: Customer },
        private dialogRef: MatDialogRef<TransactionModalComponent>,
        private customersService: CustomersService,
        private fb: FormBuilder
    ) {
        this.customer = data.customer;
    }

    ngOnInit(): void {
        this.initializeForm();
        this.loadTransactions();
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

    loadTransactions(): void {
        this.loading = true;
        const filters: TransactionFilters = {
            ...this.params,
            ...this.getFormFilters()
        };

        this.customersService.getCustomerTransactions(this.customer.id, filters).subscribe({
            next: (response) => {
                this.transactions = response.data;
                this.transactionsMeta = response.meta;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading transactions:', error);
                this.loading = false;
            }
        });
    }

    getFormFilters(): TransactionFilters {
        const formValue = this.filterForm.value;
        const filters: TransactionFilters = {};

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
        this.loadTransactions();
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
        this.loadTransactions();
    }

    pageChanger(page: number): void {
        this.params.page = page;
        this.loadTransactions();
    }

    onPageSizeChange(newSize: number): void {
        this.params.per_page = newSize;
        this.params.page = 1;
        this.loadTransactions();
    }


    formatDateTime(date: string): string {
        if (!date) return '-';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EGP'
        }).format(amount);
    }

    close(): void {
        this.dialogRef.close();
    }

    get hasActiveFilters(): boolean {
        const filters = this.filterForm.value;
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        return filters.from_date?.getTime() !== thirtyDaysAgo.getTime() || 
               filters.to_date?.getTime() !== today.getTime();
    }
}