import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { SubscriptionService, UtilsService } from 'src/app/@core/services';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-add-subscription-type',
    templateUrl: './add-subscriptionType.component.html'
})
export class AddSubscriptionTypeComponent implements OnInit {
    data: any;
    companyId!: string;
    name!: string;
    type!: string;
    selectedUserId: any;
    loading = false;
    public addSubscriptionFormGroup!: FormGroup;
    submitted = false;
    options = {};
    organizationList: any;
    subscriptionTypes: any;
    ownCompany: any;

    constructor(private fb: FormBuilder, public utilsService: UtilsService, protected ref: NbDialogRef<AddSubscriptionTypeComponent>, private readonly subscriptionService: SubscriptionService) {
        this.populateSubscriptionTypes();
    }

    ngOnInit(): void {
        this.ownCompany = this.data.company.find((element: any) => element?.verified && element?.default && !element.isDeleted);
        const userCompanies = Array.from(new Set(this.data.company.filter((company: any) => company.isAdmin).map((company: any) => company.companyId._id))).map((companyId) => this.data.company.find((com: any) => com.companyId._id === companyId).companyId);
        this.organizationList = userCompanies;
        this.addSubscriptionFormGroup = this.fb.group({
            userId: [this.selectedUserId, [Validators.required]],
            subscriptionType: [[], [Validators.required]],
            companyId: [this.ownCompany?.companyId?._id ? this.ownCompany?.companyId?._id : userCompanies[0]?._id, [Validators.required]]
        });
        this.patchSubscriptionTypes(this.ownCompany?.companyId ?? userCompanies[0]);
    }

    patchSubscriptionTypes(selectedCompany: any): void {
        const subsTypes = this.data?.company.filter((com: any) => com?.companyId?._id === selectedCompany?._id).map((com: any) => com.subscriptionType);
        this.addSubscriptionFormGroup.patchValue({
            subscriptionType: subsTypes
        });
    }

    populateSubscriptionTypes(): void {
        this.subscriptionService.getAllSubscription().subscribe((res) => {
            if (res && res.success) {
                this.subscriptionTypes = res?.data?.filter((subscription: any) => subscription.subscriptionTypeIdentifier !== 'super-admin');
            }
        });
    }

    onCompanyChange(companyId: string): void {
        this.patchSubscriptionTypes(this.organizationList.find((company: any) => company._id === companyId));
    }

    submitaddSubscriptionFormGroup({ valid, value }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;
    }

    get UF(): any {
        return this.addSubscriptionFormGroup.controls;
    }

    closeModal(): void {
        this.ref.close('close');
    }
}
