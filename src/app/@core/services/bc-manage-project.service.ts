// bc-project
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants';
import { IAppResponse } from '../interfaces/app-response.interface';
import { IBcManageProject, IBcProjectHistory } from '../interfaces/bc-manage-project.interface';
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
}
