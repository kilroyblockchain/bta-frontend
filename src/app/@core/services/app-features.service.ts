import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { URLConstant } from '../constants/url.constant';
import { IAppResponse } from '../interfaces/app-response.interface';
import { IFeature } from '../interfaces/manage-user.interface';

@Injectable({ providedIn: 'root' })
export class AppFeatureService {
    constructor(private readonly http: HttpService) {}

    findFeatureByUserSubscription(subscriptionType: string): Observable<IAppResponse<IFeature[]>> {
        return this.http.get(URLConstant.getFeatureOfUserSubscription + `/${subscriptionType}`);
    }
}
