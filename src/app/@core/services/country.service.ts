import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants/url.constant';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class CountryService {
    constructor(private http: HttpService) {}

    getAllCountries(): Observable<any> {
        return this.http.get(URLConstant.getAllCountries);
    }

    getStatesByCountryId(countryId: string): Observable<any> {
        return this.http.get(URLConstant.getStatesByCountryId + `/${countryId}`);
    }

    getCountryDetailByCountryId(countryId: string): Observable<any> {
        return this.http.get(URLConstant.getCountryDetailBYCountryId + `/${countryId}`);
    }

    getStateDetailById(stateId: string): Observable<any> {
        return this.http.get(URLConstant.getStateDetailById + `/${stateId}`);
    }
}
