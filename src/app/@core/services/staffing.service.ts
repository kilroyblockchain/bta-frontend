import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { URLConstant } from '../constants/url.constant';
import { IAppResponse } from '../interfaces/app-response.interface';
import { ICreateStaff, IStaffing } from '../interfaces/manage-user.interface';

@Injectable({
    providedIn: 'root'
})
export class StaffingService {
    constructor(private http: HttpService) {}

    createNewStaffing(data: ICreateStaff): Observable<IAppResponse<IStaffing>> {
        return this.http.post(URLConstant.createStaffingURL, data);
    }

    getOrganizationUnitStaffing(unitId: string): Observable<IAppResponse<IStaffing[]>> {
        return this.http.get(URLConstant.getUnitStaffingURL + '/' + unitId);
    }

    getStaffingById(id: string): Observable<any> {
        return this.http.get(URLConstant.createStaffingURL + '/' + id);
    }

    updateStaffingById(id: string, data: any): Observable<any> {
        return this.http.put(URLConstant.createStaffingURL + '/' + id, data);
    }

    getOrganizationUnitsByCompanyId(): Observable<any> {
        return this.http.get(URLConstant.getOrganizationUnitURL);
    }
}
