import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef, NbOptionComponent } from '@nebular/theme';
import { finalize, Subscription } from 'rxjs';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, ManageProjectService, ManageUserService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-add-project',
    templateUrl: './add-project.component.html'
})
export class AddProjectComponent implements OnInit {
    @ViewChild('allSelected')
    allSelected!: NbOptionComponent;

    addProjectForm!: FormGroup;
    options!: { [key: string]: unknown };
    resultperpage = this.utilsService.getResultsPerPage();
    submitted!: boolean;
    loading!: boolean;
    page!: number;

    members!: IUserRes[];
    getAllUserOfOrganizationSubscription!: Subscription;
    defaultSubscriptionType!: string;
    toggleStatusFilter = true;

    constructor(private ref: NbDialogRef<AddProjectComponent>, private fb: FormBuilder, private readonly authService: AuthService, private manageProjectService: ManageProjectService, private readonly utilsService: UtilsService, private readonly manageUserService: ManageUserService) {}

    ngOnInit(): void {
        this.defaultSubscriptionType = this.authService.getDefaultSubscriptionType();
        this.buildNewProjectForm();
        this.pageChange(1);
    }

    get UF(): IFormControls {
        return this.addProjectForm.controls;
    }

    buildNewProjectForm(): void {
        this.addProjectForm = this.fb.group({
            name: ['', [Validators.required]],
            details: ['', [Validators.required]],
            domain: ['', [Validators.required]],
            members: [[], [Validators.required]]
        });
    }

    toggleAllSelection(): void {
        if (this.allSelected.selected) {
            this.addProjectForm.controls['members'].patchValue([...this.members.map((item) => item._id), 0]);
        } else {
            this.addProjectForm.controls['members'].patchValue([]);
        }
    }

    togglePerOne(): void {
        if (this.allSelected.selected) {
            this.allSelected.deselect();
        }
        if (this.addProjectForm.controls['members'].value.length === this.members.length + 1) {
            this.allSelected.select();
        }
    }

    pageChange(pageNumber: number): void {
        this.page = pageNumber;
        this.options = { page: this.page, limit: this.resultperpage, status: this.toggleStatusFilter ? 'verified' : 'notverified', subscriptionType: this.authService.getDefaultSubscriptionType() };
        this.retrieveAllUserData();
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

    saveNewProject({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;

        const index = value.members.indexOf(0);
        if (index > -1) {
            value.members.splice(index, 1);
        }

        this.manageProjectService
            .addNewProject(value)
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
