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
            // Group changes by timestamp to combine AC and DC changes
            const groupedChanges = new Map();
            
            res.data.data.forEach((item: any) => {
                const timestamp = item.created_at;
                const user = item.user?.name || 'Unknown User';
                
                if (!groupedChanges.has(timestamp)) {
                    groupedChanges.set(timestamp, {
                        date: new Date(timestamp),
                        by: user,
                        old: { ac: null, dc: null },
                        new: { ac: null, dc: null }
                    });
                }
                
                const change = groupedChanges.get(timestamp);
                if (item.type === 'AC') {
                    change.old.ac = item.old_price;
                    change.new.ac = item.new_price;
                } else if (item.type === 'DC') {
                    change.old.dc = item.old_price;
                    change.new.dc = item.new_price;
                }
            });
            
            // Convert to array and filter out entries with no actual changes
            this.history = Array.from(groupedChanges.values())
                .filter(change => {
                    const acChanged = change.old.ac !== change.new.ac;
                    const dcChanged = change.old.dc !== change.new.dc;
                    return acChanged || dcChanged;
                })
                .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
            
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

  // Helper methods for template
  hasAcChange(entry: any): boolean {
    return entry.old.ac !== entry.new.ac;
  }

  hasDcChange(entry: any): boolean {
    return entry.old.dc !== entry.new.dc;
  }

  formatValue(value: any): string {
    if (value !== null && value !== undefined) {
      // Convert to number and round to 2 decimal places
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return numValue.toFixed(2);
      }
      return value.toString();
    }
    return '—';
  }
} 