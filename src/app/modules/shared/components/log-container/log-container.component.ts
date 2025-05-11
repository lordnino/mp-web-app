import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'Charger-log-container',
    standalone: true,
    imports: [CommonModule, MatIconModule, TranslocoModule],
    templateUrl: './log-container.component.html',
    styleUrl: './log-container.component.scss',
})
export class LogContainerComponent {
    @Input() logs: any;
    @Input() type: string;
}
