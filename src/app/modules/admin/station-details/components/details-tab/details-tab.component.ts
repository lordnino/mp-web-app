import { Component, ViewEncapsulation, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ChargingPoint } from 'app/models/station.model';
import { StationsService } from 'app/core/stations/stations.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import Swal from 'sweetalert2';

@Component({
    selector     : 'details-tab',
    standalone   : true,
    templateUrl  : './details-tab.component.html',
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
        MatMenuModule,
        MatButtonModule
    ],
    styleUrls: ['./details-tab.component.scss']
})
export class DetailsTabComponent implements OnInit, OnChanges {
    @Input() stationId: string;
    @Output() chargingPointUpdated = new EventEmitter<void>();

    // chargingPoints = [
    //   {
    //     name: 'Charging point 1',
    //     id: '#A2dc332',
    //     status: 'Available',
    //     statusColor: 'green',
    //     uptime: '98%',
    //     failureRate: '2%',
    //     serial: '48733834863421',
    //     type: 'AC',
    //     firmware: 'v2.1.7',
    //     model: 'v2.1.7',
    //     vendor: 'ABB Terra 54',
    //     connectors: [
    //       {
    //         name: 'Connector 1 Type 2',
    //         id: '#A1B2C3',
    //         power: '50 KW',
    //         status: 'Available',
    //         statusColor: 'green',
    //         image: 'megaplug/station/details/connector-1.svg',
    //       },
    //       {
    //         name: 'Connector 2 Type 2',
    //         id: '#D4E5F6',
    //         power: '20 KW',
    //         status: 'Available',
    //         statusColor: 'green',
    //         image: 'megaplug/station/details/connector-2.svg',
    //         switch: true
    //       }
    //     ]
    //   },
    //   {
    //     name: 'Charging point 2',
    //     id: '#654321',
    //     status: 'in use',
    //     statusColor: 'orange',
    //     uptime: '98%',
    //     failureRate: '2%',
    //     serial: '48733834863421',
    //     type: 'AC',
    //     firmware: 'v2.1.7',
    //     model: 'v2.1.7',
    //     vendor: 'ABB Terra 54',
    //     connectors: [
    //       {
    //         name: 'Connector 1 CCS2',
    //         id: '#G7H8I9',
    //         power: '50 KW',
    //         status: 'in use',
    //         statusColor: 'orange',
    //         image: 'megaplug/station/details/connector-2.svg',
    //       },
    //       {
    //         name: 'Connector 2 Type 2',
    //         id: '#J0K1L2',
    //         power: '30 KW',
    //         status: 'in use',
    //         statusColor: 'orange',
    //         image: 'megaplug/station/details/connector-2.svg',
    //       }
    //     ]
    //   },
    //   {
    //     name: 'Charging point 3',
    //     id: '#789012',
    //     status: 'Unavailable',
    //     statusColor: 'red',
    //     uptime: '98%',
    //     failureRate: '2%',
    //     serial: '48733834863421',
    //     type: 'AC',
    //     firmware: 'v2.1.7',
    //     model: 'v2.1.7',
    //     vendor: 'ABB Terra 54',
    //     connectors: [
    //       {
    //         name: 'Connector 1 Type 2',
    //         id: '#MN3O5',
    //         power: '50 KW',
    //         status: 'Unavailable',
    //         statusColor: 'red',
    //         image: 'megaplug/station/details/connector-2.svg',
    //       },
    //       {
    //         name: 'Connector 2 Type 2',
    //         id: '#P6Q7R8',
    //         power: '220 KW',
    //         status: 'Unavailable',
    //         statusColor: 'red',
    //         image: 'megaplug/station/details/connector-2.svg',
    //       }
    //     ]
    //   }
    // ];


    @Input() charging_points: ChargingPoint[] = [];
    @Input() location: string;
    
    constructor(
        private _stationsService: StationsService,
        private _dialog: MatDialog,
        private _confirmationService: FuseConfirmationService
    ) {}
    center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
    zoom = 15;
    markers: Array<{ position: google.maps.LatLngLiteral; icon?: any }> = [];

    ngOnInit() {
      
    }

    ngAfterViewInit() {
      setTimeout(() => {
        this.setMapLocation();
      }, 1000);
    }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['location'] && this.location) {
        this.setMapLocation();
      }
    }

    setMapLocation() {
      if (!this.location) return;
      try {
        const loc = JSON.parse(this.location);
        console.log(loc);
        if (loc && loc.lat && loc.lng) {
          this.center = { lat: +loc.lat, lng: +loc.lng };
          // Custom SVG marker: black circle with white center
          const svgIcon = {
            url: 'data:image/svg+xml;utf-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="#23272F"/>
                <circle cx="20" cy="20" r="8" fill="#F6FAF7"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          };
          this.markers = [
            {
              position: this.center,
              icon: svgIcon
            },
          ];
        }
      } catch (e) {
        // Invalid location JSON
      }
    }

    /**
     * Toggles the active status of a charging point
     * Shows a confirmation dialog before making the API call
     * Updates the local state and emits an event on success
     * @param chargingPoint - The charging point object to toggle
     */
    toggleChargingPointStatus(chargingPoint: any) {
        const newStatus = !chargingPoint.is_active;
        const action = newStatus ? 'enable' : 'disable';
        const pointName = `Charging Point #${chargingPoint.id}`;
        
        // Show confirmation dialog
        Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Charging Point?`,
            text: `Are you sure you want to ${action} ${pointName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, ${action} it!`,
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Call API to toggle charging point status
                this._stationsService.toggleChargingPointStatus(String(chargingPoint.id), newStatus).subscribe({
                    next: (response) => {
                        // Update charging point status locally
                        chargingPoint.is_active = newStatus;
                        
                        // Update status display
                        if (!newStatus) {
                            chargingPoint.status = 'Unavailable';
                        } else if (chargingPoint.status === 'Unavailable' && newStatus) {
                            chargingPoint.status = 'Available';
                        }
                        
                        // Emit event to refresh parent component if needed
                        this.chargingPointUpdated.emit();
                        
                        // Show success message
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: `Charging point has been ${action}d successfully.`,
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                    error: (error) => {
                        console.error('Error updating charging point status:', error);
                        
                        // Show error message
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: `Failed to ${action} the charging point. Please try again.`,
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });
    }

    /**
     * Opens a modal to move the charging point to another station
     * @param chargingPoint - The charging point to move
     */
    moveChargingPointToStation(chargingPoint: any) {
        import('../move-station-modal/move-station-modal.component').then((module) => {
            const dialogRef = this._dialog.open(module.MoveStationModalComponent, {
                width: '600px',
                maxWidth: '90vw',
                data: { 
                    chargingPoint,
                    currentStationId: this.stationId 
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result && result.station_id) {
                    this.confirmMove(chargingPoint, result.station_id);
                }
            });
        });
    }

    /**
     * Shows confirmation dialog before moving the charging point
     * @param chargingPoint - The charging point to move
     * @param targetStationId - The ID of the target station
     */
    confirmMove(chargingPoint: any, targetStationId: number): void {
        const confirmation = this._confirmationService.open({
            title: 'Confirm Move',
            message: `Are you sure you want to move charging point ${chargingPoint.serial_number} to the selected station?`,
            actions: {
                confirm: {
                    label: 'Move',
                    color: 'primary'
                },
                cancel: {
                    label: 'Cancel'
                }
            }
        });

        confirmation.afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this.moveChargingPoint(chargingPoint.id, targetStationId);
            }
        });
    }

    /**
     * Calls API to move the charging point to another station
     * @param chargingPointId - The ID of the charging point
     * @param targetStationId - The ID of the target station
     */
    moveChargingPoint(chargingPointId: number, targetStationId: number): void {
        this._stationsService.moveChargingPoint(chargingPointId, targetStationId).subscribe({
            next: (response) => {
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Charging point has been moved successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                // Emit event to refresh station details
                this.chargingPointUpdated.emit();
            },
            error: (error) => {
                console.error('Error moving charging point:', error);
                
                // Show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed to move the charging point. Please try again.',
                    confirmButtonText: 'OK'
                });
            }
        });
    }
}
