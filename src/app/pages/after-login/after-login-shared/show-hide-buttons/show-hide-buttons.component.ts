import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-show-hide-buttons',
    templateUrl: './show-hide-buttons.component.html',
    styleUrls: ['./show-hide-buttons.component.scss']
})
export class ShowHideButtonsComponent implements OnInit {
    @Input() isHidden = true;
    @Input()
    loading!: boolean;
    @Output() isCardHidden = new EventEmitter();

    ngOnInit(): void {
        this.isHidden = this.isHidden ?? true;
    }

    collapseChart(collapse: boolean): void {
        this.isHidden = collapse;
        this.isCardHidden.emit(this.isHidden);
    }
}
