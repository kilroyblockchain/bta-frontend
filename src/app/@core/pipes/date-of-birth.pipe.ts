import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateOfBirth'
})
export class DateOfBirthPipe implements PipeTransform {
    public transform(value: any): any {
        try {
            if (value) {
                return formatDate(new Date(new Date(value).getTime() + new Date().getTimezoneOffset() * 60 * 1000), 'yyyy-MM-dd', 'en');
            }
        } catch (err) {
            console.error(err);
        }
        return value;
    }
}
