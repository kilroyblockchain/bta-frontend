import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbCheckboxComponent, NbDialogRef } from '@nebular/theme';
import { IAppResponse } from 'src/app/@core/interfaces/app-response.interface';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { IFeature, IStaffing } from 'src/app/@core/interfaces/manage-user.interface';
import { ManageUserService, UtilsService, StaffingService } from 'src/app/@core/services';

interface IChildrenRow {
    unitName: string;
    unitDescription: string;
    status: boolean;
    createdDate: string;
    updatedDate: string;
    action: unknown;
    subrow: boolean;
    _id: string;
    staffingId: string;
}

export interface IAccessList {
    featureId: string;
    accessType: Array<string>;
}
let that: NewOrganizationStaffingComponent;
@Component({
    selector: 'app-new-organization-staffing',
    templateUrl: './new-organization-staffing.component.html',
    styleUrls: ['./new-organization-staffing.component.scss']
})
export class NewOrganizationStaffingComponent implements OnInit {
    childRowData!: IChildrenRow;
    mode!: string;
    newOrganizationStaffingForm!: FormGroup;
    submitted!: boolean;
    loading!: boolean;
    featureList!: Array<IFeature & { accessChecked: boolean[] }>;
    unitName!: string;
    accessListRequiredError = false;
    accessList: Array<IAccessList> = [];
    masterSelected: boolean;
    @ViewChild('allSelected')
    allSelected!: NbCheckboxComponent;
    totalFeaturesCount = 0;

    constructor(private ref: NbDialogRef<NewOrganizationStaffingComponent>, private fb: FormBuilder, private readonly staffingService: StaffingService, private readonly manageUserService: ManageUserService, private readonly utilsService: UtilsService) {
        that = this;
        this.masterSelected = false;
    }

    ngOnInit(): void {
        this.buildNewOrganizationStaffingForm();
        if (this.childRowData) {
            this.unitName = this.childRowData.unitName;
            this.getOrganizationUnitDetail();
        }
        if (this.mode === 'EDIT') {
            this.buildEditOrganizationStaffingForm(this.childRowData);
        }
    }

    buildNewOrganizationStaffingForm(): void {
        this.newOrganizationStaffingForm = this.fb.group({
            staffingName: ['', [Validators.required]]
        });
    }

    buildEditOrganizationStaffingForm(data: IChildrenRow): void {
        this.newOrganizationStaffingForm.patchValue({
            staffingName: data.unitName
        });
        this.accessList = [...(data.action as IStaffing).featureAndAccess].map((access) => ({
            featureId: access.featureId as string,
            accessType: access.accessType
        }));
    }

    get UF(): IFormControls {
        return this.newOrganizationStaffingForm.controls;
    }

    getOrganizationUnitDetail(): void {
        this.manageUserService.getOrganizationUnitById(this.childRowData._id).subscribe((data) => {
            if (data.success) {
                const featureAndAccessList = data.data.featureListId as IFeature[];
                this.featureList = featureAndAccessList.map((featureAndAccess) => {
                    const featureAndAccessCopy: IFeature & { accessChecked: boolean[] } = { ...featureAndAccess, accessChecked: [] };
                    console.log(featureAndAccessCopy);
                    for (let i = 0; i < featureAndAccessCopy.accessType.length; i++) {
                        featureAndAccessCopy.accessChecked.push(false);
                        this.totalFeaturesCount = this.totalFeaturesCount + 1;
                    }
                    return featureAndAccessCopy;
                });
                if (this.mode === 'EDIT') {
                    this.fillFeatureList(data.data.featureListId as IFeature[]);
                }
            }
        });
    }

    fillFeatureList(featureList: IFeature[]): void {
        featureList.map((feature, index) => {
            this.accessList.map((access) => {
                feature.accessType.map((a: string, i: number) => {
                    if (!this.featureList[index].accessChecked) {
                        this.featureList[index].accessChecked = new Array(feature.accessType.length).fill(false);
                    }
                    if (feature._id === access.featureId) {
                        access.accessType.map((b) => {
                            if (a === b) {
                                this.featureList[index].accessChecked[i] = true;
                            }
                        });
                    }
                });
            });
        });
    }

    toggleFeatureList(featureID: string, access: string, event: boolean): void {
        if (this.accessList.length) {
            const featureData = this.accessList.filter((res) => res.featureId === featureID);
            if (featureData.length) {
                const index = featureData[0].accessType.indexOf(access);
                if (index === -1) {
                    if (event) {
                        featureData[0].accessType.push(access);
                    }
                } else {
                    if (!event) {
                        featureData[0].accessType.splice(index, 1);
                    }
                }
            } else {
                const temp = {
                    featureId: featureID,
                    accessType: [access]
                };
                if (event) {
                    this.accessList.push(temp);
                }
            }
        } else {
            const temp = {
                featureId: featureID,
                accessType: [access]
            };
            if (event) {
                this.accessList.push(temp);
            }
        }
        this.masterSelected = this.isAllSelected(this.accessList);
    }

    saveNewOrganizationStaffing({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        if (!this.accessList.length) {
            this.accessListRequiredError = true;
            return;
        }
        this.accessListRequiredError = false;
        value.featureAndAccess = this.accessList;
        value.organizationUnitId = this.childRowData._id;
        this.loading = true;
        if (this.mode === 'CREATE') {
            this.staffingService.createNewStaffing(value).subscribe({ next: this.successRes, error: this.errorRes });
        }

        if (this.mode === 'EDIT') {
            this.staffingService.updateStaffingById(this.childRowData.staffingId, value).subscribe({ next: this.successRes, error: this.errorRes });
        }
    }

    successRes(res: IAppResponse<IStaffing>): void {
        that.loading = false;
        if (res && res.success) {
            that.ref.close(res);
            that.utilsService.showToast('success', res.message);
        }
    }

    errorRes(err: Error): void {
        that.loading = false;
        that.utilsService.showToast('warning', err?.message);
    }

    closeModal(): void {
        this.ref.close('close');
    }

    isAllSelected(accessList: IAccessList[]) {
        const accessLength = [];
        accessList.forEach((access) => {
            accessLength.push(...access.accessType);
        });
        if (accessLength.length === this.totalFeaturesCount) {
            return true;
        } else {
            return false;
        }
    }

    toggleAllSelection(isSelected: boolean): void {
        for (let i = 0; i < this.featureList.length; i++) {
            const accessList = this.featureList[i];
            for (let j = 0; j < accessList.accessType.length; j++) {
                accessList.accessChecked[j] = isSelected;
                this.toggleFeatureList(accessList._id, accessList.accessType[j], true);
            }
        }
    }
}
