import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { IBcProjectVersion } from 'src/app/@core/interfaces/bc-manage-project.interface';
import { IAiModel, IEpochs, IExp, ITestMetrics } from 'src/app/@core/interfaces/manage-project.interface';
import { BcManageProjectService, ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-log-experiment-details',
    templateUrl: './log-experiment-details.component.html',
    styleUrls: ['./log-experiment-details.scss']
})
export class ViewLogExperimentDetailsComponent implements OnInit {
    experimentInfo!: IAiModel;
    experiment!: IExp;
    testMetricsData!: ITestMetrics;
    lastExperimentTestMetricsData!: ITestMetrics;
    epochData!: { [key: string]: IEpochs };

    modelVersionBcDetails!: IBcProjectVersion;

    loading!: boolean;
    dataFound!: boolean;
    versionBcHashFound!: boolean;
    versionBcLoading!: boolean;
    experimentLogsLoading!: boolean;
    lastExperimentLogsLoading!: boolean;

    experimentOracleBCHash!: string;
    isAIEngineer!: string;

    constructor(private activeRoute: ActivatedRoute, private translate: TranslateService, private bcManageProjectService: BcManageProjectService, public utilsService: UtilsService, private manageProjectService: ManageProjectService) {}

    ngOnInit(): void {
        this.getAiLogsData();
    }

    getAiLogsData(): void {
        const experimentId = this.activeRoute.snapshot.params['id'];
        const lastExperimentId = this.activeRoute.snapshot.params['lastExperimentId'];

        this.activeRoute.queryParams.subscribe((params) => {
            this.isAIEngineer = params['aiEngineer'];
        });

        this.getExperimentInfo(experimentId);
        this.getExperimentDetails(experimentId);
        this.getExperimentOracleBcHash(experimentId);
        this.getLastExperimentDetails(lastExperimentId);
    }

    getExperimentInfo(experimentId: string): void {
        this.dataFound = false;

        this.manageProjectService.getExperimentInfo(experimentId).subscribe({
            next: (res) => {
                if (res && res.success) {
                    const { data } = res;
                    this.experimentInfo = data;
                    this.dataFound = true;
                    this.getVersionBcDetails(this.experimentInfo.version._id);
                } else {
                    this.dataFound = true;
                }
            },
            error: () => {
                this.dataFound = false;
            }
        });
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
                    }
                },
                error: () => {
                    this.dataFound = false;
                }
            });
    }

    getVersionBcDetails(versionId: string): void {
        this.versionBcLoading = true;
        this.versionBcHashFound = false;

        this.bcManageProjectService
            .getProjectVersionBcDetails(versionId)
            .pipe(
                finalize(() => {
                    this.versionBcLoading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        const { data } = res.data;
                        this.modelVersionBcDetails = data;
                        this.versionBcHashFound = true;
                    } else {
                        this.versionBcHashFound = false;
                    }
                },
                error: () => {
                    this.versionBcHashFound = false;
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
                if (res) {
                    this.experimentOracleBCHash = res.data;
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
                    }
                },
                error: () => {
                    this.dataFound = false;
                }
            });
    }
}
