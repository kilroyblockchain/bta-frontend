import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, interval, startWith, Subscription, switchMap } from 'rxjs';
import { IBcProjectVersion } from 'src/app/@core/interfaces/bc-manage-project.interface';
import { BcManageProjectService } from 'src/app/@core/services';

@Component({
    selector: 'app-common-verify-bc-hash',
    templateUrl: './common-verify-bc-hash.html',
    styleUrls: ['./common-verify-bc-hash.scss']
})
export class CommonVerifyBcHashComponent implements OnInit, OnDestroy {
    @Input()
    modelVersionBcDetails!: IBcProjectVersion;

    dataFound!: boolean;
    loading!: boolean;

    logFileOracleBCHash!: string;
    testDataOracleBcHash!: string;
    trainDataOracleBcHash!: string;
    aiModelOracleBcHash!: string;

    logFileLoading!: boolean;
    testDataLoading!: boolean;
    trainDataLoading!: boolean;
    aiModelLoading!: boolean;

    timeIntervalTestDataSets!: Subscription;
    timeIntervalTrainDataSets!: Subscription;
    timeIntervalAIModel!: Subscription;

    constructor(private activeRoute: ActivatedRoute, private bcManageProjectService: BcManageProjectService) {}

    ngOnInit(): void {
        this.getVersionData();
    }

    getVersionData(): void {
        const versionId = this.activeRoute.snapshot.params['id'];

        this.getLogFileOracleBcHash(versionId);
        this.getTestDataOracleBcHash(versionId);
        this.getTrainDataOracleBcHash(versionId);
        this.getAIModelOracleBcHash(versionId);
    }

    ngOnDestroy(): void {
        this.timeIntervalTestDataSets ? this.timeIntervalTestDataSets.unsubscribe() : null;
        this.timeIntervalTrainDataSets ? this.timeIntervalTrainDataSets.unsubscribe() : null;
        this.timeIntervalAIModel ? this.timeIntervalAIModel.unsubscribe() : null;
    }

    getLogFileOracleBcHash(versionId: string): void {
        this.logFileLoading = true;

        this.bcManageProjectService
            .getLogFileOracleBcHash(versionId)
            .pipe(
                finalize(() => {
                    this.logFileLoading = false;
                })
            )
            .subscribe((res) => {
                this.logFileOracleBCHash = res.data;
            });
    }

    getTestDataOracleBcHash(versionId: string): void {
        this.testDataLoading = true;

        this.bcManageProjectService.getTestDataOracleBcHash(versionId).subscribe((res) => {
            const testDataHashId = res.data;

            this.timeIntervalTestDataSets = interval(5000)
                .pipe(
                    startWith(0),
                    switchMap(() => this.bcManageProjectService.getOracleDataHash(testDataHashId))
                )
                .pipe(
                    finalize(() => {
                        this.testDataLoading = false;
                    })
                )
                .subscribe((res) => {
                    const { data } = res;
                    if (data.hash) {
                        this.testDataOracleBcHash = data.hash;
                        this.timeIntervalTestDataSets.unsubscribe();
                        this.bcManageProjectService.deleteOracleDataHash(testDataHashId).subscribe();
                    }
                });
        });
    }

    getTrainDataOracleBcHash(versionId: string): void {
        this.trainDataLoading = true;

        this.bcManageProjectService.getTrainDataOracleBcHash(versionId).subscribe((res) => {
            const trainDataHashId = res.data;

            this.timeIntervalTrainDataSets = interval(5000)
                .pipe(
                    startWith(0),
                    switchMap(() => this.bcManageProjectService.getOracleDataHash(trainDataHashId))
                )
                .pipe(
                    finalize(() => {
                        this.trainDataLoading = false;
                    })
                )
                .subscribe((res) => {
                    const { data } = res;
                    if (data.hash) {
                        this.trainDataOracleBcHash = data.hash;
                        this.timeIntervalTrainDataSets.unsubscribe();

                        this.bcManageProjectService.deleteOracleDataHash(trainDataHashId).subscribe();
                    }
                });
        });
    }

    getAIModelOracleBcHash(versionId: string): void {
        this.aiModelLoading = true;

        this.bcManageProjectService.getAIModelOracleBcHash(versionId).subscribe((res) => {
            const aiModelHashId = res.data;

            this.timeIntervalAIModel = interval(5000)
                .pipe(
                    startWith(0),
                    switchMap(() => this.bcManageProjectService.getOracleDataHash(aiModelHashId))
                )
                .pipe(
                    finalize(() => {
                        this.aiModelLoading = false;
                    })
                )
                .subscribe((res) => {
                    const { data } = res;
                    if (data.hash) {
                        this.aiModelOracleBcHash = data.hash;
                        this.timeIntervalAIModel.unsubscribe();
                        this.bcManageProjectService.deleteOracleDataHash(aiModelHashId).subscribe();
                    }
                });
        });
    }
}
