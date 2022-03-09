import { NotFoundComponent } from './../../miscellaneous/not-found/not-found.component';
import { UsersComponent } from './users/users.component';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterModule, Routes } from '@angular/router';
import { Injectable, NgModule } from '@angular/core';
import { SuperAdminComponent } from './super-admin.component';
import { UtilsService } from 'src/app/@core/services';
import { FEATURE_IDENTIFIER } from 'src/app/@core/constants/featureIdentifier.enum';
import { ACCESS_TYPE } from 'src/app/@core/constants/accessType.enum';
import { CompanyUsersComponent } from './company-users/company-users.component';
import { UnverifiedUsersComponent } from './unverified-users/unverified-users.component';
import { RejectedCompaniesComponent } from './rejected-companies/rejected-companies.component';
import { BlockedUsersComponent } from './blocked-users/blocked-users.component';
import { AppDashboardComponent } from '../dashboard/dashboard.component';

@Injectable()
export class SuperAdminAccessGuard implements CanActivate {
    constructor(private readonly utilsService: UtilsService, private readonly router: Router) {}
    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        if (route.data['featureIdentifier'] === 'dashboard') {
            return true;
        }
        const activated = await this.utilsService.canAccessFeature(route.data['featureIdentifier'], ACCESS_TYPE.READ);
        return activated;
    }

    async routeDashboardComponent(): Promise<void> {
        if (await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MANAGE_ALL_USER, [ACCESS_TYPE.READ])) {
            this.router.navigate(['/u/admin/unverified-users']);
        } else {
            this.router.navigate(['u/user/profile/personal-details']);
        }
    }
}

const ROUTES: Routes = [
    {
        path: '',
        component: SuperAdminComponent,
        children: [
            {
                path: '',
                redirectTo: '/u/admin/dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                canActivate: [SuperAdminAccessGuard],
                component: AppDashboardComponent,
                data: { featureIdentifier: 'dashboard', pageTitle: 'PAGE_TITLE.DASHBOARD' }
            },
            {
                path: 'users',
                component: UsersComponent,
                canActivate: [SuperAdminAccessGuard],
                data: { featureIdentifier: FEATURE_IDENTIFIER.MANAGE_ALL_USER, pageTitle: 'PAGE_TITLE.USER_LIST_ADMIN' }
            },
            {
                path: 'unverified-users',
                component: UnverifiedUsersComponent,
                canActivate: [SuperAdminAccessGuard],
                data: { featureIdentifier: FEATURE_IDENTIFIER.MANAGE_ALL_USER, pageTitle: 'PAGE_TITLE.UNVERIFIED_USER_LIST' }
            },
            {
                path: 'rejected-companies',
                component: RejectedCompaniesComponent,
                canActivate: [SuperAdminAccessGuard],
                data: { pageTitle: 'PAGE_TITLE.REJECTED_COMPANY_LIST' }
            },
            {
                path: 'company-users',
                component: CompanyUsersComponent,
                canActivate: [SuperAdminAccessGuard],
                data: { featureIdentifier: FEATURE_IDENTIFIER.MANAGE_ALL_USER, pageTitle: 'PAGE_TITLE.USER_LIST' }
            },
            {
                path: 'blocked-users',
                component: BlockedUsersComponent,
                canActivate: [SuperAdminAccessGuard],
                data: { featureIdentifier: FEATURE_IDENTIFIER.MANAGE_ALL_USER, pageTitle: 'PAGE_TITLE.BLOCKED_USERS' }
            },
            {
                path: '**',
                component: NotFoundComponent
            }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class SuperAdminRoutingModule {}
