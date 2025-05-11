import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PaginationMeta } from '../../models/api-response.model';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './pagination.component.html',
    styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
    @Input() meta: PaginationMeta;
    @Input() collectionSize: number = 0;
    @Input() per_page: number = 30;
    @Input() pageSizeOptions: number[] = [10, 30, 50, 80, 100];
    @Input() currentPage: number = 1;

    @Output() pageChange = new EventEmitter<number>();
    @Output() pageSizeChange = new EventEmitter<number>();

    inputValue: number = this.currentPage;

    validateInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (isNaN(Number(inputElement.value))) {
            inputElement.value = inputElement.value.slice(0, -1);
        }
    }

    goToPage(page: number | string): void {
        const pageNumber = Number(page);
        if (
            !isNaN(pageNumber) &&
            pageNumber > 0 &&
            pageNumber <= this.meta.last_page
        ) {
            this.currentPage = pageNumber;
            this.inputValue = pageNumber;
            this.pageChange.emit(this.currentPage);
        }
        this.scrollToTopPage();
    }

    onPageSizeChange(event: Event): void {
        const newSize = Number((event.target as HTMLSelectElement).value);
        this.per_page = newSize;
        this.pageSizeChange.emit(newSize);
        this.goToPage(1);
    }

    scrollToTopPage(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
