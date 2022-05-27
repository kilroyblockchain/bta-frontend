import { Component, Input, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { ACCESS_TYPE, FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { IStaffing } from 'src/app/@core/interfaces/manage-user.interface';
import { ICompany } from 'src/app/@core/interfaces/user-data.interface';
import { UtilsService } from 'src/app/@core/services';
import { environment } from 'src/environments/environment';
import { EditOrganizationComponent } from '../../edit-organization/edit-organization.component';

const BASE_URL = environment.apiURL + '/files/';
@Component({
    selector: 'app-organization-details',
    templateUrl: './organization-details.component.html'
})
export class OrganizationDetailsComponent implements OnInit {
    @Input() organization!: ICompany;
    @Input() staffs!: IStaffing[];
    imageBaseUrl = BASE_URL;
    showOrganizationEditButton = false;
    showOrganizationDetail = false;
    appTitle = environment.project;
    organizationUnitDetailList!: { orgUnit: string; staffingUnit: string[] }[];

    constructor(public utilsService: UtilsService, private dialogService: NbDialogService) {}

    ngOnInit(): void {
        this.checkAccessData();
        this.setOrganizationUnitDetails();
    }

    setOrganizationUnitDetails(): void {
        const selectedStaffing = this.staffs;
        const mergeCommonOrgUnit = (acc: { unitId: string; orgUnit: string; staffingUnit: string[] }[], staff: IStaffing) => {
            const index = acc.findIndex((detail) => detail.unitId === staff?.organizationUnitId?._id);
            if (index < 0) {
                acc.push({
                    unitId: staff?.organizationUnitId?._id,
                    orgUnit: staff?.organizationUnitId?.unitName,
                    staffingUnit: [staff?.staffingName]
                });
            } else {
                acc[index] = {
                    unitId: staff?.organizationUnitId?._id,
                    orgUnit: staff?.organizationUnitId?.unitName,
                    staffingUnit: [...acc[index].staffingUnit, staff?.staffingName]
                };
            }
            return acc;
        };
        const units = selectedStaffing.reduce(mergeCommonOrgUnit, []);
        this.organizationUnitDetailList = units;
    }

    async checkAccessData(): Promise<void> {
        this.showOrganizationDetail = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_DETAIL, [ACCESS_TYPE.READ]);
        this.showOrganizationEditButton = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_DETAIL, [ACCESS_TYPE.UPDATE]);
    }

    editOrganizationDetails(organizationId: string): void {
        const dialogOpen = this.dialogService.open(EditOrganizationComponent, { context: { organizationId }, hasBackdrop: true, closeOnBackdropClick: false });
        dialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close' && res.saveSuccess) {
                this.organization = res.data;
            }
        });
    }
}
