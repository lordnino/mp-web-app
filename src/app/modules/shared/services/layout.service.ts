import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private drawerOpenSubject = new BehaviorSubject<boolean>(false);

  setDrawerOpen(isOpen: boolean): void {
    this.drawerOpenSubject.next(isOpen);
  }

  getDrawerOpen(): Observable<boolean> {
    return this.drawerOpenSubject.asObservable();
  }

  // Optional: get current value
  isDrawerOpen(): boolean {
    return this.drawerOpenSubject.value;
  }
}