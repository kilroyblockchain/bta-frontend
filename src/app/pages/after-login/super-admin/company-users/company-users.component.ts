import { Component } from '@angular/core';

@Component({
    selector: 'app-company-users',
    template: '<app-users [companyUsers]="true"></app-users>'
})
export class CompanyUsersComponent {}
