import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants';
import { IAppResponse, IPaginateResult } from '../interfaces/app-response.interface';
import { IBcNodeInfo } from '../interfaces/bc-node-info.interface';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class BlockChainService {
    constructor(private readonly http: HttpService) {}

    getAllBcInfo(query: { [key: string]: unknown }): Observable<IAppResponse<IPaginateResult<IBcNodeInfo>>> {
        return this.http.get(URLConstant.getAllBcNodeInfoURL, query);
    }

    addBcNodeInfo(data: IBcNodeInfo): Observable<IAppResponse<IBcNodeInfo>> {
        return this.http.post(URLConstant.addBcNodeInfoURL, data);
    }

    updateBcNodeInfo(data: IBcNodeInfo, bcNodeId: string): Observable<IAppResponse<IBcNodeInfo>> {
        return this.http.put(URLConstant.updateBcNodeInfoURL + `/${bcNodeId}`, data);
    }

    deleteBcNodeInfo(bcNodeId: string): Observable<IAppResponse<IBcNodeInfo>> {
        return this.http.delete(URLConstant.deleteBcNodeInfoURL + `/${bcNodeId}`);
    }

    verifyBcKey(bcKey: string): Observable<IAppResponse<{ bcKey: string }>> {
        return this.http.post(URLConstant.verifyBcKeyURL, bcKey);
    }
}
