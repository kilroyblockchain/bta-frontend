import { environment } from './../../../environments/environment';
import { throwError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

const BASE_URL = environment.apiURL;

@Injectable({
    providedIn: 'root'
})
export class CreateDataService {
    constructor() {}

    public getPrintData(data: any): Observable<any>[] {
        const printArray = [];
        try {
            if (!!data) {
                for (let index = 0; index < data.length - 1; index++) {
                    const row = data[index].split(',');
                    for (let rowcount = 0; rowcount < row.length; rowcount++) {
                        printArray.push(new QuestionAnswerMapping(data[0].split(',')[rowcount], data[index + 1].split(',')[rowcount].trim()));
                    }
                }
            }
            return printArray;
        } catch (e) {
            console.log(e);
        }
    }

    errorHandle(error): any {
        if (error.message) {
            return throwError(() => error);
        }
    }
}

export class QuestionAnswerMapping {
    title: string;
    value: string;

    constructor(title: string, value: string) {
        this.title = title;
        this.value = value;
    }
}
