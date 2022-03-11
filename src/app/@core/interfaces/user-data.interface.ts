export interface IUserData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyId: string;
    company: IUserCompany[];
    staffingId: string[];
    autoPassword: boolean;
    roles: string[];
}

export interface IUserCompany {
    _id: string;
    companyId: ICompany | string;
    default: boolean;
    deletedStaffingId: any[];
    isAdmin: boolean;
    isDeleted: boolean;
    isRejected: boolean;
    staffingId: any[];
    subscriptionType: string;
    userAccept: boolean;
    verified: boolean;
}

export interface ICompany {
    _id: string;
    aboutOrganization: string;
    address: string;
    companyName: string;
    contributionForApp: string;
    country: string;
    state: string;
    zipCode: string;
    helpNeededFromApp: string;
    isDeleted: boolean;
    isRejected: boolean;
    subscription: any[];
    vaccines: any[];
    createdAt: Date;
    updatedAt: Date;
}
