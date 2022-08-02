import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbRouteTab } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-compare-log-files',
    template: `
        <nb-card>
            <nb-card-body>
                <nb-route-tabset [tabs]="tabs" fullWidth></nb-route-tabset>
            </nb-card-body>
            <ng-container *ngIf="isAIEngineerTab === 'true'; else MLOPsBlock">
                <nb-card-body>
                    <app-common-compare-log-files [versionId]="versionId"> </app-common-compare-log-files>
                </nb-card-body>
            </ng-container>
            <ng-template #MLOPsBlock>
                <nb-card-body>
                    <app-common-compare-log-files [versionId]="reviewedModelId"></app-common-compare-log-files>
                </nb-card-body>
            </ng-template>
        </nb-card>
    `
})
export class CompareLogFilesComponent implements OnInit {
    versionId!: string;
    reviewedModelId!: string;

    isAIEngineerTab!: string;
    constructor(private activeRoute: ActivatedRoute, private translate: TranslateService) {
        this.versionId = this.activeRoute.snapshot.params['versionId'];
        this.reviewedModelId = this.activeRoute.snapshot.params['reviewId'];
    }

    tabs: NbRouteTab[] = [
        {
            title: this.translate.instant('MANAGE_PROJECTS.COMMON.LABEL.AI_ENGINEER'),
            responsive: true,
            route: ['./'],
            queryParams: { aiEngineer: 'true' }
        },
        {
            title: this.translate.instant('MANAGE_PROJECTS.COMMON.LABEL.MLOPS_ENGINEER'),
            responsive: true,
            route: ['./'],
            queryParams: { aiEngineer: 'false' }
        }
    ];

    ngOnInit(): void {
        this.activeRoute.queryParams.subscribe((params) => {
            this.isAIEngineerTab = params['aiEngineer'];
        });
    }
}
