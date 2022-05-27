import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants/url.constant';
import { IAppResponse } from '../interfaces/app-response.interface';
import { HttpService } from './http.service';

export interface IBCChannelDetail {
    _id: string;
    channelName: string;
    connectionProfileName: string;
    isDefault: boolean;
    status: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class BCChannelService {
    constructor(private http: HttpService) {}

    getDefaultChannel(): Observable<IAppResponse<IBCChannelDetail>> {
        return this.http.get(URLConstant.channelDetailBaseURL + '/default');
    }
}
