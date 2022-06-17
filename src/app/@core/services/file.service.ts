import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URLConstant } from '../constants';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class FileService {
    constructor(private http: HttpService) {}

    getFileFromFolder(folderFilePath: string): Observable<Blob> {
        return this.http.get(URLConstant.getFileFromFolderURL + `/${folderFilePath}`, {}, { formType: 'blob' });
    }
}
