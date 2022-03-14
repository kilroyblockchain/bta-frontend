export interface IRejectInformation {
    id: string;
    rejectedUserDetail: IUserDetail;
    rejectedByUserDetail: IUserDetail;
    rejectionDescription?: string;
    blockchainVerified: boolean;
    createdAt?: Date;
}

interface IUserDetail {
    id: string;
    name: string;
}

export interface IRejectInformationFormData {
    rejectedUser: string;
    description: string;
}
