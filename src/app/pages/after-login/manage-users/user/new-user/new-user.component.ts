import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs/operators';
import { MSG_KEY_CONSTANT_USER } from 'src/app/@core/constants/message-key-constants';
import { DEFAULT_VALUES, ValidationRegexConstant } from 'src/app/@core/constants';
import { AuthService, ManageUserService, StaffingService, UtilsService } from 'src/app/@core/services';
import { CountryService } from 'src/app/@core/services/country.service';

@Component({
    selector: 'app-new-user',
    templateUrl: './new-user.component.html',
    styleUrls: ['../../manage-users.component.scss']
})
export class NewUserComponent implements OnInit {
    staffingId!: Array<string>;
    newUserForm!: FormGroup;
    existingUserForm!: FormGroup;
    searchUserForm!: FormGroup;
    countries!: Array<any>;
    states!: Array<any>;
    loading!: boolean;
    organizationUnits!: Array<any>;
    staffings!: Array<any>;
    submitted!: boolean;
    defaultSubscriptionType!: string;
    userAlreadyExist!: boolean;
    activeForm!: boolean;
    userDetail: any;

    constructor(private ref: NbDialogRef<NewUserComponent>, private fb: FormBuilder, private countryService: CountryService, private authService: AuthService, private utilsService: UtilsService, private readonly manageUserService: ManageUserService, private readonly staffingService: StaffingService) {}

    ngOnInit(): void {
        this.buildNewUserForm();
        this.buildSearchUserForm();
    }

    buildNewUserForm(): void {
        this.populateCountries();
        this.populateStates(DEFAULT_VALUES.COUNTRY);
        this.newUserForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            staffingId: [[], [Validators.required]],
            organizationUnit: ['', [Validators.required]],
            phone: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(18), Validators.pattern(ValidationRegexConstant.PHONE)]],
            email: ['', [Validators.required, Validators.email]],
            country: [DEFAULT_VALUES.COUNTRY],
            state: [null],
            city: [''],
            address: ['', [Validators.minLength(3)]],
            zipCode: ['']
        });
        this.existingUserForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            staffingId: [[], [Validators.required]],
            organizationUnit: ['', [Validators.required]]
        });
        this.setOrgUnits();
    }

    buildSearchUserForm(): void {
        this.searchUserForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    get UF(): any {
        return this.newUserForm.controls;
    }

    get SearchUserForm(): any {
        return this.searchUserForm.controls;
    }

    get ExistingUserForm(): any {
        return this.existingUserForm.controls;
    }

    setOrgUnits(): void {
        this.manageUserService.getAllOrganizationUnitOfOrganization(this.defaultSubscriptionType).subscribe((res) => {
            if (res && res.success) {
                this.organizationUnits = res.data;
            }
        });
    }

    checkEmail({ value, valid }: FormGroup): void {
        if (!valid) {
            this.submitted = true;
            return;
        }
        this.loading = true;
        this.authService
            .findUserIdByEmail({ email: value.email })
            .pipe(
                finalize(() => {
                    this.submitted = false;
                    this.activeForm = true;
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.userAlreadyExist = true;
                        this.userDetail = res;
                        this.existingUserForm.patchValue({
                            email: value.email
                        });
                        if (this.userDetail.organizationName) {
                            this.existingUserForm.patchValue({
                                sponsorOrganizationName: this.userDetail.sponsorOrganizationName
                            });
                            if (this.existingUserForm && this.existingUserForm.get('sponsorOrganizationName')) {
                                (<AbstractControl>this.existingUserForm.get('sponsorOrganizationName')).disable();
                            }
                        }
                    } else {
                        this.userAlreadyExist = false;
                        this.newUserForm.patchValue({
                            email: value.email
                        });
                    }
                },
                error: (err) => {
                    if (err.statusCode === 404) {
                        this.userAlreadyExist = false;
                        this.newUserForm.patchValue({
                            email: value.email
                        });
                    }
                }
            });
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

    onUnitChange(unitId: string): void {
        this.staffingService.getOrganizationUnitStaffing(unitId).subscribe((res) => {
            if (res && res.success) {
                this.staffings = res.data;
            }
        });
    }

    onSelectChange(countryId: string): void {
        this.newUserForm.patchValue({
            state: null
        });
        this.populateStates(countryId);
    }

    saveNewUser({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;
        if (this.userAlreadyExist) {
            this.authService
                .addCompanyToUser({ userId: this.userDetail.id, sponsorOrganizationName: value.sponsorOrganizationName, staffingId: value.staffingId, subscription: this.defaultSubscriptionType })
                .pipe(
                    finalize(() => {
                        this.loading = false;
                    })
                )
                .subscribe({
                    next: (res) => {
                        if (res) {
                            this.ref.close(res.data);
                            this.utilsService.showToast('success', res.message);
                        } else {
                            this.utilsService.showToast('warning', MSG_KEY_CONSTANT_USER.USER_CREATION_FAILED);
                        }
                    },
                    error: (err) => {
                        if (err.statusCode === 409) {
                            this.utilsService.showToast('warning', err.message);
                        } else {
                            this.utilsService.showToast('warning', MSG_KEY_CONSTANT_USER.USER_CREATION_FAILED);
                        }
                    }
                });
        } else {
            this.authService.createUserForOrganization(value, this.defaultSubscriptionType).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.utilsService.showToast('success', MSG_KEY_CONSTANT_USER.NEW_USER_ADDED);
                    this.ref.close(res);
                },
                error: (err) => {
                    this.loading = false;
                    this.utilsService.showToast('warning', err?.message);
                }
            });
        }
    }

    closeModal(): void {
        this.ref.close('close');
    }
}
