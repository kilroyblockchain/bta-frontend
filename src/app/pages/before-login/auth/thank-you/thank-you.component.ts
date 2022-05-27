import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-thank-you',
    templateUrl: './thank-you.component.html',
    styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent {
    appTitle = environment.project;
    subType!: string;
    constructor(private activatedRoute: ActivatedRoute) {
        this.activatedRoute.params.subscribe((params) => {
            this.subType = params['subType'];
        });
    }
}
