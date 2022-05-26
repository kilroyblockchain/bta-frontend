import { ICountry, IState } from './country.interface';
import { IStaffing } from './manage-user.interface';
import { ISubscription } from './subscription.interface';

export interface IUserRes {
    _id: string;
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    companyId: string;
    company: IUserCompany[];
    country: ICountry;
    state: IState;
    city?: string;
    staffingId: IStaffing[] | string[];
    autoPassword: boolean;
    roles: string[];
    address?: string;
    zipCode?: string;
    phone: string;
    countryName?: string;
    stateName?: string;
    accessToken: string;
    createdAt: Date;
    blockchainVerified?: boolean;
}

export interface IUserData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyId: string;
    company: IUserCompany;
    country: ICountry;
    state: IState;
    city?: string;
    staffingId: string[];
    autoPassword: boolean;
    roles: string[];
    address?: string;
    zipCode?: string;
    phone: string;
    countryName?: string;
    stateName?: string;
    createdAt: Date;
    blockchainVerified?: boolean;
}

export interface IUserCompany {
    _id: string;
    companyId: ICompany;
    default: boolean;
    deletedStaffingId: string[];
    isAdmin: boolean;
    isDeleted: boolean;
    isRejected: boolean;
    staffingId: IStaffing[];
    subscriptionType: string;
    userAccept: boolean;
    verified: boolean;
}

export interface ICompany {
    _id: string;
    address: string;
    companyName: string;
    companyLogo?: string;
    country: ICountry | string;
    state: IState | string;
    countryName: string;
    stateName: string;
    zipCode: string;
    city: string;
    isDeleted: boolean;
    isRejected: boolean;
    subscription: Partial<ISubscription>[];
    createdAt: Date;
    updatedAt: Date;
    blockchainVerified?: boolean;
}
