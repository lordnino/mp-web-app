import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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

  constructor(private fb: FormBuilder) {
    this.kwPriceForm = this.fb.group({
      ac: [null, [Validators.required, Validators.pattern(/^(\d{1,3})(\.\d{1,2})?$/), Validators.max(999.99), Validators.min(0)]],
      dc: [null, [Validators.required, Validators.pattern(/^(\d{1,3})(\.\d{1,2})?$/), Validators.max(999.99), Validators.min(0)]]
    });
  }

  get ac() { return this.kwPriceForm.get('ac'); }
  get dc() { return this.kwPriceForm.get('dc'); }

  save() {
    if (this.kwPriceForm.valid) {
      this.isSaving = true;
      // Simulate save and add to history
      setTimeout(() => {
        this.isSaving = false;
        this.showSuccess = true;
        // Add to history (placeholder)
        this.history.unshift({
          date: new Date(),
          by: 'Current User',
          old: { ac: 0, dc: 0 }, // Replace with real old values
          new: { ac: this.ac?.value, dc: this.dc?.value }
        });
      }, 1000);
    } else {
      this.kwPriceForm.markAllAsTouched();
    }
  }

  cancel() {
    this.kwPriceForm.reset();
    this.showCancel = true;
  }
} 