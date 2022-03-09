import { CountryService } from 'src/app/@core/services/country.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Component, OnInit } from '@angular/core';
import { AuthService, UtilsService } from 'src/app/@core/services';
import { MSG_KEY_CONSTANT_USER } from 'src/app/@core/constants/message-key-constants';
import { finalize } from 'rxjs/operators';
import { DEFAULT_VALUES, ValidationRegexConstant } from 'src/app/@core/constants';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-edit-profile',
    templateUrl: './edit-profile.component.html',
    providers: [TitleCasePipe]
})
export class EditProfileComponent implements OnInit {
    userData: any;
    countries!: Array<any>;
    states!: Array<any>;
    loading = false;
    submitted = false;

    public personalDetailsForm!: FormGroup;

    constructor(protected ref: NbDialogRef<EditProfileComponent>, private fb: FormBuilder, private countryService: CountryService, private authService: AuthService, private utilsService: UtilsService, private titleCasePipe: TitleCasePipe) {}

    ngOnInit(): void {
        this.createRegistrationForm(this.userData);

        this.populateCountries();
        this.populateStates(this.userData.country?._id);
    }

    createRegistrationForm(user: any): void {
        this.personalDetailsForm = this.fb.group({
            firstName: [this.titleCasePipe.transform(user?.firstName), [Validators.required, Validators.minLength(2)]],
            lastName: [this.titleCasePipe.transform(user?.lastName), [Validators.required, Validators.minLength(2)]],
            phone: [user?.phone, [Validators.required, Validators.minLength(7), Validators.maxLength(18), Validators.pattern(ValidationRegexConstant.PHONE)]],
            country: [user?.country ? user?.country?._id : DEFAULT_VALUES.COUNTRY],
            state: [user?.state?._id],
            city: [user?.city],
            address: [user?.address, [Validators.minLength(3)]],
            zipCode: [user?.zipCode]
        });
    }

    get UF(): any {
        return this.personalDetailsForm.controls;
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
        this.personalDetailsForm.patchValue({
            state: null
        });
        this.populateStates(countryId);
    }

    updatePersonalDetails({ valid, value }: FormGroup): void {
        this.submitted = true;
        value.email = this.userData.email;
        if (!valid) {
            return;
        }
        this.loading = true;
        this.authService
            .updatePersonalDetails(value)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    this.ref.close({ saveSuccess: true, data: res });
                    this.utilsService.showToast('success', MSG_KEY_CONSTANT_USER.PERSONAL_DETAILS_UPDATED_SUCCESSFULLY);
                },
                error: (err) => {
                    this.utilsService.showToast('warning', err?.message);
                }
            });
    }

    closeModal(): void {
        this.ref.close('close');
    }
}
