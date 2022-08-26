import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbCheckboxComponent, NbDialogRef } from '@nebular/theme';
import { PROJECT_USER } from 'src/app/@core/constants/project-roles.enum';
import { IAppResponse } from 'src/app/@core/interfaces/app-response.interface';
import { IBcNodeInfo } from 'src/app/@core/interfaces/bc-node-info.interface';
import { IChannelDetails } from 'src/app/@core/interfaces/channel-details.interface';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { IFeature, IStaffing } from 'src/app/@core/interfaces/manage-user.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { ManageUserService, UtilsService, StaffingService, ManageChannelDetailsService, BlockChainService, AuthService } from 'src/app/@core/services';

interface IChildrenRow {
    unitName: string;
    unitDescription: string;
    status: boolean;
    createdDate: string;
    updatedDate: string;
    bcNodeInfo: IBcNodeInfo;
    channels: string[];
    bucketUrl: string;
    oracleGroupName: string;
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

    @ViewChild('allSelected') allSelected!: NbCheckboxComponent;
    @ViewChild('staffingName') staffingName!: ElementRef;
    @ViewChild('bcNodeInfoDiv') bcNodeInfoDiv!: ElementRef;

    updateStaffingName!: string;
    defaultCompanyChannel!: string;

    totalFeaturesCount = 0;

    defaultStaffingName = [PROJECT_USER.AI_ENGINEER, PROJECT_USER.MLOps_ENGINEER, PROJECT_USER.STAKEHOLDER];
    options!: { [key: string]: unknown };

    channelDetails!: Array<IChannelDetails>;
    nonDefaultChannels!: Array<IChannelDetails>;
    companyChannel!: Array<IChannelDetails>;

    bcNodeInfo!: Array<IBcNodeInfo>;
    channelId: string[] = [];
    user!: IUserRes;

    constructor(
        private ref: NbDialogRef<NewOrganizationStaffingComponent>,
        private fb: FormBuilder,
        private authService: AuthService,
        private readonly staffingService: StaffingService,
        private readonly manageUserService: ManageUserService,
        private readonly utilsService: UtilsService,
        private readonly manageChannelService: ManageChannelDetailsService,
        private readonly blockChainService: BlockChainService
    ) {
        that = this;
        this.masterSelected = false;
    }

    ngOnInit(): void {
        this.user = this.authService.getUserDataSync();

        this.buildNewOrganizationStaffingForm();
        if (this.childRowData) {
            this.unitName = this.childRowData.unitName;
            this.getOrganizationUnitDetail();
        }
        if (this.mode === 'EDIT') {
            this.buildEditOrganizationStaffingForm(this.childRowData);
        }
        this.options = { limit: Number.MAX_SAFE_INTEGER };
        this.getAllChannelDetails();
        this.getBcNodeInfo();
    }

    buildNewOrganizationStaffingForm(): void {
        this.newOrganizationStaffingForm = this.fb.group({
            staffingName: ['', [Validators.required]],
            bcNodeInfo: ['', [Validators.required]],
            bucketUrl: ['', [Validators.required]],
            channels: [[], [Validators.required]],
            aiEngChannel: [''],
            oracleGroupName: ['', [Validators.required]]
        });
    }

    buildEditOrganizationStaffingForm(data: IChildrenRow): void {
        const [unitName, ...restName] = data.unitName.split('-');
        this.updateStaffingName = restName.join('-');
        this.defaultCompanyChannel = data.channels[data.channels.length - 1];

        if (data.channels.length) {
            for (const channel of data.channels) {
                this.channelId.push(channel);
            }

            this.channelId.length > 1 ? this.channelId.shift() : this.channelId;
        }

        this.newOrganizationStaffingForm.patchValue({
            staffingName: unitName,
            bcNodeInfo: data.bcNodeInfo,
            bucketUrl: data.bucketUrl,
            oracleGroupName: data.oracleGroupName,
            aiEngChannel: this.channelId.join()
        });

        if (this.newOrganizationStaffingForm.get('staffingName')?.value === this.defaultStaffingName[0]) {
            this.newOrganizationStaffingForm.patchValue({
                channels: [this.channelId, this.defaultCompanyChannel]
            });
        } else {
            this.newOrganizationStaffingForm.patchValue({
                channels: [this.channelId]
            });
        }

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
            if (this.staffingName.nativeElement.value) {
                this.newOrganizationStaffingForm.patchValue({
                    staffingName: this.newOrganizationStaffingForm.get('staffingName')?.value + '-' + this.staffingName.nativeElement.value
                });
                value['staffingName'] = this.newOrganizationStaffingForm.get('staffingName')?.value;
            }

            this.staffingService.createNewStaffing(value).subscribe({ next: this.successRes, error: this.errorRes });
        }

        if (this.mode === 'EDIT') {
            if (this.staffingName.nativeElement.value) {
                this.newOrganizationStaffingForm.patchValue({
                    staffingName: this.newOrganizationStaffingForm.get('staffingName')?.value + '-' + this.staffingName.nativeElement.value
                });
                value['staffingName'] = this.newOrganizationStaffingForm.get('staffingName')?.value;
            }

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

    getAllChannelDetails(): void {
        this.manageChannelService.getAllChannel(this.options).subscribe((res) => {
            this.channelDetails = res.data.docs;
            this.nonDefaultChannels = this.channelDetails.filter((d) => d.isDefault !== true && d.createdBy === this.user.id);
            this.companyChannel = this.channelDetails.filter((d) => d.isCompanyChannel === true);
        });
    }

    getBcNodeInfo(): void {
        this.blockChainService.getAllBcInfo(this.options).subscribe((res) => {
            this.bcNodeInfo = res.data.docs.filter((f) => f.addedBy._id === this.user.id);
        });
    }

    updateOracleGroupName(): void {
        if (this.mode === 'CREATE') {
            const oracleGroupName = (this.newOrganizationStaffingForm.get('staffingName')?.value + ' ' + this.staffingName.nativeElement.value).toLowerCase().trim().replace(/\s+/g, ' ');
            this.newOrganizationStaffingForm.patchValue({
                oracleGroupName: this.staffingName.nativeElement.value ? oracleGroupName.split(' ').join('-') : oracleGroupName.replace(' ', '-')
            });
        }
    }

    checkStaffingName(event: string): void {
        if (event === this.defaultStaffingName[2]) {
            this.newOrganizationStaffingForm.get('bucketUrl')?.clearValidators();
            this.newOrganizationStaffingForm.get('bucketUrl')?.updateValueAndValidity();
        }

        if (event !== this.defaultStaffingName[0]) {
            this.newOrganizationStaffingForm.get('channels')?.clearValidators();
            this.newOrganizationStaffingForm.get('channels')?.updateValueAndValidity();
        }

        if (event !== this.defaultStaffingName[0]) {
            this.bcNodeInfoDiv.nativeElement.classList.remove('two-col');
        } else {
            this.bcNodeInfoDiv.nativeElement.classList.add('two-col');
        }
    }

    addChannel(event: string): void {
        if (this.mode === 'CREATE') {
            this.newOrganizationStaffingForm.patchValue({
                channels: [event]
            });
        }
        if (this.mode === 'EDIT') {
            this.newOrganizationStaffingForm.patchValue({
                channels: [event, this.defaultCompanyChannel]
            });
        }
    }
}
