import { Component } from '@angular/core';

@Component({
    selector: 'app-blocked-users',
    template: '<app-users [blockedUsers]="true"></app-users>'
})
export class BlockedUsersComponent {}
