import { IUserRes } from './user-data.interface';

export interface IBcNodeInfo {
    _id: string;
    orgName: string;
    label: string;
    nodeUrl: string;
    status: boolean;
    authorizationToken: string;
    addedBy: IUserRes;
    updatedAt: Date;
    createdAt: Date;
}
