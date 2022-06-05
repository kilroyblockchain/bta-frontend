import { Component, OnInit } from '@angular/core';
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { finalize, Subscription } from 'rxjs';
import { ACCESS_TYPE, FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { IProject } from 'src/app/@core/interfaces/manage-project.interface';
import { AuthService, ManageProjectService, UtilsService } from 'src/app/@core/services';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expended?: boolean;
}

interface FSEntry {
    _id: string;
    name?: string;
    details?: string;
    domain?: string;
    propose?: string;
    createdAt?: Date;
    status?: boolean;
    updatedAt?: Date;
    action?: unknown;
    subrow?: boolean;
}

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html'
})
export class ProjectComponent implements OnInit {
    dataSource!: NbTreeGridDataSource<FSEntry>;
    private data: TreeNode<FSEntry>[] = [];

    totalRecords = 0;
    dataFound!: boolean;
    loading!: boolean;
    toggleStatusFilter = true;
    resultperpage = this.utilsService.getResultsPerPage();
    page!: number;
    options: { [key: string]: unknown } = {};

    columns: Array<string> = ['name', 'details', 'domain', 'purpose', 'createdAt', 'status', 'updatedAt', 'action'];
    columnNameKeys = ['MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_NAME', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_DETAILS', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_DOMAIN', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_PURPOSE', 'COMMON.COLUMN_NAME.CREATED_DATE', 'COMMON.COLUMN_NAME.STATUS', 'COMMON.COLUMN_NAME.UPDATED_DATE', 'COMMON.COLUMN_NAME.ACTION'];
    columnsName: Array<string> = [];

    getAllProject!: Subscription;
    tableData!: Array<IProject>;
    loadingTable!: boolean;

    canAddProject!: boolean;
    canUpdateProject!: boolean;
    canDeleteProject!: boolean;

    constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private manageProjectService: ManageProjectService, public utilsService: UtilsService, private readonly authService: AuthService, private translate: TranslateService) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
        this.checkAccess();
    }

    ngOnInit(): void {
        this.setTranslatedTableColumns();
        this.pageChange(1);
    }

    languageChange(): void {
        this.translate.onLangChange.subscribe(() => {
            this.setTranslatedTableColumns();
            this.checkAccess();
        });
    }

    setTranslatedTableColumns(): void {
        this.translate.get(this.columnNameKeys).subscribe((data: object) => {
            this.columnsName = Object.values(data);
        });
    }

    async checkAccess(): Promise<void> {
        this.canAddProject = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MANAGE_PROJECT, [ACCESS_TYPE.WRITE]);
        this.canUpdateProject = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MANAGE_PROJECT, [ACCESS_TYPE.UPDATE]);
        this.canDeleteProject = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MANAGE_PROJECT, [ACCESS_TYPE.DELETE]);
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { ...this.options, page: this.page, limit: this.resultperpage, status: this.toggleStatusFilter, subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.retrieveAllProjects();
    }

    onSearch(query: ISearchQuery): void {
        if (query.searchValue) {
            query.searchValue = encodeURIComponent(query.searchValue);
        }
        this.options = { ...this.options, ...query };
        this.pageChange(1);
    }

    toggleTable(): void {
        this.loading = true;
        this.dataFound = false;
        this.loadingTable = false;
        this.tableData = [];
        this.toggleStatusFilter = !this.toggleStatusFilter;
        this.pageChange(1);
    }

    retrieveAllProjects(): void {
        this.dataFound = false;
        this.loading = true;

        this.manageProjectService
            .getAllProject(this.options)
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
                            this.dataFound = false;
                        } else {
                            this.dataFound = true;
                        }
                        this.tableData = data.docs;
                        this.createTableData(this.tableData);
                    } else {
                        this.totalRecords = 0;
                    }
                },
                error: () => {
                    this.totalRecords = 0;
                }
            });
    }
    createTableData(data: IProject[]): void {
        this.data = [];
        for (const item of data) {
            this.data.push({
                data: {
                    _id: item._id,
                    name: item.name,
                    domain: item.domain,
                    details: item.details,
                    propose: item.purpose,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    status: item.status,
                    action: item,
                    subrow: false
                }
            });
            this.dataSource = this.dataSourceBuilder.create(this.data);
        }
    }
}
