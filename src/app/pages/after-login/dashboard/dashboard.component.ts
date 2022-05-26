import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class AppDashboardComponent {
    userData: IUserRes;
    constructor(private authService: AuthService, private router: Router, public utilsService: UtilsService) {
        this.userData = this.authService.getUserDataSync();
        this.router.navigate(['/']);
    }
}
