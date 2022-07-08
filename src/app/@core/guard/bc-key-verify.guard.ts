import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../services';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class BcKeyVerifyGuard implements CanActivate {
    constructor(public authService: AuthService, public router: Router, private localStorageService: LocalStorageService) {}

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.authService.getAccessToken()) {
            return true;
        }
        this.router.navigate(['/auth/login']);
        this.localStorageService.clearAllLocalStorageData();
        return false;
    }
}
