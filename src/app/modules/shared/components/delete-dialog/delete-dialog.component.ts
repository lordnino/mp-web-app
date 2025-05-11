import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { AlertService } from '../../services/alert.service';

interface DeleteDialogData {
    title?: string;
    message?: string;
    deleteFn: () => Observable<any>;
}

@Component({
    selector: 'Charger-delete-dialog',
    standalone: true,
    imports: [MatIconModule],
    templateUrl: './delete-dialog.component.html',
    styleUrl: './delete-dialog.component.scss',
})
export class DeleteDialogComponent {
    readonly dialogRef = inject(MatDialogRef<DeleteDialogComponent>);
    readonly data = inject<DeleteDialogData>(MAT_DIALOG_DATA);
    private _alertService = inject(AlertService);

    delete() {
        this.data.deleteFn().subscribe({
            next: (res) => {
                this.dialogRef.close(res);
                this._alertService.showOperationSuccess('deleted successfully');
            },
            error: (err) => {
                this._alertService.showOperationError(err.error.message);
            }
        });
    }

    close() {
        this.dialogRef.close();
    }
}
