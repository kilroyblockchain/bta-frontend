import { Router } from '@angular/router';
import { AuthService } from 'src/app/@core/services/auth.service';
import { Component } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { ChangePasswordComponent } from 'src/app/pages/after-login/user/change-passwod/change-password.component';

interface StaffingData {
    _id: string;
    title: string;
    checkFields: Array<string>;
}
@Component({
    selector: 'app-after-login',
    template: `<div class="after-login-container">
        <ng-template [ngIf]="(!autoPassword && !checkProfileCompletion && !checkWorkSafeConfigRequired) || (!autoPassword && (checkProfileCompletion || checkWorkSafeConfigRequired) && !profileIncomplete)"><router-outlet></router-outlet></ng-template>
    </div>`
})
export class AfterLoginComponent {
    isLoggedIn = false;
    userData: any;
    autoPassword!: boolean;
    profileCompletionRequired = false;
    checkProfileCompletion!: boolean;
    profileIncomplete = true;
    checkWorkSafeConfigRequired!: boolean;

    staffingData: Array<StaffingData> = [];

    profileFields = {
        education: { id: 'education', title: 'Education', count: 0, disabled: true, active: false, show: false },
        experience: { id: 'experience', title: 'Experience', count: 0, disabled: true, active: false, show: false },
        language: { id: 'language', title: 'Languages', count: 0, disabled: true, active: false, show: false },
        skill: { id: 'skill', title: 'Skills', count: 0, disabled: true, active: false, show: false }
    };

    constructor(private authService: AuthService, private router: Router, private dialogService: NbDialogService) {
        this.isLoggedIn = this.authService.isLoggedIn;
        this.authService.getUserData().then((data) => {
            this.userData = { ...data };
            this.autoPassword = this.userData.autoPassword;

            if (this.autoPassword) {
                this.checkAutoPassword();
            } else {
                this.checkWorkSafeConfig();
                this.checkUserProfileDetail();
            }
        });
        this.listenLogoutStatus();
    }

    listenLogoutStatus(): void {
        this.authService.logOutStatus.subscribe(() => {
            this.isLoggedIn = false;
        });
    }

    checkAutoPassword(): void {
        if (this.autoPassword) {
            const changePasswordDialog = this.dialogService.open(ChangePasswordComponent, { hasBackdrop: true, closeOnBackdropClick: false, closeOnEsc: false });
            changePasswordDialog.onClose.subscribe((res) => {
                if (res && res !== 'close') {
                    if (res.saveSuccess) {
                        this.autoPassword = false;
                        this.checkWorkSafeConfig();
                        this.checkUserProfileDetail();
                    }
                }
            });
        }
    }

    async checkUserProfileDetail(): Promise<any> {
        const defaultUserCompany = this.authService.getUserDefaultCompany('training');
        if (defaultUserCompany && !defaultUserCompany.isAdmin) {
            this.checkProfileCompletion = true;
        } else {
            this.checkProfileCompletion = false;
        }
    }

    checkSubscriptionList(): boolean {
        const userRoles = this.authService.getUserRoles();
        const ctIndexFound = userRoles.findIndex((data) => data === 'contact-tracing');
        const wsIndexFound = userRoles.findIndex((data) => data === 'work-safe');
        const voIndexFound = userRoles.findIndex((data) => data === 'vaccine-outreach');
        if (wsIndexFound !== -1 && (ctIndexFound !== -1 || voIndexFound !== -1)) {
            return true;
        } else {
            return false;
        }
    }

    async checkWorkSafeConfig(): Promise<any> {
        const UserWorkSafeCompany = this.authService.getUserSubscriptionCompany('work-safe');
        if (UserWorkSafeCompany) {
            this.checkWorkSafeConfigRequired = true;
        }
    }

    navigateTo(URL: string): void {
        this.router.navigate([URL]);
    }
}
