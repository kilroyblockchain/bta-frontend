import { Component, Input, OnInit } from '@angular/core';
import { Params, Router } from '@angular/router';
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { IAiModel, IProjectVersion, ITestMetrics } from 'src/app/@core/interfaces/manage-project.interface';
import { AuthService, BcManageProjectService, ManageProjectService, UtilsService } from 'src/app/@core/services';

interface TreeNode<T> {
    data: T;
}

interface FSEntry {
    expId_No: string;
    action: unknown;
    subrow: boolean;
    _id: string;
}

@Component({
    selector: 'app-common-compare-log-files',
    templateUrl: './common-compare-log-file.component.html',
    styleUrls: ['./common-compare-log-file.component.scss']
})
export class CommonCompareLogFilesComponent implements OnInit {
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

    aiExperimentLoading!: boolean;
    mlopsExperimentLoading!: boolean;

    columns!: Array<string>;
    columnNameKeys!: Array<string>;
    columnsName: Array<string> = [];
    tableData!: Array<IAiModel>;
    loadingTable!: boolean;

    aiTestMetricsData!: ITestMetrics;
    mlopsTestMetricsData!: ITestMetrics;

    @Input() versionId!: string;
    @Input() lastAIExperimentID!: string;
    @Input() lastMLOPsExperimentID!: string;
    @Input() queryParams!: Params;

    constructor(private router: Router, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private translate: TranslateService, public utilsService: UtilsService, private manageProjectService: ManageProjectService, private authService: AuthService, private bcManageProjectService: BcManageProjectService) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    ngOnInit(): void {
        this.pageChange(1);
        this.setTranslatedTableColumns();
        this.retrieveLastAIExperimentDetails();
        this.retrieveLastMLOPsExperimentDetails();
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { ...this.options, page: this.page, limit: this.resultperpage, subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.getVersionData(this.versionId);
    }

    getVersionData(versionId: string): void {
        this.retrieveAllVersionLogs(versionId);
        this.retrieveVersionData(versionId);
    }

    setTranslatedTableColumns(): void {
        this.columns = ['expId_No', 'action'];
        this.columnNameKeys = ['MANAGE_PROJECTS.AI_MODEL.COLUMN_NAME.EXP_ID', 'COMMON.COLUMN_NAME.ACTION'];

        this.translate.get(this.columnNameKeys).subscribe((data: object) => {
            this.columnsName = Object.values(data);
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
                            this.logsData = true;
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
                    action: { ...item },
                    subrow: false
                }
            });
            this.dataSource = this.dataSourceBuilder.create(this.data);
        }
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

    downloadExperimentLogFile(expId: string): void {
        this.bcManageProjectService.downloadExperimentLogFile(expId).subscribe((res) => {
            if (res) {
                window.open(res.data);
            }
        });
    }

    viewExperimentDetails(rowId: string): void {
        const URL = '/u/manage-project/log-file-experiment-details';

        if (this.queryParams['aiEngineer'] === 'true') {
            this.router.navigate([URL, rowId, this.lastMLOPsExperimentID], { queryParams: this.queryParams });
        } else {
            this.router.navigate([URL, rowId, this.lastAIExperimentID], { queryParams: this.queryParams });
        }
    }

    retrieveLastAIExperimentDetails(): void {
        this.aiExperimentLoading = true;
        this.dataFound = false;

        this.manageProjectService
            .getExperimentDetails(this.lastAIExperimentID)
            .pipe(
                finalize(() => {
                    this.aiExperimentLoading = false;
                })
            )
            .subscribe((res) => {
                if (res && res.success) {
                    const { data } = res;
                    for (const expData of data) {
                        this.aiTestMetricsData = expData.exp.test_metrics;
                    }
                    this.dataFound = true;
                } else {
                    this.dataFound = false;
                }
            });
    }

    retrieveLastMLOPsExperimentDetails(): void {
        this.mlopsExperimentLoading = true;
        this.dataFound = false;

        this.manageProjectService
            .getExperimentDetails(this.lastMLOPsExperimentID)
            .pipe(
                finalize(() => {
                    this.mlopsExperimentLoading = false;
                })
            )
            .subscribe((res) => {
                if (res && res.success) {
                    const { data } = res;
                    for (const expData of data) {
                        this.mlopsTestMetricsData = expData.exp.test_metrics;
                    }

                    this.dataFound = true;
                } else {
                    this.dataFound = false;
                }
            });
    }
}
