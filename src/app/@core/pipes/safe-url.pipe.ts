import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'safeURL'
})
export class SafeURLPipe implements PipeTransform {
    constructor(protected sanitizer: DomSanitizer) {}

    public transform(value: any): any {
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }
}
