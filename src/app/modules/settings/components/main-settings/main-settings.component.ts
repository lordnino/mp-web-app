import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from 'app/modules/shared/components/data-table/data-table.component';
import { PageHeaderComponent } from 'app/modules/shared/components/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MultipleDropDownComponent } from 'app/modules/shared/components/multiple-drop-down/multiple-drop-down.component';
import { PaginationComponent } from 'app/modules/shared/components/pagination/pagination.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CheckPermissionDirective } from 'app/modules/shared/directives/check-permission.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { KwPriceComponent } from '../kw-price/kw-price.component';
import { LoyaltyPointsComponent } from '../loyalty-points/loyalty-points.component';

interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    template?: TemplateRef<any>;
}

@Component({
    selector: 'app-main-settings',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MultipleDropDownComponent,
        PageHeaderComponent,
        PaginationComponent,
        DataTableComponent,
        MatSlideToggleModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        CheckPermissionDirective,
        MatTabsModule,
        KwPriceComponent,
        LoyaltyPointsComponent
    ],
    templateUrl: './main-settings.component.html',
    styleUrls: ['./main-settings.component.scss']
})
export class MainSettingsComponent {

} 
