import { Component, ViewEncapsulation, OnInit, AfterViewInit, ViewChild, NgZone, OnDestroy } from '@angular/core';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FirebaseService } from 'app/core/services/firebase.service';
import { StationCardComponent } from './station-card.component';
import { StationListMap, ConnectorType } from './station-list-map.model';
import { Router } from '@angular/router';
declare const google: any;

@Component({
    selector     : 'example',
    standalone   : true,
    templateUrl  : './example.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [GoogleMapsModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, StationCardComponent],
    styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit, OnDestroy {
    @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
    zoom = 12;
    center: google.maps.LatLngLiteral = { lat: 30.0444, lng: 31.2357 };
    overlays: any[] = [];
    markers: StationListMap[] = [];
    selectedStation: StationListMap | null = null;
    drawerOpen = false;
    isStationPanelCollapsed = false;
    private unsubscribeStations: () => void;
    filterName: string = '';
    filterAvailability: string = '';
    filterConnectorType: string = '';
    filterChargePower: string = '';
    filteredStations: any[] = [];

    constructor(private ngZone: NgZone, private firebaseService: FirebaseService, private router: Router) {}

    ngOnInit() {
        // Set sample station data
        this.selectedStation = this.getSampleStationData();
        
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
                } as StationListMap;
            }).filter((marker): marker is StationListMap => marker !== null);

            console.log('Processed markers:', this.markers);

            setTimeout(() => {
                this.addLabelOverlays();
            }, 1000);

            this.applyFilters();
        });
        console.log('Google Maps API available:', !!window['google']?.maps);
        console.log('Center coordinates:', this.center);
        console.log('Map component initialized');
    }

    private getSampleStationData(): StationListMap {
        return {
            "id": "10",
            "name_ar": "محطة ميجا بلج J",
            "charging_points": {
                "5403000080": {
                    "id": "60",
                    "serial": "5403000080",
                    "status": "Available",
                    "vendor": null,
                    "model": null,
                    "connectors": {
                        "1": {
                            "connector_type_symbol": "https://firebasestorage.googleapis.com/v0/b/ws-mp-kodepedia.firebasestorage.app/o/connectorTypes%2Floyalty_points.svg?alt=media",
                            "id": "1",
                            "charge_power": "50",
                            "connector_type_id": 15,
                            "status": "Available",
                            "connector_type": "CCS Combo 2",
                            "is_dc": true,
                            "is_active": true,
                            "connector_type_image": "https://firebasestorage.googleapis.com/v0/b/ws-mp-kodepedia.firebasestorage.app/o/connectorTypes%2Floyalty_points.svg?alt=media"
                        },
                        "2": {
                            "connector_type_symbol": "https://firebasestorage.googleapis.com/v0/b/ws-mp-kodepedia.firebasestorage.app/o/connectorTypes%2Floyalty_points.svg?alt=media",
                            "connector_type_image": "https://firebasestorage.googleapis.com/v0/b/ws-mp-kodepedia.firebasestorage.app/o/connectorTypes%2Floyalty_points.svg?alt=media",
                            "charge_power": "50",
                            "is_active": true,
                            "connector_type_id": 16,
                            "is_dc": true,
                            "id": "2",
                            "connector_type": "CHAdeMO",
                            "status": "Available"
                        }
                    },
                    "is_active": true,
                    "firmware": null
                }
            },
            "address_en": "Heliopolis, Cairo, Egypt",
            "address_ar": "مصر الجديدة، القاهرة، مصر",
            "name_en": "MegaPlug Station J",
            "status": "InUse",
            "longitude": 31.2410507,
            "is_active": true,
            "last_updated": {
                "seconds": 1748453228,
                "nanoseconds": 561134000
            },
            "latitude": 29.9594737,
            "position": {
                "lat": 29.9594737,
                "lng": 31.2410507
            },
            "label": "MegaPlug Station J",
            "icon": {
                "url": "/megaplug/station-in-use-marker.svg",
                "scaledSize": {
                    "width": 42,
                    "height": 42
                }
            }
        };
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

    onMarkerClick(marker: StationListMap) {
      this.selectedStation = marker;
      this.drawerOpen = true;
    }

    // Helper: Count all connectors (excluding nulls)
    getConnectorCount(station: StationListMap): number {
      if (!station?.charging_points) return 0;
      
      // Count all connectors from all charging points
      let totalConnectors = 0;
      Object.values(station.charging_points).forEach((cp: any) => {
        if (cp.connectors && typeof cp.connectors === 'object') {
          totalConnectors += Object.keys(cp.connectors).length;
        }
      });
      return totalConnectors;
    }

    // Helper: Get min-max power range string (e.g. '22-150 KW')
    getPowerRange(station: StationListMap): string {
      if (!station?.charging_points) return '';
      
      // Collect all charge powers from all connectors
      const powers: number[] = [];
      Object.values(station.charging_points).forEach((cp: any) => {
        if (cp.connectors && typeof cp.connectors === 'object') {
          Object.values(cp.connectors).forEach((connector: any) => {
            if (connector.charge_power) {
              powers.push(parseInt(connector.charge_power));
            }
          });
        }
      });
      
      if (!powers.length) return '';
      const min = Math.min(...powers);
      const max = Math.max(...powers);
      return min === max ? `${min} KW` : `${min}-${max} KW`;
    }

    // Helper: List unique connector types with icon
    getConnectorTypes(station: StationListMap): ConnectorType[] {
      if (!station?.charging_points) return [];
      
      const types = new Set<string>();
      const iconMap = new Map<string, string>();
      
      Object.values(station.charging_points).forEach((cp: any) => {
        if (cp.connectors && typeof cp.connectors === 'object') {
          Object.values(cp.connectors).forEach((connector: any) => {
            if (connector.connector_type) {
              types.add(connector.connector_type);
              // Store the icon for this connector type
              if (connector.connector_type_image || connector.connector_type_symbol) {
                iconMap.set(connector.connector_type, connector.connector_type_image || connector.connector_type_symbol);
              }
            }
          });
        }
      });
      
      return Array.from(types).map(type => ({
        name: type,
        icon: iconMap.get(type) || this.getDefaultConnectorIcon(type)
      }));
    }

    // Helper: List unique charge power values (sorted)
    getChargePowers(station: StationListMap): number[] {
      if (!station?.charging_points) return [];
      
      const powers: number[] = [];
      Object.values(station.charging_points).forEach((cp: any) => {
        if (cp.connectors && typeof cp.connectors === 'object') {
          Object.values(cp.connectors).forEach((connector: any) => {
            if (connector.charge_power) {
              powers.push(parseInt(connector.charge_power));
            }
          });
        }
      });
      
      return Array.from(new Set(powers)).sort((a, b) => a - b);
    }

    private getDefaultConnectorIcon(connectorType: string): string {
      // Map connector types to their default icons
      const iconMap: { [key: string]: string } = {
        'CCS Combo 2': '/megaplug/icons/ccs-combo.svg',
        'CHAdeMO': '/megaplug/icons/chademo.svg',
        'Type 2': '/megaplug/icons/type2.svg',
        'Type 1': '/megaplug/icons/type1.svg'
      };
      
      return iconMap[connectorType] || '/megaplug/icons/connector.svg';
    }

    applyFilters() {
        if (!this.markers) {
            this.filteredStations = [];
            return;
        }
        this.filteredStations = this.markers.filter(station => {
            // Filter by name
            const matchesName = !this.filterName || (station.label && station.label.toLowerCase().includes(this.filterName.toLowerCase()));
            // Filter by availability
            const matchesAvailability = !this.filterAvailability || (station.status && station.status.toLowerCase() === this.filterAvailability.toLowerCase());
            // Filter by connector type
            const matchesConnectorType = !this.filterConnectorType || (this.getConnectorTypes(station).some(type => type.name === this.filterConnectorType));
            // Filter by charge power (as string match)
            const matchesChargePower = !this.filterChargePower || (this.getPowerRange(station).includes(this.filterChargePower));
            return matchesName && matchesAvailability && matchesConnectorType && matchesChargePower;
        });
    }

    onStationCardClick(station: StationListMap) {
      if (station?.position) {
        this.center = { ...station.position };
        this.zoom = 16; // or your preferred zoom level
        this.onMarkerClick(station);
      }
    }

    toggleStationPanel() {
      this.isStationPanelCollapsed = !this.isStationPanelCollapsed;
    }

    onStationDetailsClick() {
      this.router.navigate(['/station/', this.selectedStation?.id]);
    }
}