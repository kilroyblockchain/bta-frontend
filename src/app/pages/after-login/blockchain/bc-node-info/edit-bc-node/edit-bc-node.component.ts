import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs';
import { IBcNodeInfo } from 'src/app/@core/interfaces/bc-node-info.interface';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { BlockChainService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-edit-bc-node-info',
    templateUrl: './edit-bc-node.component.html'
})
export class EditBcNodeInfoComponent implements OnInit {
    rowData!: IBcNodeInfo;

    editBcNodeForm!: FormGroup;
    loading!: boolean;
    submitted!: boolean;

    constructor(private ref: NbDialogRef<EditBcNodeInfoComponent>, private fb: FormBuilder, private blockchainService: BlockChainService, private readonly utilsService: UtilsService) {}

    ngOnInit(): void {
        this.buildEditBcNodeForm(this.rowData);
    }

    buildEditBcNodeForm(data: IBcNodeInfo): void {
        this.editBcNodeForm = this.fb.group({
            orgName: [data.orgName, [Validators.required, Validators.minLength(2)]],
            nodeUrl: [data.nodeUrl, [Validators.required, Validators.minLength(2)]],
            authorizationToken: [data.authorizationToken, [Validators.required, Validators.minLength(2)]],
            label: [data.label, [Validators.required, Validators.minLength(2)]]
        });
    }

    get UF(): IFormControls {
        return this.editBcNodeForm.controls;
    }

    saveEditBcNode({ valid, value }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;

        this.blockchainService
            .updateBcNodeInfo(value, this.rowData?._id)
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
