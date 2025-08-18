import { Component, ViewEncapsulation, OnInit, AfterViewInit, ViewChild, NgZone, OnDestroy } from '@angular/core';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FirebaseService } from 'app/core/services/firebase.service';
import { StationCardComponent } from './station-card.component';
import { StationListMap, ConnectorType } from './station-list-map.model';
import { Router } from '@angular/router';
import { StationsService } from 'app/core/stations/stations.service';
declare const google: any;

@Component({
    selector     : 'stations',
    standalone   : true,
    templateUrl  : './stations.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [GoogleMapsModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatIconModule, CommonModule, StationCardComponent],
    styleUrls: ['./stations.component.scss']
})
export class StationsComponent implements OnInit, OnDestroy {
    @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
    zoom = 12;
    center: google.maps.LatLngLiteral = { lat: 30.0444, lng: 31.2357 };
    overlays: any[] = [];
    markers: StationListMap[] = [];
    selectedStation: StationListMap | null = null;
    drawerOpen = false;
    isStationPanelCollapsed = false;
    private unsubscribeStations: () => void;
    name: string = '';
    filterAvailability: string[] = [];
    filterConnectorType: string[] = [];
    filterChargePower: string[] = [];
    filteredStations: any[] = [];
    
    // Store all original stations for filtering
    allStations: StationListMap[] = [];
    isFiltered: boolean = false;
    isLoading: boolean = true;

    // Filter options from API
    connectorTypeOptions: any[] = [];
    chargingPowerOptions: any[] = [];
    statusFilterOptions: any[] = [];

    constructor(private ngZone: NgZone, private firebaseService: FirebaseService, private router: Router, private stationsService: StationsService) {}

    ngOnInit() {
        // Set sample station data
        this.selectedStation = this.getSampleStationData();
        
        // Load filter settings first
        this.loadFilterSettings();
        
        this.unsubscribeStations = this.firebaseService.listenToStations((stations) => {
            console.log('Raw stations data:', stations);
            // Store all original stations for filtering
            this.allStations = stations.map(station => {
                const lat = Number(station.latitude ?? station.lat);
                const lng = Number(station.longitude ?? station.lng);

                if (isNaN(lat) || isNaN(lng)) {
                    console.error(`Invalid coordinates for station ${station.name_en || station.name_ar || station.id}:`, { lat, lng });
                    return null;
                }

                return {
                    ...station,
                    position: { lat, lng },
                    label: station.name_en || station.name_ar || station.id,
                    icon: {
                        url: this.getStationIcon(station.status),
                        scaledSize: { width: 42, height: 42 }
                    }
                } as StationListMap;
            }).filter((marker): marker is StationListMap => marker !== null);

            // Initially show all stations
            this.markers = [...this.allStations];
            this.isFiltered = false;
            this.isLoading = false;

            console.log('Processed markers:', this.markers);

            setTimeout(() => {
                this.addLabelOverlays();
            }, 1000);
        });
        console.log('Google Maps API available:', !!window['google']?.maps);
        console.log('Center coordinates:', this.center);
        console.log('Map component initialized');
    }

    loadFilterSettings() {
        console.log('Loading filter settings...');
        this.getStationFiltersSettings();
    }

    // Add filter API call method
    applyFilters() {
        console.log('Applying filters...');
        console.log('Current filter values:', {
            name: this.name,
            availability: this.filterAvailability,
            connectorType: this.filterConnectorType,
            chargePower: this.filterChargePower
        });

        // Set loading state during filtering
        this.isLoading = true;

        // Prepare query parameters
        const params: any = {};

        // Add connector types if selected
        if (this.filterConnectorType && this.filterConnectorType.length > 0) {
            console.log('Selected connector types:', this.filterConnectorType);
            console.log('Available connector type options:', this.connectorTypeOptions);
            
            const selectedConnectors = this.connectorTypeOptions
                .filter(option => this.filterConnectorType.includes(option.value))
                .map(option => option.id);
            
            console.log('Mapped connector type IDs:', selectedConnectors);
            params.connector_types = selectedConnectors;
        }

        // Add statuses if selected
        if (this.filterAvailability && this.filterAvailability.length > 0) {
            params.statuses = this.filterAvailability;
        }

        // Add charging powers if selected
        if (this.filterChargePower && this.filterChargePower.length > 0) {
            console.log('Selected charging powers:', this.filterChargePower);
            console.log('Available charging power options:', this.chargingPowerOptions);
            
            const selectedPowers = this.chargingPowerOptions
                .filter(option => this.filterChargePower.includes(option.value))
                .map(option => option.id);
            
            console.log('Mapped charging power IDs:', selectedPowers);
            params.charging_powers = selectedPowers;
        }

        if (this.name) {
            params.name = this.name;
        }

        console.log('API parameters:', params);

        // Call the filter API
        this.stationsService.filterStations(params).subscribe({
            next: (response) => {
                console.log('Filter API response:', response);
                
                if (response && Array.isArray(response)) {
                    // Extract station IDs from the response
                    const filteredStationIds = response.map((item: any) => item.station_id);
                    console.log('Filtered station IDs:', filteredStationIds);
                    
                    // Filter the original stations based on station IDs
                    this.markers = this.allStations.filter(station => 
                        filteredStationIds.includes(Number(station.id))
                    );
                    
                    this.isFiltered = true;
                    console.log('Filtered markers:', this.markers);
                } else {
                    // If no filters applied or no results, show all stations
                    this.markers = [...this.allStations];
                    this.isFiltered = false;
                }
                
                // Set loading to false after filtering
                this.isLoading = false;
                
                // Re-add overlays with filtered data
                setTimeout(() => {
                    this.addLabelOverlays();
                }, 100);
            },
            error: (error) => {
                console.error('Error calling filter API:', error);
                // On error, show all stations
                this.markers = [...this.allStations];
                this.isFiltered = false;
                this.isLoading = false;
                
                setTimeout(() => {
                    this.addLabelOverlays();
                }, 100);
            }
        });
    }

    getStationFiltersSettings() {
        console.log('Fetching station filter settings...');
        this.stationsService.getStationFiltersSettings().subscribe({
            next: (res) => {
                console.log('Filter settings response:', res);
                
                // Map connector types
                if (res && res.connector_types && Array.isArray(res.connector_types)) {
                    this.connectorTypeOptions = res.connector_types.map((type: any) => ({
                        value: type.name_en,
                        label: type.name_en,
                        id: type.id,
                        is_dc: type.is_dc
                    }));
                    console.log('Connector types mapped:', this.connectorTypeOptions);
                } else {
                    console.warn('No connector_types found in response:', res);
                }
                
                // Map charging powers
                if (res && res.charging_powers && Array.isArray(res.charging_powers)) {
                    this.chargingPowerOptions = res.charging_powers.map((power: any) => ({
                        value: power.name_en,
                        label: power.name_en,
                        id: power.id
                    }));
                    console.log('Charging powers mapped:', this.chargingPowerOptions);
                } else {
                    console.warn('No charging_powers found in response:', res);
                }
                
                // Map status filters
                if (res && res.status_filters && Array.isArray(res.status_filters)) {
                    this.statusFilterOptions = res.status_filters.map((status: any) => ({
                        value: status.key,
                        label: status.value
                    }));
                    console.log('Status filters mapped:', this.statusFilterOptions);
                } else {
                    console.warn('No status_filters found in response:', res);
                }
                
                console.log('Final mapped options:', {
                    connectorTypes: this.connectorTypeOptions,
                    chargingPowers: this.chargingPowerOptions,
                    statusFilters: this.statusFilterOptions
                });
            },
            error: (error) => {
                console.error('Error fetching station filter settings:', error);
                // Set some default options for testing
                this.connectorTypeOptions = [
                    { value: 'CHAdeMO', label: 'CHAdeMO', id: 16, is_dc: true },
                    { value: 'CCS Combo 2', label: 'CCS Combo 2', id: 15, is_dc: true }
                ];
                this.chargingPowerOptions = [
                    { value: '22 KW', label: '22 KW', id: 11 },
                    { value: '40 KW', label: '40 KW', id: 12 },
                    { value: '60 KW', label: '60 KW', id: 13 }
                ];
                this.statusFilterOptions = [
                    { value: 'Available', label: 'Available' },
                    { value: 'InUse', label: 'In use' }
                ];
                console.log('Set default options due to error');
            }
        });
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

    private getStationIcon(status: string): string {
      switch (status) {
        case 'Available':
          return '/megaplug/station-available-marker.svg';
        case 'InUse':
          return '/megaplug/station-in-use-marker.svg';
        case 'unavailable':
          return '/megaplug/stastion-unavailable-marker.svg';
        default:
          return '/megaplug/station-available-marker.svg'; // Default icon
      }
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

    onAddNewStation() {
      console.log('Add New Station clicked');
      // Add your logic here for adding a new station
    }

    onStationDetailsClick() {
      this.router.navigate(['/station/', this.selectedStation?.id]);
    }

    onToggleActive(event: any) {
      console.log('Station active status changed:', event.checked);
      // Here you can add API call to update the station's is_active status
      if (this.selectedStation) {
        // Example API call (you'll need to implement this in your service)
        // this.stationsService.updateStationStatus(this.selectedStation.id, event.checked).subscribe({
        //   next: (response) => {
        //     console.log('Station status updated successfully');
        //   },
        //   error: (error) => {
        //     console.error('Error updating station status:', error);
        //   }
        // });
      }
    }

    clearFilters() {
      console.log('Clearing filters...');
      this.name = '';
      this.filterAvailability = [];
      this.filterConnectorType = [];
      this.filterChargePower = [];
      
      // Show all stations
      this.markers = [...this.allStations];
      this.isFiltered = false;
      
      setTimeout(() => {
        this.addLabelOverlays();
      }, 100);
      
      console.log('Filters cleared, showing all stations');
    }

    // Check if any filter values are present
    hasFilterValues(): boolean {
      return !!(
        this.name?.trim() ||
        this.filterAvailability?.length > 0 ||
        this.filterConnectorType?.length > 0 ||
        this.filterChargePower?.length > 0
      );
    }
}