import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { IProjectVersion } from 'src/app/@core/interfaces/manage-project.interface';
import { ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-edit-project-version',
    templateUrl: './edit-version.component.html'
})
export class EditVersionComponent implements OnInit {
    versionData!: IProjectVersion;

    editVersionForm!: FormGroup;

    loading!: boolean;
    submitted!: boolean;
    constructor(private readonly ref: NbDialogRef<EditVersionComponent>, private readonly fb: FormBuilder, private readonly manageProjectService: ManageProjectService, private readonly utilsService: UtilsService) {}

    ngOnInit(): void {
        this.buildEditVersionForm(this.versionData);
    }

    buildEditVersionForm(data: IProjectVersion): void {
        this.editVersionForm = this.fb.group({
            versionName: [data?.versionName.substring(1), [Validators.required]],
            logFilePath: [data?.logFilePath, [Validators.required]],
            logFileVersion: [data?.logFileVersion, [Validators.required]],
            versionModel: [data?.versionModel, [Validators.required]],
            noteBookVersion: [data?.noteBookVersion, [Validators.required]],
            trainDataSets: [data?.trainDataSets, [Validators.required]],
            testDataSets: [data?.testDataSets, [Validators.required]],
            aiModel: [data?.aiModel, [Validators.required]],
            codeRepo: [data?.codeRepo, [Validators.required]],
            codeVersion: [data?.codeVersion, [Validators.required]],
            comment: [data?.comment, [Validators.required]],
            defaultName: ['v']
        });
    }

    get UF(): IFormControls {
        return this.editVersionForm.controls;
    }

    saveEditVersion({ valid, value }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }

        value['versionName'] = this.UF['defaultName']?.value + value.versionName;
        this.loading = true;
        this.manageProjectService
            .updateVersion(value, this.versionData._id)
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
