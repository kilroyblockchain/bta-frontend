import { Component } from '@angular/core';
@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    registerSteps = 1;
    constructor() {}

    stepChange(): void {
        if (this.registerSteps < 2) {
            this.registerSteps = this.registerSteps + 1;
        }
    }

    stepBack(): void {
        if (this.registerSteps > 1) {
            this.registerSteps = this.registerSteps - 1;
        }
    }
}
