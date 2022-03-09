import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants/url.constant';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
    constructor(private readonly http: HttpService) {}

    getAllSubscription(fetchCountry = false): Observable<any> {
        if (fetchCountry) {
            return this.http.get(URLConstant.getAllSubscription, { fetchCountry: true });
        }
        return this.http.get(URLConstant.getAllSubscription);
    }
}
