import { Component, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UtilsService } from 'src/app/@core/services';
import { ISearchQuery } from './search-query.interface';

@Component({
    selector: 'app-search-input',
    template: `
        <input #search nbInput [(ngModel)]="searchQuery" fieldSize="small" (ngModelChange)="onChangeSearchQuery($event)" class="search-input" [placeholder]="'COMMON.PLACEHOLDER.SEARCH' | translate" />
        <button nbButton hero status="primary" size="small" (click)="utilsService.resetFilter(search)" [translate]="'COMMON.BUTTON.RESET_FILTER'">Reset Filter</button>
    `
})
export class SearchInputComponent {
    @Output() search: EventEmitter<ISearchQuery> = new EventEmitter<ISearchQuery>();
    searchQuery!: string;
    searchStringChanged: Subject<string> = new Subject<string>();
    constructor(public utilsService: UtilsService) {
        this.searchStringChanged.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
            this.search.emit({ search: searchString ? true : false, searchValue: searchString });
        });
    }

    onChangeSearchQuery(queryString: string): void {
        this.searchStringChanged.next(queryString);
    }
}
