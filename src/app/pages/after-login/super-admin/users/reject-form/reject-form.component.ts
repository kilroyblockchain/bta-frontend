import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs/operators';
import { UtilsService } from 'src/app/@core/services';
import { UserRejectService } from 'src/app/@core/services/user-reject.service';
import { IRejectInformation, IRejectInformationFormData } from '../reject-informations/reject-information.interface';

export function descriptionMinLength(minlength: number): ValidatorFn {
    return (descriptionControl: AbstractControl): ValidationErrors | null => {
        if (descriptionControl.value && descriptionControl.value.length && descriptionControl.value.length < minlength) {
            return { minlength };
        }
        return null;
    };
}

@Component({
    selector: 'app-reject-company-form',
    templateUrl: './reject-form.component.html'
})
export class RejectCompanyFormComponent implements OnInit {
    rejectedInformation!: IRejectInformation;
    rejectedUser!: string;
    rejectCompanyFormGroup!: FormGroup;
    submitted!: boolean;
    loading!: boolean;

    constructor(private fb: FormBuilder, private ref: NbDialogRef<RejectCompanyFormComponent>, private userRejectService: UserRejectService, private utilsService: UtilsService) {}

    ngOnInit(): void {
        this.buildRejectCompanyForm();
    }

    buildRejectCompanyForm(): void {
        this.rejectCompanyFormGroup = this.fb.group({
            ...(!this.rejectedInformation ? { rejectedUser: [this.rejectedUser, [Validators.required]] } : {}),
            description: ['', descriptionMinLength(3)]
        });
        if (this.rejectedInformation) {
            this.patchRejectCompanyFormGroup();
        }
    }

    getControl(controlName: string): AbstractControl {
        return <AbstractControl>this.rejectCompanyFormGroup.get(controlName);
    }

    patchRejectCompanyFormGroup(): void {
        this.rejectCompanyFormGroup.patchValue({
            description: this.rejectedInformation.rejectionDescription
        });
    }

    closeModal(): void {
        this.ref.close();
    }

    createRejectInformation(value: IRejectInformationFormData): void {
        this.loading = true;
        this.userRejectService
            .rejectUser(value)
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        this.ref.close({
                            rejectedUser: this.rejectedUser
                        });
                        this.utilsService.showToast('success', res.message);
                    }
                },
                error: (err) => {
                    this.utilsService.showToast('warning', err.message);
                }
            });
    }

    updateRejectInformation(value: IRejectInformationFormData): void {
        this.loading = true;
        this.userRejectService
            .updateRejectInformation(this.rejectedInformation.id, value)
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: (res) => {
                    if (res && res.success) {
                        this.ref.close({
                            updatedRejectInformation: res.data
                        });
                        this.utilsService.showToast('success', res.message);
                    }
                },
                error: (err) => {
                    this.utilsService.showToast('warning', err.message);
                }
            });
    }

    onSubmit({ value, valid }: FormGroup): void {
        if (!valid) {
            this.submitted = true;
            return;
        }
        if (this.rejectedInformation) {
            this.updateRejectInformation(value);
        } else {
            this.createRejectInformation(value);
        }
    }
}
