import { Component, Input, OnInit } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Component({
    selector: 'app-validation-message',
    templateUrl: './validation-message.component.html'
})
export class ValidationMessageComponent implements OnInit {
    @Input()
    field!: string;
    @Input()
    error!: ValidationErrors;
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
