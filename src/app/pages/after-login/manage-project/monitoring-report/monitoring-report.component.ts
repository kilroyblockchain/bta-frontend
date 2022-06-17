import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { IMonitoringReport, IProjectVersion } from 'src/app/@core/interfaces/manage-project.interface';
import { AuthService, FileService, ManageProjectService, UtilsService } from 'src/app/@core/services';

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
export class MonitoringReportComponent implements OnInit {
    versionData!: IProjectVersion;
    monitoringReports!: Array<IMonitoringReport>;

    loading!: boolean;
    totalRecords = 0;
    dataFound!: boolean;
    reportsData!: boolean;
    page!: number;
    resultperpage = this.utilsService.getResultsPerPage();
    options!: { [key: string]: unknown };

    constructor(private activeRoute: ActivatedRoute, private authService: AuthService, public utilsService: UtilsService, private readonly manageProjectService: ManageProjectService, private readonly fileService: FileService) {}

    ngOnInit(): void {
        this.pageChange(1);
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { ...this.options, page: this.page, limit: this.resultperpage, subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.getVersionData();
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
}
