import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';

@Component({
    selector: 'app-validation-message',
    templateUrl: './validation-message.component.html'
})
export class ValidationMessageComponent implements OnInit {
    @Input()
    field!: string;
    @Input()
    error!: any;
    @Input()
    fieldTitle!: string;

    ngOnInit(): void {
        if (!this.field) {
            this.field = 'phone';
        }
        if (!this.fieldTitle) {
            this.fieldTitle = 'Phone';
        }
    }
}
