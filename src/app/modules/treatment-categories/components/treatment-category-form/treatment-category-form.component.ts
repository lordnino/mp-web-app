import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TreatmentCategoriesService } from '../../Services/treatment-categories.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from 'app/modules/shared/components/page-header/page-header.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoadingButtonComponent } from 'app/modules/shared/components/loading-button/loading-button.component';
import { ImageUploadComponent } from 'app/modules/shared/components/image-upload/image-upload.component';

@Component({
    selector: 'app-treatment-category-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, PageHeaderComponent, MatFormFieldModule, MatInputModule, LoadingButtonComponent, ImageUploadComponent],
    templateUrl: './treatment-category-form.component.html',
    styleUrls: ['./treatment-category-form.component.scss']
})
export class TreatmentCategoryFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    categoryId: number | null = null;
    isLoading = false;
    @ViewChild(ImageUploadComponent) imageUploadComponent: ImageUploadComponent;
    imagesFromApi: any[] = [];
    originalImageId: string | null = null;

    constructor(
        private fb: FormBuilder,
        private service: TreatmentCategoriesService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            name_en: ['', Validators.required],
            name_ar: ['', Validators.required],
            image_id: [null]
        });
    }

    ngOnInit() {
        this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
        this.isEditMode = !!this.categoryId;
        if (this.isEditMode) {
            this.isLoading = true;
            this.service.getOne(this.categoryId!).subscribe({
                next: (res: any) => {
                    const cat = {
                        ...res.data,
                        image_id: res.data.image_url || null
                    };
                    this.originalImageId = res.data.image_url || null;
                    console.log('Category:', cat);
                    this.form.patchValue(cat);
                    console.log('Form:', this.form.value);  
                    this.isLoading = false;
                },
                error: () => { this.isLoading = false; }
            });
        }
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.isLoading = true;
        const formValue = this.form.value;
        let data: any;
        if (this.isEditMode) {
            data = {
                name_en: formValue.name_en,
                name_ar: formValue.name_ar
            };
            if (formValue.image_id !== this.originalImageId) {
                data.image_id = formValue.image_id;
            }
        } else {
            data = formValue;
        }
        console.log('Data from form:', data);
        const obs = this.isEditMode
            ? this.service.update(this.categoryId!, data)
            : this.service.create(data);
        obs.subscribe({
            next: (response) => {
                this.isLoading = false;
                this.imagesFromApi = response.images || [];
                if (this.imageUploadComponent) {
                    this.imageUploadComponent.setImages(this.imagesFromApi);
                }
                console.log('Images from API:', this.imagesFromApi);
                this.router.navigate(['/treatment-categories/all-treatment-categories']);
            },
            error: () => { this.isLoading = false; }
        });
    }

    onImagesChange(images: any[]) {
        console.log('Images from component:', images);
        this.form.get('image_id')?.setValue(images.length > 0 ? images[0].id : null);
    }
} 