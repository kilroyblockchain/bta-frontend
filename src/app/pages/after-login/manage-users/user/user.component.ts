import { TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService, NbTabComponent, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ACCESS_TYPE } from 'src/app/@core/constants/accessType.enum';
import { FEATURE_IDENTIFIER } from 'src/app/@core/constants/featureIdentifier.enum';
import { IStaffing } from 'src/app/@core/interfaces/manage-user.interface';
import { IUserCompany, IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, LangTranslateService, ManageUserService, UtilsService } from 'src/app/@core/services';
import { AlertComponent } from 'src/app/pages/miscellaneous/alert/alert.component';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';
import { ChangePasswordComponent } from '../../user/change-password/password';
import { ViewUserComponent } from '../../user/view-user/view-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { NewUserComponent } from './new-user/new-user.component';

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expanded?: boolean;
}

interface FSEntry {
    firstName: string;
    lastName: string;
    email: string;
    organizationUnit: string;
    address: string;
    country: string;
    state: string;
    zipCode: string;
    verified: boolean;
    isDeleted: boolean;
    blockchainVerified: boolean;
    action: IUserRes;
}
@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    providers: [TitleCasePipe]
})
export class UserComponent implements OnInit, OnDestroy {
    dataSource!: NbTreeGridDataSource<FSEntry>;
    private data: TreeNode<FSEntry>[] = [];
    totalRecords = 0;
    resultperpage = this.utilsService.getResultsPerPage();
    page!: number;
    columns: Array<string> = ['name', 'organizationUnit', 'country', 'address', 'zipCode', 'action'];
    columnsName: Array<string> = ['Name/Email', 'Organization Unit/Staffing', 'Country/State', 'Address', 'Zip_Code', 'Action'];

    newUserDialogClose!: Subscription;
    companyID!: string;
    options!: { [key: string]: unknown };
    loading!: boolean;
    dataFound!: boolean;
    tableData: IUserRes[] = [];
    loadingTable!: boolean;
    toggleStatusFilter = true;
    dialogClose!: Subscription;
    canAddUser!: boolean;
    canUpdateUser!: boolean;
    canDeleteUser!: boolean;
    user!: IUserRes;
    defaultSubscriptionType!: string;
    tabId!: string;
    canManageBlockedUser!: boolean;
    canChangeUserPassword!: boolean;

    constructor(public utilsService: UtilsService, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private authService: AuthService, private readonly manageUserService: ManageUserService, private readonly dialogService: NbDialogService, private translate: TranslateService, private titleCasePipe: TitleCasePipe, private langTranslateService: LangTranslateService) {
        this.setCompanyId();
        this.checkAccess();
    }

    ngOnInit(): void {
        this.user = this.authService.getUserDataSync();
        this.defaultSubscriptionType = this.authService.getDefaultSubscriptionType();
    }

    ngOnDestroy(): void {
        if (this.newUserDialogClose) {
            this.newUserDialogClose.unsubscribe();
        }
        if (this.dialogClose) {
            this.dialogClose.unsubscribe();
        }
    }

    async checkAccess(): Promise<void> {
        this.canAddUser = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_USER, [ACCESS_TYPE.WRITE]);
        this.canUpdateUser = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_USER, [ACCESS_TYPE.UPDATE]);
        this.canDeleteUser = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_USER, [ACCESS_TYPE.DELETE]);
        this.canManageBlockedUser = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MANAGE_BLOCKED_COMPANY_USERS, [ACCESS_TYPE.UPDATE]);
        this.canChangeUserPassword = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.CHANGE_USER_PASSWORD, [ACCESS_TYPE.WRITE]);
        if (!this.canManageBlockedUser) {
            this.tabId = 'user-list';
        }
    }

    setCompanyId(): void {
        this.companyID = this.authService.getOrganization()?.id;
        if (!this.companyID) {
            this.authService.getUserData().then((curUser: IUserRes) => (this.companyID = curUser.companyId));
        }
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { ...this.options, page: this.page, limit: this.resultperpage, status: this.toggleStatusFilter ? 'verified' : 'notverified', subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.getAllUsers();
    }

    toggleTable(): void {
        this.loading = true;
        this.loadingTable = false;
        this.dataFound = false;
        this.tableData = [];
        this.toggleStatusFilter = !this.toggleStatusFilter;
        this.pageChange(1);
    }

    getAllUsers(): void {
        this.dataFound = false;
        this.loading = true;
        this.manageUserService
            .getAllUserOfOrganization(this.options)
            .pipe(
                finalize(() => {
                    this.loading = false;
                    this.loadingTable = false;
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
                        this.createTableData(this.tableData, this.options['status'] === 'verified' ? true : false);
                    } else {
                        this.totalRecords = 0;
                    }
                },
                error: () => {
                    this.totalRecords = 0;
                }
            });
    }

    createTableData(data: IUserRes[], status: boolean): void {
        this.data = [];
        for (const item of data) {
            const { organizationUnit, staffingIdArray } = this.getPosition(item.company);
            this.data.push({
                data: {
                    firstName: this.titleCasePipe.transform(item.firstName),
                    lastName: this.titleCasePipe.transform(item.lastName),
                    organizationUnit,
                    email: item.email,
                    address: item.address ?? '-',
                    verified: status,
                    isDeleted: status,
                    country: item.country?.name,
                    state: item.state?.name,
                    zipCode: item.zipCode ?? '-',
                    blockchainVerified: item?.blockchainVerified ?? false,
                    action: { ...item, staffingId: staffingIdArray }
                }
            });
        }
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    getPosition(companyArray: Array<IUserCompany>): { organizationUnit: string; staffingIdArray: string[] } {
        let unit = '';
        const staffingIdArray: string[] = [];
        const companyRow = this.getCompanyRow(companyArray);
        const fieldToPopulate = this.toggleStatusFilter ? 'staffingId' : 'deletedStaffingId';
        if (companyRow) {
            companyRow[fieldToPopulate].forEach((element) => {
                const staffing = element as IStaffing;
                unit = unit ? `${unit}, ${staffing?.organizationUnitId?.unitName} - ${staffing.staffingName}` : `${staffing?.organizationUnitId?.unitName} - ${staffing.staffingName}`;
                staffingIdArray.push(staffing._id);
            });
        }
        return {
            organizationUnit: unit,
            staffingIdArray
        };
    }

    addNewUser(): void {
        const newUserDialogOpen = this.dialogService.open(NewUserComponent, { context: { defaultSubscriptionType: this.defaultSubscriptionType } });
        this.newUserDialogClose = newUserDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close') {
                if (this.toggleStatusFilter) {
                    this.pageChange(1);
                }
            }
        });
    }

    enableUser(rowData: IUserRes): void {
        const enableDialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.translate.instant('COMMON.ALERT_MSG.ENABLE_DATA_RECORD', { recordType: 'user', name: this.titleCasePipe.transform(rowData.firstName) }) }, hasBackdrop: true, closeOnBackdropClick: false });
        this.dialogClose = enableDialogOpen.onClose.subscribe((closeRes) => {
            if (closeRes) {
                this.loadingTable = true;
                const companyRow = this.getCompanyRow(rowData.company);
                if (rowData) {
                    const user = {
                        userId: rowData._id,
                        companyRowId: companyRow._id,
                        staffingId: rowData.staffingId as string[],
                        subscriptionType: companyRow.subscriptionType
                    };
                    this.manageUserService
                        .enableOrganizationUser(user)
                        .pipe(
                            finalize(() => {
                                this.loadingTable = false;
                            })
                        )
                        .subscribe({
                            next: (res) => {
                                this.totalRecords -= 1;
                                if (!this.totalRecords) {
                                    this.dataFound = false;
                                }
                                this.tableData = this.tableData.filter((data) => data._id !== user.userId);
                                this.createTableData(this.tableData, this.options['status'] === 'verified' ? true : false);
                                if (res.success && res.message) {
                                    this.utilsService.showToast('success', res.message);
                                }
                            },
                            error: (err) => {
                                this.utilsService.showToast('warning', err?.message);
                            }
                        });
                }
            }
        });
    }

    deleteUser(user: IUserRes): void {
        const deleteDialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.translate.instant('MANAGE_USERS.USERS.ALERT_MSG.DISABLE_USER'), name: this.titleCasePipe.transform(user.firstName) }, hasBackdrop: true, closeOnBackdropClick: false });
        this.dialogClose = deleteDialogOpen.onClose.subscribe((closeRes) => {
            if (closeRes) {
                this.loadingTable = true;
                const companyRow = this.getCompanyRow(user.company);
                if (companyRow) {
                    const disableUser = {
                        userId: user?._id,
                        companyRowId: companyRow._id,
                        companyId: companyRow.companyId._id,
                        subscriptionType: companyRow.subscriptionType,
                        staffingId: user.staffingId as string[]
                    };
                    this.manageUserService
                        .disableOrganizationUser(disableUser)
                        .pipe(
                            finalize(() => {
                                this.loadingTable = false;
                            })
                        )
                        .subscribe({
                            next: (res) => {
                                this.totalRecords -= 1;
                                if (!this.totalRecords) {
                                    this.dataFound = false;
                                }
                                this.tableData = this.tableData.filter((data) => data._id !== user?._id);
                                this.createTableData(this.tableData, this.options['status'] === 'verified' ? true : false);
                                if (res.success && res.message) {
                                    this.utilsService.showToast('success', res.message);
                                }
                            },
                            error: (err) => {
                                this.utilsService.showToast('warning', err?.message);
                            }
                        });
                }
            }
        });
    }

    viewUser(user: IUserRes): void {
        this.dialogService.open(ViewUserComponent, { context: { user } });
    }

    editUser(data: IUserRes): void {
        const editUserDialogOpen = this.dialogService.open(EditUserComponent, { context: { rowData: data } });
        editUserDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close') {
                const savedData = res;
                this.tableData = this.tableData.map((item) => {
                    if (item._id === savedData._id) {
                        return savedData;
                    }
                    return item;
                });
                this.createTableData(this.tableData, this.options['status'] === 'verified' ? true : false);
            }
        });
    }

    onSubscriptionChange(event: string): void {
        this.defaultSubscriptionType = event;
        this.pageChange(1);
    }

    initSubscriptionType(): void {
        this.defaultSubscriptionType = this.authService.getDefaultSubscriptionType();
        this.pageChange(1);
    }

    onSearch(query: ISearchQuery): void {
        if (query.searchValue) {
            query.searchValue = encodeURIComponent(query.searchValue);
        }
        this.options = { ...this.options, ...query };
        this.pageChange(1);
    }

    getCompanyRow(company: Array<IUserCompany>): IUserCompany {
        return company.find((compRowId) => compRowId.subscriptionType === this.defaultSubscriptionType && compRowId.companyId._id === this.user.companyId) as IUserCompany;
    }

    isGrayBGRow(rowData: IUserRes): boolean {
        const adminUser = this.findAdminUser(rowData);
        return adminUser || (rowData.id ?? rowData._id) === (this.user.id ?? this.user._id);
    }

    findAdminUser(rowData: IUserRes): boolean {
        const adminUser = rowData.company.find((company) => company.companyId._id === this.user.companyId && company.isAdmin);
        if (adminUser) {
            return true;
        }
        return false;
    }

    getTabData(event: NbTabComponent): void {
        this.tabId = event.tabId;
        this.options = { ...this.options, page: this.page.toString(), limit: this.resultperpage.toString(), status: this.toggleStatusFilter ? 'true' : 'false' };
        let additionalQuery = {};
        switch (this.tabId) {
            case 'blocked-list':
                additionalQuery = { blocked: 'true' };
                break;
            case 'user-list':
                if (this.options['blocked']) delete this.options['blocked'];
                break;
            default:
                break;
        }
        this.options = { ...this.options, ...additionalQuery };
        this.pageChange(1);
    }

    unblockUser(user: IUserRes): void {
        const dialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.langTranslateService.translateKey('SUPER_ADMIN.ALERT_MSG.UNBLOCK_USER', { name: `${user.firstName} ${user.lastName}` }) }, hasBackdrop: true, closeOnBackdropClick: false });
        dialogOpen.onClose.subscribe((dialogRes) => {
            if (dialogRes) {
                this.loadingTable = true;
                this.manageUserService
                    .unblockCompanyUser(user.id ?? user._id)
                    .pipe(finalize(() => (this.loadingTable = false)))
                    .subscribe({
                        next: (res) => {
                            this.totalRecords -= 1;
                            if (!this.totalRecords) {
                                this.dataFound = false;
                            }
                            this.tableData = this.tableData.filter((data) => data._id !== user?._id);
                            this.createTableData(this.tableData, this.options['status'] === 'verified' ? true : false);
                            this.utilsService.showToast('success', res.message);
                        },
                        error: (err) => {
                            this.utilsService.showToast('warning', err.message);
                        }
                    });
            }
        });
    }

    resetUserPassword(user: IUserRes): void {
        this.dialogService.open(ChangePasswordComponent, { context: { type: 'user', userId: user._id, description: this.langTranslateService.translateKey('CHANGE_PASSWORD.DESCRIPTION.CHANGE_USER_PASSWORD', { userFullName: `${user.firstName} ${user.lastName}` }) }, hasBackdrop: true, closeOnBackdropClick: false });
    }
}
