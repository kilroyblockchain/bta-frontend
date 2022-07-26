import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { IAiModelExp } from 'src/app/@core/interfaces/manage-project.interface';
import { AuthService, ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-compare-log-files',
    templateUrl: './compare-log-files.component.html',
    styleUrls: ['./compare-logs-files.component.scss']
})
export class CompareLogFilesComponent implements OnInit {
    loading!: boolean;
    loadingReviewed!: boolean;

    versionExpDataFound!: boolean;
    reviewedExpDataFound!: boolean;

    versionExperimentData!: Array<IAiModelExp[]>;
    reviewedModelExperimentData!: Array<IAiModelExp[]>;

    constructor(private activeRoute: ActivatedRoute, private router: Router, private translate: TranslateService, public utilsService: UtilsService, private manageProjectService: ManageProjectService, private authService: AuthService) {}

    ngOnInit(): void {
        const versionId = this.activeRoute.snapshot.params['versionId'];
        const reviewedModelId = this.activeRoute.snapshot.params['reviewId'];

        this.getAllExperimentDetails(versionId);
        this.getReviewedModelAllExperimentDetails(reviewedModelId);
    }

    getAllExperimentDetails(versionId: string): void {
        this.loading = true;
        this.versionExpDataFound = false;

        this.manageProjectService
            .getAllExperimentDetails(versionId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    const { data } = res;
                    if (data.length) {
                        this.versionExperimentData = data;
                        this.versionExpDataFound = true;
                    } else {
                        this.versionExpDataFound = false;
                    }
                },
                error: () => {
                    this.versionExpDataFound = false;
                }
            });
    }

    getReviewedModelAllExperimentDetails(reviewModelId: string): void {
        this.loadingReviewed = true;
        this.reviewedExpDataFound = false;

        this.manageProjectService
            .getAllExperimentDetails(reviewModelId)
            .pipe(
                finalize(() => {
                    this.loadingReviewed = false;
                })
            )
            .subscribe({
                next: (res) => {
                    const { data } = res;
                    if (!data.length) {
                        this.reviewedExpDataFound = false;
                    } else {
                        this.reviewedModelExperimentData = data;
                        this.reviewedExpDataFound = true;
                    }
                },
                error: () => {
                    this.reviewedExpDataFound = false;
                }
            });
    }
}
