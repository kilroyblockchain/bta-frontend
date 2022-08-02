import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { IBcProjectVersion } from 'src/app/@core/interfaces/bc-manage-project.interface';
import { BcManageProjectService, ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-common-verify-bc-hash',
    templateUrl: './common-verify-bc-hash.html',
    styleUrls: ['./common-verify-bc-hash.scss']
})
export class CommonVerifyBcHashComponent implements OnInit {
    @Input()
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

    constructor(private activeRoute: ActivatedRoute, private readonly manageProjectService: ManageProjectService, private readonly utilsService: UtilsService, private bcManageProjectService: BcManageProjectService) {}

    ngOnInit(): void {
        this.getVersionData();
    }

    getVersionData(): void {
        const versionId = this.activeRoute.snapshot.params['id'];

        this.getLogFileOracleBcHash(versionId);
        this.getTestDataOracleBcHash(versionId);
        this.getTrainDataOracleBcHash(versionId);
        this.getAIModelOracleBcHash(versionId);
    }

    getLogFileOracleBcHash(versionId: string): void {
        this.logFileLoading = true;

        this.bcManageProjectService
            .getLogFileOracleBcHash(versionId)
            .pipe(
                finalize(() => {
                    this.logFileLoading = false;
                })
            )
            .subscribe((res) => {
                this.logFileOracleBCHash = res.data;
            });
    }

    getTestDataOracleBcHash(versionId: string): void {
        this.testDataLoading = true;

        this.bcManageProjectService
            .getTestDataOracleBcHash(versionId)
            .pipe(
                finalize(() => {
                    this.testDataLoading = false;
                })
            )
            .subscribe((res) => {
                this.testDataOracleBcHash = res.data;
            });
    }

    getTrainDataOracleBcHash(versionId: string): void {
        this.trainDataLoading = true;

        this.bcManageProjectService
            .getTrainDataOracleBcHash(versionId)
            .pipe(
                finalize(() => {
                    this.trainDataLoading = false;
                })
            )
            .subscribe((res) => {
                this.trainDataOracleBcHash = res.data;
            });
    }

    getAIModelOracleBcHash(versionId: string): void {
        this.aiModelLoading = true;

        this.bcManageProjectService
            .getAIModelOracleBcHash(versionId)
            .pipe(
                finalize(() => {
                    this.aiModelLoading = false;
                })
            )
            .subscribe((res) => {
                this.aiModelOracleBcHash = res.data;
            });
    }
}
