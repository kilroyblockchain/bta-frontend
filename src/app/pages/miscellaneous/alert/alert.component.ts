import { NbDialogRef } from '@nebular/theme';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
    question!: string | string[];
    name!: string;
    info!: string;
    alert!: boolean;
    cancelBtnLabel = 'COMMON.BUTTON.CANCEL';
    arrayQuestion!: string[];
    isQuestionString!: boolean;

    constructor(protected ref: NbDialogRef<AlertComponent>) {}

    ngOnInit(): void {
        if (typeof this.question === 'string') {
            this.isQuestionString = true;
        }
        if (Array.isArray(this.question)) {
            this.arrayQuestion = this.question;
        }
    }
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
