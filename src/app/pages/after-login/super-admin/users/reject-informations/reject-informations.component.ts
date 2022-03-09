import { Component, OnInit } from '@angular/core';
import { NbDialogRef, NbDialogService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { finalize } from 'rxjs/operators';
import { UtilsService } from 'src/app/@core/services';
import { UserRejectService } from 'src/app/@core/services/user-reject.service';
import { ISearchQuery } from 'src/app/pages/miscellaneous/search-input/search-query.interface';
import { RejectCompanyFormComponent } from '../reject-form/reject-form.component';
import { IRejectInformation } from './reject-information.interface';

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expanded?: boolean;
}
interface FSEntry {
    description: string;
    rejectedBy: string;
    rejectedDate: Date | string;
    rejectedInformation: IRejectInformation;
}
@Component({
    selector: 'app-reject-informations',
    templateUrl: './reject-informations.component.html',
    styles: [
        `
            .nb-column-action {
                width: 100px;
            }
            .nb-column-rejectedBy {
                width: 170px;
            }
            .wrapword {
                white-space: pre-wrap;
            }
        `
    ]
})
export class RejectInformationsComponent implements OnInit {
    rejectedUser!: string;
    companyName!: string;
    columnNames = ['SUPER_ADMIN.COLUMN_NAME.DESCRIPTION', 'SUPER_ADMIN.COLUMN_NAME.REJECTED_BY / SUPER_ADMIN.COLUMN_NAME.DATE', 'COMMON.COLUMN_NAME.ACTION'];
    columns = ['description', 'rejectedBy', 'action'];
    tableData: Array<IRejectInformation> = [];
    dataSource!: NbTreeGridDataSource<FSEntry>;
    totalRecords!: number;
    page = 1;
    resultperpage = this.utilsService.getResultsPerPage();
    options = {};
    dataFound!: boolean;
    loading!: boolean;
    constructor(private ref: NbDialogRef<RejectInformationsComponent>, private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>, public utilsService: UtilsService, private userRejectService: UserRejectService, private dialogService: NbDialogService) {}

    ngOnInit(): void {
        this.pageChange(1);
    }

    pageChange(page: number): void {
        this.page = page;
        this.options = {
            ...this.options,
            page: this.page,
            limit: this.resultperpage
        };
        this.getAllRejectInformations();
    }

    getAllRejectInformations(): void {
        this.loading = true;
        this.tableData = [];
        this.dataFound = false;
        this.userRejectService
            .getRejectInformationsOfUser(this.rejectedUser, this.options)
            .pipe(finalize(() => (this.loading = false)))
            .subscribe((res) => {
                if (res && res.success) {
                    this.tableData = res.data.docs;
                    this.dataSource = this.dataSourceBuilder.create(this.createTableData(this.tableData));
                    this.totalRecords = res.data.total;
                    this.dataFound = true;
                }
            });
    }

    createTableData(rejectedInformations: Array<IRejectInformation>): Array<TreeNode<FSEntry>> {
        return rejectedInformations.map((rejectedInformation) => {
            return {
                data: {
                    description: rejectedInformation.rejectionDescription ?? '',
                    rejectedBy: rejectedInformation.rejectedByUserDetail.name,
                    rejectedDate: rejectedInformation.createdAt ? new Date(rejectedInformation.createdAt) : '-',
                    rejectedInformation
                }
            };
        });
    }

    openEditDialog(data: FSEntry): void {
        const openDialog = this.dialogService.open(RejectCompanyFormComponent, { context: { rejectedInformation: data.rejectedInformation } });
        openDialog.onClose.subscribe((closeRes) => {
            if (closeRes) {
                this.pageChange(1);
            }
        });
    }

    closeModal(): void {
        this.ref.close();
    }

    onSearch(query: ISearchQuery): void {}
}
