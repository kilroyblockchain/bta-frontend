import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants/url.constant';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class ManageUserService {
    constructor(private readonly http: HttpService) {}

    createOrganizationUnit(data: any): Observable<any> {
        return this.http.post(URLConstant.createOrganizationUnit, data);
    }

    getAllOrganizationUnitOfOrganization(defaultSubscriptionType: string): Observable<any> {
        return this.http.get(URLConstant.getAllOrganizationUnitOfOrganization + `/${defaultSubscriptionType}`);
    }

    getUnitsByCompanyId(companyId: string, query: any): Observable<any> {
        return this.http.get(URLConstant.getUnitsByCompanyId + `/${companyId}`, query);
    }

    getOrganizationUnitById(unitId: string): Observable<any> {
        return this.http.get(URLConstant.getOrganizationUnitById + `/${unitId}`);
    }

    updateOrganizationUnit(data: any, organizationUnitId: string): Observable<any> {
        return this.http.put(URLConstant.updateOrganizationUnit + `/${organizationUnitId}`, data);
    }

    deleteOrganizationUnit(organizationUnitId: string): Observable<any> {
        return this.http.delete(URLConstant.deleteOrganizationUnit + `/${organizationUnitId}`);
    }

    enableOrganizationUnit(organizationUnitId: string): Observable<any> {
        return this.http.put(URLConstant.enableOrganizationUnit + `/${organizationUnitId}`);
    }

    getAllUserOfOrganization(query: any): Observable<any> {
        return this.http.get(URLConstant.getAllUserOfOrganization, query);
    }

    getAllUserActivityOfOrganization(query: any): Observable<any> {
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
