import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
    selector     : 'example',
    standalone   : true,
    templateUrl  : './example.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [GoogleMapsModule],
    styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit
{
    zoom = 8;
    center: google.maps.LatLngLiteral = { lat: 30.0444, lng: 31.2357 };
    markerPosition: google.maps.LatLngLiteral = this.center;
    stationIcon = {
        url: '/megaplug/station-point.svg',
        scaledSize: { width: 42, height: 42 }
    };
    
    /**
     * Constructor
     */
    constructor()
    {
    }
    
    ngOnInit() {
        console.log('Google Maps API available:', !!window['google']?.maps);
        console.log('Center coordinates:', this.center);
        console.log('Map component initialized');
    }
}
