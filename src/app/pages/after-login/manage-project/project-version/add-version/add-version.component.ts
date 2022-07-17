import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs';
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

    constructor(private ref: NbDialogRef<AddVersionComponent>, private fb: FormBuilder, private readonly utilsService: UtilsService, private readonly manageProjectService: ManageProjectService) {}

    ngOnInit(): void {
        this.buildNewVersionForm();
    }

    buildNewVersionForm(): void {
        this.addVersionForm = this.fb.group({
            versionName: ['', [Validators.required]],
            logFilePath: ['', [Validators.required]],
            logFileVersion: ['', [Validators.required]],
            versionModel: ['', [Validators.required]],
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
        value['versionName'] = this.UF['defaultName']?.value + value.versionName;
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

    closeModal(): void {
        this.ref.close('close');
    }
}
