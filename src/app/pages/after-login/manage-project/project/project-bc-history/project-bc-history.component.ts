import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { IBcProject, IProjectBcHistory } from 'src/app/@core/interfaces/bc-manage-project.interface';
import { BcManageProjectService, UtilsService } from 'src/app/@core/services';

interface TreeNode<T> {
    data: T;
}

interface FSEntry {
    txId: string;
    txDateTime: Date;
    isDeleted: boolean;
    name: string;
    domain: string;
    details: string;
    members: string[];
    entryUser: string;
}

@Component({
    selector: 'app-project-bc-history',
    templateUrl: './project-bc-history.component.html'
})
export class ProjectBcHistoryComponent implements OnInit {
    dataSource!: NbTreeGridDataSource<FSEntry>;
    private data: TreeNode<FSEntry>[] = [];

    projectBcDetails!: IBcProject;

    columns!: Array<string>;
    columnNameKeys!: Array<string>;
    columnsName: Array<string> = [];

    totalRecords = 0;
    dataFound!: boolean;
    loading!: boolean;

    tableData!: Array<IProjectBcHistory>;
    loadingTable!: boolean;

    constructor(private activeRoute: ActivatedRoute, public utilsService: UtilsService, private translate: TranslateService, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private bcManageProjectService: BcManageProjectService) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    ngOnInit(): void {
        const projectId = this.activeRoute.snapshot.params['id'];
        this.getProjectBcDetails(projectId);
        this.getProjectBcHistory(projectId);
        this.setTranslatedTableColumns();
    }

    setTranslatedTableColumns(): void {
        this.columns = ['txId', 'txDateTime', 'isDeleted', 'entryUser', 'name', 'domain', 'members', 'details'];
        this.columnNameKeys = [
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.TX_ID',
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.TX_DATE_TIME',
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.IS_DELETED',
            'COMMON.COLUMN_NAME.CREATED_BY',
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_NAME',
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_DOMAIN',
            'MANAGE_PROJECTS.PROJECT.LABEL.MEMBERS',
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_DETAILS'
        ];

        this.translate.get(this.columnNameKeys).subscribe((data: object) => {
            this.columnsName = Object.values(data);
        });
    }
    getProjectBcDetails(projectId: string): void {
        this.loading = true;
        this.bcManageProjectService
            .getProjectBcDetails(projectId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        const { data } = res.data;
                        this.projectBcDetails = data;
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

    getProjectBcHistory(projectId: string): void {
        this.bcManageProjectService.getProjectBcHistory(projectId).subscribe({
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

    createTableData(data: IProjectBcHistory[]): void {
        this.data = [];

        for (const item of data) {
            this.data.push({
                data: {
                    txId: item.txId,
                    txDateTime: item.project.recordDate,
                    isDeleted: item.isDeleted,
                    name: item.project.name,
                    domain: item.project.domain,
                    details: item.project.detail,
                    members: item.project.members,
                    entryUser: item.project.entryUser
                }
            });
            this.dataSource = this.dataSourceBuilder.create(this.data);
        }
    }

    formatTxId(txId: string): string {
        return txId.substring(0, 7) + '...' + txId.substring(txId.length - 7);
    }
}
