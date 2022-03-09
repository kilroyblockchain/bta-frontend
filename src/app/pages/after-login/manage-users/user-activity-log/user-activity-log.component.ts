import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { Component, OnInit } from '@angular/core';
import { ManageUserService, UtilsService } from 'src/app/@core/services';
import { finalize } from 'rxjs/operators';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';
import { formatDate } from '@angular/common';

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expanded?: boolean;
}

interface FSEntry {
    userId: string;
    name: string;
    email: string;
    phone: string;
    organizationName: string;
    loggedInDate: string;
    loggedOutDate: string;
    blockchainVerified: boolean;
}

@Component({
    selector: 'app-user-activity-log',
    templateUrl: './user-activity-log.component.html',
    styles: [
        `
            .all {
                background: #bbbbbb !important;
            }
            .show-logged-in-btn {
                margin-bottom: 10px;
            }
        `
    ]
})
export class UserActivityLogComponent implements OnInit {
    page!: number;
    dataSource!: NbTreeGridDataSource<FSEntry>;
    totalRecords = 0;
    resultperpage = this.utilsService.getResultsPerPage();
    columns: Array<string> = [];
    columnNames: Array<string> = [];
    options = {};
    loading = true;
    dataFound = false;
    tableData: any[] = [];
    loadingTable = false;
    showLoggedInUsers = true;
    isUserSuperAdmin: boolean;

    constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, public manageUserService: ManageUserService, public utilsService: UtilsService) {
        this.isUserSuperAdmin = this.utilsService.checkIsUserSuperAdmin();
        this.setColumns();
    }

    ngOnInit(): void {
        this.pageChange(1);
    }

    async setColumns(): Promise<any> {
        if (this.isUserSuperAdmin) {
            this.columns = ['name', 'phone', 'organizationName', 'loggedInDate', 'loggedOutDate'];
            this.columnNames = ['COMMON.COLUMN_NAME.NAME', 'COMMON.COLUMN_NAME.PHONE', 'PERSONAL_DETAIL.LABEL.ORGANIZATION', 'COMMON.COLUMN_NAME.LOGGED_IN_AT', 'COMMON.COLUMN_NAME.LOGGED_OUT_AT'];
        } else {
            this.columns = ['name', 'phone', 'loggedInDate', 'loggedOutDate'];
            this.columnNames = ['COMMON.COLUMN_NAME.NAME', 'COMMON.COLUMN_NAME.PHONE', 'COMMON.COLUMN_NAME.LOGGED_IN_AT', 'COMMON.COLUMN_NAME.LOGGED_OUT_AT'];
        }
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { ...this.options, page: this.page, limit: this.resultperpage, loginOnly: this.showLoggedInUsers ? true : false };
        this.getAllUsers();
    }

    getAllUsers(): void {
        this.dataFound = false;
        this.loading = true;
        this.totalRecords = 0;
        this.tableData = [];
        this.manageUserService
            .getAllUserActivityOfOrganization(this.options)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.total && res.docs) {
                        this.totalRecords = res.total;
                        this.dataFound = true;
                        this.tableData = res.docs;
                        this.dataSource = this.dataSourceBuilder.create(this.createTableData(this.tableData));
                    }
                }
            });
    }

    createTableData(users: Array<any>): Array<TreeNode<FSEntry>> {
        const dataArray = users.map((user) => {
            return {
                data: {
                    userId: user.userId,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    phone: user.phone,
                    organizationName: user.organization && user.organization.name ? user.organization.name : '-',
                    loggedInDate: user.loggedInDate ? formatDate(user.loggedInDate, 'yyyy-MM-dd HH:mm', 'en') : '-',
                    loggedOutDate: user.loggedOutDate ? formatDate(user.loggedOutDate, 'yyyy-MM-dd HH:mm', 'en') : '-',
                    blockchainVerified: user.blockchainVerified ?? false
                }
            };
        });
        return dataArray;
    }

    onSearch(query: ISearchQuery): void {
        this.options = { ...this.options, ...query };
        this.pageChange(1);
    }

    toggleOnlineButton(): void {
        this.showLoggedInUsers = !this.showLoggedInUsers;
        this.pageChange(1);
    }

    showLoggedInUsersStatus(loggedOutDate: string): boolean {
        if (!this.showLoggedInUsers && (!loggedOutDate || loggedOutDate === '-')) return true;
        return false;
    }
}
