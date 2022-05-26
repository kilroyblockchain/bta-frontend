import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NbDialogRef } from '@nebular/theme';
import { ICompany, IUserCompany, IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { ICountry, IState } from 'src/app/@core/interfaces/country.interface';
import { IStaffing } from 'src/app/@core/interfaces/manage-user.interface';
import { AuthService } from 'src/app/@core/services';

const BASE_URL = environment.apiURL + '/files/';
@Component({
    selector: 'app-view-user-detail',
    templateUrl: './view-user.component.html',
    styleUrls: ['./view-user.component.scss']
})
export class ViewUserComponent implements OnInit {
    user!: IUserRes;
    imageBaseUrl = BASE_URL;
    componentTitle!: string;
    userDetail!: Partial<IUserRes>;
    organizationDetail!: Partial<ICompany> & { units: { orgUnit: string; staffingUnit: string[] }[] };
    defaultSubscriptionType!: string;
    userData!: IUserRes;

    constructor(private ref: NbDialogRef<ViewUserComponent>, private authService: AuthService) {}

    ngOnInit(): void {
        this.defaultSubscriptionType = this.authService.getDefaultSubscriptionType();
        this.userData = this.authService.getUserDataSync();
        this.buildUserViewDetail(this.user);
    }

    buildUserViewDetail(user: IUserRes): void {
        this.userDetail = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            city: user.city,
            address: user.address,
            zipCode: user.zipCode,
            countryName: user.country?.name,
            stateName: user.state?.name,
            blockchainVerified: user.blockchainVerified
        };

        const rowUserOrganizationDetail = this.user?.company[0]?.companyId as ICompany;
        const rowUserOrganizationStaffingDetail = this.getCompany(this.user?.company) as IUserCompany;
        const selectedStaffing = rowUserOrganizationStaffingDetail.staffingId;
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
        this.organizationDetail = {
            ...rowUserOrganizationDetail,
            countryName: (rowUserOrganizationDetail.country as ICountry)?.name ?? 'N/a',
            stateName: (rowUserOrganizationDetail.state as IState)?.name ?? 'N/a',
            units
        };
    }

    getCompany(companyArray: Array<IUserCompany>): IUserCompany | undefined {
        return companyArray.find((comp) => comp.companyId._id === this.userData.companyId && comp.subscriptionType === this.defaultSubscriptionType);
    }

    closeModel(): void {
        this.ref.close();
    }
}
