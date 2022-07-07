import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, BlockChainService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-bc-key-verify',
    templateUrl: './bc-key-verify.component.html',
    styleUrls: ['./bc-key-verify.component.scss']
})
export class BcKeyVerifyComponent implements OnInit {
    submitted!: boolean;
    bcKeyVerifyForm!: FormGroup;
    userData!: IUserRes;
    loading!: boolean;

    constructor(private fb: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router, private blockChainService: BlockChainService, private authService: AuthService, private utilsService: UtilsService) {}

    ngOnInit(): void {
        this.buildBcKeyVerifyForm();
    }

    buildBcKeyVerifyForm(): void {
        this.bcKeyVerifyForm = this.fb.group({
            bcKey: ['', [Validators.required]]
        });
    }

    get UF(): IFormControls {
        return this.bcKeyVerifyForm.controls;
    }

    verifyBcKey({ valid, value }: FormGroup) {
        this.submitted = true;
        if (!valid) {
            return;
        }

        this.blockChainService.verifyBcKey(value).subscribe({
            next: (res) => {
                const { data } = res;
                if (data) {
                    this.authService.setBcKey(data?.bcKey);

                    this.loading = true;
                    this.authService.getUserData().then((userData) => {
                        this.userData = { ...userData };
                        const roles = this.userData?.roles;
                        if (roles) {
                            const returnURL = this.activatedRoute.snapshot.queryParams['returnUrl'];
                            if (returnURL) {
                                this.router.navigateByUrl(decodeURIComponent(returnURL)).then(() => {
                                    window.location.reload();
                                });
                            } else {
                                window.location.reload();
                            }
                        } else {
                            this.loading = false;
                        }
                    });
                }
            },
            error: (err) => {
                this.utilsService.showToast('warning', err?.message);
            }
        });
    }
}
