import { IUserData } from './user-data.interface';

export interface IFeature {
    _id: string;
    accessType: string[];
    feature: string;
    featureIdentifier: string;
    subscriptionId: string[];
}

export interface IFeatureAndAccess {
    _id: string;
    accessType: string[];
    featureId: IFeature | string;
}

export interface IOrganizationUnit {
    _id: string;
    unitName: string;
    unitDescription?: string;
    companyID: string;
    subscriptionType: string;
    featureListId: string[] | IFeature[];
    status: boolean;
    updatedAt: Date;
    createdAt: Date;
    staffing_records: IStaffing[];
}

export interface IStaffing {
    _id: string;
    featureAndAccess: IFeatureAndAccess[];
    organizationUnitId: IOrganizationUnit;
    staffingName: string;
    staffDescription: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IChangeDefaultCompany {
    companyId: string;
    subscriptionType: string;
}

export interface IUserAcceptDetail extends IUserData {
    requestedBy: string;
    subscriptionType: string;
    userName: string;
}

export interface ICreateStaff {
    featureAndAccess: { featureId: string; accessType: string[] };
    organizationUnitId: string;
    staffingName: string;
}

export interface ICreateUnit {
    companyID: string;
    featureListId: string[];
    subscriptionType: string;
    unitDescription: string;
    unitName: string;
}
