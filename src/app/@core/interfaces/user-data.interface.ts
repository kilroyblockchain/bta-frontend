import { ICountry, IState } from './country.interface';
import { IStaffing } from './manage-user.interface';
import { ISubscription } from './subscription.interface';

export interface IUserData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyId: string;
    company: IUserCompany[];
    country: string | ICountry;
    state: string | IState;
    city?: string;
    staffingId: string[];
    autoPassword: boolean;
    roles: string[];
    address?: string;
    zipCode?: string;
    phone: string;
    createdAt: Date;
    blockchainVerified?: boolean;
}

export interface IUserCompany {
    _id: string;
    companyId: ICompany | string;
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
    country: string | ICountry;
    state: string | IState;
    zipCode: string;
    city: string;
    isDeleted: boolean;
    isRejected: boolean;
    subscription: Partial<ISubscription>[];
    createdAt: Date;
    updatedAt: Date;
}
