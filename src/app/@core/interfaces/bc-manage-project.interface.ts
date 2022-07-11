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
}

export interface IProjectBcHistory {
    isDeleted: boolean;
    txId: string;
    project: IBcProject;
}
