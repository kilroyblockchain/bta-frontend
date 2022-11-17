import { NewOrganizationStaffingComponent } from './organization-staffing/new-organization-staffing/new-organization-staffing.component';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { AuthService, ManageUserService, UtilsService } from 'src/app/@core/services';
import { AlertComponent } from 'src/app/pages/miscellaneous/alert/alert.component';
import { EditOrganizationUnitComponent } from './edit-organization-unit/edit-organization-unit.component';
import { NewOrganizationUnitComponent } from './new-organization-unit/new-organization-unit.component';
import { FEATURE_IDENTIFIER } from 'src/app/@core/constants/featureIdentifier.enum';
import { ACCESS_TYPE } from 'src/app/@core/constants/accessType.enum';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';
import { IOrganizationUnit } from 'src/app/@core/interfaces/manage-user.interface';
import { IBcNodeInfo } from 'src/app/@core/interfaces/bc-node-info.interface';

interface IChildrenRow {
    unitName: string;
    unitDescription: string;
    status: boolean;
    createdDate: string;
    updatedDate: string;
    bcNodeInfo: IBcNodeInfo;
    channels: string[];
    oracleGroupName: string;
    bucketUrl: string;
    action: unknown;
    subrow: boolean;
    _id: string;
    staffingId: string;
}

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expanded?: boolean;
}

interface FSEntry {
    unitName: string;
    unitDescription: string;
    createdDate: Date;
    status: boolean;
    updatedDate: Date;
    action: unknown;
    subrow: boolean;
    _id?: string;
    staffingId?: string;
    bcNodeInfo?: IBcNodeInfo;
    channels?: string[];
    bucketUrl?: string;
}
@Component({
    selector: 'app-organization-unit',
    templateUrl: './organization-unit.component.html'
})
export class OrganizationUnitComponent implements OnInit, OnDestroy {
    dataSource: NbTreeGridDataSource<FSEntry>;
    private data: TreeNode<FSEntry>[] = [];
    totalRecords = 0;
    resultperpage = this.utilsService.getResultsPerPage();
    page!: number;
    options: { [key: string]: unknown } = {};
    dataFound!: boolean;
    loading!: boolean;
    columns: Array<string> = ['unitName', 'unitDescription', 'createdDate', 'status', 'updatedDate', 'action'];
    columnNameKeys = ['MANAGE_USERS.ORGANIZATION_UNIT.COLUMN_NAME.UNIT_NAME', 'MANAGE_USERS.ORGANIZATION_UNIT.COLUMN_NAME.DESCRIPTION', 'COMMON.COLUMN_NAME.CREATED_DATE', 'COMMON.COLUMN_NAME.STATUS', 'COMMON.COLUMN_NAME.UPDATED_DATE', 'COMMON.COLUMN_NAME.ACTION'];
    columnsName: Array<string> = [];
    newOrganizationUnitDialogClose!: Subscription;
    editOrganizationUnitDialogClose!: Subscription;
    newOrganizationStaffingDialogClose!: Subscription;
    deleteDialogClose!: Subscription;
    tableData!: Array<IOrganizationUnit>;
    loadingTable!: boolean;
    toggleStatusFilter = true;
    canAddOrganizationUnit!: boolean;
    canUpdateOrganizationUnit!: boolean;
    canDeleteOrganizationUnit!: boolean;
    canAddStaffing!: boolean;
    canUpdateStaffing!: boolean;
    canDeleteStaffing!: boolean;

    constructor(public utilsService: UtilsService, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private dialogService: NbDialogService, private readonly authService: AuthService, private readonly manageUserService: ManageUserService, private translate: TranslateService) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
        this.checkAccess();
        this.languageChange();
    }

    ngOnInit(): void {
        this.setTranslatedTableColumns();
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
        this.canAddOrganizationUnit = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_UNIT, [ACCESS_TYPE.WRITE]);
        this.canUpdateOrganizationUnit = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_UNIT, [ACCESS_TYPE.UPDATE]);
        this.canDeleteOrganizationUnit = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_UNIT, [ACCESS_TYPE.DELETE]);
        this.canAddStaffing = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_STAFFING, [ACCESS_TYPE.WRITE]);
        this.canUpdateStaffing = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_STAFFING, [ACCESS_TYPE.UPDATE]);
        this.canDeleteStaffing = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_STAFFING, [ACCESS_TYPE.DELETE]);
    }

    ngOnDestroy(): void {
        if (this.newOrganizationUnitDialogClose) {
            this.newOrganizationUnitDialogClose.unsubscribe();
        }
        if (this.editOrganizationUnitDialogClose) {
            this.editOrganizationUnitDialogClose.unsubscribe();
        }
        if (this.newOrganizationStaffingDialogClose) {
            this.newOrganizationStaffingDialogClose.unsubscribe();
        }
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { page: this.page, limit: this.resultperpage, status: this.toggleStatusFilter, subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.retrieveAllUnitsOfOrganization();
    }

    retrieveAllUnitsOfOrganization(): void {
        this.authService.getUserData().then((user) => {
            this.dataFound = false;
            this.loading = true;
            this.manageUserService
                .getUnitsByCompanyId(user?.companyId, this.options)
                .pipe(
                    finalize(() => {
                        this.loading = false;
                        this.loadingTable = false;
                    })
                )
                .subscribe({
                    next: (res) => {
                        if (res && res.success) {
                            this.tableData = res.data.docs.filter((f) => !f.isMigrated);
                            this.totalRecords = this.tableData.length;
                            if (!this.totalRecords) {
                                this.dataFound = false;
                            } else {
                                this.dataFound = true;
                            }
                            this.createTableData(this.tableData);
                        }
                    }
                });
        });
    }

    createTableData(data: IOrganizationUnit[]): void {
        this.data = [];
        for (const item of data) {
            const children = [];
            for (const staff of item.staffing_records) {
                children.push({
                    data: {
                        unitName: staff.staffingName,
                        unitDescription: staff?.staffDescription,
                        status: staff.status,
                        createdDate: staff.createdAt,
                        updatedDate: staff.updatedAt,
                        bcNodeInfo: staff.bcNodeInfo,
                        channels: staff.channels,
                        bucketUrl: staff.bucketUrl,
                        oracleGroupName: staff.oracleGroupName,
                        action: staff,
                        subrow: true,
                        _id: item._id,
                        staffingId: staff._id
                    }
                });
            }
            this.data.push({
                data: {
                    unitName: item.unitName,
                    unitDescription: item.unitDescription as string,
                    status: item.status,
                    createdDate: item.createdAt,
                    updatedDate: item.updatedAt,
                    action: item,
                    subrow: false,
                    _id: item._id
                },
                children
            });
            this.dataSource = this.dataSourceBuilder.create(this.data);
        }
    }

    addNewOrganizationUnit(): void {
        const newOrganizationUnitDialogOpen = this.dialogService.open(NewOrganizationUnitComponent, { context: {}, hasBackdrop: true, closeOnBackdropClick: false });
        this.newOrganizationUnitDialogClose = newOrganizationUnitDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close') {
                if (res.success) {
                    this.pageChange(1);
                }
            }
        });
    }

    openAddStaffingModal(rowData: IChildrenRow): void {
        const newOrganizationStaffingDialogOpen = this.dialogService.open(NewOrganizationStaffingComponent, { context: { childRowData: rowData, mode: 'CREATE' }, hasBackdrop: true, closeOnBackdropClick: false });
        this.newOrganizationStaffingDialogClose = newOrganizationStaffingDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close') {
                this.pageChange(1);
            }
        });
    }

    openOrganizationEditModal(rowData: IOrganizationUnit): void {
        const editOrganizationUnitDialogOpen = this.dialogService.open(EditOrganizationUnitComponent, { context: { rowData }, hasBackdrop: true, closeOnBackdropClick: false });
        this.editOrganizationUnitDialogClose = editOrganizationUnitDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close' && res.success) {
                this.pageChange(1);
            }
        });
    }

    openStaffingEditModal(rowData: IChildrenRow): void {
        const newOrganizationStaffingDialogOpen = this.dialogService.open(NewOrganizationStaffingComponent, { context: { childRowData: rowData, mode: 'EDIT' }, hasBackdrop: true, closeOnBackdropClick: false });
        this.newOrganizationStaffingDialogClose = newOrganizationStaffingDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close') {
                this.pageChange(1);
            }
        });
    }

    onEnableOrganizationUnit(rowData: IOrganizationUnit): void {
        this.manageUserService.enableOrganizationUnit(rowData._id as string).subscribe({
            next: (res) => {
                if (res && res.success) {
                    this.utilsService.showToast('success', res?.message);
                    this.tableData = this.tableData.filter((item) => item._id !== rowData._id);
                    this.totalRecords -= 1;
                    if (this.tableData.length < 1) {
                        this.dataFound = false;
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

    onDeleteOrganizationUnit(rowData: IOrganizationUnit): void {
        const deleteDialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.translate.instant('MANAGE_USERS.ORGANIZATION_UNIT.ALERT_MSG.DISABLE_ORGANIZATION_UNIT'), name: rowData.unitName }, hasBackdrop: true, closeOnBackdropClick: false });
        this.deleteDialogClose = deleteDialogOpen.onClose.subscribe((closeRes) => {
            if (closeRes) {
                this.manageUserService.deleteOrganizationUnit(rowData._id as string).subscribe({
                    next: (res) => {
                        if (res && res.success) {
                            this.utilsService.showToast('success', res?.message);
                            this.tableData = this.tableData.filter((item) => item._id !== rowData._id);
                            this.totalRecords -= 1;
                            if (this.tableData.length < 1) {
                                this.dataFound = false;
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

    onDeleteOrganizationStaffing(unitName: string, staffingId: string): void {
        const deleteDialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.translate.instant('MANAGE_USERS.ORGANIZATION_UNIT.ALERT_MSG.DISABLE_ORGANIZATION_UNIT'), name: unitName }, hasBackdrop: true, closeOnBackdropClick: false });
        this.deleteDialogClose = deleteDialogOpen.onClose.subscribe((closeRes) => {
            if (closeRes) {
                this.manageUserService.deleteStaffingById(staffingId).subscribe({
                    next: (res) => {
                        if (res && res.success) {
                            this.utilsService.showToast('success', res?.message);
                            this.pageChange(1);
                        }
                    },
                    error: (err) => {
                        this.utilsService.showToast('warning', err?.message);
                    }
                });
            }
        });
    }

    onEnableOrganizationStaffing(rowData: IOrganizationUnit): void {
        this.manageUserService.enableOrganizationStaffing(rowData._id).subscribe({
            next: (res) => {
                if (res && res.success) {
                    this.utilsService.showToast('success', res?.message);
                    this.pageChange(1);
                }
            },
            error: (err) => {
                this.utilsService.showToast('warning', err?.message);
            }
        });
    }

    toggleTable(): void {
        this.loading = true;
        this.dataFound = false;
        this.toggleStatusFilter = !this.toggleStatusFilter;
        this.pageChange(1);
    }

    onSubscriptionChange(): void {
        this.pageChange(1);
    }

    initSubscriptionType(): void {
        this.pageChange(1);
    }

    onSearch(query: ISearchQuery): void {
        this.dataSource.filter(query.searchValue);
    }
}
