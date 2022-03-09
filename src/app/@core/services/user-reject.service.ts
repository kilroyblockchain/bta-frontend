import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants/url.constant';
import { IAppResponse, IPaginateResult } from '../interfaces/app-response.interface';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class UserRejectService {
    constructor(private http: HttpService) {}

    rejectUser(rejectUserDto: any): Observable<IAppResponse<void>> {
        return this.http.post(URLConstant.rejectUser, rejectUserDto);
    }

    getRejectInformationsOfUser(userId: string, paginateOptions: any): Observable<IAppResponse<IPaginateResult<any>>> {
        return this.http.get(URLConstant.rejectUserInformationBaseURL + `/find/${userId}`, paginateOptions);
    }

    allowUser(userId: string): Observable<IAppResponse<void>> {
        return this.http.post(URLConstant.allowUser + `/${userId}`);
    }

    updateRejectInformation(rejectInfoId: string, updatedInfo: any): Observable<IAppResponse<any>> {
        return this.http.put(URLConstant.rejectUserInformationBaseURL + `/${rejectInfoId}`, updatedInfo);
    }
}
