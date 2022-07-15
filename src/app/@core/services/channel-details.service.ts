import { IChannelDetails } from 'src/app/@core/interfaces/channel-details.interface';
import { ICreateUnit } from '../interfaces/manage-user.interface';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants/url.constant';
import { HttpService } from './http.service';
import { IAppResponse, IPaginateResult } from '../interfaces/app-response.interface';

@Injectable({ providedIn: 'root' })
export class ManageChannelDetailsService {
    constructor(private readonly http: HttpService) {}

    getAllChannel(query: { [key: string]: unknown }): Observable<IAppResponse<IPaginateResult<IChannelDetails>>> {
        return this.http.get(URLConstant.getAllChannelDetails, query);
    }

    createChannelDetails(data: ICreateUnit): Observable<IAppResponse<IChannelDetails>> {
        return this.http.post(URLConstant.createChannelDetails, data);
    }

    deleteChannelDetails(channelId: string): Observable<IAppResponse<IChannelDetails>> {
        return this.http.delete(URLConstant.deleteChannelDetails + `/${channelId}`);
    }

    updateChannel(data: ICreateUnit, channelId: string): Observable<IAppResponse<IChannelDetails>> {
        return this.http.put(URLConstant.updateChannelDetails + `/${channelId}`, data);
    }
}
