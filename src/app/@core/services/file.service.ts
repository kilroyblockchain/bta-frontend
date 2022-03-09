import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FILE_TYPE } from 'src/app/@core/constants';

@Injectable({ providedIn: 'root' })
export class FileService {
    constructor(private http: HttpClient) {}

    getPublicAssetAsBlob(path: string): Observable<any> {
        return this.http.get(path, { responseType: 'blob' });
    }

    getFileTypeTitleByExtension(fileExtension: string): string {
        if (fileExtension) {
            for (const key in FILE_TYPE) {
                if (FILE_TYPE[key].extensions.includes(fileExtension)) {
                    return FILE_TYPE[key].title;
                }
            }
        }
        return FILE_TYPE['PLAIN'].title;
    }

    getFileTypeTitleByType(fileType: string): string {
        if (fileType) {
            for (const key in FILE_TYPE) {
                if (new RegExp(FILE_TYPE[key].types.join('|')).test(fileType)) {
                    return FILE_TYPE[key].title;
                }
            }
        }
        return FILE_TYPE['PLAIN'].title;
    }
}
