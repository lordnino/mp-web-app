import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { StationsService } from 'app/core/stations/stations.service';

@Component({
    selector: 'app-move-station-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatChipsModule
    ],
    templateUrl: './move-station-modal.component.html',
    styleUrls: ['./move-station-modal.component.scss']
})
export class MoveStationModalComponent implements OnInit {
    moveForm: FormGroup;
    stations: any[] = [];
    loadingStations = false;

    constructor(
        public dialogRef: MatDialogRef<MoveStationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private stationsService: StationsService
    ) {
        this.moveForm = this.fb.group({
            target_station_id: ['', Validators.required]
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
                // Filter out the current station from the list
                this.stations = (response.data || []).filter(
                    (station: any) => station.id !== Number(this.data.currentStationId)
                );
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

    onMove(): void {
        if (this.moveForm.valid) {
            this.dialogRef.close({
                station_id: this.moveForm.value.target_station_id
            });
        }
    }
}