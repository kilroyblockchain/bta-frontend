import { Observable, of } from 'rxjs';
import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { User } from './user.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from 'src/app/@core/services/local-storage.service';
import { LocalStorageConstant } from 'src/app/@core/constants/local-storage.constant';
import { Router } from '@angular/router';
import { CountryService } from 'src/app/@core/services/country.service';
import { AuthService, SubscriptionService, UtilsService } from 'src/app/@core/services';
import { finalize, map, startWith } from 'rxjs/operators';
import { MSG_KEY_CONSTANT_COMMON, MSG_KEY_CONSTANT_ORGANIZATION } from 'src/app/@core/constants/message-key-constants';
import { DEFAULT_VALUES, ValidationRegexConstant } from 'src/app/@core/constants';
import { TitleCasePipe } from '@angular/common';
import { RecaptchaComponent, RecaptchaErrorParameters } from 'ng-recaptcha';
import { IUserRegisterFormData } from '../user-register.interface';
import { AbstractControl } from '@angular/forms';
import { IAppResponse } from 'src/app/@core/interfaces/app-response.interface';
import { ICountry, IState } from 'src/app/@core/interfaces/country.interface';
import { ISubscription } from 'src/app/@core/interfaces/subscription.interface';
import { ISubscriptionAndCountryList } from 'src/app/@core/services/subscription.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['../register.component.scss'],
    providers: [TitleCasePipe]
})
export class UserComponent implements OnInit, OnDestroy {
    registrationFormGroup!: FormGroup;
    submitted = false;
    selectedSubscriber!: string;
    enableSubmitButton = false;
    recaptchaStr = '';
    countries!: ICountry[];
    states!: IState[];
    subscriptions!: ISubscription[];
    loading = false;
    companyNames: string[] = [];
    filteredControlOptions$!: Observable<string[]>;
    disableCaptcha = environment.disableCaptcha;

    @ViewChild('captchaRef')
    captchaRef!: TemplateRef<RecaptchaComponent>;

    constructor(private fb: FormBuilder, private localStorageService: LocalStorageService, private authService: AuthService, private countryService: CountryService, private utilsService: UtilsService, private router: Router, private readonly subscriptionService: SubscriptionService, private titleCasePipe: TitleCasePipe) {}

    ngOnInit(): void {
        const data = this.localStorageService.getLocalStorageData(LocalStorageConstant.UDRegS1);
        if (data && data.reCaptchaToken) {
            data.reCaptchaToken = '';
        }
        this.populateSubscriptionTypesAndCountries();
        if (data) {
            this.populateStates(data.country);
        } else {
            this.populateStates(DEFAULT_VALUES.COUNTRY);
        }
        this.createRegistrationForm(data);
    }

    ngOnDestroy(): void {
        const elementReference = this.captchaRef.elementRef as ElementRef<HTMLElement>;
        if (elementReference.nativeElement.parentNode) {
            elementReference.nativeElement.parentNode.removeChild(elementReference.nativeElement);
        }
    }

    createRegistrationForm(user: User): void {
        this.registrationFormGroup = this.fb.group({
            subscriptionType: [user?.subscriptionType, [Validators.required]],
            firstName: [this.titleCasePipe.transform(user?.firstName), [Validators.required, Validators.minLength(2)]],
            lastName: [this.titleCasePipe.transform(user?.lastName), [Validators.required, Validators.minLength(2)]],
            email: [user?.email, [Validators.required, Validators.minLength(5), Validators.email]],
            phone: [user?.phone, [Validators.required, Validators.minLength(7), Validators.maxLength(18), Validators.pattern(ValidationRegexConstant.PHONE)]],
            country: [user?.country ? user?.country : DEFAULT_VALUES.COUNTRY, [Validators.required]],
            state: [user?.state || null, [Validators.required]],
            city: [user?.city, [Validators.required]],
            address: [user?.address, [Validators.required, Validators.minLength(3)]],
            zipCode: [user?.zipCode, [Validators.required]],
            companyName: [user?.companyName, [Validators.required, Validators.minLength(2)]],
            password: [user?.password, [Validators.minLength(5)]]
        });
    }

    get UF(): { [key: string]: AbstractControl } {
        return this.registrationFormGroup.controls;
    }

    populateSubscriptionTypesAndCountries(): void {
        this.subscriptionService.getAllSubscription(true).subscribe((res: IAppResponse<ISubscription[] | ISubscriptionAndCountryList>) => {
            if (res && res.success) {
                const { subscriptionList, countryList } = res?.data as ISubscriptionAndCountryList;
                this.subscriptions = subscriptionList?.filter((subscription: ISubscription) => subscription.subscriptionTypeIdentifier !== 'super-admin');
                this.countries = countryList;
            }
        });
    }

    populateStates(countryId: string): void {
        this.states = [];
        this.countryService.getStatesByCountryId(countryId).subscribe((res: IAppResponse<IState[]>) => {
            if (res && res.success) {
                this.states = res.data;
            }
        });
    }

    onSelectChange(countryId: string): void {
        this.registrationFormGroup.patchValue({
            state: null
        });
        this.populateStates(countryId);
    }

    executeCaptcha({ valid, value }: FormGroup, captchaRef: RecaptchaComponent): void {
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
            this.registrationSubmit({ value, valid });
        }
    }

    registrationSubmit({ value, valid }: Partial<FormGroup>): void {
        if (!valid) {
            return;
        }
        this.loading = true;
        if (!this.recaptchaStr && !this.disableCaptcha) {
            this.loading = false;
            this.utilsService.showToast('warning', MSG_KEY_CONSTANT_COMMON.THE_RECAPTCHA_WAS_INVALID);
            return;
        }
        value.reCaptchaToken = this.disableCaptcha ? '123456' : this.recaptchaStr;
        const companyData = { companyName: this.UF['companyName'].value, reCaptchaToken: this.recaptchaStr };
        const data = { ...value, ...companyData };
        this.postUserData(data);
    }

    postUserData(userData: IUserRegisterFormData): void {
        this.loading = true;
        userData.password = 'suyogkh';
        this.authService
            .userRegister(userData)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: () => {
                    this.utilsService.showToast('success', MSG_KEY_CONSTANT_ORGANIZATION.DATA_ADDED_SUCCESSFULLY);
                    this.localStorageService.clearAllLocalStorageData();
                    this.router.navigate(['/auth/thank-you/bta-app']);
                },
                error: (err: Error) => {
                    this.utilsService.showToast('warning', err.message);
                }
            });
    }

    getAllCompanyNames(): void {
        this.authService.getAllCompanyNames().subscribe((res) => {
            const { data } = res;
            this.companyNames = data;
            this.filteredControlOptions$ = of(data);
            this.filteredControlOptions$ = this.UF['companyName'].valueChanges.pipe(
                startWith(''),
                map((filterString) => this.filter(filterString))
            );
        });
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.companyNames.filter((optionValue) => optionValue.toLowerCase().includes(filterValue));
    }

    public resolved(captchaResponse: string, { value, valid }: FormGroup): void {
        this.recaptchaStr = captchaResponse;
        if (this.recaptchaStr) {
            this.registrationSubmit({ value, valid });
        }
    }

    subscriberChanged(): void {
        this.selectedSubscriber = this.UF['subscriptionType'].value;
    }

    changedOnAgreedOnTerms(checked: boolean): void {
        this.enableSubmitButton = checked;
    }

    onError(errorDetails: RecaptchaErrorParameters): void {
        if (!this.disableCaptcha) {
            this.loading = false;
            console.log(`reCAPTCHA error encountered; details:`, errorDetails);
            this.utilsService.showToast('warning', MSG_KEY_CONSTANT_COMMON.THE_RECAPTCHA_WAS_INVALID);
        }
    }
}
