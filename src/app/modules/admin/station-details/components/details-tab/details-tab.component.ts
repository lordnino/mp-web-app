import { Component, ViewEncapsulation, Input } from '@angular/core';
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
export class DetailsTabComponent {
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
    constructor() {}

    ngAfterViewInit() {
      setTimeout(() => {
        console.log(this.charging_points);
      }, 1000);
    }
}
