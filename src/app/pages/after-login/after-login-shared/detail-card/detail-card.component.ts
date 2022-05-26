import { Component, Input } from '@angular/core';
import { IDetailCard } from './detail-card.interface';

@Component({
    selector: 'app-detail-card',
    templateUrl: './detail-card.component.html',
    styleUrls: ['./detail-card.component.scss']
})
export class DetailCardComponent {
    @Input()
    detail!: IDetailCard;
    loading!: boolean;
}
