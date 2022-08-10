import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef, NbTagComponent } from '@nebular/theme';
import { finalize } from 'rxjs';
import { MODEL_VERSION_ORACLE_URL } from 'src/app/@core/constants';
import { PROJECT_USER } from 'src/app/@core/constants/project-roles.enum';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { IProjectVersion, VersionStatus } from 'src/app/@core/interfaces/manage-project.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-add-model-review',
    templateUrl: './add-review.component.html',
    styleUrls: ['./add-review.component.scss']
})
export class AddModelReviewComponent implements OnInit {
    versionData!: IProjectVersion;
    user!: IUserRes;

    isMLOpsEng!: boolean;
    isStakeHolder!: boolean;

    isReviewStatusPending!: boolean;
    isReviewStatusReviewing!: boolean;
    isReviewStatusPass!: boolean;
    isReviewStatusDeployed!: boolean;
    isReviewStatusProduction!: boolean;
    isReviewStatusMonitoring!: boolean;
    isReviewStatusComplete!: boolean;

    ratings!: number[];
    myFiles: File[] = [];
    toggleValue!: number;
    submitted!: boolean;
    rSubmitted!: boolean;
    loading!: boolean;
    showModelReview!: boolean;

    addReviewForm!: FormGroup;
    addModelReviewForm!: FormGroup;

    versionStatus = VersionStatus;
    @ViewChild('fileInput') fileInput!: ElementRef;

    defaultBucketUrl!: string;

    constructor(private ref: NbDialogRef<AddModelReviewComponent>, private readonly fb: FormBuilder, public utilsService: UtilsService, private authService: AuthService, private manageProjectService: ManageProjectService) {
        this.getProjectUser();
        this.checkModelStatus();
    }

    ngOnInit(): void {
        this.ratings = Array(5)
            .fill(1)
            .map((x, i) => i + 1);
        this.checkModelStatus();

        this.buildAddReviewForm();
        this.buildNewModelForm();
        this.getDefaultOracleBucket();
    }

    getProjectUser(): void {
        this.user = this.authService.getUserDataSync();

        this.isMLOpsEng = !!this.user.company.find((f) => f.staffingId.find((s) => s.staffingName.toLowerCase().includes(PROJECT_USER.MLOps_ENGINEER.toLowerCase())));
        this.isStakeHolder = !!this.user.company.find((f) => f.staffingId.find((s) => s.staffingName.toLowerCase().includes(PROJECT_USER.STAKEHOLDER.toLowerCase())));
    }

    buildAddReviewForm(): void {
        let versionStatus = '';
        if (this.isStakeHolder && this.versionData.versionStatus !== this.versionStatus.MONITORING) {
            if (this.versionData.versionStatus === this.versionStatus.DEPLOYED) {
                versionStatus = this.versionStatus.QA_STATUS;
            } else {
                versionStatus = this.versionData.versionStatus;
            }
        }

        this.addReviewForm = this.fb.group({
            comment: ['', [Validators.required]],
            status: [versionStatus, [...(this.isReviewStatusDeployed || this.isReviewStatusProduction ? [] : [Validators.required])]],
            rating: [0],
            deployedModelURL: ['', ...(this.isReviewStatusPass ? [Validators.required] : [])],
            deployedModelInstruction: ['', ...(this.isReviewStatusPass ? [Validators.required] : [])],
            productionURL: [''],
            reviewModel: [''],
            reviewStatus: [''],
            reviewTempStatus: [this.versionData.versionStatus]
        });
    }

    buildNewModelForm(): void {
        this.addModelReviewForm = this.fb.group({
            versionName: ['', [Validators.required]],
            logFilePath: ['', [Validators.required]],
            testDataSets: ['', [Validators.required]],
            noteBookVersion: ['', [Validators.required]],
            codeRepo: ['', [Validators.required]],
            codeVersion: ['', [Validators.required]],
            comment: ['', [Validators.required]],
            defaultName: ['v']
        });
    }

    get RF(): IFormControls {
        return this.addReviewForm.controls;
    }

    get UF(): IFormControls {
        return this.addModelReviewForm.controls;
    }

    checkModelStatus(): void {
        this.isReviewStatusPending = this.versionData?.versionStatus === VersionStatus.PENDING;
        this.isReviewStatusReviewing = this.versionData?.versionStatus === VersionStatus.REVIEW;
        this.isReviewStatusPass = this.versionData?.versionStatus === VersionStatus.REVIEW_PASSED;
        this.isReviewStatusDeployed = this.versionData?.versionStatus === VersionStatus.DEPLOYED;
        this.isReviewStatusProduction = this.versionData?.versionStatus === VersionStatus.PRODUCTION;
        this.isReviewStatusMonitoring = this.versionData?.versionStatus === VersionStatus.MONITORING;
        this.isReviewStatusComplete = this.versionData?.versionStatus === VersionStatus.COMPLETE;
    }

    toggle(value: number): void {
        this.toggleValue = value;
        if (value === this.addReviewForm.value.rating) {
            this.addReviewForm.get('rating')?.setValue(value - 1);
            this.toggleValue = this.addReviewForm.value.rating;
        } else {
            this.addReviewForm.get('rating')?.setValue(this.toggleValue);
        }
    }

    onFilesChange(event: Event): void {
        if (event && event.target && (event.target as HTMLInputElement).files) {
            const files = (event.target as HTMLInputElement).files as FileList;
            for (let index = 0; index < files.length; index++) {
                this.myFiles.push(files[index]);
            }
        }
    }

    checkBoxValue(event: Event): void {
        if (event && event.target && (event.target as HTMLInputElement).checked) {
            this.addReviewForm.patchValue({
                status: (event.target as HTMLInputElement).value,
                reviewTempStatus: ''
            });
        }
        if (!(event.target as HTMLInputElement).checked) {
            this.addReviewForm.patchValue({
                status: '',
                reviewTempStatus: this.versionData.versionStatus
            });
            this.showModelReview = false;
        }
    }

    saveNewReview({ valid, value }: FormGroup, modelReviewId = ''): void {
        this.rSubmitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;

        const formData = new FormData();
        for (let i = 0; i < this.myFiles.length; i++) {
            formData.append('docs', this.myFiles[i]);
        }
        formData.append('comment', value.comment);
        formData.append('rating', value.rating);

        if (this.RF['reviewTempStatus']?.value && (this.isReviewStatusDeployed || this.isReviewStatusProduction || this.isReviewStatusMonitoring) && !this.versionData.isQAStatus && !this.isStakeHolder) {
            formData.append('status', value.reviewTempStatus);
        } else {
            formData.append('status', value.status);
        }
        if (this.RF['deployedModelURL']?.value) {
            formData.append('deployedModelURL', value.deployedModelURL);
        }

        if (this.RF['deployedModelInstruction']?.value) {
            formData.append('deployedModelInstruction', value.deployedModelInstruction);
        }

        if (this.RF['productionURL']?.value) {
            formData.append('productionURL', value.productionURL);
        }

        if (modelReviewId) {
            formData.append('reviewModel', modelReviewId);
        }
        this.manageProjectService
            .addModelReview(this.versionData?._id, formData)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        this.ref.close(res);
                        this.utilsService.showToast('success', res.message);
                    } else {
                        this.utilsService.showToast('warning', res.message);
                    }
                },
                error: (err) => {
                    this.utilsService.showToast('warning', err.error?.message || err?.message);
                }
            });
    }

    onTagRemove(tagToRemove: NbTagComponent): void {
        this.myFiles = this.myFiles.filter((file, index) => {
            return index + 1 + '.' + file.name !== tagToRemove.text;
        });

        if (!this.myFiles.length) {
            this.fileInput.nativeElement.value = null;
        }
    }

    openModelReviewTab({ valid }: FormGroup): void {
        this.rSubmitted = true;

        if (!valid) {
            return;
        }
        this.showModelReview = true;
    }

    addReviewVersion(): void {
        this.submitted = true;
        if (!this.addReviewForm.valid || !this.addModelReviewForm.valid) {
            return;
        }
        this.saveReviewVersion(this.addModelReviewForm);
    }

    saveReviewVersion({ value }: FormGroup): void {
        value['versionName'] = this.UF['defaultName']?.value + value.versionName;

        this.manageProjectService.addNewModelReview(value, this.versionData?.project?._id).subscribe({
            next: (res) => {
                if (res && res.success) {
                    const { data } = res;
                    this.utilsService.showToast('success', res.message);
                    this.saveNewReview(this.addReviewForm, data._id);
                } else {
                    this.utilsService.showToast('warning', res.message);
                }
            },
            error: (err) => {
                this.utilsService.showToast('warning', err.error?.message || err?.message);
            }
        });
    }

    closeModel(): void {
        this.ref.close('close');
    }

    checkVersionStatus(event: string) {
        if (event === VersionStatus.REVIEW_FAILED) {
            this.showModelReview = false;
        }
    }

    getDefaultOracleBucket(): void {
        this.manageProjectService.getDefaultBucketUrl(this.versionData.project._id).subscribe((res) => {
            this.defaultBucketUrl = res.data;
        });
    }

    valueChange(versionNumber: number): void {
        if (versionNumber) {
            this.addModelReviewForm.patchValue({
                logFilePath: this.defaultBucketUrl + '/' + this.UF['defaultName']?.value + versionNumber + MODEL_VERSION_ORACLE_URL.LOG_FILE_URL,
                testDataSets: this.defaultBucketUrl + '/' + this.UF['defaultName']?.value + versionNumber + MODEL_VERSION_ORACLE_URL.TEST_DATA_SETS_URL
            });
        } else {
            this.addModelReviewForm.patchValue({
                logFilePath: '',
                testDataSets: ''
            });
        }
    }

    checkRadioBtnValue(): void {
        if (this.addReviewForm.get('status')?.value === this.versionStatus.PRODUCTION) {
            this.addReviewForm.get('productionURL')?.addValidators(Validators.required);
            this.addReviewForm.get('productionURL')?.updateValueAndValidity();
        } else {
            this.addReviewForm.get('productionURL')?.clearValidators();
            this.addReviewForm.get('productionURL')?.updateValueAndValidity();
        }
    }
}
