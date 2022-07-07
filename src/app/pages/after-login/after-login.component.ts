import { Router } from '@angular/router';
import { AuthService } from 'src/app/@core/services/auth.service';
import { Component } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { ChangePasswordComponent } from 'src/app/pages/after-login/user/change-password/password';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';

interface StaffingData {
    _id: string;
    title: string;
    checkFields: Array<string>;
}
@Component({
    selector: 'app-after-login',
    template: `<div class="after-login-container">
        <router-outlet></router-outlet>
    </div>`
})
export class AfterLoginComponent {
    isLoggedIn = false;
    userData!: IUserRes;
    autoPassword!: boolean;
    staffingData: Array<StaffingData> = [];
    bcKey!: boolean;

    constructor(private authService: AuthService, private router: Router, private dialogService: NbDialogService) {
        this.isLoggedIn = this.authService.isLoggedIn;
        this.authService.getUserData().then((data) => {
            this.userData = { ...data };
            this.autoPassword = this.userData.autoPassword;

            if (this.autoPassword) {
                this.checkAutoPassword();
            }
        });
        this.listenLogoutStatus();

        this.bcKey = !!this.authService.getBcKey();
    }

    listenLogoutStatus(): void {
        this.authService.logOutStatus.subscribe(() => {
            this.isLoggedIn = false;
        });
    }

    checkAutoPassword(): void {
        if (this.autoPassword) {
            const changePasswordDialog = this.dialogService.open(ChangePasswordComponent, { context: { type: 'own' }, hasBackdrop: true, closeOnBackdropClick: false, closeOnEsc: false });
            changePasswordDialog.onClose.subscribe((res) => {
                if (res && res !== 'close') {
                    if (res.saveSuccess) {
                        this.autoPassword = false;
                    }
                }
            });
        }
    }

    navigateTo(URL: string): void {
        this.router.navigate([URL]);
    }
}
