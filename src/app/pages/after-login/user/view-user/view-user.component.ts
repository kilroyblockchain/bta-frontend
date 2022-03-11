import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NbDialogRef } from '@nebular/theme';
import { IUserData, ICompany } from 'src/app/@core/interfaces/user-data.interface';
import { ICountry, IState } from 'src/app/@core/interfaces/country.interface';

const BASE_URL = environment.apiURL + '/files/';
@Component({
    selector: 'app-view-user-detail',
    templateUrl: './view-user.component.html',
    styleUrls: ['./view-user.component.scss']
})
export class ViewUserComponent implements OnInit {
    user!: IUserData;
    imageBaseUrl = BASE_URL;
    componentTitle!: string;
    userDetail!: Partial<IUserData>;
    organizationDetail!: Partial<ICompany>;

    constructor(private ref: NbDialogRef<ViewUserComponent>) {}

    ngOnInit(): void {
        this.buildUserViewDetail(this.user);
    }

    buildUserViewDetail(user: IUserData): void {
        this.userDetail = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            city: user.city,
            address: user.address,
            zipCode: user.zipCode,
            country: (user.country as ICountry).name,
            state: (user.state as IState).name,
            blockchainVerified: user.blockchainVerified
        };
        const organizationDetail = this.user?.company[0]?.companyId as ICompany;
        this.organizationDetail = {
            ...organizationDetail,
            country: (organizationDetail.country as ICountry).name,
            state: (organizationDetail.state as IState).name
        };
    }

    closeModel(): void {
        this.ref.close();
    }
}
