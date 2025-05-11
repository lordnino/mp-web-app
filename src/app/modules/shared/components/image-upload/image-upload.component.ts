import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-image-upload',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
    @Input() initialImages: any[] = [];
    @Input() multiImage: boolean = false;
    @Output() imagesChange = new EventEmitter<any[]>();

    files: File[] = [];
    previews: string[] = [];
    uploadedImages: any[] = [];
    uploading = false;

    constructor(private http: HttpClient) {}

    ngOnInit() {
        console.log('initialImages', this.initialImages);
        if (this.initialImages?.length) {
            this.uploadedImages = [...this.initialImages];
        }
    }

    setImages(images: any[]) {
        this.uploadedImages = [...images];
        this.imagesChange.emit(this.uploadedImages);
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        
        const files = Array.from(input.files);
        this.handleFiles(files);
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        
        if (event.dataTransfer?.files) {
            const files = Array.from(event.dataTransfer.files);
            this.handleFiles(files);
        }
    }

    private handleFiles(files: File[]) {
        if (!this.multiImage) {
            this.files = [];
            this.previews = [];
            this.uploadedImages = [];
        }

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                this.files.push(file);
                const reader = new FileReader();
                reader.onload = (e: ProgressEvent<FileReader>) => {
                    if (e.target?.result) {
                        this.previews.push(e.target.result as string);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    removePreview(index: number) {
        this.files.splice(index, 1);
        this.previews.splice(index, 1);
    }

    removeUploaded(index: number) {
        this.uploadedImages.splice(index, 1);
        this.imagesChange.emit(this.uploadedImages);
    }

    upload() {
        if (this.files.length === 0) return;
        this.uploading = true;
        const formData = new FormData();
        this.files.forEach(file => {
            formData.append('files[]', file);
        });

        this.http.post<any[]>(`${environment.apiUrl}files/upload`, formData).subscribe({
            next: (res: any) => {
                if (this.multiImage) {
                    this.uploadedImages = [...this.uploadedImages, ...res.data];
                } else {
                    this.uploadedImages = res.data.length ? [res.data[res.data.length - 1]] : [];
                }
                console.log('uploadedImages', this.uploadedImages);
                this.imagesChange.emit(this.uploadedImages);
                this.files = [];
                this.previews = [];
                this.uploading = false;
            },
            error: () => { this.uploading = false; }
        });
    }
} 