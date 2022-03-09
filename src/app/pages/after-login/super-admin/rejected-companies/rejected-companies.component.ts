import { Component } from '@angular/core';

@Component({
    selector: 'app-rejected-companies',
    template: '<app-users [unverifiedUsers]="true" [rejectedCompanies]="true"></app-users>'
})
export class RejectedCompaniesComponent {}
