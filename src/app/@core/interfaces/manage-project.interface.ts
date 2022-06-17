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
    projectVersions: Array<IProjectVersion>;
}

export interface IProjectVersion {
    _id: string;
    versionName: string;
    logFilePath: string;
    logFileVersion: string;
    versionModel: string;
    noteBookVersion: string;
    trainDataSets: string;
    testDataSets: string;
    artifacts: string;
    codeVersion: string;
    codeRepo: string;
    comment: string;
    status: boolean;
    versionStatus: VersionStatus;
    updatedAt: Date;
    createdAt: Date;
    createdBy: IUserRes;
    project: IProject;
}

export enum VersionStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    ACCEPT = 'ACCEPT',
    DECLINE = 'DECLINE'
}

export interface IMonitoringReport {
    _id: string;
    subject: string;
    description: string;
    documents: Array<IReportDocs>;
    updatedAt: Date;
    createdAt: Date;
    version: IProjectVersion;
    createdBy: IUserRes;
}

interface IReportDocs {
    _id?: string;
    docURL: string;
    docName: string;
}
