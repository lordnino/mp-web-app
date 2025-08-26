import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from 'app/modules/shared/components/data-table/data-table.component';
import { PageHeaderComponent } from 'app/modules/shared/components/page-header/page-header.component';
import { PaginationMeta } from 'app/modules/shared/models/api-response.model';
import { PaginationComponent } from 'app/modules/shared/components/pagination/pagination.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { UnassignedChargingPointsService } from '../../services/unassigned-charging-points.service';
import { AssignStationModalComponent } from '../assign-station-modal/assign-station-modal.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';

interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    template?: TemplateRef<any>;
}

@Component({
    selector: 'app-unassigned-list',
    standalone: true,
    imports: [
        CommonModule,
        PageHeaderComponent,
        PaginationComponent,
        DataTableComponent,
        MatIconModule,
        MatButtonModule,
        MatChipsModule
    ],
    templateUrl: './unassigned-list.component.html',
    styleUrls: ['./unassigned-list.component.scss']
})
export class UnassignedListComponent implements OnInit, AfterViewInit {
    @ViewChild('connectorsTemplate') connectorsTemplate: TemplateRef<any>;
    
    chargingPoints: any[] = [];
    columns: TableColumn[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'serial', label: 'Serial Number', sortable: true },
        { key: 'vendor', label: 'Vendor', sortable: true },
        { key: 'model', label: 'Model', sortable: true },
        { key: 'connectors', label: 'Connector Types', sortable: false, template: null },
        { key: 'firmware', label: 'Firmware', sortable: false },
        { key: 'created_at', label: 'Created At', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false }
    ];
    loading = false;
    chargingPointsMeta: PaginationMeta;
    params = {
        page: 1,
        count: 10,
        per_page: 10,
        last_page: 1,
        sort: 'created_at,desc',
    };
    sortActive = 'created_at';
    sortDirection: 'asc' | 'desc' = 'desc';
    
    tableActions = [
        { 
            label: 'Assign to Station', 
            icon: 'add_link', 
            action: 'assign',
            show: (row: any) => true
        }
    ];

    constructor(
        private unassignedService: UnassignedChargingPointsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private confirmationService: FuseConfirmationService
    ) {}

    ngOnInit() {
        this.getUnassignedChargingPoints();
    }

    ngAfterViewInit() {
        this.updateColumnsWithTemplates();
    }

    updateColumnsWithTemplates() {
        if (this.connectorsTemplate) {
            this.columns = this.columns.map(col => {
                if (col.key === 'connectors') {
                    return { ...col, template: this.connectorsTemplate };
                }
                return col;
            });
        }
    }

    getUnassignedChargingPoints(params: any = {}) {
        const queryParams = {
            ...this.params,
            ...params,
        };
        this.loading = true;
        this.unassignedService.getUnassignedChargingPoints(queryParams).subscribe({
            next: (res: any) => {
                this.chargingPoints = res.data;
                this.chargingPointsMeta = res.meta;
                this.loading = false;
                
                setTimeout(() => {
                    this.updateColumnsWithTemplates();
                });
            },
            error: (error) => { 
                console.error('Error loading unassigned charging points:', error);
                this.loading = false; 
            }
        });
    }

    pageChanger(event: number): void {
        this.params.page = event;
        this.getUnassignedChargingPoints();
    }

    onPageSizeChange(newSize: number): void {
        this.params.count = newSize;
        this.params.per_page = newSize;
        this.getUnassignedChargingPoints();
    }

    onSortChange(sort: Sort) {
        if (!sort.direction) {
            this.sortActive = 'created_at';
            this.sortDirection = 'desc';
            this.params.sort = 'created_at,desc';
            return;
        }
        this.sortActive = sort.active;
        this.sortDirection = sort.direction as 'asc' | 'desc';
        this.params.sort = `${sort.active},${sort.direction}`;
        this.getUnassignedChargingPoints();
    }

    onActionClick(event: {action: string, row: any}): void {
        if (event.action === 'assign') {
            this.openAssignModal(event.row);
        }
    }

    openAssignModal(chargingPoint: any): void {
        const dialogRef = this.dialog.open(AssignStationModalComponent, {
            width: '600px',
            maxWidth: '90vw',
            data: { chargingPoint }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.station_id) {
                this.confirmAssignment(chargingPoint, result.station_id);
            }
        });
    }

    confirmAssignment(chargingPoint: any, stationId: number): void {
        const confirmation = this.confirmationService.open({
            title: 'Confirm Assignment',
            message: `Are you sure you want to assign charging point ${chargingPoint.serial} to the selected station?`,
            actions: {
                confirm: {
                    label: 'Assign',
                    color: 'primary'
                },
                cancel: {
                    label: 'Cancel'
                }
            }
        });

        confirmation.afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this.assignChargingPoint(chargingPoint.id, stationId);
            }
        });
    }

    assignChargingPoint(chargingPointId: number, stationId: number): void {
        this.unassignedService.assignChargingPointToStation(chargingPointId, stationId).subscribe({
            next: (response) => {
                this.snackBar.open('Charging point assigned successfully', 'Close', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });
                // Refresh the table
                this.getUnassignedChargingPoints();
            },
            error: (error) => {
                console.error('Error assigning charging point:', error);
                this.snackBar.open('Failed to assign charging point', 'Close', {
                    duration: 3000,
                    panelClass: ['error-snackbar']
                });
            }
        });
    }
}