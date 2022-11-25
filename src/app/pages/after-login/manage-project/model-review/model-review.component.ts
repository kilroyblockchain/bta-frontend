import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { finalize, Subscription } from 'rxjs';
import { ACCESS_TYPE, FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { PROJECT_USER } from 'src/app/@core/constants/project-roles.enum';
import { IModelReview, IProjectVersion, VersionStatus } from 'src/app/@core/interfaces/manage-project.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, FileService, ManageProjectService, UtilsService } from 'src/app/@core/services';
import { AlertComponent } from 'src/app/pages/miscellaneous/alert/alert.component';
import { AddModelReviewComponent } from './add-review/add-review.component';

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
    reviewLoading!: boolean;

    isCompanyAdmin!: boolean;
    isStakeHolder!: boolean;

    canAddReview!: boolean;

    isReviewStatusPending!: boolean;
    isReviewStatusReviewing!: boolean;
    isReviewStatusPass!: boolean;
    isReviewStatusMonitoring!: boolean;
    isReviewStatusComplete!: boolean;
    isReviewStatusFailed!: boolean;
    isReviewStatusDeclined!: boolean;

    isErrorReviewedVersion!: boolean;
    newReviewDialogClose!: Subscription;

    constructor(private dialogService: NbDialogService, private router: Router, private activeRoute: ActivatedRoute, private translate: TranslateService, private readonly fileService: FileService, private authService: AuthService, public utilsService: UtilsService, private readonly manageProjectService: ManageProjectService) {
        this.getProjectUser();
    }

    ngOnInit(): void {
        this.pageChange(1);
        this.checkAccess();
    }

    getProjectUser(): void {
        this.user = this.authService.getUserDataSync();

        this.isCompanyAdmin = !!this.user.company.find((f) => f.companyId._id === this.user.companyId && f.isAdmin === true);
        this.isStakeHolder = !!this.user.company.find((f) => f.staffingId.find((s) => s.staffingName.toLowerCase().includes(PROJECT_USER.STAKEHOLDER.toLowerCase())));
    }

    async checkAccess(): Promise<void> {
        this.canAddReview = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MODEL_REVIEWS, [ACCESS_TYPE.WRITE]);
    }

    ngOnDestroy(): void {
        this.newReviewDialogClose ? this.newReviewDialogClose.unsubscribe() : null;
    }

    checkModelStatus(versionStatus: string): void {
        this.isReviewStatusPending = versionStatus === VersionStatus.PENDING;
        this.isReviewStatusReviewing = versionStatus === VersionStatus.REVIEW;
        this.isReviewStatusPass = versionStatus === VersionStatus.REVIEW_PASSED;
        this.isReviewStatusFailed = versionStatus === VersionStatus.REVIEW_FAILED;
        this.isReviewStatusMonitoring = versionStatus === VersionStatus.MONITORING;
        this.isReviewStatusComplete = versionStatus === VersionStatus.COMPLETE;
        this.isReviewStatusDeclined = versionStatus === VersionStatus.DECLINED;
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
        this.isErrorInReviewedVersion(versionId);
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
                            this.checkModelStatus(this.versionData.versionStatus);
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
        this.reviewLoading = true;

        this.manageProjectService
            .getModelReview(this.options, versionId)
            .pipe(
                finalize(() => {
                    this.reviewLoading = false;
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
                            this.modelReviews = data.docs;
                        }
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

    openDocs(filePath: string, fileName: string): void {
        this.fileService.getFileFromFolder(filePath).subscribe((file: Blob) => {
            if (file['type'].split('/')[0] === 'image' || file['type'].split('/')[1] === 'pdf') {
                const urlCreator = window.URL || window.webkitURL;
                const url = urlCreator.createObjectURL(file);
                window.open(url);
                urlCreator.revokeObjectURL(url);
            } else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([file], { type: file.type }));
                a.download = fileName;
                a.click();
            }
        });
    }

    addNewReviewModal(versionData: IProjectVersion): void {
        if (this.isStakeHolder && (this.isReviewStatusPending || this.isReviewStatusReviewing || this.isReviewStatusPass)) {
            this.dialogService.open(AlertComponent, { context: { alert: true, info: this.translate.instant('MANAGE_PROJECTS.MODEL_REVIEW.ALERT_MSG.MODEL_NOT_DEPLOYED_YET') }, hasBackdrop: true, closeOnBackdropClick: false });
        } else {
            const newReviewDialogOpen = this.dialogService.open(AddModelReviewComponent, { context: { versionData }, hasBackdrop: true, closeOnBackdropClick: false });
            this.newReviewDialogClose = newReviewDialogOpen.onClose.subscribe((res) => {
                if (res && res !== 'close') {
                    this.pageChange(1);
                }
            });
        }
    }

    isErrorInReviewedVersion(versionId: string): void {
        this.manageProjectService.isErrorInReviewedModel(versionId).subscribe((res) => {
            this.isErrorReviewedVersion = res.data;
        });
    }

    openReviewDetails(modelReviewId: string): void {
        const URL = '/u/manage-project/version-details';
        this.router.navigate([URL, modelReviewId]);
    }
}
