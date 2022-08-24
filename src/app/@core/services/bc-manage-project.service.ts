import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants';
import { IAppResponse } from '../interfaces/app-response.interface';
import { IAIModelTempHash, IBcArtifactModelDataHistory, IBcArtifactModelDetailsData, IBcExperimentData, IBcExperimentDataHistory, IBcManageProject, IBcManageProjectVersion, IBcModelReviewHistory, IBcProjectHistory, IBcProjectVersionHistory } from '../interfaces/bc-manage-project.interface';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class BcManageProjectService {
    constructor(private readonly http: HttpService) {}

    getProjectBcDetails(projectId: string): Observable<IAppResponse<IBcManageProject>> {
        return this.http.get(URLConstant.getProjectBcDetailsURL + `/${projectId}`);
    }

    getProjectBcHistory(projectId: string): Observable<IAppResponse<IBcProjectHistory>> {
        return this.http.get(URLConstant.getProjectBcHistoryURL + `/${projectId}`);
    }

    getProjectVersionBcDetails(versionId: string): Observable<IAppResponse<IBcManageProjectVersion>> {
        return this.http.get(URLConstant.getProjectVersionBcDetailsURL + `/${versionId}`);
    }

    getProjectVersionBcHistory(versionId: string): Observable<IAppResponse<IBcProjectVersionHistory>> {
        return this.http.get(URLConstant.getProjectVersionBcHistoryURL + `/${versionId}`);
    }

    getModelReviewBcHistory(versionId: string): Observable<IAppResponse<IBcModelReviewHistory>> {
        return this.http.get(URLConstant.getModelReviewBcHistoryURL + `/${versionId}`);
    }

    getLogFileOracleBcHash(versionId: string): Observable<IAppResponse<string>> {
        return this.http.get(URLConstant.getLogFilesOracleBcHashURL + `/${versionId}`);
    }

    getTestDataOracleBcHash(versionId: string): Observable<IAppResponse<string>> {
        return this.http.get(URLConstant.getTestDataOracleBcHashURL + `/${versionId}`);
    }

    getTrainDataOracleBcHash(versionId: string): Observable<IAppResponse<string>> {
        return this.http.get(URLConstant.getTrainDataOracleBcHashURL + `/${versionId}`);
    }

    getAIModelOracleBcHash(versionId: string): Observable<IAppResponse<string>> {
        return this.http.get(URLConstant.getAIModelOracleBcHashURL + `/${versionId}`);
    }

    getExperimentOracleBcHash(experimentId: string): Observable<IAppResponse<string>> {
        return this.http.get(URLConstant.getExperimentOracleBcHashURL + `/${experimentId}`);
    }

    downloadExperimentLogFile(experimentId: string): Observable<IAppResponse<string>> {
        return this.http.get(URLConstant.downloadExperimentOracleFileURL + `/${experimentId}`);
    }

    getOracleDataHash(hashId: string): Observable<IAppResponse<IAIModelTempHash>> {
        return this.http.get(URLConstant.getOracleDataHashURL + `/${hashId}`);
    }

    deleteOracleDataHash(hashId: string): Observable<IAppResponse<IAIModelTempHash>> {
        return this.http.delete(URLConstant.deleteOracleDataHashURL + `/${hashId}`);
    }

    getExperimentBcDetails(experimentId: string): Observable<IAppResponse<IBcExperimentData>> {
        return this.http.get(URLConstant.getModelExperimentBcDetailsURL + `/${experimentId}`);
    }

    getExperimentBcHistory(experimentId: string): Observable<IAppResponse<IBcExperimentDataHistory>> {
        return this.http.get(URLConstant.getModelExperimentBcHistoryURL + `/${experimentId}`);
    }

    getArtifactModelBcHistory(modelId: string): Observable<IAppResponse<IBcArtifactModelDataHistory>> {
        return this.http.get(URLConstant.getArtifactModelBcHistoryURL + `/${modelId}`);
    }

    getArtifactModelBcDetails(modelId: string): Observable<IAppResponse<IBcArtifactModelDetailsData>> {
        return this.http.get(URLConstant.getArtifactModelBcDetailsURL + `/${modelId}`);
    }
}
