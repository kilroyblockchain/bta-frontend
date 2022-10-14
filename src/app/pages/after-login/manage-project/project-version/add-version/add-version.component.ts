import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs';
import { MODEL_VERSION_ORACLE_URL } from 'src/app/@core/constants';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { IProject } from 'src/app/@core/interfaces/manage-project.interface';
import { ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-add-version',
    templateUrl: './add-version.component.html'
})
export class AddVersionComponent implements OnInit {
    rowData!: IProject;
    submitted!: boolean;
    loading!: boolean;
    addVersionForm!: FormGroup;
    defaultBucketUrl!: string;

    constructor(private ref: NbDialogRef<AddVersionComponent>, private fb: FormBuilder, private readonly utilsService: UtilsService, private readonly manageProjectService: ManageProjectService) {}

    ngOnInit(): void {
        this.buildNewVersionForm();
        this.getDefaultOracleBucket();
    }

    buildNewVersionForm(): void {
        this.addVersionForm = this.fb.group({
            versionName: ['', [Validators.required]],
            logFilePath: ['', [Validators.required]],
            noteBookVersion: ['', [Validators.required]],
            trainDataSets: ['', [Validators.required]],
            testDataSets: ['', [Validators.required]],
            aiModel: ['', [Validators.required]],
            codeRepo: ['', [Validators.required]],
            codeVersion: ['', [Validators.required]],
            comment: ['', [Validators.required]],
            defaultName: ['v']
        });
    }

    get UF(): IFormControls {
        return this.addVersionForm.controls;
    }

    saveNewVersion({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }

        if (!value['versionName'].length) {
            value['versionName'] = this.UF['defaultName']?.value + value.versionName;
        }

        this.loading = true;
        this.manageProjectService
            .addVersion(value, this.rowData._id)
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

    getDefaultOracleBucket(): void {
        this.manageProjectService.getDefaultBucketUrl(this.rowData._id).subscribe((res) => {
            this.defaultBucketUrl = res.data;
        });
    }

    valueChange(versionNumber: number): void {
        if (versionNumber) {
            this.addVersionForm.patchValue({
                logFilePath: this.defaultBucketUrl + '/' + this.UF['defaultName'].value + versionNumber + MODEL_VERSION_ORACLE_URL.LOG_FILE_URL,
                testDataSets: this.defaultBucketUrl + '/' + this.UF['defaultName'].value + versionNumber + MODEL_VERSION_ORACLE_URL.TEST_DATA_SETS_URL,
                trainDataSets: this.defaultBucketUrl + '/' + this.UF['defaultName'].value + versionNumber + MODEL_VERSION_ORACLE_URL.TRAIN_DATA_SETS_URL,
                aiModel: this.defaultBucketUrl + '/' + this.UF['defaultName'].value + versionNumber + MODEL_VERSION_ORACLE_URL.AI_MODEL_URL
            });
        } else {
            this.addVersionForm.patchValue({
                logFilePath: '',
                testDataSets: '',
                trainDataSets: '',
                aiModel: ''
            });
        }
    }

    closeModal(): void {
        this.ref.close('close');
    }
}
