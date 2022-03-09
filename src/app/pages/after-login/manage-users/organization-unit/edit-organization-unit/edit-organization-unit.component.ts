import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs/operators';
import { AuthService, AppFeatureService, ManageUserService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-edit-organization-unit',
    templateUrl: './edit-organization-unit.component.html'
})
export class EditOrganizationUnitComponent implements OnInit {
    rowData: any;
    editOrganizationUnitForm!: FormGroup;
    user: any;
    features!: Array<any>;
    loading!: boolean;
    submitted!: boolean;
    defaultSubscriptionType: string | undefined;
    constructor(private readonly ref: NbDialogRef<EditOrganizationUnitComponent>, private readonly fb: FormBuilder, private readonly authService: AuthService, private readonly appFeatureService: AppFeatureService, private readonly manageUserService: ManageUserService, private readonly utilsService: UtilsService) {}

    ngOnInit(): void {
        this.setUser();
        this.defaultSubscriptionType = this.authService.getDefaultSubscriptionType();
        this.setUserFeatureArray();
        this.buildEditOrganizationUnitForm(this.rowData);
    }

    get UF(): any {
        return this.editOrganizationUnitForm.controls;
    }

    setUser(): void {
        this.authService.getUserData().then((res) => (this.user = res));
    }

    setUserFeatureArray(): void {
        this.appFeatureService.findFeatureByUserSubscription(<string>this.defaultSubscriptionType).subscribe((res) => {
            if (res && res.success) {
                this.features = res.data;
            }
        });
    }

    buildEditOrganizationUnitForm(data: any): void {
        this.editOrganizationUnitForm = this.fb.group({
            unitName: [data?.unitName, [Validators.required]],
            subscriptionType: [this.defaultSubscriptionType],
            unitDescription: [data?.unitDescription],
            featureListId: [data?.featureListId, Validators.required]
        });
    }

    closeModal(): void {
        this.ref.close('close');
    }

    saveEditOrganizationUnit({ valid, value }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;
        value.companyID = this.user?.companyId;
        this.manageUserService
            .updateOrganizationUnit(value, this.rowData?._id)
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
}
