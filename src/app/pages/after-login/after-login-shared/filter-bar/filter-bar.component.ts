import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UtilsService } from 'src/app/@core/services';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';

@Component({
    selector: 'app-filter-bar',
    templateUrl: './filter-bar.component.html'
})
export class FilterBarComponent {
    @Input()
    totalRecords!: number;
    @Input()
    dataFound!: boolean;
    @Input()
    filterLabel!: string;
    @Input()
    paginateId!: string;
    @Input()
    recordType!: string;
    @Output() toggleTableEmit = new EventEmitter();
    @Output() searchValue = new EventEmitter();
    @Output() pageChanged = new EventEmitter();
    toggleStatusFilter = true;
    resultperpage = this.utilsService.getResultsPerPage();

    constructor(private utilsService: UtilsService) {}

    toggleTable(): void {
        this.toggleTableEmit.emit();
    }

    onSearch(event: ISearchQuery): void {
        this.searchValue.emit(event);
    }

    pageChange(event: number): void {
        this.pageChanged.emit(event);
    }
}
