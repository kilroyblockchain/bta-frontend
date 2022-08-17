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

export interface IBcExperimentData {
    data: IBcExperimentDetail;
}

export interface IBcExperimentDetail {
    data: IBcModelExperiment;
}

export interface IBcModelExperiment {
    experimentName: string;
    experimentBcHash: string;
    modelVersion: IBcProjectVersion;
    project: IBcProjectInfo;
    recordDate: Date;
    entryUser: string;
    creatorMSP: string;
}

export interface IBcExperimentDataHistory {
    data: IBcExperimentHistory;
}

export interface IBcExperimentHistory {
    data: IBcExperimentHistoryData[];
}

export interface IBcExperimentHistoryData {
    txId: string;
    modelExperiment: IBcModelExperiment;
    isDeleted: boolean;
}

export interface IBcArtifactModelDataHistory {
    data: IBcArtifactModelHistory;
}

export interface IBcArtifactModelHistory {
    data: IBcArtifactModelHistoryData[];
}

export interface IBcArtifactModelHistoryData {
    txId: string;
    modelArtifact: IBcArtifactModel;
    isDeleted: boolean;
}

export interface IBcArtifactModel {
    creatorMSP: string;
    entryUser: string;
    modelArtifactBcHash: string;
    modelArtifactName: string;
    modelVersion: IBcProjectVersion;
    project: IBcProjectInfo;
    recordDate: Date;
}

/*
modelArtifact: {
creatorMSP: "PeerDs1MainnetBtaKilroyMSP"
entryUser: "cavakoh@mailinator.com"
modelArtifactBcHash: "7553df91b58fd8da2b6656abbb2b1b8307ea4434dbc0fd6df594b5d6d7938496"
modelArtifactName: "tsd_model_1"
modelVersion: {id: "62fbc3fbea9022d993f050ba", versionName: "v1"}
project: {id: "62efd37ef24e4b26ff79c760", projectName: "TSD"}
recordDate: "2022-08-16T16:23:09Z"
}
*/
/*
isDeleted: false

txId: "b7c6d472eeb2b280e4248a370d9ecdd8a7de0a5b0c6b7228dc5fa907aaa716b6"

*/
