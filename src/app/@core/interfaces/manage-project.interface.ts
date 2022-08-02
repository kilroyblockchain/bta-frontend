import { ICompany, IUserRes } from './user-data.interface';

export interface IProject {
    _id: string;
    name: string;
    details: string;
    members: Array<IUserRes>;
    domain: string;
    purpose: IPurposeDoc;
    status: boolean;
    updatedAt: Date;
    createdAt: Date;
    createdBy: IUserRes;
    companyId: ICompany;
    projectVersions: Array<IProjectVersion>;
}

export interface IPurposeDoc {
    text: string;
    docName: string;
    docURL: string;
}

export interface IProjectVersion {
    _id: string;
    versionName: string;
    logFilePath: string;
    logFileVersion?: string;
    logFileBCHash?: string;
    logFileStatus: IOracleBucketDataStatus;
    versionModel?: string;
    noteBookVersion: string;
    trainDataSets: string;
    trainDatasetBCHash?: string;
    trainDatasetStatus: IOracleBucketDataStatus;
    testDataSets: string;
    testDatasetBCHash?: string;
    testDatasetStatus: IOracleBucketDataStatus;
    aiModel: string;
    aiModelBcHash?: string;
    aiModelStatus: IOracleBucketDataStatus;
    codeVersion: string;
    codeRepo: string;
    comment: string;
    status: boolean;
    versionStatus: VersionStatus;
    updatedAt: Date;
    createdAt: Date;
    submittedDate: Date;
    reviewedDate: Date;
    productionDate: Date;
    createdBy: IUserRes;
    project: IProject;
    isQAStatus: boolean;
}

export enum VersionStatus {
    PENDING = 'Pending',
    REVIEW = 'Reviewing',
    REVIEW_PASSED = 'Review Passed',
    REVIEW_FAILED = 'Review Failed',
    PRODUCTION = 'Production',
    DEPLOYED = 'Deployed',
    MONITORING = 'Monitoring',
    COMPLETE = 'Complete',
    DRAFT = 'Draft',
    QA_STATUS = 'Question Answer'
}

interface IOracleBucketDataStatus {
    message: string;
    code: OracleBucketDataStatus;
}

export enum OracleBucketDataStatus {
    FETCHING = 'fetching',
    FETCHED = 'fetched',
    ERROR = 'error'
}

export interface IMonitoringReport {
    _id: string;
    subject: string;
    description: string;
    documents: Array<IDocuments>;
    updatedAt: Date;
    createdAt: Date;
    version: IProjectVersion;
    createdBy: IUserRes;
    staffing: string;
    status: IMonitoringStatus;
    otherStatus: string;
}

interface IDocuments {
    _id?: string;
    docURL: string;
    docName: string;
}

export interface IMonitoringStatus {
    _id: string;
    name: string;
    updatedAt: Date;
    createdAt: Date;
}

export interface IAiModel {
    _id: string;
    expNo: string;
    experimentBcHash: string;
    updatedAt: Date;
    createdAt: Date;
    project: IProject;
    version: IProjectVersion;
}

export interface IAiModelExp {
    exp: IExp;
}

export interface IExp {
    exp_no: string;
    datetime: string;
    hyperparameters: IHyperParameters;
    epochs: { [key: string]: IEpochs };
    test_metrics: ITestMetrics;
}

export interface IHyperParameters {
    hidden_size: string;
    learning_rate: string;
    data_dir: string;
}

export interface IEpochs {
    val_accuracy: string;
    train_loss: string;
    val_loss: string;
    train_f1_score: string;
    train_recall: string;
    train_acc: string;
    train_precision: string;
}

export interface ITestMetrics {
    test_f1_score: string;
    test_accuracy: string;
    test_recall: string;
    test_precision: string;
    test_loss: string;
}

export interface IModelReview {
    _id: string;
    comment: string;
    status: string;
    rating: number;
    version: IProjectVersion;
    documents: Array<IDocuments>;
    reviewModel: string;
    deployedModelURL: string;
    deployedModelInstruction: string;
    productionURL: string;
    createdBy: IUserRes;
    staffing: string;
    createdAt: Date;
    updatedAt: Date;
}
