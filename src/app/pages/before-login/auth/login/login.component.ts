import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService, UtilsService } from 'src/app/@core/services';
import { TitleCasePipe } from '@angular/common';
import { MSG_KEY_CONSTANT_COMMON } from 'src/app/@core/constants/message-key-constants';
import { RecaptchaComponent, RecaptchaErrorParameters } from 'ng-recaptcha';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ICompany, IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: [TitleCasePipe]
})
export class LoginComponent implements OnInit, OnDestroy {
    loginFormGroup!: FormGroup;
    userData!: IUserRes;
    submitted = false;
    loading = false;
    recaptchaStr!: string;
    appTitle = environment.project;
    disableCaptcha = environment.disableCaptcha;

    @ViewChild('captchaRef')
    captchaRef!: TemplateRef<RecaptchaComponent>;

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private fb: FormBuilder, private authService: AuthService, private utilsService: UtilsService, private titleCasePipe: TitleCasePipe) {}

    ngOnInit(): void {
        this.createLoginForm();
    }

    ngOnDestroy(): void {
        const elementReference = this.captchaRef.elementRef as ElementRef<HTMLElement>;
        if (elementReference.nativeElement.parentNode) {
            elementReference.nativeElement.parentNode.removeChild(elementReference.nativeElement);
        }
    }

    createLoginForm(): void {
        this.loginFormGroup = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(5)]]
        });
    }

    get UF(): IFormControls {
        return this.loginFormGroup.controls;
    }

    executeCaptcha({ valid, value }: FormGroup, captchaRef: RecaptchaComponent) {
        this.submitted = true;
        if (!valid) {
            return;
        }
        if (!this.disableCaptcha) {
            if (this.recaptchaStr) {
                captchaRef.reset();
            }
            captchaRef.execute();
        } else {
            this.loginFormSubmit({ value, valid });
        }
    }

    loginFormSubmit({ value, valid }: Partial<FormGroup>): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        if (!this.recaptchaStr && !this.disableCaptcha) {
            this.loading = false;
            this.utilsService.showToast('warning', MSG_KEY_CONSTANT_COMMON.THE_RECAPTCHA_WAS_INVALID);
            return;
        }
        value.reCaptchaToken = this.disableCaptcha ? '123456' : this.recaptchaStr;
        this.loading = true;
        this.authService.userLogin(value).subscribe({
            next: (res) => {
                const { data } = res;
                if (data) {
                    this.authService.setAccessToken(data?.accessToken);
                    const user = {
                        roles: data?.roles,
                        firstName: this.titleCasePipe.transform(data?.firstName),
                        lastName: this.titleCasePipe.transform(data?.lastName),
                        email: data?.email,
                        id: data?.id,
                        companyName: (data?.company[0].companyId as ICompany).companyName,
                        companyId: data?.companyId,
                        company: data?.company,
                        autoPassword: data?.autoPassword,
                        staffingId: data?.staffingId
                    };
                    this.authService.setUserData(user);
                    this.authService.getUserData().then((userData) => {
                        this.userData = { ...userData };
                        const roles = this.userData?.roles;
                        if (roles) {
                            const returnURL = this.activatedRoute.snapshot.queryParams['returnUrl'];
                            if (returnURL) {
                                this.router.navigateByUrl(decodeURIComponent(returnURL)).then(() => {
                                    window.location.reload();
                                });
                            } else {
                                window.location.reload();
                            }
                        } else {
                            this.loading = false;
                        }
                    });
                }
            },
            error: (err) => {
                this.loading = false;
                this.utilsService.showToast('warning', err?.message);
            }
        });
    }

    resolved(captchaResponse: string, { value, valid }: FormGroup): void {
        this.recaptchaStr = captchaResponse;
        if (this.recaptchaStr) {
            this.loginFormSubmit({ value, valid });
        }
    }

    onError(errorDetails: RecaptchaErrorParameters): void {
        if (!this.disableCaptcha) {
            this.loading = false;
            console.log(`reCAPTCHA error encountered; details:`, errorDetails);
            this.utilsService.showToast('warning', MSG_KEY_CONSTANT_COMMON.THE_RECAPTCHA_WAS_INVALID);
        }
    }
}
