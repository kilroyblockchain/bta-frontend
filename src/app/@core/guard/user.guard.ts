import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { IUserRes } from '../interfaces/user-data.interface';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserGuard implements CanActivate {
    userData!: IUserRes;
    isAdmin!: boolean;
    constructor(public authService: AuthService, public router: Router) {}

    async canActivate(): Promise<boolean> {
        const data = await this.authService.getUserData();
        this.userData = { ...data };
        const roles = this.userData?.roles;
        if (roles) {
            if (roles.includes('super-admin')) {
                this.isAdmin = true;
                this.router.navigate(['/u/admin']);
            } else {
                this.isAdmin = false;
                this.router.navigate(['/u/dashboard']);
            }
            return true;
        } else {
            this.authService.logout();
        }

        this.router.navigate(['/auth/login']);
        return false;
    }
}
