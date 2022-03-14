import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserActivity } from 'src/app/pages/after-login/manage-users/user-activity-log/user-activity.interface';
import { URLConstant } from '../constants/url.constant';
import { IAppResponse, IPaginateResult } from '../interfaces/app-response.interface';
import { ICreateUnit, IFeatureAndAccess, IOrganizationUnit } from '../interfaces/manage-user.interface';
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

    getAllUserOfOrganization(query: { [key: string]: unknown }): Observable<IPaginateResult<IUserRes>> {
        return this.http.get(URLConstant.getAllUserOfOrganization, query);
    }

    getAllUserActivityOfOrganization(query: { [key: string]: unknown }): Observable<IPaginateResult<IUserActivity>> {
        return this.http.get(URLConstant.getAllUserActivityOfOrganization, query);
    }

    getAllUsersLoginCount(): Observable<any> {
        return this.http.get(URLConstant.getAllUsersLoginCount);
    }

    editUserForOrganization(userId: string, data: any): Observable<any> {
        return this.http.put(URLConstant.updateOrganizationUser + `/${userId}`, data);
    }

    editTrainingUser(userId: string, data: any, staffingId: string): Observable<any> {
        return this.http.put(URLConstant.updateOrganizationUser + `/${staffingId}/${userId}`, data);
    }

    verifyOrganizationUser(data: any, staffingId = '', enableTrainingUser = false): Observable<any> {
        if (staffingId && enableTrainingUser) {
            return this.http.put(URLConstant.verifyOrganizationUser + `/${staffingId}?enableTrainingUser=${enableTrainingUser}`, data);
        }
        return this.http.put(URLConstant.verifyOrganizationUser, data);
    }

    deleteOrganizationUser(userId: string, staffingId = '', query = {}): Observable<any> {
        if (staffingId) {
            return this.http.delete(URLConstant.deleteOrganizationUser + `/${staffingId}/${userId}`, query);
        }
        return this.http.delete(URLConstant.deleteOrganizationUser + `/${userId}`, query);
    }

    disableorganizationUser(data: any): Observable<any> {
        return this.http.put(URLConstant.deleteOrganizationUser, data);
    }

    enableOrganizationUser(data: any): Observable<any> {
        return this.http.put(URLConstant.enableOrganizationUser, data);
    }

    deleteStaffingById(id: string): Observable<any> {
        return this.http.delete(URLConstant.createStaffingURL + '/' + id);
    }

    enableOrganizationStaffing(organizationStaffingId: string): Observable<any> {
        return this.http.put(URLConstant.enableOrganizationStaffing + `/${organizationStaffingId}`);
    }
}
