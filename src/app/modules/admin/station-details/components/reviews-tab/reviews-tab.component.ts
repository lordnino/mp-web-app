import { Component, ViewEncapsulation, Input } from '@angular/core';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Review } from 'app/models/station.model';
import { formatDistanceToNow } from 'date-fns';

@Component({
    selector     : 'reviews-tab',
    standalone   : true,
    templateUrl  : './reviews-tab.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        GoogleMapsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatIconModule
    ],
    styleUrls: ['./reviews-tab.component.scss']
})
export class ReviewsTabComponent {
    @Input() stationId: string;
    @Input() reviews: Review[];
    constructor() {}

    getFormattedDate(date: string): string {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
      }
}
