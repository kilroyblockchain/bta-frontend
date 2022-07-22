import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService, NbMenuBag, NbMenuService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { finalize, Subject, Subscription, takeUntil } from 'rxjs';
import { ACCESS_TYPE, FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { PROJECT_USER } from 'src/app/@core/constants/project-roles.enum';
import { IProject, IProjectVersion, VersionStatus, IPurposeDoc } from 'src/app/@core/interfaces/manage-project.interface';
import { MenuItem } from 'src/app/@core/interfaces/menu-item.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, LangTranslateService, ManageProjectService, UtilsService, FileService } from 'src/app/@core/services';
import { AlertComponent } from 'src/app/pages/miscellaneous/alert/alert.component';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';
import { AddVersionComponent } from '../project-version/add-version/add-version.component';
import { EditVersionComponent } from '../project-version/edit-version/edit-version.component';
import { ViewProjectVersionComponent } from '../project-version/view-version/view-project-version.component';
import { AddProjectPurposeComponent } from './add-project-purpose/add-purpose.component';
import { AddProjectComponent } from './add-project/add-project.component';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { ViewProjectComponent } from './view-project/view-project.component';

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expended?: boolean;
}

interface FSEntry {
    participantName?: string;
    _id: string;
    name?: string;
    details: string;
    domain?: string;
    purpose: string | IPurposeDoc;
    status?: string;
    latestVersion?: string;
    action: unknown;
    subrow: boolean;
    versionId?: string;
}

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styles: [
        `
            .docs {
                cursor: pointer;
                margin: 2px;
                text-decoration: none;
            }
        `
    ]
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

    columns!: Array<string>;
    columnNameKeys!: Array<string>;
    columnsName: Array<string> = [];

    newProjectDialogClose!: Subscription;
    editProjectDialogClose!: Subscription;
    deleteDialogClose!: Subscription;
    viewProjectDetailsClose!: Subscription;
    addVersionDialogClose!: Subscription;
    viewVersionDetailsClose!: Subscription;
    editModelVersionClose!: Subscription;

    tableData!: Array<IProject>;
    loadingTable!: boolean;

    canAddProject!: boolean;
    canUpdateProject!: boolean;
    canDeleteProject!: boolean;
    canViewProjectDetails!: boolean;
    canAddVersion!: boolean;
    canViewVersionDetails!: boolean;
    canViewModelReview!: boolean;
    canViewMonitoringReport!: boolean;
    canAddProjectPurpose!: boolean;

    childrenMenuItems: Array<MenuItem> = [];
    parentMenuItems: Array<MenuItem> = [];

    rowVersion!: IProjectVersion;
    rowProject!: IProject;
    destroy$: Subject<void> = new Subject<void>();

    user!: IUserRes;
    isCompanyAdmin!: boolean;
    isAIEng!: boolean;
    isMLOpsEng!: boolean;
    isStakeHolder!: boolean;

    canAddProjectAndVersion!: boolean;
    constructor(
        private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>,
        private router: Router,
        private dialogService: NbDialogService,
        private menuService: NbMenuService,
        private manageProjectService: ManageProjectService,
        public utilsService: UtilsService,
        private readonly authService: AuthService,
        private translate: TranslateService,
        private langTranslateService: LangTranslateService,
        private readonly fileService: FileService
    ) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
        this.initChildrenMenu();
        this.initParentMenu();
        this.getProjectUser();
    }

    ngOnInit(): void {
        this.setTranslatedTableColumns();
        this.pageChange(1);
        this.checkAccess();
        const options = { page: this.page, limit: Number.MAX_SAFE_INTEGER, status: this.toggleStatusFilter ? 'verified' : 'notverified', subscriptionType: this.authService.getDefaultSubscriptionType() };

        this.manageProjectService.canAddProject(options).subscribe((res) => {
            if (res && res.success) {
                this.canAddProjectAndVersion = res.data;
            }
        });
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
        this.editModelVersionClose ? this.editModelVersionClose.unsubscribe() : null;
    }

    languageChange(): void {
        this.translate.onLangChange.subscribe(() => {
            this.setTranslatedTableColumns();
            this.checkAccess();
        });
    }

    setTranslatedTableColumns(): void {
        this.columns = [...(this.isCompanyAdmin ? ['participantName', 'name', 'details', 'purpose', 'domain', 'latestVersion', 'status'] : []), ...(this.isAIEng ? ['name', 'details', 'purpose', 'domain'] : []), ...(this.isMLOpsEng || this.isStakeHolder ? ['name', 'details', 'purpose', 'status'] : []), 'action'];
        this.columnNameKeys = [
            ...(this.isCompanyAdmin ? ['MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PARTICIPANT_NAME', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_NAME', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_DETAILS', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_PURPOSE', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_DOMAIN', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.LATEST_VERSION', 'COMMON.COLUMN_NAME.STATUS'] : []),
            ...(this.isAIEng ? ['MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_NAME', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_DETAILS', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_PURPOSE', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_DOMAIN'] : []),
            ...(this.isMLOpsEng || this.isStakeHolder ? ['MANAGE_PROJECTS.PROJECT.COLUMN_NAME.PROJECT_NAME', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.AI_ENGINEER', 'MANAGE_PROJECTS.PROJECT.COLUMN_NAME.VERSION', 'COMMON.COLUMN_NAME.STATUS'] : []),
            'COMMON.COLUMN_NAME.ACTION'
        ];

        this.translate.get(this.columnNameKeys).subscribe((data: object) => {
            this.columnsName = Object.values(data);
        });
    }

    getProjectUser(): void {
        this.user = this.authService.getUserDataSync();
        this.isCompanyAdmin = !!this.user.company.find((f) => f.companyId._id === this.user.companyId && f.isAdmin === true);

        this.isAIEng = !!this.user.company.find((f) => f.staffingId.find((s) => s.staffingName.toLowerCase().includes(PROJECT_USER.AI_ENGINEER.toLowerCase())));
        this.isMLOpsEng = !!this.user.company.find((f) => f.staffingId.find((s) => s.staffingName.toLowerCase().includes(PROJECT_USER.MLOps_ENGINEER.toLowerCase())));
        this.isStakeHolder = !!this.user.company.find((f) => f.staffingId.find((s) => s.staffingName.toLowerCase().includes(PROJECT_USER.STAKEHOLDER.toLowerCase())));
    }

    async checkAccess(): Promise<void> {
        this.canAddProject = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.PROJECT, [ACCESS_TYPE.WRITE]);
        this.canDeleteProject = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.PROJECT, [ACCESS_TYPE.DELETE]);
        if (this.isAIEng || this.isCompanyAdmin) {
            this.parentMenuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.VIEW_PROJECT', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.VIEW_PROJECT') });
        }
        this.canAddVersion = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MODEL_VERSION, [ACCESS_TYPE.WRITE]);
        if (this.canAddVersion) {
            this.parentMenuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.ADD_VERSION', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.ADD_VERSION') });
        }
        this.canUpdateProject = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.PROJECT, [ACCESS_TYPE.UPDATE]);
        if (this.canUpdateProject) {
            this.parentMenuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.EDIT_PROJECT', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.EDIT_PROJECT') });
        }
        this.canViewVersionDetails = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MODEL_VERSION, [ACCESS_TYPE.READ]);
        if (this.canViewVersionDetails) {
            this.childrenMenuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.VERSION_DETAILS', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.VERSION_DETAILS') });
        }

        this.childrenMenuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.EDIT_PROJECT_VERSION', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.EDIT_PROJECT_VERSION') });

        this.canViewModelReview = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MODEL_REVIEWS, [ACCESS_TYPE.READ]);
        if (this.canViewModelReview) {
            this.childrenMenuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.MODEL_REVIEWS', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.MODEL_REVIEWS') });
        }
        this.canViewMonitoringReport = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MODEL_MONITORING, [ACCESS_TYPE.READ]);
        if (this.canViewMonitoringReport) {
            this.childrenMenuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.MONITORING_REPORT', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.MONITORING_REPORT') });
        }

        this.canAddProjectPurpose = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.PROJECT_PURPOSE, [ACCESS_TYPE.WRITE]);
        if (this.canAddProjectPurpose && !this.isCompanyAdmin) {
            this.childrenMenuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.PROJECT_PURPOSE', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.PROJECT_PURPOSE') });
        }
        this.parentMenuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.PROJECT_BC_HISTORY', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.PROJECT_BC_HISTORY') });
        this.childrenMenuItems.push({ key: 'MANAGE_PROJECTS.MENU_ITEM.VERSION_BC_HISTORY', title: this.langTranslateService.translateKey('MANAGE_PROJECTS.MENU_ITEM.VERSION_BC_HISTORY') });
        this.childrenMenuItems.push({ key: 'Model Review Bc history', title: this.langTranslateService.translateKey('Model Review Bc history') });
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
            if (this.isCompanyAdmin || this.isAIEng) {
                const children = [];
                for (const version of item.projectVersions) {
                    children.push({
                        data: {
                            details: version.versionName,
                            purpose: version.versionStatus,
                            action: { project: item, version },
                            subrow: true,
                            _id: version._id
                        }
                    });
                }
                this.data.push({
                    data: {
                        _id: item._id,
                        participantName: item?.createdBy?.firstName + ' ' + item?.createdBy?.lastName,
                        name: item.name,
                        domain: item.domain,
                        details: item.details,
                        purpose: item.purpose,
                        latestVersion: item.projectVersions[item.projectVersions.length - 1]?.versionName,
                        status: item.projectVersions[item.projectVersions.length - 1]?.versionStatus,
                        action: { project: item },
                        subrow: false
                    },
                    children
                });
                this.dataSource = this.dataSourceBuilder.create(this.data);
            } else {
                for (const version of item.projectVersions) {
                    this.data.push({
                        data: {
                            _id: item._id,
                            name: item.name,
                            details: version?.createdBy?.firstName + ' ' + version?.createdBy?.lastName,
                            purpose: version.versionName,
                            status: version.versionStatus,
                            action: { project: item, version },
                            subrow: false,
                            versionId: version._id
                        }
                    });
                    this.dataSource = this.dataSourceBuilder.create(this.data);
                    this.totalRecords = this.data.length;
                }
            }
        }
    }

    addNewProjectModal(): void {
        if (this.canAddProjectAndVersion) {
            const newProjectDialogOpen = this.dialogService.open(AddProjectComponent, { context: {}, hasBackdrop: true, closeOnBackdropClick: false });
            this.newProjectDialogClose = newProjectDialogOpen.onClose.subscribe((res) => {
                if (res && res !== 'close') {
                    this.pageChange(1);
                }
            });
        } else {
            this.dialogService.open(AlertComponent, { context: { alert: true, info: this.translate.instant('MANAGE_PROJECTS.PROJECT.ALERT_MSG.CAN_ADD_PROJECT') }, hasBackdrop: true, closeOnBackdropClick: false });
        }
    }

    openProjectEditModal(rowData: IProject): void {
        const editProjectDialogOpen = this.dialogService.open(EditProjectComponent, { context: { rowData }, hasBackdrop: true, closeOnBackdropClick: false });
        this.editProjectDialogClose = editProjectDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close' && res.success) {
                this.pageChange(1);
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
        if (this.canAddProjectAndVersion) {
            const addVersionOpen = this.dialogService.open(AddVersionComponent, { context: { rowData }, hasBackdrop: true, closeOnBackdropClick: false });
            this.addVersionDialogClose = addVersionOpen.onClose.subscribe((res) => {
                if (res && res !== 'close' && res.success) {
                    this.pageChange(1);
                    this.dialogService.open(AlertComponent, { context: { alert: true, info: this.translate.instant('MANAGE_PROJECTS.PROJECT.ALERT_MSG.SAVING_NEW_MODEL_VERSION') }, hasBackdrop: true, closeOnBackdropClick: false });
                }
            });
        } else {
            this.dialogService.open(AlertComponent, { context: { alert: true, info: this.translate.instant('MANAGE_PROJECTS.PROJECT.ALERT_MSG.CAN_ADD_PROJECT') }, hasBackdrop: true, closeOnBackdropClick: false });
        }
    }

    openMenu(rowData: { project: IProject; version: IProjectVersion }) {
        this.rowVersion = rowData.version;
        this.rowProject = rowData.project;
        if (this.rowVersion) {
            this.childrenMenuItems = this.childrenMenuItems.map((menu) => {
                if (menu.key === 'MANAGE_PROJECTS.MENU_ITEM.EDIT_PROJECT_VERSION') {
                    return {
                        ...menu,
                        hidden: this.rowVersion?.versionStatus !== VersionStatus.DRAFT
                    };
                }
                return menu;
            });

            this.childrenMenuItems = this.childrenMenuItems.map((menu) => {
                if (menu.key === 'MANAGE_PROJECTS.MENU_ITEM.MONITORING_REPORT') {
                    return {
                        ...menu,
                        hidden: this.rowVersion.versionStatus !== VersionStatus.MONITORING
                    };
                }
                return menu;
            });

            this.childrenMenuItems = this.childrenMenuItems.map((menu) => {
                if (menu.key === 'MANAGE_PROJECTS.MENU_ITEM.MODEL_REVIEWS') {
                    return {
                        ...menu,
                        hidden: this.rowVersion.versionStatus === VersionStatus.DRAFT
                    };
                }
                return menu;
            });
        }
    }

    initChildrenMenu(): void {
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
                        case 'MANAGE_PROJECTS.MENU_ITEM.MODEL_REVIEWS':
                            this.viewModelReviews(this.rowVersion);
                            break;
                        case 'MANAGE_PROJECTS.MENU_ITEM.PROJECT_PURPOSE':
                            this.addProjectPurpose(this.rowProject);
                            break;

                        case 'MANAGE_PROJECTS.MENU_ITEM.VERSION_BC_HISTORY':
                            this.viewProjectVersionHistory(this.rowVersion);
                            break;
                        case 'MANAGE_PROJECTS.MENU_ITEM.EDIT_PROJECT_VERSION':
                            this.editModelVersion(this.rowVersion);
                            break;
                        case 'Model Review Bc history':
                            this.viewModelReviewBcHistory(this.rowVersion);
                            break;
                        default:
                            break;
                    }
                }
            });
    }

    initParentMenu(): void {
        this.menuService
            .onItemClick()
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ item, tag }: NbMenuBag) => {
                if (tag === 'projectMenu') {
                    switch ((item as MenuItem).key) {
                        case 'MANAGE_PROJECTS.MENU_ITEM.VIEW_PROJECT':
                            this.viewProjectDetails(this.rowProject);
                            break;
                        case 'MANAGE_PROJECTS.MENU_ITEM.EDIT_PROJECT':
                            this.openProjectEditModal(this.rowProject);
                            break;
                        case 'MANAGE_PROJECTS.MENU_ITEM.ADD_VERSION':
                            this.addNewProjectVersion(this.rowProject);
                            break;
                        case 'MANAGE_PROJECTS.MENU_ITEM.PROJECT_BC_HISTORY':
                            this.viewProjectBcHistory(this.rowProject);
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

    viewModelReviews(versionData: IProjectVersion): void {
        const URL = 'u/manage-project/model-reviews';
        this.navigateTo(URL, versionData._id);
    }

    addProjectPurpose(rowData: IProject): void {
        const editProjectDialogOpen = this.dialogService.open(AddProjectPurposeComponent, { context: { rowData }, hasBackdrop: true, closeOnBackdropClick: false });
        this.editProjectDialogClose = editProjectDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close' && res.success) {
                this.pageChange(1);
            }
        });
    }

    viewProjectBcHistory(projectData: IProject): void {
        const URL = '/u/manage-project/project-bc-history';
        this.navigateTo(URL, projectData._id);
    }

    viewProjectVersionHistory(versionData: IProjectVersion): void {
        const URL = 'u/manage-project/version-bc-history';
        this.navigateTo(URL, versionData._id);
    }

    editModelVersion(versionData: IProjectVersion): void {
        const editModelVersionOpen = this.dialogService.open(EditVersionComponent, { context: { versionData }, hasBackdrop: true, closeOnBackdropClick: false });
        this.editModelVersionClose = editModelVersionOpen.onClose.subscribe((res) => {
            if (res && res !== 'close' && res.success) {
                this.pageChange(1);
            }
        });
    }

    openDocs(filename: string): void {
        this.fileService.getFileFromFolder(filename).subscribe((file: Blob) => {
            const urlCreator = window.URL || window.webkitURL;
            const url = urlCreator.createObjectURL(file);
            window.open(url);
            urlCreator.revokeObjectURL(url);
        });
    }

    viewModelReviewBcHistory(versionData: IProjectVersion): void {
        const URL = 'u/manage-project/model-review-bc-history';
        this.navigateTo(URL, versionData._id);
    }
}
