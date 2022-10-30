import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbDialogService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { finalize, interval, startWith, Subscription, switchMap } from 'rxjs';
import { ACCESS_TYPE, FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { IAiModel, IProjectVersion, OracleBucketDataStatus, VersionStatus } from 'src/app/@core/interfaces/manage-project.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, ManageProjectService, UtilsService } from 'src/app/@core/services';
import { AlertComponent } from 'src/app/pages/miscellaneous/alert/alert.component';

interface TreeNode<T> {
    data: T;
}

interface FSEntry {
    expId_No: string;
    date: Date;
    detail?: string;
    log?: string;
    dataset?: string;
    action: unknown;
    subrow: boolean;
    _id: string;
}

@Component({
    selector: 'app-ai-model',
    templateUrl: './ai-model.component.html',
    styleUrls: ['./ai-model.component.scss']
})
export class AiModelComponent implements OnInit, OnDestroy {
    private data: TreeNode<FSEntry>[] = [];
    dataSource!: NbTreeGridDataSource<FSEntry>;

    versionData!: IProjectVersion;

    page!: number;
    options: { [key: string]: unknown } = {};
    resultperpage = this.utilsService.getResultsPerPage();
    dataFound!: boolean;
    logsData!: boolean;
    totalRecords = 0;
    loading!: boolean;

    columns!: Array<string>;
    columnNameKeys!: Array<string>;
    columnsName: Array<string> = [];
    tableData!: Array<IAiModel>;
    loadingTable!: boolean;

    canViewReview!: boolean;
    isModelStatusDraft!: boolean;
    isUserCanSubmitVersion!: boolean;
    isModelStatusMlopsReview!: boolean;

    user!: IUserRes;

    oracleBucketDataStatus = OracleBucketDataStatus;
    confirmSubmitModelDialogClose!: Subscription;
    viewVerifyBcHashClose!: Subscription;

    timeIntervalTestDataSets!: Subscription;
    timeIntervalTrainDataSets!: Subscription;
    timeIntervalAIModel!: Subscription;

    constructor(private activeRoute: ActivatedRoute, private router: Router, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private translate: TranslateService, public utilsService: UtilsService, private manageProjectService: ManageProjectService, private authService: AuthService, private dialogService: NbDialogService) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    ngOnInit(): void {
        this.pageChange(1);
        this.setTranslatedTableColumns();
        this.checkAccess();
    }

    ngOnDestroy(): void {
        this.confirmSubmitModelDialogClose ? this.confirmSubmitModelDialogClose.unsubscribe() : null;
        this.viewVerifyBcHashClose ? this.viewVerifyBcHashClose.unsubscribe() : null;

        this.timeIntervalTestDataSets ? this.timeIntervalTestDataSets.unsubscribe() : null;
        this.timeIntervalTrainDataSets ? this.timeIntervalTrainDataSets.unsubscribe() : null;
        this.timeIntervalAIModel ? this.timeIntervalAIModel.unsubscribe() : null;
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { ...this.options, page: this.page, limit: this.resultperpage, subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.getVersionData();
    }

    async checkAccess(): Promise<void> {
        this.canViewReview = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MODEL_REVIEWS, [ACCESS_TYPE.READ]);
    }

    getVersionUser(user: IUserRes): void {
        this.user = this.authService.getUserDataSync();
        this.isUserCanSubmitVersion = user._id === this.user.id;
    }

    navigateTo(URL: string, id: string): void {
        this.router.navigate([URL, id]);
    }

    checkCanSubmitVersionModel(): boolean {
        if (this.isUserCanSubmitVersion && this.versionData && this.isModelStatusDraft && this.versionData.logFileBCHash && this.versionData.trainDatasetBCHash && this.versionData.trainDatasetBCHash && this.versionData.aiModelBcHash) {
            return true;
        } else {
            return false;
        }
    }

    checkModelStatus(versionStatus: string): void {
        this.isModelStatusDraft = versionStatus === VersionStatus.DRAFT;
        this.isModelStatusMlopsReview = versionStatus === VersionStatus.MLOPS_REVIEW;
    }

    setTranslatedTableColumns(): void {
        this.columns = ['expId_No', 'date', 'action'];
        this.columnNameKeys = ['MANAGE_PROJECTS.AI_MODEL.COLUMN_NAME.EXP_ID', 'MANAGE_PROJECTS.AI_MODEL.COLUMN_NAME.DATE', 'COMMON.COLUMN_NAME.ACTION'];

        this.translate.get(this.columnNameKeys).subscribe((data: object) => {
            this.columnsName = Object.values(data);
        });
    }

    getVersionData(): void {
        const versionId = this.activeRoute.snapshot.params['id'];
        this.retrieveVersionData(versionId);
        this.retrieveAllVersionLogs(versionId);
    }

    retrieveVersionData(versionId: string): void {
        this.loading = true;
        this.dataFound = false;

        this.manageProjectService
            .getVersionInfo(versionId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        const { data } = res;
                        if (!data) {
                            this.dataFound = false;
                        } else {
                            this.versionData = data;
                            this.checkModelStatus(this.versionData.versionStatus);
                            this.getVersionUser(this.versionData.createdBy);
                            this.dataFound = true;
                        }
                    } else {
                        this.dataFound = false;
                    }
                },
                error: () => {
                    this.dataFound = false;
                }
            });
    }

    retrieveAllVersionLogs(versionId: string): void {
        this.loading = true;
        this.logsData = false;
        this.loadingTable = true;

        this.manageProjectService
            .getAllVersionExp(this.options, versionId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    const { data } = res;
                    if (data.total) {
                        this.totalRecords = data.total;
                        if (!this.totalRecords) {
                            this.logsData = false;
                        } else {
                            if (this.versionData && this.versionData.logFileStatus.code !== this.oracleBucketDataStatus.FETCHING) {
                                this.logsData = true;
                            }
                        }
                        this.tableData = data.docs;
                        this.createTableData(this.tableData);
                    } else {
                        this.totalRecords = 0;
                        this.loadingTable = false;
                    }
                },
                error: () => {
                    this.totalRecords = 0;
                    this.loadingTable = false;
                }
            });
    }

    createTableData(data: IAiModel[]): void {
        this.data = [];
        for (const item of data) {
            this.data.push({
                data: {
                    _id: item?._id,
                    expId_No: item?.expNo,
                    date: item?.createdAt,
                    action: { ...item },
                    subrow: false
                }
            });

            this.dataSource = this.dataSourceBuilder.create(this.data);
        }
    }

    viewExperimentDetails(rowId: string): void {
        const URL = '/u/manage-project/logs-experiment-detail';
        this.navigateTo(URL, rowId);
    }

    viewModelReviews(modelId: string): void {
        const URL = 'u/manage-project/model-reviews';
        this.navigateTo(URL, modelId);
    }

    submitModelVersion(versionId: string): void {
        const confirmSubmitModelDialogOpen = this.dialogService.open(AlertComponent, {
            context: { alert: false, question: [this.translate.instant('MANAGE_PROJECTS.VERSION.ALERT_MSG.SURE_FOR_SUBMIT_MODEL'), this.translate.instant('MANAGE_PROJECTS.VERSION.ALERT_MSG.NOTE_FOR_SUBMITTING')] },
            hasBackdrop: true,
            closeOnBackdropClick: false
        });
        this.confirmSubmitModelDialogClose = confirmSubmitModelDialogOpen.onClose.subscribe((closeRes) => {
            if (closeRes) {
                this.loading = true;
                this.manageProjectService
                    .submitModelVersion(versionId)
                    .pipe(
                        finalize(() => {
                            this.loading = false;
                        })
                    )
                    .subscribe({
                        next: (res) => {
                            if (res && res.success) {
                                this.utilsService.showToast('success', res.message);
                                this.pageChange(1);
                            } else {
                                this.utilsService.showToast('warning', res.message);
                            }
                        },
                        error: (err) => {
                            this.utilsService.showToast('warning', err.error?.message || err?.message);
                        }
                    });
            }
        });
    }

    getLogFileBcHash(versionId: string): void {
        this.logsData = false;
        this.data = [];
        this.versionData.logFileStatus.code = this.oracleBucketDataStatus.FETCHING;
        this.dataSource = this.dataSourceBuilder.create(this.data);
        this.manageProjectService.getLogFileBcHash(versionId).subscribe((res) => {
            if (res) {
                this.reLoad();
            }
        });
    }

    getTestDataBcHash(versionId: string): void {
        this.versionData.testDatasetStatus.code = this.oracleBucketDataStatus.FETCHING;
        this.manageProjectService.getTestDataBcHash(versionId).subscribe((res) => {
            if (res) {
                this.timeIntervalTestDataSets = interval(2000)
                    .pipe(
                        startWith(0),
                        switchMap(() => this.manageProjectService.getVersionInfo(versionId))
                    )
                    .subscribe({
                        next: (res) => {
                            if (res && res.success) {
                                const { data } = res;
                                if (!data) {
                                    this.dataFound = false;
                                } else {
                                    this.versionData = data;
                                    this.checkModelStatus(this.versionData.versionStatus);
                                    this.getVersionUser(this.versionData.createdBy);
                                    this.dataFound = true;

                                    if (this.versionData.testDatasetStatus.code === this.oracleBucketDataStatus.FETCHED) {
                                        this.timeIntervalTestDataSets.unsubscribe();
                                    }
                                }
                            } else {
                                this.dataFound = false;
                            }
                        },
                        error: () => {
                            this.dataFound = false;
                        }
                    });
            }
        });
    }

    getTrainDataSetsBcHash(versionId: string): void {
        this.versionData.trainDatasetStatus.code = this.oracleBucketDataStatus.FETCHING;
        this.manageProjectService.getTrainDataSetsBcHash(versionId).subscribe((res) => {
            if (res) {
                this.timeIntervalTrainDataSets = interval(2000)
                    .pipe(
                        startWith(0),
                        switchMap(() => this.manageProjectService.getVersionInfo(versionId))
                    )
                    .subscribe({
                        next: (res) => {
                            if (res && res.success) {
                                const { data } = res;
                                if (!data) {
                                    this.dataFound = false;
                                } else {
                                    this.versionData = data;
                                    this.checkModelStatus(this.versionData.versionStatus);
                                    this.getVersionUser(this.versionData.createdBy);
                                    this.dataFound = true;
                                    if (this.versionData.trainDatasetStatus.code === this.oracleBucketDataStatus.FETCHED) {
                                        this.timeIntervalTrainDataSets.unsubscribe();
                                    }
                                }
                            } else {
                                this.dataFound = false;
                            }
                        },
                        error: () => {
                            this.dataFound = false;
                        }
                    });
            }
        });
    }

    getAiModelBcHash(versionId: string): void {
        this.versionData.aiModelStatus.code = this.oracleBucketDataStatus.FETCHING;
        this.manageProjectService.getAiModelBcHash(versionId).subscribe((res) => {
            if (res) {
                this.timeIntervalAIModel = interval(2000)
                    .pipe(
                        startWith(0),
                        switchMap(() => this.manageProjectService.getVersionInfo(versionId))
                    )
                    .subscribe({
                        next: (res) => {
                            if (res && res.success) {
                                const { data } = res;
                                if (!data) {
                                    this.dataFound = false;
                                } else {
                                    this.versionData = data;
                                    this.checkModelStatus(this.versionData.versionStatus);
                                    this.getVersionUser(this.versionData.createdBy);
                                    this.dataFound = true;
                                    if (this.versionData.aiModelStatus.code === this.oracleBucketDataStatus.FETCHED) {
                                        this.timeIntervalAIModel.unsubscribe();
                                    }
                                }
                            } else {
                                this.dataFound = false;
                            }
                        },
                        error: () => {
                            this.dataFound = false;
                        }
                    });
            }
        });
    }

    reLoad(): void {
        window.location.reload();
    }

    formatOracleUrl(txId: string): string {
        return txId.substring(0, 35) + '...' + txId.substring(txId.length - 35);
    }

    formatFetchingInfo(message: string): string {
        return message.charAt(0).toUpperCase() + message.slice(1) + ' ' + this.translate.instant('MANAGE_PROJECTS.COMMON.LABEL.DATA');
    }

    openVerifyBcHashModel(versionId: string): void {
        const URL = '/u/manage-project/verify-bc-hash';
        this.router.navigate([URL, versionId]);
    }
}
