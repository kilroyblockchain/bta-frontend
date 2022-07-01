import { TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { finalize, Subscription } from 'rxjs';
import { IBcNodeInfo } from 'src/app/@core/interfaces/bc-node-info.interface';
import { AuthService, BlockChainService, UtilsService } from 'src/app/@core/services';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';
import { EditBcNodeInfoComponent } from './edit-bc-node/edit-bc-node.component';
import { NewBcNodeComponent } from './new-bc-node/new-bc-node.component';

interface TreeNode<T> {
    data: T;
}
interface FSEntry {
    orgName: string;
    label: string;
    nodeUrl: string;
    status: boolean;
    authorizationToken?: string;
    addedBy: string;
    updatedAt: Date;
    createdAt: Date;
    action: unknown;
    subrow: boolean;
    _id: string;
}

@Component({
    selector: 'app-bc-node-info',
    templateUrl: './bc-node-info.component.html'
})
export class BcNodeComponent implements OnInit, OnDestroy {
    private data: TreeNode<FSEntry>[] = [];
    dataSource!: NbTreeGridDataSource<FSEntry>;

    page!: number;
    options: { [key: string]: unknown } = {};
    resultperpage = this.utilsService.getResultsPerPage();
    toggleStatusFilter = true;
    dataFound!: boolean;
    logsData!: boolean;
    totalRecords = 0;
    loading!: boolean;

    columns!: Array<string>;
    columnNameKeys!: Array<string>;
    columnsName: Array<string> = [];

    tableData!: Array<IBcNodeInfo>;
    loadingTable!: boolean;

    newBcNodeDialogClose!: Subscription;
    editBcNodeDialogClose!: Subscription;

    constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, private dialogService: NbDialogService, private titleCasePipe: TitleCasePipe, private translate: TranslateService, private blockchainService: BlockChainService, public utilsService: UtilsService, private authService: AuthService) {
        this.dataSource = this.dataSourceBuilder.create(this.data);
    }

    ngOnInit(): void {
        this.pageChange(1);
        this.setTranslatedTableColumns();
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { ...this.options, page: this.page, limit: this.resultperpage, status: this.toggleStatusFilter, subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.getBcNodeData();
    }

    ngOnDestroy(): void {
        this.newBcNodeDialogClose ? this.newBcNodeDialogClose.unsubscribe() : null;
        this.editBcNodeDialogClose ? this.editBcNodeDialogClose.unsubscribe() : null;
    }

    setTranslatedTableColumns(): void {
        this.columns = ['orgName', 'label', 'nodeUrl', 'authorizationToken', 'addedBy', 'createdAt', 'status', 'updatedAt', 'action'];
        this.columnNameKeys = ['BLOCKCHAIN.BC_NODE_INFO.COLUMN_NAME.ORGANIZATION_NAME', 'BLOCKCHAIN.BC_NODE_INFO.COLUMN_NAME.LABEL', 'BLOCKCHAIN.BC_NODE_INFO.COLUMN_NAME.NODE_URL', 'BLOCKCHAIN.BC_NODE_INFO.COLUMN_NAME.AUTHORIZATION_TOKEN', 'COMMON.COLUMN_NAME.CREATED_BY', 'COMMON.COLUMN_NAME.CREATED_AT', 'COMMON.COLUMN_NAME.STATUS', 'COMMON.COLUMN_NAME.UPDATED_AT', 'COMMON.COLUMN_NAME.ACTION'];

        this.translate.get(this.columnNameKeys).subscribe((data: object) => {
            this.columnsName = Object.values(data);
        });
    }

    toggleTable(): void {
        this.loading = true;
        this.dataFound = false;
        this.loadingTable = false;
        this.tableData = [];
        this.toggleStatusFilter = !this.toggleStatusFilter;
        this.pageChange(1);
    }

    onSearch(query: ISearchQuery): void {
        if (query.searchValue) {
            query.searchValue = encodeURIComponent(query.searchValue);
        }
        this.options = { ...this.options, ...query };
        this.pageChange(1);
    }

    getBcNodeData(): void {
        this.dataFound = false;
        this.loading = true;

        this.blockchainService
            .getAllBcInfo(this.options)
            .pipe(
                finalize(() => {
                    this.loading = false;
                    this.loadingTable = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        this.totalRecords = res.data.total;
                        if (!this.totalRecords) {
                            this.dataFound = false;
                        } else {
                            this.dataFound = true;
                        }
                        this.tableData = res.data.docs;
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

    createTableData(data: IBcNodeInfo[]): void {
        this.data = [];

        for (const item of data) {
            this.data.push({
                data: {
                    orgName: item.orgName,
                    label: item.label,
                    nodeUrl: item.nodeUrl,
                    status: item.status,
                    authorizationToken: item.authorizationToken,
                    addedBy: this.titleCasePipe.transform(item.addedBy.firstName + ' ' + item.addedBy.lastName),
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    _id: item._id,
                    subrow: false,
                    action: item
                }
            });
            this.dataSource = this.dataSourceBuilder.create(this.data);
        }
    }

    addNewBcNodeModal(): void {
        const newBcNodeDialogOpen = this.dialogService.open(NewBcNodeComponent, { context: {}, hasBackdrop: true, closeOnBackdropClick: false });
        this.newBcNodeDialogClose = newBcNodeDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close') {
                this.pageChange(1);
            }
        });
    }

    openEditBcNodeModal(rowData: IBcNodeInfo): void {
        const editBcNodeDialogOpen = this.dialogService.open(EditBcNodeInfoComponent, { context: { rowData }, hasBackdrop: true, closeOnBackdropClick: false });
        this.editBcNodeDialogClose = editBcNodeDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close' && res.success) {
                this.pageChange(1);
            }
        });
    }
}
