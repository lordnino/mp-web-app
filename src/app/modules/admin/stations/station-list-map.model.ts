// Station List and Map Model Interfaces

export interface Connector {
  id: string;
  connector_type: string;
  connector_type_id: number;
  connector_type_symbol: string;
  connector_type_image: string;
  charge_power: string;
  status: 'Available' | 'InUse' | 'Unavailable';
  is_dc: boolean;
  is_active: boolean;
}

export interface ChargingPoint {
  id: string;
  serial: string;
  status: 'Available' | 'InUse' | 'Unavailable';
  vendor: string | null;
  model: string | null;
  firmware: string | null;
  is_active: boolean;
  connectors: { [key: string]: Connector };
}

export interface Position {
  lat: number;
  lng: number;
}

export interface Icon {
  url: string;
  scaledSize: {
    width: number;
    height: number;
  };
}

export interface LastUpdated {
  seconds: number;
  nanoseconds: number;
}

export interface StationListMap {
  id: string;
  last_updated: LastUpdated;
  longitude: number;
  address_en: string;
  latitude: number;
  name_ar: string;
  address_ar: string;
  is_active: boolean;
  status: 'Available' | 'InUse' | 'Unavailable';
  charging_points: { [key: string]: ChargingPoint };
  name_en: string;
  position: Position;
  label: string;
  icon: Icon;
  image?: string; // Optional field for station image
}

// Helper types for filtered/processed data
export interface ConnectorType {
  name: string;
  icon: string;
}

export interface StationWithMapData extends StationListMap {
  // Additional properties for map display
  mapPosition?: google.maps.LatLngLiteral;
  mapIcon?: Icon;
}

// Filter interfaces
export interface StationFilters {
  name?: string;
  availability?: 'Available' | 'InUse' | 'Unavailable';
  connectorType?: string;
  chargePower?: string;
}

// Map marker interface
export interface MapMarker {
  position: Position;
  icon: Icon;
  station: StationListMap;
}