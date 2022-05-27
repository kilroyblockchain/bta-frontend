import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-blockchain-verified',
    templateUrl: './blockchain-verified.component.html',
    styleUrls: ['./blockchain-verified.component.scss']
})
export class BlockchainVerifiedComponent implements OnInit {
    @Input()
    blockName!: string;
    @Input()
    blockchainVerified!: boolean | undefined;
    @Input()
    tooltip!: string;
    @Input()
    showOnline!: boolean;

    ngOnInit(): void {
        this.blockchainVerified = this.blockchainVerified ?? false;
    }
}
