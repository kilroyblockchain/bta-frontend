import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Organization } from './organization.interface';
import { User } from '../user/user.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LocalStorageService } from 'src/app/@core/services/local-storage.service';
import { LocalStorageConstant } from 'src/app/@core/constants/local-storage.constant';
import { Router } from '@angular/router';
import { CountryService } from 'src/app/@core/services/country.service';
import { AuthService, UtilsService } from 'src/app/@core/services';
import { MSG_KEY_CONSTANT_ORGANIZATION } from 'src/app/@core/constants/message-key-constants';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-organization',
    templateUrl: './organization.component.html',
    styleUrls: ['../register.component.scss']
})
export class OrganizationComponent implements OnInit {
    @Input() currentStep: any;
    @Output() ifStepBack = new EventEmitter();
    registrationFormGroup!: FormGroup;
    submitted = false;
    selectedSubscriber!: string;
    stepOneData!: User;
    stepTwoData!: Organization;
    disableCopyButton = false;
    logoURL: any;
    enableSubmitButton = false;
    enableBackButton = false;
    countries!: Array<any>;
    states!: Array<any>;
    appTitle = environment.project;
    constructor(private fb: FormBuilder, private localStorageService: LocalStorageService, private countryService: CountryService, private authService: AuthService, private utilsService: UtilsService, private router: Router) {}

    ngOnInit(): void {
        this.stepOneData = this.localStorageService.getLocalStorageData(LocalStorageConstant.UDRegS1);
        this.stepTwoData = this.localStorageService.getLocalStorageData(LocalStorageConstant.ODRegS2);
        this.createRegistrationForm(this.stepTwoData);
        this.populateCountries();
    }

    createRegistrationForm(org: Organization): void {
        this.registrationFormGroup = this.fb.group({
            companyCountry: [org?.companyCountry],
            companyState: [org?.companyState],
            companyAddress: [org?.companyAddress],
            companyZipCode: [org?.companyZipCode],
            aboutOrganization: [org?.aboutOrganization],
            contributionForApp: [org?.contributionForApp],
            helpNeededFromApp: [org?.helpNeededFromApp],
            companyLogo: [org?.companyLogo],
            image: ['']
        });
    }

    get UF(): any {
        return this.registrationFormGroup.controls;
    }

    populateCountries(): void {
        this.countryService.getAllCountries().subscribe((res) => {
            if (res && res.success) {
                this.countries = res.data;
            }
        });
    }

    populateStates(countryId: string): void {
        this.states = [];
        this.countryService.getStatesByCountryId(countryId).subscribe((res) => {
            if (res && res.success) {
                this.states = res.data;
            }
        });
    }

    onSelectChange(countryId: string): void {
        this.registrationFormGroup.patchValue({
            companyState: null
        });
        this.populateStates(countryId);
    }

    onFileChange(event: any): void {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            this.registrationFormGroup.patchValue({
                image: file
            });

            const reader = new FileReader();

            reader.readAsDataURL(event.target.files[0]);

            reader.onload = (e: any) => {
                this.logoURL = e.target.result;
            };
        }
    }

    registrationFormSubmit({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        const stepOneData = this.localStorageService.getLocalStorageData(LocalStorageConstant.UDRegS1);
        if (!stepOneData || (stepOneData && !stepOneData.companyName)) {
            this.utilsService.showToast('warning', MSG_KEY_CONSTANT_ORGANIZATION.COMPANY_NAME_IS_REQUIRED_FOR_THE_SURVEYOR);
            return;
        }
        let formData: any;
        let hasFormData: boolean;
        stepOneData.reCaptchaToken = stepOneData.reCaptchaToken;
        stepOneData.password = 'suyogkh';
        if (this.UF.image.value) {
            hasFormData = true;
            formData = new FormData();
            for (const property of Object.keys(this.UF)) {
                formData.append(property, this.UF[property].value);
            }
            for (const property of Object.keys(stepOneData)) {
                formData.append(property, stepOneData[property]);
            }
        } else {
            hasFormData = false;
            formData = { ...value, ...stepOneData };
        }
        this.authService.userRegister(formData, hasFormData).subscribe({
            next: () => {
                this.utilsService.showToast('success', MSG_KEY_CONSTANT_ORGANIZATION.DATA_ADDED_SUCCESSFULLY);
                this.localStorageService.clearAllLocalStorageData();
                this.router.navigate(['/auth/thank-you/other']);
            },
            error: (err) => {
                this.handleError(err, value);
            }
        });
    }

    handleError(err: any, value: any): void {
        this.enableBackButton = true;
        this.localStorageService.setLocalStorageData(LocalStorageConstant.ODRegS2, value);
        this.utilsService.showToast('warning', err?.message);
    }

    copyStepOneData(): void {
        this.disableCopyButton = !this.disableCopyButton;
        if (this.disableCopyButton) {
            this.populateStates(this.stepOneData.country);
            this.UF.companyAddress.setValue(this.stepOneData.address);
            this.UF.companyZipCode.setValue(this.stepOneData.zipCode);
            this.UF.companyState.setValue(this.stepOneData.state);
            this.UF.companyCountry.setValue(this.stepOneData.country);
        } else {
            this.UF.companyAddress.setValue('');
            this.UF.companyZipCode.setValue('');
            this.UF.companyState.setValue('');
            this.UF.companyCountry.setValue('');
        }
    }

    goBack(): void {
        this.ifStepBack.emit();
    }

    changedOnAgreedOnTerms(checked: any): void {
        this.enableSubmitButton = checked;
    }
}
