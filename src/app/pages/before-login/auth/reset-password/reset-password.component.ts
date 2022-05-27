import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthService, UtilsService } from 'src/app/@core/services';
import { MSG_KEY_CONSTANT_COMMON } from 'src/app/@core/constants/message-key-constants';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
    resetPasswordFormGroup!: FormGroup;
    submitted = false;
    passwordDoNotMatch!: boolean;
    resetToken!: string;
    loading!: boolean;

    constructor(private fb: FormBuilder, private authService: AuthService, private utilsService: UtilsService, private activatedRoute: ActivatedRoute, public router: Router) {}

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((params) => {
            this.resetToken = params['resetToken'];
            if (this.tokenExpired(this.resetToken)) {
                this.router.navigate(['/']);
            }
        });
        this.createResetPasswordForm();
    }

    createResetPasswordForm(): void {
        this.resetPasswordFormGroup = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(5)]],
            newpassword: ['', [Validators.required, Validators.minLength(5)]]
        });
        this.resetPasswordFormGroup.get('newpassword')?.valueChanges.subscribe((value) => {
            this.onChangeConfirmPassword(value);
        });
    }

    get UF(): IFormControls {
        return this.resetPasswordFormGroup.controls;
    }

    private tokenExpired(token: string): boolean {
        try {
            const expiry = JSON.parse(window.atob(token.split('.')[1])).exp;
            if (Math.floor(new Date().getTime() / 1000) >= expiry) {
                this.utilsService.showToast('warning', MSG_KEY_CONSTANT_COMMON.LINK_HAS_BEEN_EXPIRED);
            }
            return Math.floor(new Date().getTime() / 1000) >= expiry;
        } catch (err) {
            this.utilsService.showToast('warning', MSG_KEY_CONSTANT_COMMON.LINK_IS_NOT_VALID);
            return true;
        }
    }

    onChangeConfirmPassword(confirmPassword: string): void {
        if (this.UF['password'].value === confirmPassword) {
            this.passwordDoNotMatch = false;
        }
    }

    resetPasswordFormSubmit({ value, valid }: FormGroup): void {
        this.submitted = true;

        if (!this.resetToken) {
            this.utilsService.showToast('warning', MSG_KEY_CONSTANT_COMMON.SOMETHING_WENT_WRONG);
            return;
        }

        if (!valid) {
            return;
        }

        if (this.UF['password'].value !== this.UF['newpassword'].value) {
            this.passwordDoNotMatch = true;
            return;
        }
        this.loading = true;
        const newData = {
            password: value.password,
            resetToken: this.resetToken
        };

        this.authService.resetPassword(newData).subscribe({
            next: (res) => {
                if (res && res.success) {
                    this.utilsService.showToast('success', MSG_KEY_CONSTANT_COMMON.PASSWORD_HAS_BEEN_UPDATED);
                    this.router.navigate(['/auth/login']);
                } else {
                    this.loading = false;
                    this.utilsService.showToast('warning', res.message);
                }
            },
            error: (err) => {
                this.loading = false;
                if (err.message) {
                    this.utilsService.showToast('warning', err?.message);
                }
            }
        });
    }
}
