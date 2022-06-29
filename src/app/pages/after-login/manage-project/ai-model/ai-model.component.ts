import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbDialogService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { ACCESS_TYPE, FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { IAiModel, IProjectVersion } from 'src/app/@core/interfaces/manage-project.interface';
import { AuthService, ManageProjectService, UtilsService } from 'src/app/@core/services';

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
    templateUrl: './ai-model.component.html'
})
export class AiModelComponent implements OnInit {
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

    constructor(private activeRoute: ActivatedRoute, private router: Router, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private translate: TranslateService, public utilsService: UtilsService, private dialogService: NbDialogService, private manageProjectService: ManageProjectService, private authService: AuthService) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    ngOnInit(): void {
        this.pageChange(1);
        this.setTranslatedTableColumns();
        this.checkAccess();
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { ...this.options, page: this.page, limit: this.resultperpage, subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.getVersionData();
    }

    async checkAccess(): Promise<void> {
        this.canViewReview = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MODEL_REVIEWS, [ACCESS_TYPE.READ]);
    }

    navigateTo(URL: string, id: string): void {
        this.router.navigate([URL, id]);
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
}
