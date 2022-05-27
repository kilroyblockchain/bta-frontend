export interface IUserRegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    subscriptionType: string;
    companyName: string;
    password: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    state: string;
    zipCode: string;
    reCaptchaToken: string;
}

export interface IUserRegisterRes {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    blockchainVerified: boolean;
}
