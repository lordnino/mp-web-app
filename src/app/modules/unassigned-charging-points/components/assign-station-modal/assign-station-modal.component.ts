import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { StationsService } from 'app/core/stations/stations.service';

@Component({
    selector: 'app-assign-station-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatIconModule
    ],
    templateUrl: './assign-station-modal.component.html',
    styleUrls: ['./assign-station-modal.component.scss']
})
export class AssignStationModalComponent implements OnInit {
    assignForm: FormGroup;
    stations: any[] = [];
    loadingStations = false;

    constructor(
        public dialogRef: MatDialogRef<AssignStationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private stationsService: StationsService
    ) {
        this.assignForm = this.fb.group({
            station_id: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadStations();
    }

    loadStations(): void {
        this.loadingStations = true;
        const params = {
            per_page: 1000,
            page: 1
        };
        
        this.stationsService.filterStations(params).subscribe({
            next: (response) => {
                this.stations = response.data || [];
                this.loadingStations = false;
            },
            error: (error) => {
                console.error('Error loading stations:', error);
                this.loadingStations = false;
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onAssign(): void {
        if (this.assignForm.valid) {
            this.dialogRef.close({
                station_id: this.assignForm.value.station_id
            });
        }
    }
}