import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { finalize, Subscription } from 'rxjs';
import { ACCESS_TYPE, FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { PROJECT_USER } from 'src/app/@core/constants/project-roles.enum';
import { IModelReview, IProjectVersion } from 'src/app/@core/interfaces/manage-project.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, FileService, ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-model-component',
    templateUrl: './model-review.component.html',
    styleUrls: ['./model-review.component.scss']
})
export class ModelReviewComponent implements OnInit, OnDestroy {
    user!: IUserRes;
    versionData!: IProjectVersion;
    modelReviews!: Array<IModelReview>;

    dataFound!: boolean;
    reviewData!: boolean;

    resultperpage = this.utilsService.getResultsPerPage();
    options: { [key: string]: unknown } = {};
    page!: number;
    loading!: boolean;
    totalRecords = 0;

    isCompanyAdmin!: boolean;
    isAIEng!: boolean;
    isMLOpsEng!: boolean;
    isStakeHolder!: boolean;

    canAddReview!: boolean;

    newReviewDialogClose!: Subscription;

    constructor(private dialogService: NbDialogService, private activeRoute: ActivatedRoute, private readonly fileService: FileService, private authService: AuthService, public utilsService: UtilsService, private readonly manageProjectService: ManageProjectService) {
        this.getProjectUser();
    }

    ngOnInit(): void {
        this.pageChange(1);
        this.checkAccess();
    }

    getProjectUser(): void {
        this.user = this.authService.getUserDataSync();

        this.isCompanyAdmin = !!this.user.company.find((f) => f.companyId._id === this.user.companyId && f.isAdmin === true);
        this.isAIEng = !!this.user.company.find((f) => f.staffingId.find((s) => s.staffingName.toLowerCase().includes(PROJECT_USER.AI_ENGINEER.toLowerCase())));
        this.isMLOpsEng = !!this.user.company.find((f) => f.staffingId.find((s) => s.staffingName.toLowerCase().includes(PROJECT_USER.MLOps_ENGINEER.toLowerCase())));
        this.isStakeHolder = !!this.user.company.find((f) => f.staffingId.find((s) => s.staffingName.toLowerCase().includes(PROJECT_USER.STAKEHOLDER.toLowerCase())));
    }

    async checkAccess(): Promise<void> {
        this.canAddReview = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MODEL_REVIEWS, [ACCESS_TYPE.WRITE]);
    }

    ngOnDestroy(): void {
        this.newReviewDialogClose ? this.newReviewDialogClose.unsubscribe() : null;
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { ...this.options, page: this.page, limit: this.resultperpage, subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.getVersionData();
    }

    getVersionData(): void {
        const versionId = this.activeRoute.snapshot.params['id'];
        this.retrieveVersionData(versionId);
        this.getModelReviews(versionId);
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

    getModelReviews(versionId: string): void {
        this.reviewData = false;
        this.loading = true;

        this.manageProjectService
            .getModelReview(this.options, versionId)
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
                            this.reviewData = false;
                        } else {
                            this.reviewData = true;
                        }
                        this.modelReviews = data.docs;
                    } else {
                        this.totalRecords = 0;
                    }
                },
                error: () => {
                    this.totalRecords = 0;
                }
            });
    }

    totalRating(): number[] {
        return new Array(5);
    }

    createRange(number: number): number[] {
        return new Array(number);
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
