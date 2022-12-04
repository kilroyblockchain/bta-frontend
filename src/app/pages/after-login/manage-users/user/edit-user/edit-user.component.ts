import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs/operators';
import { ValidationRegexConstant } from 'src/app/@core/constants';
import { MSG_KEY_CONSTANT_USER } from 'src/app/@core/constants/message-key-constants';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { ICountry, IState } from 'src/app/@core/interfaces/country.interface';
import { IOrganizationUnit, IStaffing } from 'src/app/@core/interfaces/manage-user.interface';
import { IUserCompany, IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, ManageUserService, StaffingService, UtilsService } from 'src/app/@core/services';
import { CountryService } from 'src/app/@core/services/country.service';
import { getFormControl } from 'src/app/@core/utils/form-helper';

@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html'
})
export class EditUserComponent implements OnInit {
    rowData!: IUserRes;
    editUserForm!: FormGroup;
    countries!: Array<ICountry>;
    states!: Array<IState>;
    loading!: boolean;
    organizationUnits!: Array<IOrganizationUnit>;
    staffings!: Array<IStaffing>;
    submitted!: boolean;
    userData!: IUserRes;
    defaultSubscriptionType!: string;

    constructor(private ref: NbDialogRef<EditUserComponent>, private fb: FormBuilder, private countryService: CountryService, private authService: AuthService, private utilsService: UtilsService, private readonly manageUserService: ManageUserService, private readonly staffingService: StaffingService, private titleCasePipe: TitleCasePipe) {}

    ngOnInit(): void {
        this.defaultSubscriptionType = this.authService.getDefaultSubscriptionType();
        this.userData = this.authService.getUserDataSync();
        this.populateCountries();
        this.buildEditUserForm();
    }

    buildEditUserForm(): void {
        const row = this.getCompany(this.rowData.company) as IUserCompany;
        const selectedStaffing = row.staffingId;
        this.populateStates(this.rowData?.country?._id);
        this.editUserForm = this.fb.group({
            firstName: [this.titleCasePipe.transform(this.rowData?.firstName), [Validators.required]],
            lastName: [this.titleCasePipe.transform(this.rowData?.lastName), [Validators.required]],
            staffing: this.fb.array([this.createStaffingFormGroup()]),
            staffingId: [selectedStaffing.map((staffing) => staffing._id), [Validators.required]],
            organizationUnit: [selectedStaffing[0]?.organizationUnitId?._id, [Validators.required]],
            phone: [this.rowData?.phone, [Validators.required, Validators.minLength(7), Validators.maxLength(18), Validators.pattern(ValidationRegexConstant.PHONE)]],
            email: [this.rowData?.email, [Validators.required, Validators.email]],
            country: [this.rowData?.country?._id || null],
            state: [this.rowData?.state?._id || null],
            city: [this.rowData?.city],
            address: [this.rowData?.address, [Validators.minLength(3)]],
            zipCode: [this.rowData?.zipCode]
        });
        this.setOrgUnits();
        this.patchStaffing(selectedStaffing);
        this.patchRuntimeStaffing();
    }

    get UF(): IFormControls {
        return this.editUserForm.controls;
    }

    get StaffingFormGroupArray(): FormArray {
        return this.editUserForm.get('staffing') as FormArray;
    }

    getFormControl(formGroup: FormGroup | AbstractControl, controlName: string): AbstractControl {
        return getFormControl(formGroup, controlName);
    }

    patchStaffing(staffing: IStaffing[]): void {
        if (staffing && staffing.length) {
            this.StaffingFormGroupArray.at(0).patchValue({
                orgUnit: staffing[0]?.organizationUnitId?._id,
                staffingUnit: staffing[0]?._id ?? ''
            });
            this.populateStaffing(staffing[0]?.organizationUnitId?._id, 0);
        }
    }

    patchRuntimeStaffing(): void {
        this.editUserForm.get('staffing')?.valueChanges.subscribe((staffing) => {
            const staffingIdList = this.accumulateStaffingIdFromStaffingFormArrayValues(staffing);
            this.editUserForm.get('staffingId')?.setValue(staffingIdList);
        });
    }

    accumulateStaffingIdFromStaffingFormArrayValues(staffing: { staffingUnit: string }[]): string[] {
        const staffingIdList = staffing.map((staff: { staffingUnit: string }) => {
            return staff.staffingUnit;
        });
        return staffingIdList;
    }

    createStaffingFormGroup(staff?: { orgUnit: string; staffingUnit: string }): FormGroup {
        const staffingFormGroup = this.fb.group({
            orgUnit: [staff?.orgUnit ?? '', [Validators.required]],
            staffingUnit: [staff?.staffingUnit ?? '', [Validators.required]],
            staffingList: [[]]
        });
        return staffingFormGroup;
    }

    addStaff(): void {
        this.StaffingFormGroupArray.push(this.createStaffingFormGroup());
    }

    removeStaff(index: number): void {
        if (this.StaffingFormGroupArray && this.StaffingFormGroupArray.length > 1) {
            this.StaffingFormGroupArray.removeAt(index);
        }
    }

    setOrgUnits(): void {
        this.manageUserService.getAllOrganizationUnitOfOrganization(this.defaultSubscriptionType).subscribe((res) => {
            if (res && res.success) {
                this.organizationUnits = res.data;
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

    populateStaffing(unitId: string, index: number): void {
        this.staffingService.getOrganizationUnitStaffing(unitId).subscribe((res) => {
            if (res && res.success) {
                this.StaffingFormGroupArray.at(index).patchValue({
                    staffingList: res.data
                });
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

    onSelectChange(countryId: string): void {
        this.editUserForm.patchValue({
            state: null
        });
        this.populateStates(countryId);
    }

    getCompany(companyArray: Array<IUserCompany>): IUserCompany | undefined {
        return companyArray.find((comp) => comp.companyId._id === this.userData.companyId && comp.subscriptionType === this.defaultSubscriptionType);
    }

    saveEditUser({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;

        value.staffingId = [...value.staffingId];
        this.manageUserService
            .editUserForOrganization(this.rowData._id as string, value)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res.data) {
                        this.utilsService.showToast('success', MSG_KEY_CONSTANT_USER.USER_UPDATED);
                        this.ref.close(res.data);
                    } else {
                        this.utilsService.showToast('warning', MSG_KEY_CONSTANT_USER.USER_UPDATE_FAILED);
                    }
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
