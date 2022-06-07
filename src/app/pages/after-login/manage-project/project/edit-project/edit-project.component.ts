import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef, NbOptionComponent } from '@nebular/theme';
import { finalize } from 'rxjs';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { IProject } from 'src/app/@core/interfaces/manage-project.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, ManageProjectService, ManageUserService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-edit-project',
    templateUrl: './edit-project.component.html'
})
export class EditProjectComponent implements OnInit {
    @ViewChild('allSelected')
    allSelected!: NbOptionComponent;

    rowData!: IProject;
    editProjectForm!: FormGroup;
    toggleStatusFilter = true;
    members!: Array<IUserRes>;

    page!: number;
    loading!: boolean;
    submitted!: boolean;
    defaultSubscriptionType: string | undefined;
    options!: { [key: string]: unknown };

    constructor(private readonly ref: NbDialogRef<EditProjectComponent>, private readonly fb: FormBuilder, private readonly authService: AuthService, private readonly manageProjectService: ManageProjectService, private readonly utilsService: UtilsService, private readonly manageUserService: ManageUserService) {}

    ngOnInit(): void {
        this.defaultSubscriptionType = this.authService.getDefaultSubscriptionType();
        this.buildEditProjectForm(this.rowData);
        this.pageChange(1);
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { page: this.page, limit: Number.MAX_SAFE_INTEGER, status: this.toggleStatusFilter ? 'verified' : 'notverified', subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.retrieveAllUserData();
    }

    buildEditProjectForm(data: IProject): void {
        const membersId = data.members.map((member) => member._id);
        this.editProjectForm = this.fb.group({
            name: [data?.name, [Validators.required]],
            details: [data?.details, [Validators.required]],
            domain: [data?.domain, [Validators.required]],
            purpose: [data?.purpose],
            members: [membersId, [Validators.required]]
        });
    }

    get UF(): IFormControls {
        return this.editProjectForm.controls;
    }

    retrieveAllUserData(): void {
        this.manageUserService
            .getAllUserOfOrganization(this.options)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    const { data } = res;
                    this.members = data.docs;
                }
            });
    }

    saveEditProject({ valid, value }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;

        this.manageProjectService
            .updateProject(value, this.rowData?._id)
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
