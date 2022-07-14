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
    projectVersions: IBcProjectVersion[];
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
    projectVersion: IBcProjectVersion;
}
export interface IBcProjectVersion {
    id: string;
    versionName: string;
    logFilePath: string;
    logFileVersion: string;
    logFileBCHash: string;
    versionModel: string;
    noteBookVersion: string;
    testDataSets: string;
    testDatasetBCHash: string;
    trainDataSets: string;
    trainDatasetBCHash: string;
    artifacts: string;
    aiModelBcHash?: string;
    codeVersion: string;
    codeRepo: string;
    comment: string;
    versionStatus: string;
    status: boolean;
    project: string;
    entryUser: string;
    recordDate: Date;
}
