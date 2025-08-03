import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { KwPriceService } from '../../services/kw-price.service';
@Component({
  selector: 'app-kw-price',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './kw-price.component.html',
  styleUrls: ['./kw-price.component.scss']
})
export class KwPriceComponent {
  kwPriceForm: FormGroup;
  isSaving = false;
  showSuccess = false;
  showCancel = false;
  history = [];
  currentKwPriceId: number | null = null;
  acPriceId: number | null = null;
  dcPriceId: number | null = null;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  perPage = 30;
  Math = Math; // Make Math available in template
  initialValues: any = null; // Store initial values from API

  constructor(private fb: FormBuilder, private kwPriceService: KwPriceService) {
    this.kwPriceForm = this.fb.group({
      ac: [null, [Validators.required, Validators.pattern(/^(\d{1,3})(\.\d{1,2})?$/), Validators.max(999.99), Validators.min(0)]],
      dc: [null, [Validators.required, Validators.pattern(/^(\d{1,3})(\.\d{1,2})?$/), Validators.max(999.99), Validators.min(0)]]
    });
  }

  get ac() { return this.kwPriceForm.get('ac'); }
  get dc() { return this.kwPriceForm.get('dc'); }

  ngOnInit() {
    this.getKwPrice();
    this.getKwPriceHistory();
  }

  getKwPrice() {
    this.kwPriceService.getKwPrice().subscribe((res) => {
      if (res && res.data && Array.isArray(res.data)) {
        const acPrice = res.data.find((item: any) => item.type === 'AC');
        const dcPrice = res.data.find((item: any) => item.type === 'DC');
        
        const formValues = {
          ac: acPrice ? acPrice.price_per_kw : null,
          dc: dcPrice ? dcPrice.price_per_kw : null
        };
        
        // Store initial values for cancel functionality
        this.initialValues = { ...formValues };
        
        this.kwPriceForm.patchValue(formValues);
        
        // Store IDs for both AC and DC prices
        this.acPriceId = acPrice ? acPrice.id : null;
        this.dcPriceId = dcPrice ? dcPrice.id : null;
        
        // Keep the first ID for backward compatibility (will be removed in future)
        if (res.data.length > 0) {
          this.currentKwPriceId = res.data[0].id;
        }
      }
    });
  }

  getKwPriceHistory(page: number = 1) {
    this.kwPriceService.getKwPriceHistory(page, this.perPage).subscribe((res) => {
        if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
            this.history = res.data.data.map((item: any) => ({
                date: new Date(item.created_at),
                by: item.user?.name || 'Unknown User',
                old: {
                    ac: item.type === 'AC' ? item.old_price : null,
                    dc: item.type === 'DC' ? item.old_price : null
                },
                new: {
                    ac: item.type === 'AC' ? item.new_price : null,
                    dc: item.type === 'DC' ? item.new_price : null
                }
            }));
            
            // Update pagination metadata
            this.currentPage = res.data.current_page || 1;
            this.totalPages = res.data.last_page || 1;
            this.totalItems = res.data.total || 0;
        } else {
            this.history = [];
        }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getKwPriceHistory(page);
  }

  save() {
    if (this.kwPriceForm.valid) {
      this.isSaving = true;
      
      const prices = [];
      
      // Add AC price if it has changed and ID exists
      if (this.acPriceId && this.ac?.value !== null) {
        prices.push({
          id: this.acPriceId,
          price_per_kw: this.ac.value
        });
      }
      
      // Add DC price if it has changed and ID exists
      if (this.dcPriceId && this.dc?.value !== null) {
        prices.push({
          id: this.dcPriceId,
          price_per_kw: this.dc.value
        });
      }

      this.kwPriceService.updateKwPrice(prices).subscribe(
        (res) => {
          this.isSaving = false;
          this.showSuccess = true;
          // Refresh data after successful update
          // this.getKwPrice();
          this.getKwPriceHistory();
          // Hide success message after 3 seconds
          setTimeout(() => {
            this.showSuccess = false;
          }, 3000);
        },
        (error) => {
          this.isSaving = false;
          console.error('Error updating KW prices:', error);
        }
      );
    } else {
      this.kwPriceForm.markAllAsTouched();
    }
  }

  cancel() {
    if (this.initialValues) {
      this.kwPriceForm.patchValue(this.initialValues);
    } else {
      this.kwPriceForm.reset();
    }
    this.showCancel = true;
  }
} 