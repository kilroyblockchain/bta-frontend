import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
    selector: 'app-show-hide-embed-buttons',
    templateUrl: './show-hide-embed-buttons.component.html',
    styleUrls: ['./show-hide-embed-buttons.component.scss']
})
export class ShowHideEmbedButtonsComponent {
    isHidden = true;
    @Input()
    loading!: boolean;
    @Output() displayEmbedLink = new EventEmitter();
    @Output() isChartHidden = new EventEmitter();
    @Input()
    hideEmbed!: boolean;

    collapseChart(collapse: boolean): void {
        this.isHidden = collapse;
        this.isChartHidden.emit(this.isHidden);
    }

    displayEmbedDialog(): void {
        this.displayEmbedLink.emit();
    }
}
