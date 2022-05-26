import { Component } from '@angular/core';

@Component({
    selector: 'app-unverified-users',
    template: `<app-users [unverifiedUsers]="true"></app-users>`
})
export class UnverifiedUsersComponent {}
