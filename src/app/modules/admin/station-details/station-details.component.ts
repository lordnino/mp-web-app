import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LogHistoryTabComponent } from './components/log-history-tab/log-history-tab.component';
import { StationStatsTabComponent } from './components/stations-stats/station-stats-tab.component';
import { ChargingHistoryTabComponent } from './components/charging-history-tab/charging-history-tab.component';
import { ReviewsTabComponent } from './components/reviews-tab/reviews-tab.component';
import { LayoutService } from 'app/modules/shared/services/layout.service';
import { AmenitiesTabComponent } from './components/amenities-tab/amenities-tab.component';
import { DetailsTabComponent } from './components/details-tab/details-tab.component';

@Component({
    selector: 'station-details',
    standalone: true,
    templateUrl: './station-details.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        GoogleMapsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatIconModule,
        LogHistoryTabComponent,
        StationStatsTabComponent,
        ChargingHistoryTabComponent,
        ReviewsTabComponent,
        AmenitiesTabComponent,
        DetailsTabComponent
    ],
    styleUrls: ['./station-details.component.scss'],
})
export class StationDetailsComponent implements AfterViewInit {
    @ViewChild('editBtn') editBtn: ElementRef;

    // Static data for the station details UI
    station = {
        name: 'Chilout Madinaty (DC)',
        status: 'Available',
        address: 'Cairo , nasser city , 31 abas el akad',
        openHours: '10:00 - 23:00',
        isOpen: true,
        rating: 4.9,
        connectors: 8,
        power: '22-50 KW',
        type: 'AC Station',
        charges: '30,000',
        isActive: true,
        images: [
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // Main station image
            'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', // Car charging
            'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', // Phone app
        ],
    };
    selectedTab = 'Details';
    
    constructor(private _layoutService: LayoutService) {}

    ngAfterViewInit() {
        this._layoutService.getDrawerOpen().subscribe((isOpen) => {
            console.log(isOpen);
            if (isOpen) {
                this.editBtn.nativeElement.style.left = '315px';
            } else {
                this.editBtn.nativeElement.style.left = '16px';
            }
        });
        // setTimeout(() => {
        //     const drawer = document.querySelector('.fuse-vertical-navigation-appearance-default') as HTMLElement;
        //     if (!drawer) return;

        //     // Function to update the CSS variable
        //     const updateBtnLeft = () => {
        //         const drawerWidth = drawer.offsetWidth;
        //         document.documentElement.style.setProperty('--drawer-width', `${drawerWidth + 40}px`);
        //     };

        //     // Initial set
        //     updateBtnLeft();

        //     // Watch for drawer resize
        //     const resizeObserver = new ResizeObserver(updateBtnLeft);
        //     resizeObserver.observe(drawer);
        // }, 100);
    }
}
