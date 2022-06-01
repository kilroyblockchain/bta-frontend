import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants/url.constant';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class LogPageService {
    constructor(private http: HttpService) {}

    getLogStreams(): Observable<any> {
        return this.http.get(URLConstant.getLogFileStreamURL, {}, { formType: 'blob' });
    }
}
