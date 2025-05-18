import { Injectable } from '@angular/core';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
// import { messaging } from 'configs/firebase.config';
import { environment } from 'environments/environment';
import { deleteToken, getMessaging, getToken } from 'firebase/messaging';
import { BehaviorSubject } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root',
})
export class PushNotificationsService {
    token = null;
    payload: any[] = [];
    newNotification = new BehaviorSubject(null);

    constructor(
        private _alertService: AlertService,
        private _notificationService: NotificationsService
    ) {}

    // initPush() {
    //     return new Promise((resolve, reject) => {
    //         if (this.token) {
    //             return resolve(this.token);
    //         } else {
    //             return this.requestToken()
    //                 .then((token) => {
    //                     this.token = token;
    //                     this.listen();
    //                     resolve(token);
    //                 })
    //                 .catch(() => resolve(''));
    //         }
    //     });
    // }

    // async requestToken() {
    //     const serviceWorkerRegistration =
    //         await navigator.serviceWorker.register(
    //             `${environment.baseHREF}firebase-messaging-sw.js`
    //         );
    //     navigator.serviceWorker.onmessage = ({ data }) => {
    //         const { type, notification } = data;
    //         return;
    //     };
    //     const messaging = getMessaging();
    //     return getToken(messaging, {
    //         serviceWorkerRegistration: serviceWorkerRegistration,
    //         vapidKey: environment.firebaseConfig.vapidKey,
    //     });
    // }

    // listen() {
    //     messaging.onMessage((incomingMessage) => {
    //         this.payload.push(incomingMessage);
    //         this.newNotification.next(this.payload);
    //         this._notificationService.getAll({
    //             page: 1,
    //             count: 10,
    //         });
    //     });
    // }

    // counterToHideNotification(notifications: any[]) {
    //     this.reAssignNotifications(notifications);
    // }

    // reAssignNotifications(notifications: any[]) {
    //     this.payload = notifications;
    //     this.newNotification.next(this.payload);
    // }

    // async unregister() {
    //     try {
    //         // Unregister the service worker
    //         const registrations =
    //             await navigator.serviceWorker.getRegistrations();
    //         for (let registration of registrations) {
    //             if (
    //                 registration.active &&
    //                 registration.scope.includes('firebase-messaging-sw.js')
    //             ) {
    //                 await registration.unregister();
    //             }
    //         }

    //         // Remove the token
    //         const messagingInstance = getMessaging();
    //         if (this.token) {
    //             await deleteToken(messagingInstance);
    //             this.token = null;
    //         }

    //         // Clear payload and notifications
    //         this.payload = [];
    //         this.newNotification.next(this.payload);
    //     } catch (error) {
    //         console.error('Error during unregistering:', error);
    //         this._alertService.showOperationError(error);
    //     }
    // }
}
