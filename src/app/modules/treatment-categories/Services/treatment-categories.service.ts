import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TreatmentCategory } from '../models/treatment-category.model';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class TreatmentCategoriesService {
    private _categoriesBaseUrl = `${environment.apiUrl}treatment-categories`;
    private _treatmentsBaseUrl = `${environment.apiUrl}treatments`;
    private _healthGoalsBaseUrl = `${environment.apiUrl}health-goals`;
    private _servicesBaseUrl = `${environment.apiUrl}services`;

    constructor(private http: HttpClient) {}

    getAll(params: any = {}): Observable<TreatmentCategory[]> {
        return this.http.get<TreatmentCategory[]>(this._categoriesBaseUrl, { params });
    }

    getOne(id: number | string): Observable<TreatmentCategory> {
        return this.http.get<TreatmentCategory>(`${this._categoriesBaseUrl}/${id}`);
    }

    create(category: Pick<TreatmentCategory, 'name_en' | 'name_ar'>): Observable<TreatmentCategory> {
        return this.http.post<TreatmentCategory>(this._categoriesBaseUrl, category);
    }

    update(id: number | string, category: Pick<TreatmentCategory, 'name_en' | 'name_ar'>): Observable<TreatmentCategory> {
        return this.http.put<TreatmentCategory>(`${this._categoriesBaseUrl}/${id}`, category);
    }

    delete(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this._categoriesBaseUrl}/${id}`);
    }

    toggleStatus(id: number | string, status: boolean): Observable<void> {
        return this.http.patch<void>(`${this._categoriesBaseUrl}/${id}/toggle-active`, { is_active: status });
    }

    getAllCategories() {
        return this.http.get<{ data: TreatmentCategory[] }>(`${this._categoriesBaseUrl}`);
    }

    updateCategoriesOrder(payload: { categories: { id: number; display_order: number }[] }) {
        return this.http.patch(`${this._categoriesBaseUrl}/reorder`, payload);
    }

    getAllTreatments(params: any = {}) {
        return this.http.get(`${this._treatmentsBaseUrl}`, { params });
    }

    getAllHealthGoals(params: any = {}) {
        return this.http.get(`${this._healthGoalsBaseUrl}`, { params });
    }

    getAllServices(params: any = {}) {
        return this.http.get(`${this._servicesBaseUrl}`, { params });
    }
} 