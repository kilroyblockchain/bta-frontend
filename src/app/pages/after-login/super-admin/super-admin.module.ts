import { UnverifiedUsersComponent } from './unverified-users/unverified-users.component';
import { MiscellaneousModule } from './../../miscellaneous/miscellaneous.module';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants/common-shared-modules.constant';
import { NgModule } from '@angular/core';
import { SuperAdminAccessGuard, SuperAdminRoutingModule } from './super-admin-routing.module';
import { UsersComponent } from './users/users.component';
import { SharedModule } from 'src/app/pages/shared/shared.module';
import { SuperAdminComponent } from './super-admin.component';
import { CompanyUsersComponent } from './company-users/company-users.component';
import { VerifyUserComponent } from './users/verify-user/verify-user.component';
import { AddSubscriptionTypeComponent } from './users/add-subscriptionType/add-subscriptionType.component';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { RejectedCompaniesComponent } from './rejected-companies/rejected-companies.component';
import { RejectCompanyFormComponent } from './users/reject-form/reject-form.component';
import { RejectInformationsComponent } from './users/reject-informations/reject-informations.component';
import { BlockedUsersComponent } from './blocked-users/blocked-users.component';
import { AfterLoginSharedModule } from '../after-login-shared/after-login-shared.module';
import { LogPageComponent } from './log-page/log-page.component';

const CUSTOM_MODULE = [SharedModule];
const PAGE_COMPONENT = [SuperAdminComponent, UsersComponent, CompanyUsersComponent, VerifyUserComponent, AddSubscriptionTypeComponent, UnverifiedUsersComponent, RejectedCompaniesComponent, RejectCompanyFormComponent, RejectInformationsComponent, BlockedUsersComponent, LogPageComponent];
@NgModule({
    declarations: [...PAGE_COMPONENT],
    imports: [SuperAdminRoutingModule, ...CUSTOM_MODULE, ...COMMON_SHARED_MODULE, MiscellaneousModule, InternationalizationModule, AfterLoginSharedModule],
    providers: [SuperAdminAccessGuard]
})
export class SuperAdminModule {}
