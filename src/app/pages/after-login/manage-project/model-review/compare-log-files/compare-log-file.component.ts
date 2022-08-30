import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { NbRouteTab } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, ManageProjectService } from 'src/app/@core/services';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-compare-log-files',
    template: `
        <nb-card>
            <nb-card-body>
                <nb-route-tabset [tabs]="tabs" fullWidth></nb-route-tabset>
            </nb-card-body>
            <ng-container *ngIf="isAIEngineerTab === 'true'; else MLOPsBlock">
                <nb-card-body>
                    <ng-container *ngIf="lastAIExperimentID && lastMLOPsExperimentID">
                        <app-common-compare-log-files [versionId]="versionId" [lastAIExperimentID]="lastAIExperimentID" [lastMLOPsExperimentID]="lastMLOPsExperimentID" [queryParams]="queryParams"> </app-common-compare-log-files>
                    </ng-container>
                </nb-card-body>
            </ng-container>
            <ng-template #MLOPsBlock>
                <nb-card-body>
                    <ng-container *ngIf="lastAIExperimentID && lastMLOPsExperimentID">
                        <app-common-compare-log-files [versionId]="reviewedModelId" [lastAIExperimentID]="lastAIExperimentID" [lastMLOPsExperimentID]="lastMLOPsExperimentID" [queryParams]="queryParams"></app-common-compare-log-files>
                    </ng-container>
                </nb-card-body>
            </ng-template>
            <div *ngIf="!mlopsExpData && !mlopsLoading">
                <app-data-not-found></app-data-not-found>
            </div>
            <div *ngIf="!aiExpData && !aiLoading">
                <app-data-not-found></app-data-not-found>
            </div>
        </nb-card>
    `
})
export class CompareLogFilesComponent implements OnInit {
    versionId!: string;
    reviewedModelId!: string;

    page!: number;
    options: { [key: string]: unknown } = {};

    isAIEngineerTab!: string;

    aiLoading!: boolean;
    aiExpData!: boolean;
    mlopsLoading!: boolean;
    mlopsExpData!: boolean;

    lastAIExperimentID!: string;
    lastMLOPsExperimentID!: string;

    queryParams!: Params;

    constructor(private activeRoute: ActivatedRoute, private translate: TranslateService, private manageProjectService: ManageProjectService, private authService: AuthService) {
        this.versionId = this.activeRoute.snapshot.params['versionId'];
        this.reviewedModelId = this.activeRoute.snapshot.params['reviewId'];

        this.activeRoute.queryParams.subscribe((params) => {
            this.isAIEngineerTab = params['aiEngineer'];
            this.queryParams = params;
        });
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
        this.options = { ...this.options, page: this.page, limit: Number.MAX_SAFE_INTEGER, subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.getAIEngLastExperiment();
        this.getMLOPsLastExperiment();
    }

    getAIEngLastExperiment(): void {
        this.aiExpData = false;
        this.aiLoading = true;

        this.manageProjectService
            .getAllVersionExp(this.options, this.versionId)
            .pipe(
                finalize(() => {
                    this.aiLoading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    const { data } = res;
                    if (data.total) {
                        this.lastAIExperimentID = data.docs[data.docs.length - 1]?._id;
                        this.aiExpData = true;
                    } else {
                        this.aiExpData = false;
                    }
                },
                error: () => {
                    this.aiExpData = false;
                }
            });
    }

    getMLOPsLastExperiment(): void {
        this.mlopsExpData = false;
        this.mlopsLoading = true;

        this.manageProjectService
            .getAllVersionExp(this.options, this.reviewedModelId)
            .pipe(
                finalize(() => {
                    this.mlopsLoading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    const { data } = res;
                    if (data.total) {
                        this.lastMLOPsExperimentID = data.docs[data.docs.length - 1]?._id;
                        this.mlopsExpData = true;
                    } else {
                        this.mlopsExpData = false;
                    }
                },
                error: () => {
                    this.mlopsExpData = false;
                }
            });
    }
}
