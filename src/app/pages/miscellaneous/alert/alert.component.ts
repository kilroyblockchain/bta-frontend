import { NbDialogRef } from '@nebular/theme';
import { Component } from '@angular/core';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
    question!: string;
    name!: string;
    info!: string;
    alert!: boolean;
    cancelBtnLabel = 'COMMON.BUTTON.CANCEL';

    constructor(protected ref: NbDialogRef<AlertComponent>) {}
    selected(): void {
        this.ref.close(true);
    }
    rejected(): void {
        this.ref.close(false);
    }
    alertInfo(): void {
        this.ref.close();
    }
}
