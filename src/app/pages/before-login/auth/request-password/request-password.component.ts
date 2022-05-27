import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService, UtilsService } from 'src/app/@core/services';
import { MSG_KEY_CONSTANT_COMMON } from 'src/app/@core/constants/message-key-constants';
import { RecaptchaComponent, RecaptchaErrorParameters } from 'ng-recaptcha';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';

@Component({
    selector: 'app-request-password',
    templateUrl: './request-password.component.html'
})
export class RequestPasswordComponent implements OnInit, OnDestroy {
    requestPasswordFormGroup!: FormGroup;
    submitted = false;
    emailSent = false;
    loading!: boolean;
    recaptchaStr!: string;

    @ViewChild('captchaRef')
    captchaRef!: TemplateRef<RecaptchaComponent>;

    constructor(private fb: FormBuilder, private authService: AuthService, private utilsService: UtilsService, private router: Router) {}

    ngOnInit(): void {
        this.createRequestPasswordForm();
    }

    ngOnDestroy(): void {
        if (this.captchaRef) {
            const elementReference = this.captchaRef.elementRef as ElementRef<HTMLElement>;
            if (elementReference.nativeElement.parentNode) {
                elementReference.nativeElement.parentNode.removeChild(elementReference.nativeElement);
            }
        }
    }

    createRequestPasswordForm(): void {
        this.requestPasswordFormGroup = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    get UF(): IFormControls {
        return this.requestPasswordFormGroup.controls;
    }

    requestPasswordFormSubmit({ value, valid }: Partial<FormGroup>): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        if (!this.recaptchaStr) {
            this.loading = false;
            this.utilsService.showToast('warning', MSG_KEY_CONSTANT_COMMON.THE_RECAPTCHA_WAS_INVALID);
            return;
        }
        value.reCaptchaToken = this.recaptchaStr;
        this.loading = true;
        this.authService.requestPassword(value).subscribe({
            next: () => {
                this.emailSent = true;
            },
            error: (err) => {
                if (err.message) {
                    this.loading = false;
                    this.utilsService.showToast('warning', err?.message);
                }
            }
        });
    }

    goToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    executeCaptcha({ valid }: FormGroup, captchaRef: RecaptchaComponent) {
        this.submitted = true;
        if (!valid) {
            return;
        }
        if (this.recaptchaStr) {
            captchaRef.reset();
        }
        captchaRef.execute();
    }

    resolved(captchaResponse: string, { value, valid }: FormGroup): void {
        this.recaptchaStr = captchaResponse;
        if (this.recaptchaStr) {
            this.requestPasswordFormSubmit({ value, valid });
        }
    }

    onError(errorDetails: RecaptchaErrorParameters): void {
        this.loading = false;
        console.log(`reCAPTCHA error encountered; details:`, errorDetails);
        this.utilsService.showToast('warning', MSG_KEY_CONSTANT_COMMON.THE_RECAPTCHA_WAS_INVALID);
    }
}
