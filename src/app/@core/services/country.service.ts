import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants/url.constant';
import { IAppResponse } from '../interfaces/app-response.interface';
import { ICountry, IState } from '../interfaces/country.interface';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class CountryService {
    constructor(private http: HttpService) {}

    getAllCountries(): Observable<IAppResponse<ICountry[]>> {
        return this.http.get(URLConstant.getAllCountries);
    }

    getStatesByCountryId(countryId: string): Observable<IAppResponse<IState[]>> {
        return this.http.get(URLConstant.getStatesByCountryId + `/${countryId}`);
    }

    getCountryDetailByCountryId(countryId: string): Observable<IAppResponse<ICountry>> {
        return this.http.get(URLConstant.getCountryDetailBYCountryId + `/${countryId}`);
    }

    getStateDetailById(stateId: string): Observable<IAppResponse<IState>> {
        return this.http.get(URLConstant.getStateDetailById + `/${stateId}`);
    }
}
