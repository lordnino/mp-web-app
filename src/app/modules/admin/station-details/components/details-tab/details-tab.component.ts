import { Component, ViewEncapsulation, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ChargingPoint } from 'app/models/station.model';

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
        MatIconModule
    ],
    styleUrls: ['./details-tab.component.scss']
})
export class DetailsTabComponent implements OnInit, OnChanges {
    @Input() stationId: string;

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
    constructor() {}
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
}
