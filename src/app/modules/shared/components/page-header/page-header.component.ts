import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

interface Breadcrumb {
    name: string;
    link: string;
}

@Component({
    selector: 'app-page-header',
    standalone: true,
    imports: [
        MatIconModule,
        RouterModule
    ],
    template: `
        <div class="bg-card flex flex-0 flex-col border-b p-6 dark:bg-transparent sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-8">
            <div class="min-w-0 flex-1">
                <!-- Breadcrumbs -->
                <div class="flex flex-wrap items-center font-medium">
                    @for (item of breadcrumbs; track item; let last = $last) {
                        <div [class.ml-1]="!$first" class="flex items-center">
                            @if (!$first) {
                                <mat-icon
                                    class="text-secondary icon-size-5"
                                    [svgIcon]="'heroicons_mini:chevron-right'"
                                ></mat-icon>
                            }
                            <a
                                class="ml-1 text-primary-500"
                                [routerLink]="[item.link]"
                            >
                                {{item.name}}
                            </a>
                        </div>
                    }
                </div>
                <!-- Title -->
                <div class="mt-2">
                    <h2 class="truncate text-3xl font-extrabold leading-7 tracking-tight sm:leading-10 md:text-4xl">
                        {{title}}
                    </h2>
                    @if (subtitle) {
                        <p class="mt-1 text-sm text-gray-500">{{subtitle}}</p>
                    }
                </div>
            </div>
            <!-- Header Actions -->
            <div class="mt-4 flex items-center sm:ml-4 sm:mt-0">
                <ng-content></ng-content>
            </div>
        </div>
    `
})
export class PageHeaderComponent {
    @Input() breadcrumbs: Breadcrumb[] = [];
    @Input() title: string = '';
    @Input() subtitle: string = '';
} 