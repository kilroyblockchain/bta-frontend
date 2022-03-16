import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class GuestGaurd implements CanActivate {
    constructor(public authService: AuthService, public router: Router) {}

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.authService.isLoggedIn !== true) {
            return true;
        }
        this.router.navigate(['/u']);
        return false;
    }
}
