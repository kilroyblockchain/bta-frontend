import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-blockchain-verified',
    templateUrl: './blockchain-verified.component.html',
    styleUrls: ['./blockchain-verified.component.scss']
})
export class BlockchainVerifiedComponent {
    @Input()
    blockName!: string;
    @Input()
    blockchainVerified!: boolean;
    @Input()
    tooltip!: string;
    @Input()
    showOnline!: boolean;
    constructor() {}
}
