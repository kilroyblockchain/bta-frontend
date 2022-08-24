import { EditChannelComponent } from './edit-channel/edit-channel.component';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { finalize, Subject } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { IChannelDetails } from 'src/app/@core/interfaces/channel-details.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, LangTranslateService, ManageChannelDetailsService, UtilsService } from 'src/app/@core/services';
import { AlertComponent } from 'src/app/pages/miscellaneous/alert/alert.component';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';
import { NewChannelComponent } from './new-channel/new-channel.component';

interface FSEntry {
    channelName: string;
    connectionProfileName: string;
    isDefault: boolean;
    action: IChannelDetails;
    status: boolean;
}

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expanded?: boolean;
}

@Component({
    selector: 'app-channel-details',
    templateUrl: './manage-channel.component.html',
    providers: [TitleCasePipe]
})
export class ChannelSetUpComponent implements OnInit, OnDestroy {
    dataSource!: NbTreeGridDataSource<FSEntry>;
    private data: TreeNode<FSEntry>[] = [];
    totalRecords = 0;
    resultperpage = this.utilsService.getResultsPerPage();
    page!: number;
    loading!: boolean;
    dataFound!: boolean;
    columns: Array<string> = ['channelName', 'connectionProfileName', 'isDefault', 'status', 'action'];
    columnsName: Array<string> = ['Channel Name', 'Profile Name', 'Default', 'Status', 'Action'];
    dialogClose!: Subscription;
    getAllProjectChannelOfOrganizationSubscription!: Subscription;
    destroy$: Subject<void> = new Subject<void>();
    newChannelDialogClose!: Subscription;
    editChannelDialogClose!: Subscription;
    canAddChannel!: boolean;
    canUpdateChannel!: boolean;
    canDeleteChannel!: boolean;
    tableData: IChannelDetails[] = [];
    loadingTable!: boolean;
    toggleStatusFilter = true;
    options!: { [key: string]: unknown };
    defaultSubscriptionType!: string;
    user!: IUserRes;
    getAllChannelForProject!: Subscription;
    deleteDialogClose!: Subscription;

    constructor(public utilsService: UtilsService, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private authService: AuthService, private readonly dialogService: NbDialogService, private translate: TranslateService, private langTranslateService: LangTranslateService, public datepipe: DatePipe, private readonly manageChannelService: ManageChannelDetailsService) {}

    ngOnInit(): void {
        this.user = this.authService.getUserDataSync();
        this.pageChange(1);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.newChannelDialogClose ? this.newChannelDialogClose.unsubscribe() : null;
        this.editChannelDialogClose ? this.editChannelDialogClose.unsubscribe() : null;
        this.dialogClose ? this.dialogClose.unsubscribe() : null;
        this.getAllProjectChannelOfOrganizationSubscription ? this.getAllProjectChannelOfOrganizationSubscription.unsubscribe() : null;
    }

    addNewChannel(): void {
        const newProject = this.dialogService.open(NewChannelComponent, { context: {}, hasBackdrop: true, closeOnBackdropClick: false });
        this.newChannelDialogClose = newProject.onClose.subscribe((res) => {
            if (res && res !== 'close') {
                if (res.success) {
                    this.pageChange(1);
                }
            }
        });
    }

    toggleTable(): void {
        this.loading = true;
        this.loadingTable = false;
        this.dataFound = false;
        this.tableData = [];
        this.toggleStatusFilter = !this.toggleStatusFilter;
        this.pageChange(1);
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { ...this.options, page: this.page, limit: this.resultperpage, status: this.toggleStatusFilter, subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.getAllChannel();
    }

    getAllChannel(): void {
        if (this.getAllChannelForProject) {
            this.getAllChannelForProject.unsubscribe();
        }
        this.dataFound = false;
        this.loading = true;
        this.getAllChannelForProject = this.manageChannelService
            .getAllChannel(this.options)
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
                        this.tableData = data.docs.filter((d) => d.createdBy === this.user.id);
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

    createTableData(data: IChannelDetails[]): void {
        this.data = [];
        for (const item of data) {
            this.data.push({
                data: {
                    channelName: item.channelName,
                    connectionProfileName: item.connectionProfileName,
                    isDefault: item.isDefault,
                    status: item.status,
                    action: { ...item }
                }
            });
        }
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    onDeleteChannel(rowData: IChannelDetails): void {
        const deleteDialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.translate.instant('Are you Sure to delete Channel'), name: rowData.channelName }, hasBackdrop: true, closeOnBackdropClick: false });
        this.deleteDialogClose = deleteDialogOpen.onClose.subscribe((closeRes) => {
            if (closeRes) {
                this.manageChannelService.deleteChannelDetails(rowData._id as string).subscribe({
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

    openChannelEditModal(rowData: IChannelDetails): void {
        const editChanneltDialogOpen = this.dialogService.open(EditChannelComponent, { context: { rowData }, hasBackdrop: true, closeOnBackdropClick: false });
        this.editChannelDialogClose = editChanneltDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close' && res.success) {
                this.pageChange(1);
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
        this.dataSource.filter(query.searchValue);
    }
}
