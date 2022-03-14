import { VerifyUserComponent } from './verify-user/verify-user.component';
import { Component, Input, OnInit } from '@angular/core';
import { NbSortDirection, NbTreeGridDataSource, NbTreeGridDataSourceBuilder, NbDialogService } from '@nebular/theme';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { UtilsService, AuthService, LangTranslateService } from 'src/app/@core/services';
import { ViewUserComponent } from '../../user/view-user/view-user.component';
import { FEATURE_IDENTIFIER } from 'src/app/@core/constants/featureIdentifier.enum';
import { ACCESS_TYPE } from 'src/app/@core/constants/accessType.enum';
import { AddSubscriptionTypeComponent } from './add-subscriptionType/add-subscriptionType.component';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';
import { finalize } from 'rxjs/operators';
import { RejectCompanyFormComponent } from './reject-form/reject-form.component';
import { RejectInformationsComponent } from './reject-informations/reject-informations.component';
import { AlertComponent } from 'src/app/pages/miscellaneous/alert/alert.component';
import { IUserCompany, IUserRes } from 'src/app/@core/interfaces/user-data.interface';

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expanded?: boolean;
}

interface FSEntry {
    name: string;
    companyName: string;
    address?: string;
    email?: string;
    phone?: string;
    adminType: string;
    nonAdminType: string;
    adminCompanyList: string;
    nonAdminCompanyList: string;
    verified?: boolean;
    blockchainVerified?: boolean;
    id?: string;
    company?: IUserCompany[];
    companyId?: string;
    createdat?: string;
    extra: IUserRes;
}

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    providers: [TitleCasePipe]
})
export class UsersComponent implements OnInit {
    @Input()
    companyUsers!: boolean;
    @Input()
    unverifiedUsers!: boolean;
    @Input()
    rejectedCompanies!: boolean;
    @Input()
    blockedUsers!: boolean;
    defaultColumnsNames = ['SUPER_ADMIN.COLUMN_NAME.ORGANIZATION/SUPER_ADMIN.COLUMN_NAME.POST', 'COMMON.COLUMN_NAME.NAME/SUPER_ADMIN.COLUMN_NAME.ADDRESS', 'COMMON.COLUMN_NAME.EMAIL/COMMON.COLUMN_NAME.PHONE', 'COMMON.COLUMN_NAME.ACTION'];
    defaultColumns = ['companyName', 'name', 'email', 'action'];
    allColumns = [...this.defaultColumns];
    dataSource: NbTreeGridDataSource<FSEntry>;
    sortColumn!: string;
    sortDirection: NbSortDirection = NbSortDirection.NONE;
    totalRecords!: number;
    options: { [key: string]: unknown } = {};
    page = 1;
    resultperpage = 10;
    loadingTable!: boolean;
    loading = true;
    tableData!: IUserRes[];
    dataFound = false;
    toggleStatusFilter!: boolean;
    subscriptionType = 'all';
    canDelete!: boolean;
    canVerify!: boolean;
    canAddOrgToSupervisor!: boolean;

    private data: TreeNode<FSEntry>[] = [];

    constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private authService: AuthService, public utilsService: UtilsService, private dialogService: NbDialogService, private titleCasePipe: TitleCasePipe, private langTranslateService: LangTranslateService) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    ngOnInit(): void {
        this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MANAGE_ALL_USER, [ACCESS_TYPE.READ]).then((isManageAllUserAccess) => {
            if (isManageAllUserAccess) {
                this.pageChange(1);
                this.checkAccess();
            }
        });
        this.toggleStatusFilter = this.unverifiedUsers ? false : true;
    }

    async checkAccess(): Promise<void> {
        this.canVerify = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MANAGE_ALL_USER, [ACCESS_TYPE.UPDATE]);
        this.canDelete = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MANAGE_ALL_USER, [ACCESS_TYPE.DELETE]);
    }

    retrieveAllUserData(): void {
        this.dataFound = false;
        this.loading = true;
        this.authService
            .getAllUserData(this.options)
            .pipe(
                finalize(() => {
                    this.loading = false;
                    this.loadingTable = false;
                })
            )
            .subscribe({
                next: (data) => {
                    this.totalRecords = data.total;
                    if (!this.totalRecords) {
                        this.dataFound = false;
                    } else {
                        this.dataFound = true;
                    }
                    this.tableData = data.docs;
                    this.createTableData(this.tableData, this.options['status'] === 'verified' ? true : false);
                }
            });
    }

    toggleTable(): void {
        this.loading = true;
        this.loadingTable = false;
        this.dataFound = false;
        this.toggleStatusFilter = !this.toggleStatusFilter;
        this.pageChange(1);
    }

    async createTableData(data: IUserRes[], status: boolean): Promise<void> {
        this.data = [];
        for await (const item of data) {
            const comp = item.company.filter((element: IUserCompany) => (this.options['subscriptionType'] === 'all' ? true : element.subscriptionType === this.options['subscriptionType']));
            const adminCompanyList: string[] = [];
            const nonAdminCompanyList: string[] = [];
            const adminTypes: string[] = [];
            const nonAdminTypes: string[] = [];
            comp.forEach((element: IUserCompany) => {
                if (element.isAdmin) {
                    if (!adminCompanyList.includes(element.companyId.companyName)) {
                        adminCompanyList.push(element.companyId.companyName);
                    }
                    if (!adminTypes.includes(this.utilsService.getFullSubscriptionType(element.subscriptionType))) {
                        if (this.toggleStatusFilter) {
                            if (!element.isDeleted) {
                                adminTypes.push(this.utilsService.getFullSubscriptionType(element.subscriptionType));
                            }
                        } else {
                            if (element.isDeleted) {
                                adminTypes.push(this.utilsService.getFullSubscriptionType(element.subscriptionType));
                            }
                        }
                    }
                } else {
                    if (!nonAdminCompanyList.includes(element.companyId.companyName)) {
                        nonAdminCompanyList.push(element.companyId.companyName);
                    }
                    if (!nonAdminTypes.includes(this.utilsService.getFullSubscriptionType(element.subscriptionType))) {
                        if (this.toggleStatusFilter) {
                            if (!element.isDeleted) {
                                nonAdminTypes.push(this.utilsService.getFullSubscriptionType(element.subscriptionType));
                            }
                        } else {
                            if (element.isDeleted) {
                                nonAdminTypes.push(this.utilsService.getFullSubscriptionType(element.subscriptionType));
                            }
                        }
                    }
                }
            });

            this.data.push({
                data: {
                    name: this.titleCasePipe.transform(item.firstName + ' ' + item.lastName),
                    companyName: Array.from(new Set(comp.map((compName: IUserCompany) => compName.companyId.companyName))).join(','),
                    adminCompanyList: adminCompanyList.join(','),
                    nonAdminCompanyList: nonAdminCompanyList.join(','),
                    address: item.address,
                    email: item.email,
                    phone: item.phone,
                    blockchainVerified: item.blockchainVerified,
                    adminType: adminTypes.join(','),
                    nonAdminType: nonAdminTypes.join(','),
                    verified: status,
                    id: item._id,
                    company: comp,
                    createdat: new DatePipe('en-US').transform(item.createdAt, 'yyyy-MM-dd') as string,
                    extra: item
                }
            });
        }

        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    verifyUser(rowData: FSEntry): void {
        const { extra: userData } = rowData;
        const dialogResponse = this.dialogService.open(VerifyUserComponent, { context: { rowData: userData, unverifiedUsers: this.unverifiedUsers, enabled: this.toggleStatusFilter } });
        dialogResponse.onClose.subscribe((res) => {
            if (res === 'save') {
                this.pageChange(1);
            }
        });
    }

    pageChange(newPage: number): void {
        this.page = newPage;

        this.options = { ...this.options, page: this.page, limit: this.resultperpage, status: this.toggleStatusFilter ? 'verified' : 'notverified', subscriptionType: this.subscriptionType, companyUsers: this.companyUsers, unverifiedUsers: this.unverifiedUsers, rejectedCompanies: this.rejectedCompanies, blockedUsers: this.blockedUsers };
        this.retrieveAllUserData();
    }

    viewUser(data: FSEntry): void {
        const { extra: userData } = data;
        this.dialogService.open(ViewUserComponent, { context: { user: userData } });
    }

    addSubscriptionType(id: string, name: string, data: FSEntry): void {
        const { extra: userData } = data;
        const dialogResponse = this.dialogService.open(AddSubscriptionTypeComponent, { context: { selectedUserId: id, name, data: userData, type: 'CREATE' }, hasBackdrop: true, closeOnBackdropClick: false });
        dialogResponse.onClose.subscribe((res) => {
            if (res === 'save') {
                this.pageChange(1);
            }
        });
    }

    onSearch(query: ISearchQuery): void {
        this.options = { ...this.options, ...query };
        this.pageChange(1);
    }

    rejectUser(userId: string): void {
        const dialogOpen = this.dialogService.open(RejectCompanyFormComponent, { context: { rejectedUser: userId }, hasBackdrop: true, closeOnBackdropClick: false });
        dialogOpen.onClose.subscribe((closeRes) => {
            if (closeRes && closeRes.rejectedUser) {
                this.pageChange(1);
            }
        });
    }

    viewRejectInformations(user: FSEntry): void {
        this.dialogService.open(RejectInformationsComponent, { context: { rejectedUser: user.id, companyName: user.companyName } });
    }

    unblockUser(user: FSEntry): void {
        const userId = user.id as string;
        const dialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.langTranslateService.translateKey('SUPER_ADMIN.ALERT_MSG.UNBLOCK_USER', { name: user.name }) }, hasBackdrop: true, closeOnBackdropClick: false });
        dialogOpen.onClose.subscribe((dialogRes) => {
            if (dialogRes) {
                this.loading = true;
                this.loadingTable = true;
                this.authService
                    .unblockUser(userId)
                    .pipe(
                        finalize(() => {
                            this.loading = false;
                            this.loadingTable = false;
                        })
                    )
                    .subscribe({
                        next: (res) => {
                            this.utilsService.showToast('success', res?.message);
                            this.pageChange(this.page);
                        },
                        error: (err) => {
                            this.utilsService.showToast('warning', err?.message);
                        }
                    });
            }
        });
    }
}
