import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserGaurd implements CanActivate {
    userData: any;
    isAdmin!: boolean;
    constructor(public authService: AuthService, public router: Router) {}

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
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
