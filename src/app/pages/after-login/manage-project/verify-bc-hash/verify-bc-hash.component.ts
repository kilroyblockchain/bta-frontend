import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { IBcProjectVersion } from 'src/app/@core/interfaces/bc-manage-project.interface';
import { BcManageProjectService } from 'src/app/@core/services';

@Component({
    selector: 'app-verify-bc-hash',
    templateUrl: './verify-bc-hash.component.html'
})
export class VerifyBcHashComponent implements OnInit {
    modelVersionBcDetails!: IBcProjectVersion;

    dataFound!: boolean;
    loading!: boolean;

    logFileOracleBCHash!: string;
    testDataOracleBcHash!: string;
    trainDataOracleBcHash!: string;
    aiModelOracleBcHash!: string;

    logFileLoading!: boolean;
    testDataLoading!: boolean;
    trainDataLoading!: boolean;
    aiModelLoading!: boolean;

    constructor(private activeRoute: ActivatedRoute, private bcManageProjectService: BcManageProjectService) {}

    ngOnInit(): void {
        this.getVersionData();
    }

    getVersionData(): void {
        const versionId = this.activeRoute.snapshot.params['id'];
        this.getVersionBcDetails(versionId);
    }

    getVersionBcDetails(versionId: string): void {
        this.loading = true;

        this.bcManageProjectService
            .getProjectVersionBcDetails(versionId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        const { data } = res.data;
                        this.modelVersionBcDetails = data;
                        this.dataFound = true;
                    } else {
                        this.dataFound = false;
                    }
                },
                error: () => {
                    this.dataFound = false;
                }
            });
    }
}
