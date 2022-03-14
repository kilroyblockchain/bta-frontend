import { Component, OnInit } from '@angular/core';
import { NbDialogRef, NbDialogService, NbTreeGridDataSource, NbSortDirection, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { finalize } from 'rxjs/operators';
import { IUserCompany, IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, LangTranslateService, ManageUserService, UtilsService } from 'src/app/@core/services';
import { BCChannelService, IBCChannelDetail } from 'src/app/@core/services/bc-channel.service';
import { AlertComponent } from 'src/app/pages/miscellaneous/alert/alert.component';
import { IUserActionRow } from '../user.interface';

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expanded?: boolean;
}

interface FSEntry {
    companyName: string;
    id?: string;
    companyId: string;
    subscriptionType: string;
    verify: boolean;
    isDeleted: boolean;
    assignedSubscription: string;
}

@Component({
    selector: 'app-verify-user',
    templateUrl: './verify-user.component.html'
})
export class VerifyUserComponent implements OnInit {
    rowData!: IUserRes;
    userId!: string;
    delete!: boolean;
    unverifiedUsers!: boolean;
    defaultColumnsNames = ['COMMON.COLUMN_NAME.ORGANIZATION_NAME', 'SUPER_ADMIN.COLUMN_NAME.SUBSCRIPTION_TYPE', 'COMMON.COLUMN_NAME.ACTION'];
    defaultColumns = ['companyName', 'subscriptionType', 'action'];
    allColumns = [...this.defaultColumns];
    dataSource: NbTreeGridDataSource<FSEntry>;
    sortColumn!: string;
    sortDirection: NbSortDirection = NbSortDirection.NONE;
    loading!: boolean;
    enabled!: boolean;
    defaultChannel!: IBCChannelDetail;

    private data: TreeNode<FSEntry>[] = [];

    constructor(public utilsService: UtilsService, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private authService: AuthService, private dialogService: NbDialogService, protected ref: NbDialogRef<VerifyUserComponent>, private manageUserService: ManageUserService, private bcChannelService: BCChannelService, private langTranslateService: LangTranslateService) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    ngOnInit(): void {
        this.createTableData(this.rowData.company.filter((element: IUserCompany) => element.isDeleted === !this.enabled));
        this.patchChannel();
    }

    patchChannel(): void {
        this.loading = true;
        this.bcChannelService
            .getDefaultChannel()
            .pipe(finalize(() => (this.loading = false)))
            .subscribe((res) => {
                if (res && res.success && res.data) {
                    this.defaultChannel = res.data;
                }
            });
    }

    createTableData(companyData: Array<IUserCompany>): void {
        this.data = [];
        for (const item of companyData) {
            this.data.push({
                data: {
                    companyName: item.companyId.companyName,
                    id: item._id,
                    companyId: item.companyId._id,
                    subscriptionType: this.utilsService.getFullSubscriptionType(item.subscriptionType),
                    verify: item.verified,
                    isDeleted: 'isDeleted' in item ? item.isDeleted : true,
                    assignedSubscription: item.subscriptionType
                }
            });
        }
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    verifyUser(data: FSEntry): void {
        this.loading = true;
        const user: IUserActionRow = {
            userId: this.rowData.id,
            companyRowId: data.id as string,
            companyId: data.companyId,
            isRegisteredUser: true,
            subscriptionType: data.assignedSubscription,
            channelId: this.defaultChannel?._id ?? ''
        };
        this.authService
            .verifyUser(user)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    this.utilsService.showToast('success', res?.message);
                    this.ref.close('save');
                },
                error: (err) => {
                    this.utilsService.showToast('warning', err?.message);
                    this.ref.close('close');
                }
            });
    }

    enableUser(id: string, data: FSEntry): void {
        const dialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.langTranslateService.translateKey('COMMON.ALERT_MSG.ENABLE_DATA_RECORD', { name: `${data.companyName} (${data.subscriptionType})`, recordType: '' }) }, hasBackdrop: true, closeOnBackdropClick: false });
        dialogOpen.onClose.subscribe((res) => {
            if (res) {
                this.loading = true;
                const user = {
                    userId: this.rowData.id,
                    companyRowId: id,
                    companyId: data.companyId,
                    isRegisteredUser: true,
                    subscriptionType: data.assignedSubscription
                };
                this.manageUserService
                    .enableOrganizationUser(user)
                    .pipe(
                        finalize(() => {
                            this.loading = false;
                        })
                    )
                    .subscribe({
                        next: (resData) => {
                            this.ref.close('save');
                            this.utilsService.showToast('success', resData?.message);
                        },
                        error: (err) => {
                            this.utilsService.showToast('warning', err?.message);
                        }
                    });
            }
        });
    }

    disableUser(id: string, rowData: FSEntry): void {
        const dialogOpen = this.dialogService.open(AlertComponent, { context: { alert: false, question: this.langTranslateService.translateKey('COMMON.ALERT_MSG.DISABLE_DATA_RECORD', { name: `${rowData.companyName} (${rowData.subscriptionType})`, recordType: '' }) }, hasBackdrop: true, closeOnBackdropClick: false });
        dialogOpen.onClose.subscribe((res) => {
            if (res) {
                this.loading = true;
                const user = {
                    userId: this.rowData.id,
                    companyRowId: id,
                    companyId: rowData.companyId,
                    isRegisteredUser: true,
                    subscriptionType: rowData.assignedSubscription
                };
                this.authService
                    .deleteUser(user)
                    .pipe(
                        finalize(() => {
                            this.loading = false;
                        })
                    )
                    .subscribe({
                        next: (data) => {
                            if (data.success) {
                                this.ref.close('save');
                            }
                            this.utilsService.showToast('success', data?.message);
                        },
                        error: (err) => {
                            this.utilsService.showToast('warning', err?.message);
                        }
                    });
            }
        });
    }

    closeModal(): void {
        this.ref.close('close');
    }
}
