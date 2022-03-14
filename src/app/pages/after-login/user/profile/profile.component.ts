import { Subscription } from 'rxjs';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService, UtilsService } from 'src/app/@core/services';
import { FEATURE_IDENTIFIER } from 'src/app/@core/constants/featureIdentifier.enum';
import { ACCESS_TYPE } from 'src/app/@core/constants/accessType.enum';
import { finalize } from 'rxjs/operators';
import { ICompany, IUserCompany, IUserData } from 'src/app/@core/interfaces/user-data.interface';
import { ProfileService } from './profile.service';
import { IStaffing } from 'src/app/@core/interfaces/manage-user.interface';

const BASE_URL = environment.apiURL + '/files/';
@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    userData!: IUserData;
    imageBaseUrl = BASE_URL;
    dataFound!: boolean;
    loading!: boolean;
    showProfileEditButton = false;
    showOrganizationEditButton = false;
    showOrganizationDetail = false;
    company!: IUserCompany;
    organization!: ICompany;
    staffs!: IStaffing[];
    url: string;
    subscription: Subscription;

    constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router, public utilsService: UtilsService, private profileService: ProfileService) {
        this.url = this.route.snapshot.paramMap.get('url') as string;
        this.subscription = router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.url = event.url.split('/')[event.url.split('/').length - 1];
            }
        });
    }

    ngOnInit(): void {
        this.getUserData();
        this.checkAccessData();
    }

    async checkAccessData(): Promise<void> {
        this.showProfileEditButton = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.PERSONAL_DETAIL, [ACCESS_TYPE.UPDATE]);
        this.showOrganizationDetail = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_DETAIL, [ACCESS_TYPE.READ]);
        this.showOrganizationEditButton = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_DETAIL, [ACCESS_TYPE.UPDATE]);
    }

    getUserData(): void {
        this.dataFound = false;
        this.loading = true;
        this.authService
            .getUser()
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (data) => {
                    this.dataFound = true;
                    this.userData = this.profileService.getPersonalDetail(data);
                    this.organization = this.profileService.getOrganizationDetail(data);
                    this.staffs = data.company.staffingId;
                },
                error: (err) => {
                    this.utilsService.showToast('warning', err?.error);
                }
            });
    }
}
