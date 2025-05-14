import { Component, ViewEncapsulation, OnInit, AfterViewInit, ViewChild, NgZone } from '@angular/core';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';

declare const google: any;

@Component({
    selector     : 'example',
    standalone   : true,
    templateUrl  : './example.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [GoogleMapsModule],
    styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit, AfterViewInit {
    @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
    zoom = 8;
    center: google.maps.LatLngLiteral = { lat: 30.0444, lng: 31.2357 };
    overlays: any[] = [];
    markers = [
      {
        position: { lat: 30.0444, lng: 31.2357 },
        label: 'Station 1',
        icon: {
          url: '/megaplug/station-point.svg',
          scaledSize: { width: 42, height: 42 }
        }
      },
      {
        position: { lat: 29.9753, lng: 31.1376 },
        label: 'Station 2',
        icon: {
          url: '/megaplug/station-point.svg',
          scaledSize: { width: 42, height: 42 }
        }
      }
      // Add more markers as needed
    ];

    constructor(private ngZone: NgZone) {}

    ngOnInit() {
        console.log('Google Maps API available:', !!window['google']?.maps);
        console.log('Center coordinates:', this.center);
        console.log('Map component initialized');
    }

    ngAfterViewInit() {
      this.addLabelOverlays();
    }

    addLabelOverlays() {
      // Remove previous overlays
      this.overlays.forEach(overlay => overlay.setMap(null));
      this.overlays = [];

      this.markers.forEach(marker => {
        const label = marker.label;
        const position = marker.position;
        const map = this.map.googleMap;

        function LabelOverlay(position, label, map) {
          this.position = new google.maps.LatLng(position.lat, position.lng);
          this.label = label;
          this.div = null;
          this.setMap(map);
        }

        LabelOverlay.prototype = new google.maps.OverlayView();

        LabelOverlay.prototype.onAdd = function () {
          const div = document.createElement('div');
          div.style.position = 'absolute';
          div.style.transform = 'translate(-50%, 10px)';
          div.style.background = 'white';
          div.style.padding = '2px 6px';
          div.style.borderRadius = '4px';
          div.style.fontSize = '14px';
          div.style.pointerEvents = 'none';
          div.style.zIndex = '10';
          div.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
          div.innerText = this.label;
          this.div = div;
          const panes = this.getPanes();
          panes.overlayMouseTarget.appendChild(div);
        };

        LabelOverlay.prototype.draw = function () {
          const overlayProjection = this.getProjection();
          const pos = overlayProjection.fromLatLngToDivPixel(this.position);
          if (this.div) {
            this.div.style.left = pos.x + 'px';
            this.div.style.top = pos.y + 'px';
          }
        };

        LabelOverlay.prototype.onRemove = function () {
          if (this.div) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
          }
        };

        const overlay = new LabelOverlay(position, label, map);
        this.overlays.push(overlay);
      });
    }
}
