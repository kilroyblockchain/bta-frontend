import { Component, OnInit, Input } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { ACCESS_TYPE, FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { IUserRes, IUserData } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, UtilsService } from 'src/app/@core/services';
import { environment } from 'src/environments/environment';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';

const BASE_URL = environment.apiURL + '/files/';

@Component({
    selector: 'app-personal-details',
    templateUrl: './personal-details.component.html',
    styleUrls: ['./personal-details.component.scss']
})
export class PersonalDetailsComponent implements OnInit {
    @Input() userData!: IUserData;
    imageBaseUrl = BASE_URL;
    showProfileEditButton = false;
    organizationList = [];
    loggedInUser: IUserRes;
    constructor(public utilsService: UtilsService, private dialogService: NbDialogService, private authService: AuthService) {
        this.loggedInUser = this.authService.getUserDataSync();
    }

    ngOnInit(): void {
        this.checkAccessData();
    }

    async checkAccessData(): Promise<void> {
        if (this.loggedInUser.roles.length === 1) {
            this.showProfileEditButton = true;
        } else {
            this.showProfileEditButton = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.PERSONAL_DETAIL, [ACCESS_TYPE.UPDATE]);
        }
    }

    editPersonalDetails(): void {
        const dialogOpen = this.dialogService.open(EditProfileComponent, { context: { userData: this.userData }, hasBackdrop: true, closeOnBackdropClick: false });
        dialogOpen.onClose.subscribe((res) => {
            if (res && res.saveSuccess) {
                this.userData = res.data;
            }
        });
    }
}
