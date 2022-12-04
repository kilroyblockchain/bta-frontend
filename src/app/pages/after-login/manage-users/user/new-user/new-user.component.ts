import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs/operators';
import { MSG_KEY_CONSTANT_USER } from 'src/app/@core/constants/message-key-constants';
import { DEFAULT_VALUES, ValidationRegexConstant } from 'src/app/@core/constants';
import { AuthService, ManageUserService, StaffingService, UtilsService } from 'src/app/@core/services';
import { CountryService } from 'src/app/@core/services/country.service';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { ICountry, IState } from 'src/app/@core/interfaces/country.interface';
import { IOrganizationUnit } from 'src/app/@core/interfaces/manage-user.interface';
import { IUserData } from 'src/app/@core/interfaces/user-data.interface';
import { getFormControl } from 'src/app/@core/utils/form-helper';

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
    countries!: Array<ICountry>;
    states!: Array<IState>;
    loading!: boolean;
    organizationUnits!: IOrganizationUnit[];
    submitted!: boolean;
    defaultSubscriptionType!: string;
    userAlreadyExist!: boolean;
    activeForm!: boolean;
    userDetail!: Partial<IUserData>;

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
            staffing: this.fb.array([this.createStaffingFormArray()]),
            staffingId: [[], [Validators.required]],
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
            staffing: this.fb.array([this.createStaffingFormArray()]),
            staffingId: [[], [Validators.required]]
        });
        this.setOrgUnits();
        this.patchStaffing();
    }

    buildSearchUserForm(): void {
        this.searchUserForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    patchStaffing(): void {
        this.newUserForm.get('staffing')?.valueChanges.subscribe((staffing) => {
            const staffingIdList = this.accumulateStaffingIdFromStaffingFormArrayValues(staffing);
            this.newUserForm.get('staffingId')?.setValue(staffingIdList);
        });
        this.existingUserForm.get('staffing')?.valueChanges.subscribe((staffing: { staffingUnit: string }[]) => {
            const staffingIdList = this.accumulateStaffingIdFromStaffingFormArrayValues(staffing);
            this.existingUserForm.get('staffingId')?.setValue(staffingIdList);
        });
    }

    accumulateStaffingIdFromStaffingFormArrayValues(staffing: { staffingUnit: string }[]): string[] {
        const staffingIdList = staffing.map((staff: { staffingUnit: string }) => {
            return staff.staffingUnit;
        });
        return staffingIdList;
    }

    createStaffingFormArray(): FormGroup {
        const staffingFormGroup = this.fb.group({
            orgUnit: ['', [Validators.required]],
            staffingUnit: ['', [Validators.required]],
            staffingList: [[]]
        });
        return staffingFormGroup;
    }

    get UF(): IFormControls {
        return this.newUserForm.controls;
    }

    get StaffingFormGroupArray(): FormArray {
        return this.newUserForm.get('staffing') as FormArray;
    }

    get StaffingFormGroupArrayForExistingUser(): FormArray {
        return this.existingUserForm.get('staffing') as FormArray;
    }

    get SearchUserForm(): IFormControls {
        return this.searchUserForm.controls;
    }

    get ExistingUserForm(): IFormControls {
        return this.existingUserForm.controls;
    }

    addStaff(): void {
        this.StaffingFormGroupArray.push(this.createStaffingFormArray());
    }

    removeStaff(index: number): void {
        if (this.StaffingFormGroupArray && this.StaffingFormGroupArray.length > 1) {
            this.StaffingFormGroupArray.removeAt(index);
        }
    }

    addStaffForExistingUser(): void {
        this.StaffingFormGroupArrayForExistingUser.push(this.createStaffingFormArray());
    }

    removeStaffForExistingUser(index: number): void {
        if (this.StaffingFormGroupArrayForExistingUser && this.StaffingFormGroupArrayForExistingUser.length > 1) {
            this.StaffingFormGroupArrayForExistingUser.removeAt(index);
        }
    }

    getFormControl(formGroup: FormGroup | AbstractControl, controlName: string): AbstractControl {
        return getFormControl(formGroup, controlName);
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
                    const { data } = res;
                    if (data) {
                        this.userAlreadyExist = true;
                        this.userDetail = data;
                        this.existingUserForm.patchValue({
                            email: value.email
                        });
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

    onUnitChange(unitId: string, index: number): void {
        this.staffingService.getOrganizationUnitStaffing(unitId).subscribe((res) => {
            if (res && res.success) {
                this.StaffingFormGroupArray.at(index).patchValue({
                    staffingList: res.data,
                    staffingUnit: ''
                });
            }
        });
    }

    onUnitChangeForExistingUser(unitId: string, index: number): void {
        this.staffingService.getOrganizationUnitStaffing(unitId).subscribe((res) => {
            if (res && res.success) {
                this.StaffingFormGroupArrayForExistingUser.at(index).patchValue({
                    staffingList: res.data,
                    staffingUnit: ''
                });
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
                .addCompanyToUser({ userId: this.userDetail.id as string, staffingId: value.staffingId, subscription: this.defaultSubscriptionType })
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
                    this.ref.close(res.data);
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
