import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService, NbMenuBag, NbMenuService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { finalize, Subject, Subscription, takeUntil } from 'rxjs';
import { ACCESS_TYPE, FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { IProject, IProjectVersion } from 'src/app/@core/interfaces/manage-project.interface';
import { MenuItem } from 'src/app/@core/interfaces/menu-item.interface';
import { AuthService, LangTranslateService, ManageProjectService, UtilsService } from 'src/app/@core/services';
import { AlertComponent } from 'src/app/pages/miscellaneous/alert/alert.component';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';
import { AddVersionComponent } from '../project-version/add-version/add-version.component';
import { ViewProjectVersionComponent } from '../project-version/view-version/view-project-version.component';
import { AddProjectComponent } from './add-project/add-project.component';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { ViewProjectComponent } from './view-project/view-project.component';

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expended?: boolean;
}

interface FSEntry {
    _id: string;
    name?: string;
    details: string;
    domain: string;
    propose?: string;
    createdAt?: Date;
    status?: boolean;
    updatedAt?: Date;
    action: unknown;
    subrow: boolean;
}

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html'
})
export class ProjectComponent implements OnInit, OnDestroy {
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
    newProjectDialogClose!: Subscription;
    editProjectDialogClose!: Subscription;
    deleteDialogClose!: Subscription;
    viewProjectDetailsClose!: Subscription;
    addVersionDialogClose!: Subscription;
    viewVersionDetailsClose!: Subscription;

    tableData!: Array<IProject>;
    loadingTable!: boolean;

    canAddProject!: boolean;
    canUpdateProject!: boolean;
    canDeleteProject!: boolean;

    menuItems: Array<MenuItem> = [];
    rowVersion!: IProjectVersion;
    destroy$: Subject<void> = new Subject<void>();

    constructor(
        private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>,
        private router: Router,
        private dialogService: NbDialogService,
        private menuService: NbMenuService,
        private manageProjectService: ManageProjectService,
        public utilsService: UtilsService,
        private readonly authService: AuthService,
        private translate: TranslateService,
        private langTranslateService: LangTranslateService
    ) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
        this.checkAccess();
        this.initMenu();
    }

    ngOnInit(): void {
        this.setTranslatedTableColumns();
        this.pageChange(1);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        this.newProjectDialogClose ? this.newProjectDialogClose.unsubscribe() : null;
        this.deleteDialogClose ? this.deleteDialogClose.unsubscribe() : null;
        this.editProjectDialogClose ? this.editProjectDialogClose.unsubscribe() : null;
        this.viewProjectDetailsClose ? this.viewProjectDetailsClose.unsubscribe() : null;
        this.addVersionDialogClose ? this.addVersionDialogClose.unsubscribe() : null;
        this.viewVersionDetailsClose ? this.viewVersionDetailsClose.unsubscribe() : null;
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
        this.menuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.VERSION_DETAILS', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.VERSION_DETAILS') });
        this.menuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.MONITORING_REPORT', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.MONITORING_REPORT') });
    }

    navigateTo(URL: string, id: string): void {
        this.router.navigate([URL, id]);
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
            const children = [];
            for (const version of item.projectVersions) {
                children.push({
                    data: {
                        details: version.versionName,
                        domain: version.versionStatus,
                        action: version,
                        subrow: true,
                        _id: version._id
                    }
                });
            }
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
                },
                children
            });
            this.dataSource = this.dataSourceBuilder.create(this.data);
        }
    }

    addNewProjectModal(): void {
        const newProjectDialogOpen = this.dialogService.open(AddProjectComponent, { context: {}, hasBackdrop: true, closeOnBackdropClick: false });
        this.newProjectDialogClose = newProjectDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close') {
                this.pageChange(1);
            }
        });
    }

    openProjectEditModal(rowData: IProject): void {
        const editProjectDialogOpen = this.dialogService.open(EditProjectComponent, { context: { rowData }, hasBackdrop: true, closeOnBackdropClick: false });
        this.editProjectDialogClose = editProjectDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close' && res.success) {
                this.pageChange(1);
            }
        });
    }
    onDeleteProject(rowData: IProject): void {
        const deleteDialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.translate.instant('MANAGE_PROJECTS.PROJECT.ALERT_MSG.DISABLE_PROJECT'), name: rowData.name }, hasBackdrop: true, closeOnBackdropClick: false });
        this.deleteDialogClose = deleteDialogOpen.onClose.subscribe((closeRes) => {
            if (closeRes) {
                this.manageProjectService.deleteProject(rowData._id as string).subscribe({
                    next: (res) => {
                        if (res && res.success) {
                            this.utilsService.showToast('success', res?.message);
                            this.tableData = this.tableData.filter((item) => item._id !== rowData._id);
                            this.totalRecords -= 1;
                            if (this.tableData.length < 1) {
                                this.dataFound = false;
                                this.loading = false;
                            } else {
                                this.createTableData(this.tableData);
                            }
                        }
                    },
                    error: (err) => {
                        this.utilsService.showToast('warning', err?.message);
                    }
                });
            }
        });
    }

    onEnableProject(rowData: IProject): void {
        const deleteDialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.translate.instant('MANAGE_PROJECTS.PROJECT.ALERT_MSG.ENABLE_PROJECT'), name: rowData.name }, hasBackdrop: true, closeOnBackdropClick: false });
        this.deleteDialogClose = deleteDialogOpen.onClose.subscribe((closeRes) => {
            if (closeRes) {
                this.manageProjectService.enableProject(rowData._id as string).subscribe({
                    next: (res) => {
                        if (res && res.success) {
                            this.utilsService.showToast('success', res?.message);
                            this.tableData = this.tableData.filter((item) => item._id !== rowData._id);
                            this.totalRecords -= 1;
                            if (this.tableData.length < 1) {
                                this.dataFound = false;
                                this.loading = false;
                            } else {
                                this.createTableData(this.tableData);
                            }
                        }
                    },
                    error: (err) => {
                        this.utilsService.showToast('warning', err?.message);
                    }
                });
            }
        });
    }

    viewProjectDetails(projectData: IProject): void {
        const viewProjectDetailOpen = this.dialogService.open(ViewProjectComponent, { context: { projectData }, hasBackdrop: true, closeOnBackdropClick: false });
        this.viewProjectDetailsClose = viewProjectDetailOpen.onClose.subscribe((res) => {
            if (res && res !== 'close' && res.success) {
                this.pageChange(1);
            }
        });
    }

    addNewProjectVersion(rowData: IProject): void {
        const addVersionOpen = this.dialogService.open(AddVersionComponent, { context: { rowData }, hasBackdrop: true, closeOnBackdropClick: false });
        this.addVersionDialogClose = addVersionOpen.onClose.subscribe((res) => {
            if (res && res !== 'close' && res.success) {
                this.pageChange(1);
            }
        });
    }

    openMenu(rowData: IProjectVersion) {
        this.rowVersion = rowData;
    }

    initMenu(): void {
        this.menuService
            .onItemClick()
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ item, tag }: NbMenuBag) => {
                if (tag === 'versionMenu') {
                    switch ((item as MenuItem).key) {
                        case 'MANAGE_PROJECTS.MENU_ITEM.VERSION_DETAILS':
                            this.viewVersionDetails(this.rowVersion);
                            break;
                        case 'MANAGE_PROJECTS.MENU_ITEM.MONITORING_REPORT':
                            this.viewVersionReports(this.rowVersion);
                            break;
                        default:
                            break;
                    }
                }
            });
    }

    viewVersion(versionData: IProjectVersion): void {
        const viewVersionDetailOpen = this.dialogService.open(ViewProjectVersionComponent, { context: { versionData }, hasBackdrop: true, closeOnBackdropClick: false });
        this.viewVersionDetailsClose = viewVersionDetailOpen.onClose.subscribe((res) => {
            if (res && res !== 'close' && res.success) {
                this.pageChange(1);
            }
        });
    }

    viewVersionDetails(versionData: IProjectVersion): void {
        const URL = '/u/manage-project/version-details';
        this.navigateTo(URL, versionData._id);
    }

    viewVersionReports(versionData: IProjectVersion): void {
        const URL = '/u/manage-project/version-reports';
        this.navigateTo(URL, versionData._id);
    }
}
