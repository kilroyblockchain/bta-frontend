import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-data-not-found',
    templateUrl: './data-not-found.component.html',
    styleUrls: ['../miscellaneous.component.scss']
})
export class DataNotFoundComponent implements OnInit {
    @Input()
    type!: string;

    ngOnInit(): void {
        if (!this.type) {
            this.type = 'data';
        }
    }
}
