import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const msg = error?.toString?.();
    if (
      msg &&
      msg.includes('MatSortHeader must be placed within a parent element with the MatSort directive')
    ) {
      // Suppress this specific error
      return;
    }
    // Otherwise, log as normal
    console.error(error);
  }
} 