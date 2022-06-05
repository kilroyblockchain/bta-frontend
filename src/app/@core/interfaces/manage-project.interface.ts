import { ICompany, IUserRes } from './user-data.interface';

export interface IProject {
    _id: string;
    name: string;
    details: string;
    members: Array<IUserRes>;
    domain: string;
    purpose: string;
    status: boolean;
    updatedAt: Date;
    createdAt: Date;
    createdBy: IUserRes;
    companyId: ICompany;
}
