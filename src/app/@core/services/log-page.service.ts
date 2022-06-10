import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants/url.constant';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class LogPageService {
    constructor(private http: HttpService) {}

    getLogs(): Observable<string[]> {
        return this.http.get(URLConstant.getLogFilesURL);
    }

    getLogFile(filename: string): Observable<any> {
        return this.http.get(URLConstant.getLogFilesURL + `/${filename}`, {}, { formType: 'blob' });
    }
}
