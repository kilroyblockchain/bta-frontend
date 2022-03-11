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
    featureId: IFeature;
}

export interface IOrganizationUnit {
    _id: string;
    unitName: string;
    unitDescription?: string;
    companyID: string;
    subscriptionType: string;
    featureListId: string[];
    status: boolean;
    createdAt: Date;
}

export interface IStaffing {
    _id: string;
    featureAndAccess: IFeatureAndAccess[];
    organizationUnitId: IOrganizationUnit;
    staffingName: string;
    status: boolean;
    createdAt: Date;
}
