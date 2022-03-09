import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const BASE_URL = environment.apiURL;

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    constructor(private http: HttpClient) {}

    get(URL: string, query?: any, formType?: any): any {
        return this.http.get(BASE_URL + URL, this.getHeaderWithParams(query, formType)).pipe(catchError(this.errorHandle));
    }

    post(URL: string, body?: any, formData?: boolean): Observable<any> {
        return this.http.post(BASE_URL + URL, body, this.getHeader(formData)).pipe(catchError(this.errorHandle));
    }

    put(URL: string, body?: any, formData?: boolean): Observable<any> {
        return this.http.put(BASE_URL + URL, body, this.getHeader(formData)).pipe(catchError(this.errorHandle));
    }

    delete(URL: string, query?: any): Observable<any> {
        return this.http.delete(BASE_URL + URL, this.getHeaderWithParams(query)).pipe(catchError(this.errorHandle));
    }

    getHeader(formData?: boolean): any {
        if (formData) {
            return this.getFormDataHeader();
        }
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
    }

    getFormDataHeader(): any {
        return { headers: new HttpHeaders({}) };
    }

    getBlobHeader(): any {
        return { responseType: 'blob' };
    }

    getTextHeader(): any {
        return { responseType: 'text' };
    }

    getHeaderWithParams(paramsData: { [key: string]: any }, formType?: any): any {
        let options: any;
        let params = new HttpParams();
        if (paramsData) {
            for (const param of Object.keys(paramsData)) {
                params = params.append(param, paramsData[param]);
            }
        }
        if (formType && formType.formType === 'text') {
            options = this.getTextHeader();
        } else if (formType && formType.formType === 'blob') {
            options = this.getBlobHeader();
        } else {
            options = this.getHeader(false);
        }
        options.params = params;
        return options;
    }

    errorHandle(error: any): any {
        if (error.error && error.error.statusCode) {
            return throwError(() => error.error);
        } else {
            let errorMessage = '';
            if (error.error instanceof ErrorEvent) {
                errorMessage = error.error.error;
            } else {
                errorMessage = `Error Code: ${error.status}\nMessage: ${error.error}`;
            }
            return throwError(() => errorMessage);
        }
    }
}
