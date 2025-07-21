import { Component, ViewEncapsulation, Input } from '@angular/core';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
    selector     : 'amenities-tab',
    standalone   : true,
    templateUrl  : './amenities-tab.component.html',
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
    styleUrls: ['./amenities-tab.component.scss']
})
export class AmenitiesTabComponent {
    @Input() stationId: string;
    // @Input() amenities: any[];

    amenities = [
        { icon: 'wifi', label: 'Free Wi-Fi' },
        { icon: 'store', label: 'Mini Market' },
        { icon: 'restaurant', label: 'Restaurant' },
        { icon: 'build', label: 'Vehicle Services' },
        { icon: 'wc', label: 'Restrooms' },
        { icon: 'battery_charging_full', label: 'Electronics charge' },
        { icon: 'child_care', label: 'Kids Area' },
        { icon: 'wifi', label: 'Free Wi-Fi' },
        { icon: 'store', label: 'Mini Market' },
        { icon: 'restaurant', label: 'Restaurant' },
        { icon: 'build', label: 'Vehicle Services' },
        { icon: 'wc', label: 'Restrooms' },
        { icon: 'battery_charging_full', label: 'Electronics charge' },
        { icon: 'child_care', label: 'Kids Area' },
    ];
    constructor() {}
}
