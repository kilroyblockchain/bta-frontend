import { Component } from '@angular/core';
import { finalize } from 'rxjs';
import { IUsersLoginCount } from 'src/app/@core/interfaces/common.interface';
import { ManageUserService } from 'src/app/@core/services';

@Component({
    selector: 'app-login-summary',
    templateUrl: './login-summary.component.html',
    styleUrls: ['./login-summary.component.scss']
})
export class LoginSummaryComponent {
    isHidden = false;
    loading = false;
    usersLoginCounts!: IUsersLoginCount;

    constructor(public manageUserService: ManageUserService) {
        this.getAllUsersLoginCount();
    }

    hideShowLoginSummary(collapse: boolean): void {
        this.isHidden = collapse;
        if (!collapse) {
            this.getAllUsersLoginCount();
        }
    }

    getAllUsersLoginCount(): void {
        this.loading = true;
        this.manageUserService
            .getAllUsersLoginCount()
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    if (res && res.data) {
                        this.usersLoginCounts = res.data;
                    }
                }
            });
    }
}
