import { TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ACCESS_TYPE } from 'src/app/@core/constants/accessType.enum';
import { FEATURE_IDENTIFIER } from 'src/app/@core/constants/featureIdentifier.enum';
import { MSG_KEY_CONSTANT_USER } from 'src/app/@core/constants/message-key-constants';
import { AuthService, ManageUserService, UtilsService } from 'src/app/@core/services';
import { AlertComponent } from 'src/app/pages/miscellaneous/alert/alert.component';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';
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
    staffing: string;
    address: string;
    country: string;
    state: string;
    zipCode: string;
    verified: boolean;
    isDeleted: boolean;
    blockchainVerified: boolean;
    action: any;
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
    options: any;
    loading!: boolean;
    dataFound!: boolean;
    tableData: any[] = [];
    loadingTable!: boolean;
    toggleStatusFilter = true;
    dialogClose!: Subscription;
    canAddUser!: boolean;
    canUpdateUser!: boolean;
    canDeleteUser!: boolean;
    user: any;
    defaultCompany: any;
    defaultSubscriptionType!: string;

    constructor(public utilsService: UtilsService, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private disalogService: NbDialogService, private authService: AuthService, private readonly manageUserService: ManageUserService, private readonly dialogService: NbDialogService, private translate: TranslateService, private titleCasePipe: TitleCasePipe) {
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

    async checkAccess(): Promise<any> {
        this.canAddUser = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_USER, [ACCESS_TYPE.WRITE]);
        this.canUpdateUser = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_USER, [ACCESS_TYPE.UPDATE]);
        this.canDeleteUser = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_USER, [ACCESS_TYPE.DELETE]);
    }

    setCompanyId(): void {
        this.companyID = this.authService.getOrganization()?.id;
        if (!this.companyID) {
            this.authService.getUserData().then((curUser: any) => (this.companyID = curUser.companyId));
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
                next: (data) => {
                    if (data.total) {
                        this.totalRecords = data.total;
                        if (!this.totalRecords) {
                            this.dataFound = false;
                        } else {
                            this.dataFound = true;
                        }
                        this.tableData = data.docs;
                        this.createTableData(this.tableData, this.options.status === 'verified' ? true : false);
                    } else {
                        this.totalRecords = 0;
                    }
                },
                error: () => {
                    this.totalRecords = 0;
                }
            });
    }

    createTableData(data: any, status: boolean): void {
        this.data = [];
        for (const item of data) {
            const { organizationUnit, staffing, staffingIdArray } = this.getPosition(item.company);
            this.data.push({
                data: {
                    firstName: this.titleCasePipe.transform(item.firstName),
                    lastName: this.titleCasePipe.transform(item.lastName),
                    organizationUnit,
                    staffing: staffing.join(', '),
                    email: item.email,
                    address: item.address,
                    verified: status,
                    isDeleted: status,
                    country: item.country?.name,
                    state: item.state?.name,
                    zipCode: item.zipCode,
                    blockchainVerified: item?.blockchainVerified,
                    action: { ...item, staffingId: staffingIdArray }
                }
            });
        }
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    getPosition(companyArray: Array<any>): { organizationUnit: string; staffing: any[]; staffingIdArray: string[] } {
        let unit: string = '';
        const positions: any[] = [];
        const staffingIdArray: string[] = [];
        const companyRow = this.getCompanyRow(companyArray);
        const fieldToPopulate = this.toggleStatusFilter ? 'staffingId' : 'deletedStaffingId';
        if (companyRow) {
            companyRow[fieldToPopulate].forEach((element: any) => {
                unit = unit ? `${unit}` : element?.organizationUnitId?.unitName;
                positions.push(element.staffingName);
                staffingIdArray.push(element._id);
            });
        }
        return {
            organizationUnit: unit,
            staffing: positions,
            staffingIdArray
        };
    }

    addNewUser(): void {
        const newUserDialogOpen = this.disalogService.open(NewUserComponent, { context: { defaultSubscriptionType: this.defaultSubscriptionType } });
        this.newUserDialogClose = newUserDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close') {
                if (this.toggleStatusFilter) {
                    this.pageChange(1);
                }
            }
        });
    }

    verifyUser(rowData: any): void {
        this.loadingTable = true;
        const companyRow = this.getCompanyRow(rowData.action.company);
        if (rowData) {
            const user = {
                userId: rowData.action.id,
                companyRowId: companyRow._id
            };
            this.manageUserService
                .verifyOrganizationUser(user)
                .pipe(
                    finalize(() => {
                        this.loadingTable = false;
                    })
                )
                .subscribe({
                    next: () => {
                        this.totalRecords -= 1;
                        if (!this.totalRecords) {
                            this.dataFound = false;
                        }
                        this.tableData = this.tableData.filter((data: any) => data._id !== user.userId);
                        this.createTableData(this.tableData, this.options.status === 'verified' ? true : false);
                        this.utilsService.showToast('success', MSG_KEY_CONSTANT_USER.USER_VERIFIED);
                    },
                    error: (err) => {
                        this.utilsService.showToast('warning', err?.message);
                    }
                });
        }
    }

    enableUser(rowData: any): void {
        const enableDialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.translate.instant('COMMON.ALERT_MSG.ENABLE_DATA_RECORD', { recordType: 'user', name: this.titleCasePipe.transform(rowData.firstName) }) }, hasBackdrop: true, closeOnBackdropClick: false });
        this.dialogClose = enableDialogOpen.onClose.subscribe((closeRes) => {
            if (closeRes) {
                this.loadingTable = true;
                const companyRow = this.getCompanyRow(rowData.company);
                if (rowData) {
                    const user = {
                        userId: rowData.id,
                        companyRowId: companyRow._id,
                        staffingId: rowData.staffingId,
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
                                this.tableData = this.tableData.filter((data: any) => data._id !== user.userId);
                                this.createTableData(this.tableData, this.options.status === 'verified' ? true : false);
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

    deleteUser(user: any): void {
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
                        staffingId: user.staffingId
                    };
                    this.manageUserService
                        .disableorganizationUser(disableUser)
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
                                this.tableData = this.tableData.filter((data: any) => data._id !== user?._id);
                                this.createTableData(this.tableData, this.options.status === 'verified' ? true : false);
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

    viewUser(user: any): void {
        this.dialogService.open(ViewUserComponent, { context: { user } });
    }

    editUser(data: any): void {
        const editUserDialogOpen = this.disalogService.open(EditUserComponent, { context: { rowData: data } });
        editUserDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close') {
                const savedData: any = res;
                this.tableData = this.tableData.map((item: any) => {
                    if (item._id === savedData._id) {
                        return savedData;
                    }
                    return item;
                });
                this.tableData.sort((data1: any, data2: any) => new Date(data2.updatedAt).getTime() - new Date(data1.updatedAt).getTime());
                this.createTableData(this.tableData, this.options.status === 'verified' ? true : false);
            }
        });
    }

    onSubscriptionChange(event: any): void {
        this.defaultSubscriptionType = event;
        this.pageChange(1);
    }

    initSubscriptionType(): void {
        this.defaultSubscriptionType = this.authService.getDefaultSubscriptionType();
        this.pageChange(1);
    }

    onSearch(query: ISearchQuery): void {
        this.options = { ...this.options, ...query };
        this.pageChange(1);
    }

    getCompanyRow(company: Array<any>): any {
        return company.find((compRowId) => compRowId.subscriptionType === this.defaultSubscriptionType && compRowId.companyId._id === this.user.companyId);
    }

    findAdminUser(rowData: any): boolean {
        const adminUser = rowData.company.find((company: any) => company.companyId._id === this.user.companyId && company.isAdmin);
        if (adminUser) {
            return true;
        }
        return false;
    }
}
