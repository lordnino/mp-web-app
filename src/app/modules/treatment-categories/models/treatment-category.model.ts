export interface TreatmentCategory {
    id: number;
    name_en: string;
    name_ar: string;
    images?: any[]; // Optional array of images
    is_active: boolean;
    created_at: string;
} 