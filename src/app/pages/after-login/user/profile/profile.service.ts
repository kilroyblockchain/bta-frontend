import { Injectable } from '@angular/core';
import { ICountry, IState } from 'src/app/@core/interfaces/country.interface';
import { ICompany, IUserData } from 'src/app/@core/interfaces/user-data.interface';

@Injectable({ providedIn: 'root' })
export class ProfileService {
    getPersonalDetail(userData: IUserData): IUserData {
        return {
            ...userData,
            countryName: (userData.country as ICountry).name,
            stateName: (userData.state as IState).name
        };
    }

    getOrganizationDetail(userData: IUserData): ICompany {
        const { company } = userData;
        const { companyId } = company;
        return {
            ...companyId,
            countryName: (companyId.country as ICountry).name,
            stateName: (companyId.state as IState).name,
            blockchainVerified: userData.blockchainVerified
        };
    }
}
