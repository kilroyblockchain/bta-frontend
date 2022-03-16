import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef, NbOptionComponent } from '@nebular/theme';
import { finalize } from 'rxjs/operators';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { IFeature } from 'src/app/@core/interfaces/manage-user.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, AppFeatureService, ManageUserService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-new-organization-unit',
    templateUrl: './new-organization-unit.component.html'
})
export class NewOrganizationUnitComponent implements OnInit {
    newOrganizationUnitForm!: FormGroup;
    features!: Array<IFeature>;
    submitted!: boolean;
    user!: IUserRes;
    loading!: boolean;
    defaultSubscriptionType!: string;
    @ViewChild('allSelected')
    allSelected!: NbOptionComponent;
    constructor(private ref: NbDialogRef<NewOrganizationUnitComponent>, private fb: FormBuilder, private readonly appFeatureService: AppFeatureService, private readonly authService: AuthService, private readonly manageUserService: ManageUserService, private readonly utilsService: UtilsService) {}

    ngOnInit(): void {
        this.setUser();
        this.defaultSubscriptionType = this.authService.getDefaultSubscriptionType();
        this.setUserFeatureArray();
        this.buildNewOrganizationUnitForm();
    }

    setUser(): void {
        this.authService.getUserData().then((res) => (this.user = res));
    }

    setUserFeatureArray(): void {
        this.appFeatureService.findFeatureByUserSubscription(this.defaultSubscriptionType).subscribe((res) => {
            if (res && res.success) {
                this.features = res.data;
            }
        });
    }

    get UF(): IFormControls {
        return this.newOrganizationUnitForm.controls;
    }

    buildNewOrganizationUnitForm(): void {
        this.newOrganizationUnitForm = this.fb.group({
            unitName: ['', [Validators.required]],
            unitDescription: [''],
            subscriptionType: [this.defaultSubscriptionType],
            featureListId: [[], Validators.required]
        });
    }

    saveNewOrganizationUnit({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;
        value.companyID = this.user?.companyId;

        const index = value.featureListId.indexOf(0);
        if (index > -1) {
            value.featureListId.splice(index, 1);
        }

        this.manageUserService
            .createOrganizationUnit(value)
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
                    this.utilsService.showToast('warning', err?.message);
                }
            });
    }

    toggleAllSelection(): void {
        if (this.allSelected.selected) {
            this.newOrganizationUnitForm.controls['featureListId'].patchValue([...this.features.map((item) => item._id), 0]);
        } else {
            this.newOrganizationUnitForm.controls['featureListId'].patchValue([]);
        }
    }

    togglePerOne(): boolean | void {
        if (this.allSelected.selected) {
            this.allSelected.deselect();
            return false;
        }
        if (this.newOrganizationUnitForm.controls['featureListId'].value.length === this.features.length + 1) {
            this.allSelected.select();
        }
    }

    closeModal(): void {
        this.ref.close('close');
    }
}
