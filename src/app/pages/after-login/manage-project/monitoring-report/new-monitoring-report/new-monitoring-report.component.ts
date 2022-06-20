import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef, NbTagComponent } from '@nebular/theme';
import { finalize } from 'rxjs';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-new-monitoring-report',
    templateUrl: './new-monitoring-report.component.html'
})
export class NewMonitoringReportComponent implements OnInit {
    constructor(private ref: NbDialogRef<NewMonitoringReportComponent>, private readonly utilsService: UtilsService, private fb: FormBuilder, private readonly manageProjectService: ManageProjectService) {}
    monitoringInfoForm!: FormGroup;
    submitted!: boolean;
    loading!: boolean;
    myFiles: File[] = [];
    versionId!: string;

    @ViewChild('fileInput') fileInput!: ElementRef;

    ngOnInit(): void {
        this.buildMonitoringInfoForm();
    }

    buildMonitoringInfoForm(): void {
        this.monitoringInfoForm = this.fb.group({
            subject: ['', [Validators.required]],
            description: ['', [Validators.required]]
        });
    }

    get UF(): IFormControls {
        return this.monitoringInfoForm.controls;
    }

    onFilesChange(event: Event): void {
        if (event && event.target && (event.target as HTMLInputElement).files) {
            const files = (event.target as HTMLInputElement).files as FileList;
            for (let index = 0; index < files.length; index++) {
                this.myFiles.push(files[index]);
            }
        }
    }

    onTagRemove(tagToRemove: NbTagComponent): void {
        this.myFiles = this.myFiles.filter((file, index) => {
            return index + 1 + '.' + file.name !== tagToRemove.text;
        });

        if (!this.myFiles.length) {
            this.fileInput.nativeElement.value = null;
        }
    }

    saveVersionReports({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }

        this.loading = true;
        const formData = new FormData();

        for (let i = 0; i < this.myFiles.length; i++) {
            formData.append('docs', this.myFiles[i]);
        }

        formData.append('subject', value.subject);
        formData.append('description', value.description);

        this.manageProjectService
            .addVersionReports(this.versionId, formData)
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
