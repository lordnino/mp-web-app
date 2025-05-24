import { Component, ViewEncapsulation, OnInit, AfterViewInit, ViewChild, NgZone, OnDestroy } from '@angular/core';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { FirebaseService } from 'app/core/services/firebase.service';
declare const google: any;

@Component({
    selector     : 'example',
    standalone   : true,
    templateUrl  : './example.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [GoogleMapsModule],
    styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit, OnDestroy {
    @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
    zoom = 12;
    center: google.maps.LatLngLiteral = { lat: 30.0444, lng: 31.2357 };
    overlays: any[] = [];
    markers: any;
    selectedStation: any = null;
    drawerOpen = false;
    private unsubscribeStations: () => void;

    constructor(private ngZone: NgZone, private firebaseService: FirebaseService) {}

    ngOnInit() {
        this.unsubscribeStations = this.firebaseService.listenToStations((stations) => {
            console.log('Raw stations data:', stations);
            this.markers = stations.map(station => {
                const lat = Number(station.latitude ?? station.lat);
                const lng = Number(station.longitude ?? station.lng);

                if (isNaN(lat) || isNaN(lng)) {
                    console.error(`Invalid coordinates for station ${station.name_en || station.name_ar || station.id}:`, { lat, lng });
                    return null;
                }

                // Choose icon URL based on status
                let iconUrl = '/megaplug/station-available-marker.svg';
                if (station.status === 'unavailable') {
                    iconUrl = '/megaplug/stastion-unavailable-marker.svg';
                } else if (station.status === 'InUse') {
                    iconUrl = '/megaplug/station-in-use-marker.svg';
                }

                return {
                    ...station,
                    position: { lat, lng },
                    label: station.name_en || station.name_ar || station.id,
                    icon: {
                        url: iconUrl,
                        scaledSize: { width: 42, height: 42 }
                    }
                }
            }).filter(marker => marker !== null);

            console.log('Processed markers:', this.markers);

            setTimeout(() => {
                this.addLabelOverlays();
            }, 1000);
        });
        console.log('Google Maps API available:', !!window['google']?.maps);
        console.log('Center coordinates:', this.center);
        console.log('Map component initialized');
    }

    ngOnDestroy() {
        if (this.unsubscribeStations) {
            this.unsubscribeStations();
        }
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

    onMarkerClick(marker: any) {
      this.selectedStation = marker;
      this.drawerOpen = true;
    }

    // Helper: Count all connectors (excluding nulls)
    getConnectorCount(station: any): number {
      if (!station?.charging_points) return 0;
      return Object.values(station.charging_points)
        .flatMap((cp: any) => Array.isArray(cp.connectors) ? cp.connectors : [])
        .filter((c: any) => c && typeof c === 'object')
        .length;
    }

    // Helper: Get min-max power range string (e.g. '22-150 KW')
    getPowerRange(station: any): string {
      if (!station?.charging_points) return '';
      const powers = Object.values(station.charging_points)
        .flatMap((cp: any) => Array.isArray(cp.connectors) ? cp.connectors : [])
        .filter((c: any) => c && typeof c === 'object' && c.charge_power)
        .map((c: any) => c.charge_power);
      if (!powers.length) return '';
      const min = Math.min(...powers);
      const max = Math.max(...powers);
      return min === max ? `${min} KW` : `${min}-${max} KW`;
    }

    // Helper: List unique connector types with icon
    getConnectorTypes(station: any): { name: string, icon: string }[] {
      if (!station?.charging_points) return [];
      const all = Object.values(station.charging_points)
        .flatMap((cp: any) => Array.isArray(cp.connectors) ? cp.connectors : [])
        .filter((c: any) => c && typeof c === 'object' && c.connector_type);
      const map = new Map();
      all.forEach((c: any) => {
        if (!map.has(c.connector_type)) {
          map.set(c.connector_type, { name: c.connector_type, icon: c.connector_type_image || c.connector_type_symbol || '' });
        }
      });
      return Array.from(map.values());
    }

    // Helper: List unique charge power values (sorted)
    getChargePowers(station: any): number[] {
      if (!station?.charging_points) return [];
      const all = Object.values(station.charging_points)
        .flatMap((cp: any) => Array.isArray(cp.connectors) ? cp.connectors : [])
        .filter((c: any) => c && typeof c === 'object' && c.charge_power)
        .map((c: any) => c.charge_power);
      return Array.from(new Set(all)).sort((a, b) => a - b);
    }
}

// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, getDocs } from 'firebase/firestore';
// import { environment } from 'environments/environment';

// const app = initializeApp(environment.firebaseConfig);
// const db = getFirestore(app);

// async function testFirestore() {
//   const snapshot = await getDocs(collection(db, 'stations'));
//   console.log(snapshot);
//   snapshot.docs.forEach(doc => {
//     console.log('Doc ID:', doc.id, 'Data:', doc.data());
//   });
// }
// testFirestore();