import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { IUserRes } from '../interfaces/user-data.interface';
import { AuthService } from '../services';

@Injectable({
    providedIn: 'root'
})
export class ProjectGuard implements CanActivate {
    userData!: IUserRes;

    constructor(public authService: AuthService, public router: Router) {}

    async canActivate(): Promise<boolean> {
        const data = await this.authService.getUserData();
        this.userData = { ...data };
        const roles = this.userData?.roles;
        if (roles) {
            if (!roles.includes('super-admin')) {
                return true;
            } else {
                this.router.navigate(['/u/dashboard']);
            }
        } else {
            this.authService.logout();
        }

        this.router.navigate(['/auth/login']);
        return false;
    }
}
