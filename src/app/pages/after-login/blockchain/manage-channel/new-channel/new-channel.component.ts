import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { ManageChannelDetailsService } from 'src/app/@core/services';
import { AuthService } from 'src/app/@core/services/auth.service';
import { UtilsService } from 'src/app/@core/services/utils.service';

@Component({
    selector: 'app-new-channel',
    templateUrl: './new-channel.component.html'
})
export class NewChannelComponent implements OnInit {
    newChannelForm!: FormGroup;
    submitted!: boolean;
    page!: number;
    options!: { [key: string]: unknown };
    loading!: boolean;
    toggleStatusFilter = true;

    constructor(private ref: NbDialogRef<NewChannelComponent>, private fb: FormBuilder, private readonly utilsService: UtilsService, private readonly authService: AuthService, private readonly manageChannelService: ManageChannelDetailsService) {}
    ngOnInit(): void {
        this.buildNewChannelForm();
    }

    buildNewChannelForm(): void {
        const subscriptionType = this.authService.getDefaultSubscriptionType();

        this.newChannelForm = this.fb.group({
            channelName: ['', [Validators.required]],
            connectionProfileName: ['', [Validators.required]],
            isCompanyChannel: [subscriptionType === 'super-admin' ? true : false]
        });
    }

    saveNewChannel({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }

        this.loading = true;
        this.manageChannelService
            .createChannelDetails(value)
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

    get UF(): IFormControls {
        return this.newChannelForm.controls;
    }

    closeModal(): void {
        this.ref.close('close');
    }
}
