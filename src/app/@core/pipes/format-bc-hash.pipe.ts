import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatBcHash'
})
export class FormatBcHashPipe implements PipeTransform {
    transform(hash: string): string {
        if (hash) {
            return hash.substring(0, 15) + '...' + hash.substring(hash.length - 15);
        }
        return '';
    }
}
