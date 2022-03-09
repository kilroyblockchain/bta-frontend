import { Component, Input, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { ACCESS_TYPE, FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { UtilsService } from 'src/app/@core/services';
import { environment } from 'src/environments/environment';
import { EditOrganizationComponent } from '../../edit-organization/edit-organization.component';

const BASE_URL = environment.apiURL + '/files/';
@Component({
    selector: 'app-organization-details',
    templateUrl: './organization-details.component.html'
})
export class OrganizationDetailsComponent implements OnInit {
    @Input() userData: any;
    @Input() organizationList: any;
    imageBaseUrl = BASE_URL;
    showOrganizationEditButton = false;
    showOrganizationDetail = false;
    company: any;
    appTitle = environment.project;

    constructor(public utilsService: UtilsService, private dialogService: NbDialogService) {}

    ngOnInit(): void {
        this.checkAccessData();
        this.company = this.userData.company;
    }

    async checkAccessData(): Promise<void> {
        this.showOrganizationDetail = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_DETAIL, [ACCESS_TYPE.READ]);
        this.showOrganizationEditButton = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_DETAIL, [ACCESS_TYPE.UPDATE]);
    }

    editOrganizationDetails(organizationId: string): void {
        const dialogOpen = this.dialogService.open(EditOrganizationComponent, { context: { organizationId }, hasBackdrop: true, closeOnBackdropClick: false });
        dialogOpen.onClose.subscribe((res: any) => {
            if (res && res !== 'close' && res.saveSuccess) {
                this.userData.company.companyId = res.data;
            }
        });
    }
}
