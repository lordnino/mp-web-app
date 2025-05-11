import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface StatusToggleDialogData {
    newStatus: boolean;
    entityName: string;
    title?: string;
    message?: string;
}

@Component({
    selector: 'app-status-toggle-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    template: `
        <div class="p-4">
            <h2 mat-dialog-title>{{ data.title || (data.newStatus ? 'Activate' : 'Deactivate') + ' ' + data.entityName }}</h2>
            <div mat-dialog-content>
                <p>{{ data.message || 'Are you sure you want to ' + (data.newStatus ? 'activate' : 'deactivate') + ' this ' + data.entityName.toLowerCase() + '?' }}</p>
            </div>
            <div mat-dialog-actions class="flex justify-end gap-2">
                <button mat-button (click)="onNoClick()">Cancel</button>
                <button mat-raised-button color="primary" (click)="onYesClick()">Confirm</button>
            </div>
        </div>
    `
})
export class StatusToggleDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<StatusToggleDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: StatusToggleDialogData
    ) {}

    onNoClick(): void {
        this.dialogRef.close(false);
    }

    onYesClick(): void {
        this.dialogRef.close(true);
    }
} 