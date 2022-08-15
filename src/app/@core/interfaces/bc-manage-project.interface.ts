export interface IBcManageProject {
    data: IBcProject;
}

export interface IBcProjectHistory {
    data: IProjectBcHistory[];
}

export interface IBcProject {
    projectId: string;
    name: string;
    detail: string;
    domain: string;
    members: string[];
    entryUser: string;
    recordDate: Date;
    modelVersions: IBcProjectVersion[];
}
export interface IBcProjectVersion {
    id: string;
    versionName: string;
}

export interface IProjectBcHistory {
    isDeleted: boolean;
    txId: string;
    project: IBcProject;
}

export interface IBcManageProjectVersion {
    data: IBcProjectVersion;
}

export interface IBcProjectVersionHistory {
    data: IProjectVersionBcHistory[];
}

export interface IProjectVersionBcHistory {
    isDeleted: boolean;
    txId: string;
    modelVersion: IBcProjectVersion;
}
export interface IBcProjectVersion {
    id: string;
    versionName: string;
    logFileVersion: string;
    logFilePath: string;
    logFileBCHash: string;
    noteBookVersion: string;
    testDataSetsUrl: string;
    testDatasetBCHash: string;
    trainDataSetsUrl: string;
    trainDatasetBCHash: string;
    aiModelUrl: string;
    aiModelBcHash: string;
    codeVersion: string;
    codeRepo: string;
    comment: string;
    versionStatus: string;
    status: boolean;
    project: IBcProjectInfo;
    entryUser: string;
    recordDate: Date;
    creatorMSP: string;
}

interface IBcProjectInfo {
    id: string;
    projectName: string;
}

export interface IBcModelReviewDetails {
    data: IBcModelReview;
}

export interface IBcModelReviewHistory {
    data: IModelReviewBcHistory[];
}

export interface IModelReviewBcHistory {
    isDeleted: boolean;
    txId: string;
    modelReview: IBcModelReview;
}
export interface IBcModelReview {
    id: string;
    reviewStatus: string;
    comment: string;
    ratings: string;
    deployedUrl: string;
    deploymentInstruction: string;
    productionURL: string;
    reviewedModelVersionId: string;
    reviewDocuments: IReviewSupportingDocument[];
    entryUserDetail: IEntryUserBcDetail;
    recordDate: Date;
    creatorMSP: string;
}

interface IEntryUserBcDetail {
    entryUser: string;
    organizationUnit: string;
    staffing: string;
}

interface IReviewSupportingDocument {
    docUrl: string;
    docName: string;
}

export interface IAIModelTempHash {
    _id: string;
    hash: string;
    updatedAt: Date;
    createdAt: Date;
}
