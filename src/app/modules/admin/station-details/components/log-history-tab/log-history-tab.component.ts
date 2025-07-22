import { Component, ViewEncapsulation, Input } from '@angular/core';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
    selector     : 'log-history-tab',
    standalone   : true,
    templateUrl  : './log-history-tab.component.html',
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
    styleUrls: ['./log-history-tab.component.scss']
})
export class LogHistoryTabComponent {
    @Input() stationId: string;

    logs = [
        {
            userName: 'Super Admin',
            userAvatar: '',
            message: 'Charging Point #2 has been deactivated by Super Admin.',
            status: 'Deactivated',
            date: '2 Feb 2023',
            time: '7:40 pm'
        },
        {
            userName: 'Lobna ahmed',
            userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            message: 'Charging Point #1 has been successfully activated by Hala Ahmed.',
            status: 'Activated',
            date: '2 Feb 2023',
            time: '7:40 pm'
        },
        {
            userName: 'Layla Ali',
            userAvatar: 'https://randomuser.me/api/portraits/women/47.jpg',
            message: 'Charging Point #1 settings and station working hours were updated by Hala Ahmed.',
            status: 'Edited',
            date: '2 Feb 2023',
            time: '7:40 pm'
        },
        {
            userName: 'Mona sayed',
            userAvatar: 'https://randomuser.me/api/portraits/women/48.jpg',
            message: 'Charging Point #1 settings and station working hours were updated by Hala Ahmed.',
            status: 'Activated',
            date: '2 Feb 2023',
            time: '7:40 pm'
        },
        {
            userName: 'Alaa hamza',
            userAvatar: 'https://randomuser.me/api/portraits/women/49.jpg',
            message: 'Charging Point #1 has been re-activated by Lara Youssef.',
            status: 'Activated',
            date: '2 Feb 2023',
            time: '7:40 pm'
        }
    ];

    @Input() logHistory: any[] = [];

    constructor() {}
}
