import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { environment } from 'environments/environment';
import { DiskService } from '../../services/disk.service';

@Component({
    selector: 'Charger-export-file',
    standalone: true,
    imports: [MatIconModule],
    templateUrl: './export-file.component.html',
    styleUrl: './export-file.component.scss',
})
export class ExportFileComponent {
    @Input() endpoint: string;

    baseUrl = environment.apiUrl;

    constructor(private _diskService: DiskService) {}

    ngOnInit(): void {}

    export(): void {
        if (this.endpoint) {
            this._diskService
                .downloadFile(`${this.baseUrl}${this.endpoint}`)
                .subscribe((response: any) => {
                    this.saveFile(response.url_excel_download);
                });
        }
    }

    private saveFile(downloadUrl: string): void {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'exported-data.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
