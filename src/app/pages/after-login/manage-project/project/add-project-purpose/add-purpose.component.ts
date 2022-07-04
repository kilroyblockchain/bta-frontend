import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NbDialogRef, NbOptionComponent, NbTagComponent } from '@nebular/theme';
import { finalize } from 'rxjs';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { IProject } from 'src/app/@core/interfaces/manage-project.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { ManageProjectService, ManageUserService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-project-purpose',
    templateUrl: './add-purpose.component.html',
    styles: [
        `
            .file-names {
                margin-bottom: 1px;
            }
        `
    ]
})
export class AddProjectPurposeComponent implements OnInit {
    rowData!: IProject;
    projectPurposeForm!: FormGroup;
    members!: Array<IUserRes>;

    loading!: boolean;
    submitted!: boolean;
    options!: { [key: string]: unknown };
    resultperpage = this.utilsService.getResultsPerPage();

    page!: number;
    toggleStatusFilter = true;

    @ViewChild('allSelected')
    allSelected!: NbOptionComponent;
    @ViewChild('fileInput') fileInput!: ElementRef;

    fileName!: string;

    constructor(private readonly ref: NbDialogRef<AddProjectPurposeComponent>, private readonly fb: FormBuilder, private readonly manageProjectService: ManageProjectService, private readonly utilsService: UtilsService, private readonly manageUserService: ManageUserService) {}

    ngOnInit(): void {
        this.buildProjectPurposeForm();
    }

    get UF(): IFormControls {
        return this.projectPurposeForm.controls;
    }

    buildProjectPurposeForm(): void {
        const purpose = this.rowData.purpose;
        this.fileName = purpose && purpose.docName ? purpose.docName : '';

        this.projectPurposeForm = this.fb.group({
            purpose: [purpose && purpose.text ? purpose.text : ''],
            purposeDoc: ['']
        });
    }

    closeModal(): void {
        this.ref.close('close');
    }

    onFilesChange(event: Event): void {
        if (event && event.target && (event.target as HTMLInputElement).files) {
            const files = (event.target as HTMLInputElement).files as FileList;
            if (files.length > 0) {
                const file = files[0];
                this.projectPurposeForm.patchValue({
                    purposeDoc: file
                });
                this.fileName = file.name;
            }
        }
    }

    onTagRemove(tagToRemove: NbTagComponent): void {
        if (tagToRemove) {
            this.projectPurposeForm.patchValue({
                purposeDoc: ''
            });
            this.fileName = '';
        }
    }

    saveEditProject({ valid, value }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        console.log(this.UF['purposeDoc'].value);

        let formData;
        let hasFormData: boolean;

        if (this.UF['purposeDoc'].value && this.rowData.purpose.docName !== this.UF['purposeDoc'].value) {
            console.log('Im is formdata');
            hasFormData = true;
            formData = new FormData();

            for (const property of Object.keys(this.UF)) {
                formData.append(property, this.UF[property].value);
            }
        } else {
            hasFormData = false;
            console.log(value);
            formData = { ...value };
        }

        this.loading = true;
        this.manageProjectService
            .addPurpose(this.rowData?._id, formData, hasFormData)
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
}
