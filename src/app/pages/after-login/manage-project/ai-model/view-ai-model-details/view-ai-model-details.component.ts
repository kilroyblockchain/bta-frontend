import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { IAiModel, IEpochs, IExp, IHyperParameters, ITestMetrics } from 'src/app/@core/interfaces/manage-project.interface';
import { AuthService, ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-view-ai-model-details',
    templateUrl: './view-ai-model-details.component.html',
    styleUrls: ['./view-ai-model-details.component.scss']
})
export class ViewAiModelDetailsComponent implements OnInit {
    experimentInfo!: IAiModel;
    experiment!: IExp;
    hyperparameterData!: IHyperParameters;
    testMetricsData!: ITestMetrics;
    epochData!: { [key: string]: IEpochs };

    loading!: boolean;
    dataFound!: boolean;

    constructor(private activeRoute: ActivatedRoute, private location: Location, public utilsService: UtilsService, private manageProjectService: ManageProjectService, private authService: AuthService) {}

    ngOnInit(): void {
        this.getAiLogsData();
    }

    getAiLogsData(): void {
        const experimentId = this.activeRoute.snapshot.params['id'];
        this.getExperimentInfo(experimentId);
        this.getExperimentDetails(experimentId);
    }

    getExperimentInfo(experimentId: string): void {
        this.dataFound = false;

        this.manageProjectService.getExperimentInfo(experimentId).subscribe({
            next: (res) => {
                if (res && res.success) {
                    const { data } = res;
                    this.experimentInfo = data;
                    this.dataFound = true;
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
                            this.hyperparameterData = expData.exp.hyperparameters;
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

    back(): void {
        this.location.back();
    }
}
