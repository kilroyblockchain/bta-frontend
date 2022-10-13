import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs';
import { IChannelDetails } from 'src/app/@core/interfaces/channel-details.interface';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { ManageChannelDetailsService } from 'src/app/@core/services';
import { AuthService } from 'src/app/@core/services/auth.service';
import { ManageUserService } from 'src/app/@core/services/manage-user.service';
import { UtilsService } from 'src/app/@core/services/utils.service';

@Component({
    selector: 'app-edit-channel',
    templateUrl: './edit-channel.component.html'
})
export class EditChannelComponent implements OnInit {
    editChannelForm!: FormGroup;
    rowData!: IChannelDetails;
    options!: { [key: string]: unknown };
    page!: number;
    loading!: boolean;
    submitted!: boolean;
    constructor(private ref: NbDialogRef<EditChannelComponent>, private fb: FormBuilder, private readonly utilsService: UtilsService, private readonly authService: AuthService, private readonly manageUserService: ManageUserService, private readonly manageChannelService: ManageChannelDetailsService) {}
    ngOnInit(): void {
        this.buildEditChannelDetailsForm(this.rowData);
    }

    buildEditChannelDetailsForm(data: IChannelDetails): void {
        const subscriptionType = this.authService.getDefaultSubscriptionType();

        this.editChannelForm = this.fb.group({
            channelName: [data.channelName, [Validators.required]],
            connectionProfileName: [data.connectionProfileName, [Validators.required]],
            isCompanyChannel: [subscriptionType === 'super-admin' ? true : false]
        });
    }

    get UF(): IFormControls {
        return this.editChannelForm.controls;
    }

    editChannel({ valid, value }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;
        this.manageChannelService
            .updateChannel(value, this.rowData?._id)
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

    closeModal(): void {
        this.ref.close('close');
    }
}
