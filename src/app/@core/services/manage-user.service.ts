import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserLoginCount } from 'src/app/pages/after-login/after-login-shared/login-summary/login-count.interface';
import { IUserActivity } from 'src/app/pages/after-login/manage-users/user-activity-log/user-activity.interface';
import { IStaffUserFormData } from 'src/app/pages/after-login/manage-users/user/manage-user.interface';
import { IUserActionRow } from 'src/app/pages/after-login/super-admin/users/user.interface';
import { URLConstant } from '../constants/url.constant';
import { IAppResponse, IPaginateResult } from '../interfaces/app-response.interface';
import { ICreateUnit, IOrganizationUnit, IStaffing } from '../interfaces/manage-user.interface';
import { IUserRes } from '../interfaces/user-data.interface';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class ManageUserService {
    constructor(private readonly http: HttpService) {}

    createOrganizationUnit(data: ICreateUnit): Observable<IAppResponse<IOrganizationUnit>> {
        return this.http.post(URLConstant.createOrganizationUnit, data);
    }

    getAllOrganizationUnitOfOrganization(defaultSubscriptionType: string): Observable<IAppResponse<IOrganizationUnit[]>> {
        return this.http.get(URLConstant.getAllOrganizationUnitOfOrganization + `/${defaultSubscriptionType}`);
    }

    getUnitsByCompanyId(companyId: string, query: { [key: string]: unknown }): Observable<IAppResponse<IPaginateResult<IOrganizationUnit>>> {
        return this.http.get(URLConstant.getUnitsByCompanyId + `/${companyId}`, query);
    }

    getOrganizationUnitById(unitId: string): Observable<IAppResponse<IOrganizationUnit>> {
        return this.http.get(URLConstant.getOrganizationUnitById + `/${unitId}`);
    }

    updateOrganizationUnit(data: ICreateUnit, organizationUnitId: string): Observable<IAppResponse<IOrganizationUnit>> {
        return this.http.put(URLConstant.updateOrganizationUnit + `/${organizationUnitId}`, data);
    }

    deleteOrganizationUnit(organizationUnitId: string): Observable<IAppResponse<IOrganizationUnit>> {
        return this.http.delete(URLConstant.deleteOrganizationUnit + `/${organizationUnitId}`);
    }

    enableOrganizationUnit(organizationUnitId: string): Observable<IAppResponse<IOrganizationUnit>> {
        return this.http.put(URLConstant.enableOrganizationUnit + `/${organizationUnitId}`);
    }

    getAllUserOfOrganization(query: { [key: string]: unknown }): Observable<IAppResponse<IPaginateResult<IUserRes>>> {
        return this.http.get(URLConstant.getAllUserOfOrganization, query);
    }

    getAllUserActivityOfOrganization(query: { [key: string]: unknown }): Observable<IAppResponse<IPaginateResult<IUserActivity>>> {
        return this.http.get(URLConstant.getAllUserActivityOfOrganization, query);
    }

    getAllUsersLoginCount(): Observable<IAppResponse<IUserLoginCount>> {
        return this.http.get(URLConstant.getAllUsersLoginCount);
    }

    editUserForOrganization(userId: string, data: IStaffUserFormData): Observable<IAppResponse<IUserRes>> {
        return this.http.put(URLConstant.updateOrganizationUser + `/${userId}`, data);
    }

    disableOrganizationUser(data: Partial<IStaffUserFormData>): Observable<IAppResponse<void>> {
        return this.http.put(URLConstant.deleteOrganizationUser, data);
    }

    enableOrganizationUser(data: Partial<IUserActionRow>): Observable<IAppResponse<void>> {
        return this.http.put(URLConstant.enableOrganizationUser, data);
    }

    deleteStaffingById(id: string): Observable<IAppResponse<IStaffing>> {
        return this.http.delete(URLConstant.createStaffingURL + '/' + id);
    }

    enableOrganizationStaffing(organizationStaffingId: string): Observable<IAppResponse<IStaffing>> {
        return this.http.put(URLConstant.enableOrganizationStaffing + `/${organizationStaffingId}`);
    }

    unblockCompanyUser(userId: string): Observable<IAppResponse<void>> {
        return this.http.put(URLConstant.unblockCompanyUser + `/${userId}`);
    }
}
