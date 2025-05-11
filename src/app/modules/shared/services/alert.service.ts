import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  Loader = new BehaviorSubject(false);
  message_confirmation = 'Are you sure you want to delete?';
  message_clear = 'Are you sure you want to cancel?';

  constructor(
    private title: Title,
    private router: Router,
  ) { }

  showOperationSuccess(message?: any) {
    return Swal.fire('', message, 'success');
  }

  showOperationError(err?: any) {
    Swal.fire('', err, 'error');
  }

  showOperationDownloadError(err?: any) {
    Swal.fire(
      'Failed',
      'Downloading file failed, ' + err.error.message,
      'error'
    );
  }

  showOperationWarning(message?: any) {
    return Swal.fire({ icon: 'warning', showCancelButton: true, showConfirmButton: true, titleText: this.message_confirmation });
  }

  showClearWarning(message?: any) {
    return Swal.fire({ icon: 'warning', showCancelButton: true, showConfirmButton: true, titleText: this.message_clear });
  }
}
