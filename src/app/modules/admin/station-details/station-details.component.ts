import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    ViewChild,
    ViewEncapsulation,
    Pipe,
    PipeTransform,
    CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { StationsService } from 'app/core/stations/stations.service';
import Swal from 'sweetalert2';
import { LayoutService } from 'app/modules/shared/services/layout.service';
import { AmenitiesTabComponent } from './components/amenities-tab/amenities-tab.component';
import { ChargingHistoryTabComponent } from './components/charging-history-tab/charging-history-tab.component';
import { DetailsTabComponent } from './components/details-tab/details-tab.component';
import { LogHistoryTabComponent } from './components/log-history-tab/log-history-tab.component';
import { ReviewsTabComponent } from './components/reviews-tab/reviews-tab.component';
import { StationStatsTabComponent } from './components/stations-stats/station-stats-tab.component';
import { Station } from 'app/models/station.model';


@Pipe({ name: 'lastUpdateFormat', standalone: true })
export class LastUpdateFormatPipe implements PipeTransform {
    transform(value: Date | string | null): string {
        if (!value) return '--';
        const date = value instanceof Date ? value : new Date(value);
        // Get hour, am/pm, day, month, year
        let hours = date.getHours();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const day = date.getDate();
        const year = date.getFullYear();
        // Get short month in lowercase
        const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
        return `${hours} ${ampm} , ${day} ${month} ${year}`;
    }
}

@Component({
    selector: 'station-details',
    standalone: true,
    templateUrl: './station-details.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        GoogleMapsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatIconModule,
        LogHistoryTabComponent,
        StationStatsTabComponent,
        ChargingHistoryTabComponent,
        ReviewsTabComponent,
        AmenitiesTabComponent,
        DetailsTabComponent,
        LastUpdateFormatPipe, // Add the custom pipe here
    ],
    styleUrls: ['./station-details.component.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StationDetailsComponent implements AfterViewInit {
    @ViewChild('editBtn') editBtn: ElementRef;
    @ViewChild('swiperEl', { static: false }) swiperEl: ElementRef;

    // Static data for the station details UI
    station: Station;
    selectedTab = 'Details';
    loading = true; // Add loading state
    lastUpdateTime: Date | null = null; // Track last API call time

    constructor(
        private _layoutService: LayoutService,
        private _stationsService: StationsService,
        private _route: ActivatedRoute
    ) {
        this._route.params.subscribe((params) => {
            this.getStationDetails(params['id']);
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this._layoutService.getDrawerOpen().subscribe((isOpen) => {
                console.log(isOpen);
                if (!this.editBtn) return;
                if (isOpen) {
                    this.editBtn.nativeElement.style.left = '315px';
                } else {
                    this.editBtn.nativeElement.style.left = '16px';
                }
            });
            if (this.swiperEl) {
                const swiper = this.swiperEl.nativeElement.swiper;
                swiper.update();
            }
        }, 500);
    }

    getStationDetails(stationId: string) {
        this.loading = true; // Set loading to true before API call
        this._stationsService
            .getStationsDetails(stationId)
            .subscribe((station: any) => {
                console.log(station);
                this.station = {
                    // name: 'Chilout Madinaty (DC)',
                    // status: 'Available',
                    // address: 'Cairo , nasser city , 31 abas el akad',
                    // openHours: '10:00 - 23:00',
                    // isOpen: true,
                    // rating: 4.9,
                    // connectors: 8,
                    // power: '22-50 KW',
                    // type: 'AC Station',
                    // charges: '30,000',
                    // isActive: true,
                    ...station.station,
                    reviews: station.reviews,
                    // images: [
                    //     // 'megaplug/station/details/img1.svg', // Main station image
                    //     // 'megaplug/station/details/img2.svg', // Car charging
                    //     // 'megaplug/station/details/img3.svg', // Phone app
                    //     'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // Main station image
                    //     'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', // Car charging
                    //     'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', // Phone app
                    // ],
                    charging_history: station.charging_history,
                    log_history: station.log_history,
                    statistics: station.statistics,
                    amenities: station.station.amenities,
                };
                console.log(this.station);
                this.loading = false; // Set loading to false after data is loaded
                this.lastUpdateTime = new Date(); // Set last update time
            });
    }

    getConnectorsCount() {
        let connectors = 0;
        this.station.charging_points.forEach((charging_point: any) => {
            connectors += charging_point.connectors.length;
        });
        return connectors;
    }

    getAcChargingPointsCount(): number {
        if (!this.station || !Array.isArray(this.station.charging_points)) {
            return 0;
        }
        let acCount = 0;
        this.station.charging_points.forEach((chargingPoint: any) => {
            if (chargingPoint && chargingPoint.is_dc === false) {
                acCount += 1;
            }
        });
        return acCount;
    }

    getDcChargingPointsCount(): number {
        if (!this.station || !Array.isArray(this.station.charging_points)) {
            return 0;
        }
        let dcCount = 0;
        this.station.charging_points.forEach((chargingPoint: any) => {
            if (chargingPoint && chargingPoint.is_dc === true) {
                dcCount += 1;
            }
        });
        return dcCount;
    }

    onToggleActive(event: MatSlideToggleChange) {
        if (!this.station) return;
        
        const newStatus = event.checked;
        const action = newStatus ? 'enable' : 'disable';
        const stationName = this.station.name_en || this.station.name_ar || 'this station';
        
        // Show confirmation dialog
        Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Station?`,
            text: `Are you sure you want to ${action} ${stationName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, ${action} it!`,
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Call API to toggle station status
                this._stationsService.toggleStationStatus(String(this.station.id), newStatus).subscribe({
                    next: (response) => {
                        // Update station status locally
                        this.station.is_active = newStatus;
                        
                        // Show success message
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: `Station has been ${action}d successfully.`,
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                    error: (error) => {
                        console.error('Error updating station status:', error);
                        
                        // Revert the toggle
                        this.station.is_active = !newStatus;
                        
                        // Show error message
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: `Failed to ${action} the station. Please try again.`,
                            confirmButtonText: 'OK'
                        });
                    }
                });
            } else {
                // User cancelled, revert the toggle
                this.station.is_active = !newStatus;
            }
        });
    }
}
