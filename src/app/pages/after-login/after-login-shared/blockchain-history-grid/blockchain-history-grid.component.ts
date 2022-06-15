import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from 'src/app/@core/services';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';
import { IBlockchainHistory } from './blockchain-history.interface';

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expanded?: boolean;
}
interface FSEntry {
    TxId: string;
    hashCode: string;
    operation?: string;
    isDeleted?: string;
    timestamp?: string;
}
@Component({
    selector: 'app-blockchain-history-grid',
    templateUrl: './blockchain-history-grid.component.html',
    styles: [
        `
            .nb-column-isDeleted {
                width: 150px;
            }
            .nb-column-timestamp,
            .nb-column-operation {
                width: 200px;
            }
        `
    ],
    providers: [DatePipe]
})
export class BlockchainHistoryGridComponent implements OnChanges {
    @Input()
    tableData!: Array<IBlockchainHistory>;
    @Input()
    blockchainHistoryTitle!: string;
    @Input()
    loading!: boolean;
    columnNames = ['COMMON.COLUMN_NAME.TRANSACTION_ID', 'COMMON.COLUMN_NAME.HASH_CODE', 'COMMON.COLUMN_NAME.TIMESTAMP', 'COMMON.COLUMN_NAME.IS_DELETED', 'COMMON.COLUMN_NAME.OPERATION'];
    columns = ['TxId', 'hashCode', 'timestamp', 'isDeleted', 'operation'];
    dataSource!: NbTreeGridDataSource<FSEntry>;
    totalRecords!: number;
    resultperpage = this.utilsService.getResultsPerPage();
    dataFound!: boolean;

    constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, public utilsService: UtilsService, private datePipe: DatePipe, private translateService: TranslateService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['tableData'] && changes['tableData'].currentValue && changes['tableData'].currentValue.length) {
            this.updateTable(changes['tableData'].currentValue);
        }
    }

    updateTable(tableData: IBlockchainHistory[]): void {
        this.totalRecords = tableData.length;
        if (this.totalRecords) {
            this.dataFound = true;
        }
        this.dataSource = this.dataSourceBuilder.create(this.createTableData(tableData));
        this.loading = false;
    }

    createTableData(blockchainHistories: Array<IBlockchainHistory>): Array<TreeNode<FSEntry>> {
        return blockchainHistories.map((transaction) => {
            return {
                data: {
                    TxId: transaction.TxId,
                    hashCode: transaction?.Value?.hash ?? '-',
                    timestamp: transaction.Timestamp ? <string>this.datePipe.transform(new Date(transaction.Timestamp), 'yyyy-MM-dd, h:mm a') : '-',
                    isDeleted: this.translateService.instant(transaction.IsDelete === 'true' ? 'COMMON.DESCRIPTION.YES' : 'COMMON.DESCRIPTION.NO'),
                    operation: transaction?.Value?.payload ?? '-'
                }
            };
        });
    }

    onSearch(searchQuery: ISearchQuery): void {
        console.log(searchQuery);
    }
}
