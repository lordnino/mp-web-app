import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ImagePreviewDialogData {
    imageUrl: string;
    title?: string;
}

@Component({
    selector: 'app-image-preview-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
        <div class="p-4">
            <div class="flex justify-between items-center mb-4">
                <h2 mat-dialog-title class="text-xl font-semibold">{{ data.title || 'Image Preview' }}</h2>
                <button mat-icon-button (click)="onClose()">
                    <mat-icon>close</mat-icon>
                </button>
            </div>
            <div mat-dialog-content class="flex justify-center">
                <img [src]="data.imageUrl" alt="Preview" class="max-w-full max-h-[80vh] object-contain">
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            max-width: 90vw;
            max-height: 90vh;
        }
    `]
})
export class ImagePreviewDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ImagePreviewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ImagePreviewDialogData
    ) {}

    onClose(): void {
        this.dialogRef.close();
    }
} 