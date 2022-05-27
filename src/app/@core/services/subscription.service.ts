import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants/url.constant';
import { IAppResponse } from '../interfaces/app-response.interface';
import { ICountry } from '../interfaces/country.interface';
import { ISubscription } from '../interfaces/subscription.interface';
import { HttpService } from './http.service';

export interface ISubscriptionAndCountryList {
    subscriptionList: ISubscription[];
    countryList: ICountry[];
}
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
    constructor(private readonly http: HttpService) {}

    getAllSubscription(fetchCountry = false): Observable<IAppResponse<ISubscription[] | ISubscriptionAndCountryList>> {
        if (fetchCountry) {
            return this.http.get(URLConstant.getAllSubscription, { fetchCountry: true });
        }
        return this.http.get(URLConstant.getAllSubscription);
    }
}
