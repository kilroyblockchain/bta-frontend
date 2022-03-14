import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NbDialogRef } from '@nebular/theme';
import { ICompany, IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { ICountry, IState } from 'src/app/@core/interfaces/country.interface';

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
    organizationDetail!: Partial<ICompany>;

    constructor(private ref: NbDialogRef<ViewUserComponent>) {}

    ngOnInit(): void {
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
            countryName: user.country.name,
            stateName: user.state.name,
            blockchainVerified: user.blockchainVerified
        };
        const organizationDetail = this.user?.company[0]?.companyId as ICompany;
        this.organizationDetail = {
            ...organizationDetail,
            countryName: (organizationDetail.country as ICountry).name,
            stateName: (organizationDetail.state as IState).name
        };
    }

    closeModel(): void {
        this.ref.close();
    }
}
