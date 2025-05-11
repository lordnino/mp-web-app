import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { DiskService } from '../services/disk.service';

@Directive({
    selector: '[appCheckPermission]',
    standalone: true,
})
export class CheckPermissionDirective {
    @Input('appCheckPermissionState') appCheckPermissionState = true;
    @Input() appCheckPermission;
    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private diskService: DiskService
    ) {}

    ngOnInit() {
        if (
            (!this.appCheckPermission ||
                this.diskService.checkPermission(this.appCheckPermission)) ===
            this.appCheckPermissionState
        ) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}
