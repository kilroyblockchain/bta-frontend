import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { BlockChainService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-new-bc-node',
    templateUrl: './new-bc-node.component.html'
})
export class NewBcNodeComponent implements OnInit {
    submitted!: boolean;
    loading!: boolean;

    addBcNodeForm!: FormGroup;

    constructor(private ref: NbDialogRef<NewBcNodeComponent>, private fb: FormBuilder, private blockchainService: BlockChainService, private readonly utilsService: UtilsService) {}

    ngOnInit(): void {
        this.buildNewBcNodeForm();
    }

    buildNewBcNodeForm(): void {
        this.addBcNodeForm = this.fb.group({
            orgName: ['', [Validators.required, Validators.minLength(2)]],
            nodeUrl: ['', [Validators.required, Validators.minLength(2)]],
            authorizationToken: ['', [Validators.required, Validators.minLength(2)]],
            label: ['', [Validators.required, Validators.minLength(2)]]
        });
    }

    get UF(): IFormControls {
        return this.addBcNodeForm.controls;
    }

    saveNewProject({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (!valid) {
            return;
        }
        this.loading = true;

        this.blockchainService
            .addBcNodeInfo(value)
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
