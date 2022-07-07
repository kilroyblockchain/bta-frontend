import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {
    constructor(public authService: AuthService, public router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.authService.isLoggedIn === true) {
            return true;
        } else if (this.authService.getAccessToken()) {
            this.router.navigate(['/auth/bc-key-verify']);
        } else {
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: encodeURIComponent(state.url) } });
        }
        return false;
    }
}
