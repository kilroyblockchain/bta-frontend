export interface IStaffUserFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    organizationUnit: string;
    staffingId: string[];
}

export interface IAddCompanyToUser {
    userId: string;
    staffingId: string;
    subscription: string;
}
