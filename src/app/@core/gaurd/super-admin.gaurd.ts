import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { IUserRes } from '../interfaces/user-data.interface';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SuperAdminGaurd implements CanActivate {
    userData!: IUserRes;
    constructor(public authService: AuthService, public router: Router) {}

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        const definedRole = route.data['role'];
        const data = await this.authService.getUserData();
        this.userData = { ...data };
        const roles = this.userData?.roles;
        const roleValues = definedRole.filter((dRole: string) => roles && roles.includes(dRole));
        if (roleValues.length) {
            return true;
        } else {
            this.router.navigate(['u/dashboard']);
            return false;
        }
    }
}
