import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, interval, startWith, Subscription, switchMap } from 'rxjs';
import { IBcExperimentHistoryData, IBcArtifactModelDetails } from 'src/app/@core/interfaces/bc-manage-project.interface';
import { IAiModel, IEpochs, IExp, ITestMetrics } from 'src/app/@core/interfaces/manage-project.interface';
import { BcManageProjectService, ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-log-experiment-details',
    templateUrl: './log-experiment-details.component.html',
    styleUrls: ['./log-experiment-details.scss']
})
export class ViewLogExperimentDetailsComponent implements OnInit, OnDestroy {
    experimentInfo!: IAiModel;
    experiment!: IExp;
    testMetricsData!: ITestMetrics;
    lastExperimentTestMetricsData!: ITestMetrics;
    epochData!: { [key: string]: IEpochs };

    loading!: boolean;
    dataFound!: boolean;

    experimentLogsLoading!: boolean;
    lastExperimentLogsLoading!: boolean;

    experimentOracleBCHash!: string;
    isAIEngineer!: string;

    experimentBcHistory!: IBcExperimentHistoryData;
    lastExperimentBcHistory!: IBcExperimentHistoryData;

    timeIntervalArtifactModelSets!: Subscription;
    artifactModelOracleHash!: string;
    artifactModelBcDetails!: IBcArtifactModelDetails;

    artifactModelOracleHashLoading!: boolean;
    artifactModelBcHashLoading!: boolean;

    experimentBcHistoryData!: boolean;
    experimentBcHistoryLoading!: boolean;

    lastExperimentBcHistoryData!: boolean;
    lastExperimentBcHistoryLoading!: boolean;

    isDataAvailable!: boolean;

    constructor(private activeRoute: ActivatedRoute, private bcManageProjectService: BcManageProjectService, public utilsService: UtilsService, private manageProjectService: ManageProjectService) {}

    ngOnInit(): void {
        this.isDataAvailable = true;

        this.getAiLogsData();
    }

    getAiLogsData(): void {
        const experimentId = this.activeRoute.snapshot.params['id'];
        const lastExperimentId = this.activeRoute.snapshot.params['lastExperimentId'];

        this.activeRoute.queryParams.subscribe((params) => {
            this.isAIEngineer = params['aiEngineer'];
        });

        this.getExperimentDetails(experimentId);

        this.getExperimentOracleBcHash(experimentId);
        this.getLastExperimentDetails(lastExperimentId);

        this.getExperimentBcHistory(experimentId);
        this.getLastExperimentBcHistory(lastExperimentId);

        if (this.isAIEngineer === 'true') {
            this.getArtifactModelDetails(experimentId);
        }
    }

    ngOnDestroy(): void {
        this.timeIntervalArtifactModelSets ? this.timeIntervalArtifactModelSets.unsubscribe() : null;
    }

    getExperimentDetails(experimentId: string): void {
        this.loading = true;
        this.dataFound = false;

        this.manageProjectService
            .getExperimentDetails(experimentId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        const { data } = res;
                        for (const expData of data) {
                            this.experiment = expData.exp;
                            this.testMetricsData = expData.exp.test_metrics;
                            this.epochData = expData.exp.epochs;
                        }
                        this.dataFound = true;
                    } else {
                        this.dataFound = false;
                        this.isDataAvailable = false;
                    }
                },
                error: () => {
                    this.dataFound = false;
                    this.isDataAvailable = false;
                }
            });
    }

    getExperimentOracleBcHash(expId: string): void {
        this.experimentLogsLoading = true;

        this.bcManageProjectService
            .getExperimentOracleBcHash(expId)
            .pipe(
                finalize(() => {
                    this.experimentLogsLoading = false;
                })
            )
            .subscribe((res) => {
                if (res && res.success) {
                    this.experimentOracleBCHash = res.data;
                } else {
                    this.isDataAvailable = false;
                }
            });
    }

    getLastExperimentDetails(experimentId: string): void {
        this.lastExperimentLogsLoading = true;
        this.dataFound = false;

        this.manageProjectService
            .getExperimentDetails(experimentId)
            .pipe(
                finalize(() => {
                    this.lastExperimentLogsLoading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        const { data } = res;
                        for (const expData of data) {
                            this.lastExperimentTestMetricsData = expData.exp.test_metrics;
                        }
                        this.dataFound = true;
                    } else {
                        this.dataFound = false;
                        this.isDataAvailable = false;
                    }
                },
                error: () => {
                    this.dataFound = false;
                    this.isDataAvailable = false;
                }
            });
    }

    getExperimentBcHistory(expId: string): void {
        this.experimentBcHistoryData = false;
        this.experimentBcHistoryLoading = true;

        this.bcManageProjectService
            .getExperimentBcHistory(expId)
            .pipe(
                finalize(() => {
                    this.experimentBcHistoryLoading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        const { data } = res;
                        this.experimentBcHistory = data.data.data[0];
                        this.experimentBcHistoryData = true;
                    } else {
                        this.experimentBcHistoryData = false;
                        this.isDataAvailable = false;
                    }
                },
                error: () => {
                    this.experimentBcHistoryData = false;
                    this.isDataAvailable = false;
                }
            });
    }

    getLastExperimentBcHistory(expId: string): void {
        this.lastExperimentBcHistoryData = false;
        this.lastExperimentBcHistoryLoading = true;

        this.bcManageProjectService.getExperimentBcHistory(expId).subscribe({
            next: (res) => {
                if (res && res.success) {
                    const { data } = res;
                    this.lastExperimentBcHistory = data.data.data[0];
                    this.lastExperimentBcHistoryData = true;
                } else {
                    this.lastExperimentBcHistoryData = false;
                    this.isDataAvailable = false;
                }
            },
            error: () => {
                this.lastExperimentBcHistoryData = false;
                this.isDataAvailable = false;
            }
        });
    }

    getArtifactModelDetails(experimentId: string): void {
        this.artifactModelBcHashLoading = true;
        this.artifactModelOracleHashLoading = true;

        this.manageProjectService.getArtifactModelDetails(experimentId).subscribe((res) => {
            if (res && res.success) {
                const { data } = res;
                this.getArtifactModelOracleBcHash(data);
                this.getArtifactModelBcDetails(data);
            } else {
                this.isDataAvailable = false;
            }
        });
    }

    getArtifactModelOracleBcHash(modelId: string): void {
        this.manageProjectService.getArtifactModelOracleBcHash(modelId).subscribe((res) => {
            const artifactModelHashId = res.data;

            this.timeIntervalArtifactModelSets = interval(5000)
                .pipe(
                    startWith(0),
                    switchMap(() => this.bcManageProjectService.getOracleDataHash(artifactModelHashId))
                )
                .pipe(
                    finalize(() => {
                        this.artifactModelOracleHashLoading = false;
                    })
                )
                .subscribe((res) => {
                    const { data } = res;
                    if (data.hash) {
                        this.artifactModelOracleHash = data.hash;
                        this.timeIntervalArtifactModelSets.unsubscribe();
                        this.bcManageProjectService.deleteOracleDataHash(artifactModelHashId).subscribe();
                    }
                });
        });
    }

    getArtifactModelBcDetails(modelId: string): void {
        this.bcManageProjectService
            .getArtifactModelBcDetails(modelId)
            .pipe(
                finalize(() => {
                    this.artifactModelBcHashLoading = false;
                })
            )
            .subscribe((res) => {
                if (res && res.success) {
                    const { data } = res;
                    this.artifactModelBcDetails = data.data;
                } else {
                    this.isDataAvailable = false;
                }
            });
    }
}
