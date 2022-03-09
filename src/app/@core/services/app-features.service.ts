import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { URLConstant } from '../constants/url.constant';

@Injectable({ providedIn: 'root' })
export class AppFeatureService {
    constructor(private readonly http: HttpService) {}

    findFeatureByUserSubscription(subscriptionType: string): Observable<any> {
        return this.http.get(URLConstant.getFeatureOfUserSubscription + `/${subscriptionType}`);
    }
}
