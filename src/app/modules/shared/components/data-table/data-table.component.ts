import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort, MatSort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        DatePipe
    ],
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnChanges, AfterViewInit {
    @Input() data: any[] = [];
    @Input() columns: Array<{
        key: string;
        label: string;
        sortable?: boolean;
        template?: any;
        formatter?: (value: any) => any;
    }> = [];
    @Input() actions: Array<{
        label: string;
        icon: string;
        action: string;
        show?: (row: any) => boolean;
    }> = [];
    @Input() loading = false;
    @Input() sortActive: string = '';
    @Input() sortDirection: 'asc' | 'desc' = 'asc';

    @Output() sortChange = new EventEmitter<Sort>();
    @Output() actionClick = new EventEmitter<{action: string, row: any}>();

    // Loading data placeholder
    loadingData = Array(5).fill({}).map(() => ({}));
    skeletonWidths: string[] = [];

    private widthOptions = ['60%', '70%', '80%', '90%'];
    private datePipe = new DatePipe('en-US');

    @ViewChild(MatSort) sort: MatSort;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['loading']) {
            this.generateSkeletonWidths();
        }
    }

    ngAfterViewInit() {
        if (this.sort) {
            this.sort.active = this.sortActive;
            this.sort.direction = this.sortDirection;
            this.sort.sortChange.emit({
                active: this.sortActive,
                direction: this.sortDirection
            });
        }
    }

    get displayedColumns(): string[] {
        return this.columns.map(column => column.key);
    }

    getValue(row: any, column: any): any {
        const value = column.key.split('.').reduce((obj: any, key: string) => obj?.[key], row);
        
        // If column has a custom formatter, use it
        if (column.formatter) {
            return column.formatter(value);
        }
        
        // Check if the value is a date
        if (this.isDate(value)) {
            return this.datePipe.transform(value, 'medium');
        }
        
        return value;
    }

    private isDate(value: any): boolean {
        if (!value) return false;
        
        // Check if it's a Date object
        if (value instanceof Date) return true;
        
        // Check if it's a string that can be parsed as a date
        if (typeof value === 'string') {
            // More strict date detection - only accept ISO date strings or common date formats
            const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/; // ISO format
            const simpleDateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
            const slashDateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/; // MM/DD/YYYY format
            
            // Only treat as date if it matches a clear date pattern
            if (dateRegex.test(value) || simpleDateRegex.test(value) || slashDateRegex.test(value)) {
                const date = new Date(value);
                return !isNaN(date.getTime());
            }
            
            return false;
        }
        
        return false;
    }

    private generateSkeletonWidths(): void {
        this.skeletonWidths = Array(this.loadingData.length)
            .fill(0)
            .map(() => this.widthOptions[Math.floor(Math.random() * this.widthOptions.length)]);
    }

    onSort(sort: Sort): void {
        if (!this.loading) {
            this.sortChange.emit(sort);
        }
    }

    onActionClick(action: {label: string, icon: string, action: string}, row: any): void {
        if (!this.loading) {
            this.actionClick.emit({ action: action.action, row });
        }
    }
    

    onSortChange(state: Sort) {
        this.sortChange.emit(state);
    }
} 