import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants';
import { IAppResponse, IPaginateResult } from '../interfaces/app-response.interface';
import { IAiModel, IAiModelExp, IModelReview, IMonitoringReport, IProject, IProjectVersion } from '../interfaces/manage-project.interface';
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
        return this.http.get(URLConstant.versionReportsURL + `/${versionId}`);
    }

    addVersionReports(versionId: string, data: FormData, hasFormData = true): Observable<IAppResponse<IMonitoringReport>> {
        return this.http.post(URLConstant.versionReportsURL + `/${versionId}`, data, hasFormData);
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

    canAddProject(query: { [key: string]: unknown }): Observable<IAppResponse<boolean>> {
        return this.http.get(URLConstant.canAddProjectURL, query);
    }
}
