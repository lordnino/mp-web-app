export interface Station {
    id: number;
    name: string;
    status: string;
    address: string;
    openHours: string;
    isOpen: boolean;
    rating: number;
    connectors: number;
    power: string;
    type: string;
    charges: string;
    name_en: string;
    name_ar: string;
    images: string[];
    address_en: string;
    address_ar: string;
    location: string; // JSON string
    average_rating: number;
    total_reviews: number;
    is_active: boolean;
    today_working_hours: WorkingHours;
    all_working_hours: WorkingHours[];
    amenities: Amenity[];
    charging_points: ChargingPoint[];
    connector_powers: string[];
    created_at: string;
    updated_at: string;
}

export interface WorkingHours {
    id?: number;
    station_id?: number;
    weekday: string;
    is_24_hours: boolean;
    start_time: string | null;
    end_time: string | null;
    is_active: boolean;
    shift_order?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export interface Amenity {
    id: number;
    name_en: string;
    name_ar: string;
    image_url: string;
}

export interface ChargingPoint {
    id: number;
    name: string | null;
    vendor: string | null;
    model: string | null;
    firmware_version: string | null;
    is_active: boolean;
    connectors: Connector[];
}

export interface Connector {
    id: number;
    connector_id: string;
    connector_type: ConnectorType;
    charge_power: ChargePower;
    price_per_kw: string;
    status: string;
    is_active: boolean;
}

export interface ConnectorType {
    id: number;
    name_en: string;
    name_ar: string;
    image: string;
    is_dc: boolean;
}

export interface ChargePower {
    id: number;
    name_en: string;
    name_ar: string | null;
    power_kw: number | null;
}

export interface Review {
    id: number;
    user: User;
    rating: number;
    review: string;
    transaction_id: string | null;
    created_at: string;
    created_at_human: string;
}

export interface User {
    id: number;
    name: string;
    avatar: string | null;
}
