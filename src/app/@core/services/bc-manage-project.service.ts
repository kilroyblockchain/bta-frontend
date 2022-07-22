// bc-project
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants';
import { IAppResponse } from '../interfaces/app-response.interface';
import { IBcManageProject, IBcManageProjectVersion, IBcModelReviewHistory, IBcProjectHistory, IBcProjectVersionHistory } from '../interfaces/bc-manage-project.interface';
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
}
