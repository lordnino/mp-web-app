import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-loading-button',
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule
    ],
    template: `
        <button 
            mat-raised-button
            [color]="color"
            [type]="type"
            [disabled]="isLoading || disabled"
            class="min-w-[120px] h-10 inline-flex items-center justify-center"
            (click)="onClick.emit($event)"
        >
            <div class="flex items-center gap-2">
                @if (isLoading) {
                    <mat-icon class="!w-4 !h-4 animate-spin">sync</mat-icon>
                    <span class="inline-block">{{ loadingText || defaultLoadingText }}</span>
                } @else {
                    <span class="inline-block"><ng-content></ng-content></span>
                }
            </div>
        </button>
    `,
    styles: [`
        :host {
            display: inline-block;
        }
        mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            line-height: 16px;
        }
    `]
})
export class LoadingButtonComponent {
    @Input() isLoading = false;
    @Input() disabled = false;
    @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() loadingText?: string;
    @Output() onClick = new EventEmitter<MouseEvent>();

    protected readonly defaultLoadingText = 'Please wait...';
} 