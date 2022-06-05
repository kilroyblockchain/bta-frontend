import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants';
import { IAppResponse, IPaginateResult } from '../interfaces/app-response.interface';
import { IProject } from '../interfaces/manage-project.interface';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class ManageProjectService {
    constructor(private readonly http: HttpService) {}

    getAllProject(query: { [key: string]: unknown }): Observable<IAppResponse<IPaginateResult<IProject>>> {
        return this.http.get(URLConstant.getAllProjectURL, query);
    }
}
