import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants';
import { IAppResponse, IPaginateResult } from '../interfaces/app-response.interface';
import { IAiArtifactsModel, IAiModel, IAiModelExp, IModelReview, IMonitoringReport, IMonitoringStatus, IProject, IProjectVersion } from '../interfaces/manage-project.interface';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class ManageProjectService {
    constructor(private readonly http: HttpService) {}

    getAllProject(query: { [key: string]: unknown }): Observable<IAppResponse<IPaginateResult<IProject>>> {
        return this.http.get(URLConstant.getAllProjectURL, query);
    }

    addNewProject(data: IProject): Observable<IAppResponse<IProject>> {
        return this.http.post(URLConstant.createProjectURL, data);
    }

    updateProject(data: IProject, projectId: string): Observable<IAppResponse<IProject>> {
        return this.http.put(URLConstant.updateProjectURL + `/${projectId}`, data);
    }

    deleteProject(projectId: string): Observable<IAppResponse<IProject>> {
        return this.http.delete(URLConstant.deleteProjectURL + `/${projectId}`);
    }

    enableProject(projectId: string): Observable<IAppResponse<IProject>> {
        return this.http.patch(URLConstant.enableProjectURL + `/${projectId}`);
    }

    addVersion(versionData: IProjectVersion, projectId: string): Observable<IAppResponse<IProjectVersion>> {
        return this.http.post(URLConstant.addProjectVersionURL + `/${projectId}`, versionData);
    }

    getVersionInfo(versionId: string): Observable<IAppResponse<IProjectVersion>> {
        return this.http.get(URLConstant.getVersionInfoURL + `/${versionId}`);
    }

    getVersionReports(versionId: string): Observable<IAppResponse<IPaginateResult<IMonitoringReport>>> {
        return this.http.get(URLConstant.getVersionReportsURL + `/${versionId}`);
    }

    addVersionReports(versionId: string, data: FormData, hasFormData = true): Observable<IAppResponse<IMonitoringReport>> {
        return this.http.post(URLConstant.versionReportsURL + `/${versionId}`, data, hasFormData);
    }

    getVersionReportStatus(): Observable<IAppResponse<IMonitoringStatus[]>> {
        return this.http.get(URLConstant.getVersionReportStatusURL);
    }

    getAllVersionExp(query: { [key: string]: unknown }, versionId: string): Observable<IAppResponse<IPaginateResult<IAiModel>>> {
        return this.http.get(URLConstant.getVersionAllExpURL + `/${versionId}`, query);
    }

    getExperimentDetails(experimentId: string): Observable<IAppResponse<IAiModelExp[]>> {
        return this.http.get(URLConstant.getExperimentDetailsURL + `/${experimentId}`);
    }

    getExperimentInfo(experimentId: string): Observable<IAppResponse<IAiModel>> {
        return this.http.get(URLConstant.getExperimentInfoURL + `/${experimentId}`);
    }

    addModelReview(versionId: string, data: FormData, hasFormData = true): Observable<IAppResponse<IModelReview>> {
        return this.http.post(URLConstant.modelReviewURL + `/${versionId}`, data, hasFormData);
    }

    getModelReview(query: { [key: string]: unknown }, versionId: string): Observable<IAppResponse<IPaginateResult<IModelReview>>> {
        return this.http.get(URLConstant.modelReviewURL + `/${versionId}`, query);
    }

    addNewModelReview(versionData: IProjectVersion, projectId: string): Observable<IAppResponse<IProjectVersion>> {
        return this.http.post(URLConstant.addNewModelReviewURL + `/${projectId}`, versionData);
    }

    addPurpose(projectId: string, data: FormData, hasFormData: boolean): Observable<IAppResponse<IProject>> {
        return this.http.post(URLConstant.addProjectPurposeURL + `/${projectId}`, data, hasFormData);
    }

    canAddProject(query: { [key: string]: unknown }): Observable<IAppResponse<boolean>> {
        return this.http.get(URLConstant.canAddProjectURL, query);
    }

    submitModelVersion(versionId: string): Observable<IAppResponse<IProjectVersion>> {
        return this.http.patch(URLConstant.submitModelVersionURL + `/${versionId}`);
    }

    updateVersion(versionData: IProjectVersion, versionId: string): Observable<IAppResponse<IProjectVersion>> {
        return this.http.put(URLConstant.updateModelVersionURL + `/${versionId}`, versionData);
    }

    getDefaultBucketUrl(projectId: string): Observable<IAppResponse<string>> {
        return this.http.get(URLConstant.getDefaultBucketURL + `/${projectId}`);
    }

    getLogFileBcHash(versionId: string): Observable<IAppResponse<IProjectVersion>> {
        return this.http.get(URLConstant.getLogFileBcHashURL + `/${versionId}`);
    }

    getTestDataBcHash(versionId: string): Observable<IAppResponse<void>> {
        return this.http.get(URLConstant.getTestDataSetsBcHashURL + `/${versionId}`);
    }

    getTrainDataSetsBcHash(versionId: string): Observable<IAppResponse<void>> {
        return this.http.get(URLConstant.getTrainDataSetsBcHashURL + `/${versionId}`);
    }

    getAiModelBcHash(versionId: string): Observable<IAppResponse<void>> {
        return this.http.get(URLConstant.getAiModelBcHashUrl + `/${versionId}`);
    }

    getAllExperimentDetails(versionId: string): Observable<IAppResponse<Array<IAiModelExp[]>>> {
        return this.http.get(URLConstant.getAllExperimentDetailsURL + `/${versionId}`);
    }

    getAllArtifactsModel(query: { [key: string]: unknown }, versionId: string): Observable<IAppResponse<IPaginateResult<IAiArtifactsModel>>> {
        return this.http.get(URLConstant.getAllArtifactsModelURL + `/${versionId}`, query);
    }

    getArtifactModelOracleBcHash(expId: string): Observable<IAppResponse<string>> {
        return this.http.get(URLConstant.getArtifactModelOracleHashURL + `/${expId}`);
    }

    getArtifactModelDetails(expId: string): Observable<IAppResponse<string>> {
        return this.http.get(URLConstant.getArtifactModelDetailsURL + `/${expId}`);
    }

    updateMlopsReviewedVersion(data: IProjectVersion, versionId: string): Observable<IAppResponse<IProjectVersion>> {
        return this.http.put(URLConstant.updateMlopsReviewedVersionURL + `/${versionId}`, data);
    }

    canMlopsEditReviewedVersion(versionId: string): Observable<IAppResponse<boolean>> {
        return this.http.get(URLConstant.canMlopsEditReviewedVersionURL + `/${versionId}`);
    }

    isErrorInReviewedModel(versionId: string): Observable<IAppResponse<boolean>> {
        return this.http.get(URLConstant.isErrorInReviewedModelURL + `/${versionId}`);
    }
}
