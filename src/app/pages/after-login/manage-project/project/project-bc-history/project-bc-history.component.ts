import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { IBcProject, IBcProjectVersion, IProjectBcHistory, IPurposeDetails } from 'src/app/@core/interfaces/bc-manage-project.interface';
import { BcManageProjectService, FileService, UtilsService } from 'src/app/@core/services';

interface TreeNode<T> {
    data: T;
}

interface FSEntry {
    txId: string;
    txDateTime: Date;
    domain: string;
    details: string;
    purpose: IPurposeDetails;
    members: string[];
    entryUser: string;
    modelVersions: IBcProjectVersion[];
}

@Component({
    selector: 'app-project-bc-history',
    templateUrl: './project-bc-history.component.html',
    styles: [
        `
            .version-bc-history {
                text-decoration: none;
                cursor: pointer;
            }
            .docs {
                cursor: pointer;
                margin: 2px;
                text-decoration: none;
            }
        `
    ]
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

    constructor(private activeRoute: ActivatedRoute, private router: Router, public utilsService: UtilsService, private readonly fileService: FileService, private translate: TranslateService, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private bcManageProjectService: BcManageProjectService) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    ngOnInit(): void {
        const projectId = this.activeRoute.snapshot.params['id'];
        this.getProjectBcDetails(projectId);
        this.getProjectBcHistory(projectId);
        this.setTranslatedTableColumns();
    }

    setTranslatedTableColumns(): void {
        this.columns = ['txId', 'txDateTime', 'entryUser', 'domain', 'modelVersions', 'purpose', 'details', 'members'];
        this.columnNameKeys = [
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.TX_ID',
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.TX_DATE_TIME',
            'COMMON.COLUMN_NAME.CREATED_BY',
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_DOMAIN',
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.MODEL_VERSION_NAME',
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_PURPOSE',
            'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_DETAILS',
            'MANAGE_PROJECTS.PROJECT.LABEL.MEMBERS'
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
                    purpose: item.project.purposeDetail,
                    domain: item.project.domain,
                    details: item.project.detail,
                    members: item.project.members,
                    entryUser: item.project.entryUser,
                    modelVersions: item.project.modelVersions
                }
            });
            this.dataSource = this.dataSourceBuilder.create(this.data);
        }
    }

    formatTxId(txId: string): string {
        return txId.substring(0, 7) + '...' + txId.substring(txId.length - 7);
    }

    vewVersionBChistory(versionId: string): void {
        const URL = 'u/manage-project/model-review-bc-history';
        this.router.navigate([URL, versionId]);
    }

    openDocs(filePath: string, fileName: string): void {
        this.fileService.getFileFromFolder(filePath).subscribe((file: Blob) => {
            if (file['type'].split('/')[0] === 'image' || file['type'].split('/')[1] === 'pdf') {
                const urlCreator = window.URL || window.webkitURL;
                const url = urlCreator.createObjectURL(file);
                window.open(url);
                urlCreator.revokeObjectURL(url);
            } else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([file], { type: file.type }));
                a.download = fileName;
                a.click();
            }
        });
    }
}
