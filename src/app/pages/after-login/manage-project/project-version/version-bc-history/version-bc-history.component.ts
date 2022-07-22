import { Component, OnInit } from '@angular/core';
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { IBcProjectVersion, IProjectVersionBcHistory } from 'src/app/@core/interfaces/bc-manage-project.interface';
import { BcManageProjectService, UtilsService } from 'src/app/@core/services';
import { finalize } from 'rxjs';

interface TreeNode<T> {
    data: T;
}

interface FSEntry {
    txId: string;
    txDateTime: Date;
    isDeleted: boolean;
    name: string;
    comment: string;
    status: string;
    entryUser: string;
    noteBook: string;
}

@Component({
    selector: 'app-project-version-bc-history',
    templateUrl: './version-bc-history.component.html'
})
export class ProjectVersionBcHistoryComponent implements OnInit {
    dataSource!: NbTreeGridDataSource<FSEntry>;
    private data: TreeNode<FSEntry>[] = [];

    projectVersionBcDetails!: IBcProjectVersion;

    columns!: Array<string>;
    columnNameKeys!: Array<string>;
    columnsName: Array<string> = [];

    totalRecords = 0;
    dataFound!: boolean;
    loading!: boolean;

    tableData!: Array<IProjectVersionBcHistory>;
    loadingTable!: boolean;

    constructor(private activeRoute: ActivatedRoute, public utilsService: UtilsService, private translate: TranslateService, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private bcManageProjectService: BcManageProjectService) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    ngOnInit(): void {
        const versionId = this.activeRoute.snapshot.params['id'];
        this.getProjectVersionBcDetails(versionId);
        this.getProjectVersionBcHistory(versionId);
        this.setTranslatedTableColumns();
    }

    setTranslatedTableColumns(): void {
        this.columns = ['txId', 'txDateTime', 'isDeleted', 'entryUser', 'status', 'comment', 'noteBook'];
        this.columnNameKeys = ['MANAGE_PROJECTS.PROJECT.COLUMN_NAME.TX_ID', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.TX_DATE_TIME', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.IS_DELETED', 'COMMON.COLUMN_NAME.CREATED_BY', 'COMMON.COLUMN_NAME.STATUS', 'MANAGE_PROJECTS.VERSION.COLUMN_NAME.COMMENT', 'MANAGE_PROJECTS.VERSION.COLUMN_NAME.NOTEBOOK_VERSION'];

        this.translate.get(this.columnNameKeys).subscribe((data: object) => {
            this.columnsName = Object.values(data);
        });
    }

    getProjectVersionBcDetails(versionId: string): void {
        this.loading = true;

        this.bcManageProjectService
            .getProjectVersionBcDetails(versionId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        const { data } = res.data;
                        this.projectVersionBcDetails = data;
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

    getProjectVersionBcHistory(versionId: string): void {
        this.bcManageProjectService.getProjectVersionBcHistory(versionId).subscribe({
            next: (res) => {
                const { data } = res.data;
                if (data.length) {
                    this.totalRecords = data?.length;
                    if (!this.totalRecords) {
                        this.dataFound = false;
                    } else {
                        this.dataFound = true;
                    }

                    this.tableData = data;
                    this.createTableData(this.tableData);
                } else {
                    this.totalRecords = 0;
                }
            },
            error: () => {
                this.dataFound = false;
            }
        });
    }

    createTableData(data: IProjectVersionBcHistory[]): void {
        this.data = [];

        for (const item of data) {
            this.data.push({
                data: {
                    txId: item.txId,
                    txDateTime: item.modelVersion.recordDate,
                    isDeleted: item.isDeleted,
                    name: item.modelVersion.versionName,
                    status: item.modelVersion.versionStatus,
                    comment: item.modelVersion.comment,
                    entryUser: item.modelVersion.entryUser,
                    noteBook: item.modelVersion.noteBookVersion
                }
            });
            this.dataSource = this.dataSourceBuilder.create(this.data);
        }
    }

    formatTxId(txId: string): string {
        return txId.substring(0, 7) + '...' + txId.substring(txId.length - 7);
    }
}
