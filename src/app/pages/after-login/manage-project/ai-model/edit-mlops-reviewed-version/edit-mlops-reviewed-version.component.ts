import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs';
import { MODEL_VERSION_ORACLE_URL } from 'src/app/@core/constants';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { IProjectVersion } from 'src/app/@core/interfaces/manage-project.interface';
import { ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-edit-mlops-reviewed-version',
    templateUrl: './edit-mlops-reviewed-version.component.html'
})
export class EditMlopsReviewedVersionComponent implements OnInit {
    versionData!: IProjectVersion;

    editMlopsVersionForm!: FormGroup;
    defaultBucketUrl!: string;

    loading!: boolean;
    submitted!: boolean;

    constructor(private readonly ref: NbDialogRef<EditMlopsReviewedVersionComponent>, private readonly fb: FormBuilder, private readonly manageProjectService: ManageProjectService, private readonly utilsService: UtilsService) {}

    ngOnInit(): void {
        this.buildEditMlopsVersionForm(this.versionData);
        this.getDefaultOracleBucket();
    }

    buildEditMlopsVersionForm(versionData: IProjectVersion): void {
        this.editMlopsVersionForm = this.fb.group({
            versionName: [versionData?.versionName.substring(1), [Validators.required]],
            logFilePath: [versionData.logFilePath, [Validators.required]],
            testDataSets: [versionData.testDataSets, [Validators.required]],
            noteBookVersion: [versionData.noteBookVersion, [Validators.required]],
            codeRepo: [versionData.codeRepo, [Validators.required]],
            codeVersion: [versionData.codeVersion, [Validators.required]],
            comment: [versionData.comment, [Validators.required]],
            defaultName: ['v']
        });
    }

    get UF(): IFormControls {
        return this.editMlopsVersionForm.controls;
    }
    getDefaultOracleBucket(): void {
        this.manageProjectService.getDefaultBucketUrl(this.versionData.project._id).subscribe((res) => {
            this.defaultBucketUrl = res.data;
        });
    }

    saveEditVersion({ value, valid }: FormGroup): void {
        this.submitted = true;

        if (!valid) {
            return;
        }

        value['versionName'] = this.UF['defaultName']?.value + value.versionName;

        this.loading = true;
        this.manageProjectService
            .updateMlopsReviewedVersion(value, this.versionData._id)
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

    valueChange(versionNumber: number): void {
        if (versionNumber) {
            this.editMlopsVersionForm.patchValue({
                logFilePath: this.defaultBucketUrl + '/' + this.UF['defaultName'].value + versionNumber + MODEL_VERSION_ORACLE_URL.LOG_FILE_URL,
                testDataSets: this.defaultBucketUrl + '/' + this.UF['defaultName'].value + versionNumber + MODEL_VERSION_ORACLE_URL.TEST_DATA_SETS_URL
            });
        } else {
            this.editMlopsVersionForm.patchValue({
                logFilePath: '',
                testDataSets: ''
            });
        }
    }

    closeModal(): void {
        this.ref.close('close');
    }
}
