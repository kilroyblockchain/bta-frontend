import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs/operators';
import { MSG_KEY_CONSTANT_USER } from 'src/app/@core/constants/message-key-constants';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { AuthService, LocalStorageService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent implements OnInit {
    changePasswordFormGroup!: FormGroup;
    submitted = false;
    passwordDoNotMatch!: true;
    userData: any;
    autoPassword!: boolean;
    loading!: boolean;
    constructor(protected ref: NbDialogRef<ChangePasswordComponent>, private fb: FormBuilder, private authService: AuthService, private utilsService: UtilsService, public router: Router, private localStorageService: LocalStorageService) {
        this.authService.getUserData().then((data) => {
            this.userData = { ...data };
            this.autoPassword = this.userData.autoPassword;
        });
    }

    ngOnInit(): void {
        this.createChangePasswordForm();
    }

    createChangePasswordForm(): void {
        this.changePasswordFormGroup = this.fb.group({
            currentPassword: ['', [Validators.required, Validators.minLength(5)]],
            password: ['', [Validators.required, Validators.minLength(5)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(5)]]
        });
    }

    get UF(): IFormControls {
        return this.changePasswordFormGroup.controls;
    }

    changePasswordFormSubmit({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }

        if (this.UF['password'].value !== this.UF['confirmPassword'].value) {
            this.passwordDoNotMatch = true;
            return;
        }

        const newData = {
            currentPassword: value.currentPassword,
            password: value.password
        };
        this.loading = true;
        this.authService
            .changePassword(newData)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        this.authService.getUserData().then((user) => {
                            const newUser = { ...user, autoPassword: false };
                            this.authService.setUserData(newUser);
                            if (this.autoPassword) {
                                this.router.navigate(['/u']);
                                this.autoPassword = false;
                            }
                            this.ref.close({ saveSuccess: true, data: res.data });
                            this.utilsService.showToast('success', res?.message);
                        });
                    } else {
                        this.utilsService.showToast('warning', res && res.message ? res.message : MSG_KEY_CONSTANT_USER.FAILED_TO_CHANGE_PASSWORD);
                    }
                },
                error: (err) => {
                    this.utilsService.showToast('warning', err?.message);
                }
            });
    }

    closeModal(): void {
        if (this.autoPassword) {
            this.localStorageService.clearAllLocalStorageData();
            window.location.href = '/';
        } else {
            this.ref.close('close');
        }
    }
}
