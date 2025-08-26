import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly excludedErrorMessages: string[] = [
    // 'MatSortHeader must be placed within a parent element with the MatSort directive',
    // 'ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked',
    // 'Cannot read properties of null (reading \'sortChange\')'
  ];

  handleError(error: any): void {
    const msg = error?.toString?.();
    if (msg && this.excludedErrorMessages.some(excludedMsg => msg.includes(excludedMsg))) {
      // Suppress excluded errors
      return;
    }
    // Otherwise, log as normal
    console.error(error);
  }
} 