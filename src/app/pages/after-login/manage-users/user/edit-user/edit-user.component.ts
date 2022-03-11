import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs/operators';
import { ValidationRegexConstant } from 'src/app/@core/constants';
import { MSG_KEY_CONSTANT_USER } from 'src/app/@core/constants/message-key-constants';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { AuthService, ManageUserService, StaffingService, UtilsService } from 'src/app/@core/services';
import { CountryService } from 'src/app/@core/services/country.service';

@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html'
})
export class EditUserComponent implements OnInit {
    rowData: any;
    editUserForm!: FormGroup;
    countries!: Array<any>;
    states!: Array<any>;
    loading!: boolean;
    organizationUnits!: Array<any>;
    staffings!: Array<any>;
    submitted!: boolean;
    userData: any;
    defaultSubscriptionType!: string;
    otherUnitStaffings = [];

    constructor(private ref: NbDialogRef<EditUserComponent>, private fb: FormBuilder, private countryService: CountryService, private authService: AuthService, private utilsService: UtilsService, private readonly manageUserService: ManageUserService, private readonly staffingService: StaffingService, private titleCasePipe: TitleCasePipe) {}

    ngOnInit(): void {
        this.defaultSubscriptionType = this.authService.getDefaultSubscriptionType();
        this.userData = this.authService.getUserDataSync();
        this.buildEditUserForm();
    }

    buildEditUserForm(): void {
        const row = this.getCompany(this.rowData.company);
        const selectedStaffing = row.staffingId;
        this.populateStaffing(selectedStaffing[0]?.organizationUnitId?._id);
        this.populateStates(this.rowData?.country?._id);
        this.editUserForm = this.fb.group({
            firstName: [this.titleCasePipe.transform(this.rowData?.firstName), [Validators.required]],
            lastName: [this.titleCasePipe.transform(this.rowData?.lastName), [Validators.required]],
            staffingId: [selectedStaffing.map((staffing: any) => staffing._id), [Validators.required]],
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
    }

    get UF(): IFormControls {
        return this.editUserForm.controls;
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
    populateStaffing(unitId: string): void {
        this.staffingService.getOrganizationUnitStaffing(unitId).subscribe((res) => {
            if (res && res.success) {
                this.staffings = res.data;
            }
        });
    }

    onUnitChange(unitId: string): void {
        this.editUserForm.patchValue({
            staffingId: []
        });
        this.populateStaffing(unitId);
    }

    onSelectChange(countryId: string): void {
        this.editUserForm.patchValue({
            state: null
        });
        this.populateStates(countryId);
    }

    getCompany(companyArray: Array<any>): any {
        return companyArray.find((comp) => comp.companyId._id === this.userData.companyId && comp.subscriptionType === this.defaultSubscriptionType);
    }

    saveEditUser({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;

        value.staffingId = [...value.staffingId, ...this.otherUnitStaffings.map((staff: any) => staff._id)];
        this.manageUserService
            .editUserForOrganization(this.rowData._id, value)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.utilsService.showToast('success', MSG_KEY_CONSTANT_USER.USER_UPDATED);
                        this.ref.close(res);
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
