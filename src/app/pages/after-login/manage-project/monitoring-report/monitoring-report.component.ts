import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { finalize, Subscription } from 'rxjs';
import { ACCESS_TYPE, FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { IMonitoringReport, IProjectVersion } from 'src/app/@core/interfaces/manage-project.interface';
import { AuthService, FileService, ManageProjectService, UtilsService } from 'src/app/@core/services';
import { NewMonitoringReportComponent } from './new-monitoring-report/new-monitoring-report.component';

@Component({
    selector: 'app-monitoring-report',
    templateUrl: './monitoring-report.component.html',
    styles: [
        `
            .docs {
                cursor: pointer;
                margin: 2px;
            }
        `
    ]
})
export class MonitoringReportComponent implements OnInit, OnDestroy {
    versionData!: IProjectVersion;
    monitoringReports!: Array<IMonitoringReport>;

    loading!: boolean;
    totalRecords = 0;
    dataFound!: boolean;
    reportsData!: boolean;
    page!: number;
    resultperpage = this.utilsService.getResultsPerPage();
    options!: { [key: string]: unknown };
    newMonitoringReportDialogClose!: Subscription;

    canAddMonitoringReports!: boolean;

    constructor(private activeRoute: ActivatedRoute, private authService: AuthService, public utilsService: UtilsService, private readonly manageProjectService: ManageProjectService, private readonly fileService: FileService, private dialogService: NbDialogService) {}

    ngOnInit(): void {
        this.pageChange(1);
        this.checkAccess();
    }

    ngOnDestroy(): void {
        this.newMonitoringReportDialogClose ? this.newMonitoringReportDialogClose.unsubscribe() : null;
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { ...this.options, page: this.page, limit: this.resultperpage, subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.getVersionData();
    }

    async checkAccess(): Promise<void> {
        this.canAddMonitoringReports = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MODEL_MONITORING, [ACCESS_TYPE.WRITE]);
    }
    getVersionData(): void {
        const versionId = this.activeRoute.snapshot.params['id'];
        this.retrieveVersionData(versionId);
        this.getMonitoringReports(versionId);
    }

    retrieveVersionData(versionId: string): void {
        this.dataFound = false;
        this.loading = true;

        this.manageProjectService
            .getVersionInfo(versionId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        const { data } = res;
                        if (!data) {
                            this.dataFound = false;
                        } else {
                            this.versionData = data;
                            this.dataFound = true;
                        }
                    } else {
                        this.dataFound = false;
                    }
                },
                error: () => {
                    this.dataFound = false;
                }
            });
    }

    getMonitoringReports(versionId: string): void {
        this.loading = true;
        this.reportsData = false;

        this.manageProjectService
            .getVersionReports(versionId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    const { data } = res;
                    if (data.total) {
                        this.totalRecords = data.total;
                        if (!this.totalRecords) {
                            this.reportsData = false;
                        } else {
                            this.reportsData = true;
                        }
                        this.monitoringReports = data.docs;
                    } else {
                        this.totalRecords = 0;
                    }
                },
                error: () => {
                    this.totalRecords = 0;
                }
            });
    }

    openDocs(filename: string): void {
        this.fileService.getFileFromFolder(filename).subscribe((file: Blob) => {
            const urlCreator = window.URL || window.webkitURL;
            const url = urlCreator.createObjectURL(file);
            window.open(url);
            urlCreator.revokeObjectURL(url);
        });
    }

    addNewMonitoringReportModal(versionId: string): void {
        const newMonitoringReportDialogOpen = this.dialogService.open(NewMonitoringReportComponent, { context: { versionId }, hasBackdrop: true, closeOnBackdropClick: false });
        this.newMonitoringReportDialogClose = newMonitoringReportDialogOpen.onClose.subscribe((res) => {
            if (res && res !== 'close') {
                this.pageChange(1);
            }
        });
    }
}
