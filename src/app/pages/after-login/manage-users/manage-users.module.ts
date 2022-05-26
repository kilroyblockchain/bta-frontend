import { SelectSubscriptionTypeComponent } from './select-subscription-type/select-subscription-type.component';
import { NgModule } from '@angular/core';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants/common-shared-modules.constant';
import { MiscellaneousModule } from '../../miscellaneous/miscellaneous.module';
import { ManageUsersRoutingModule } from './manage-users-routing.module';
import { ManageUsersComponent } from './manage-users.component';
import { EditOrganizationUnitComponent } from './organization-unit/edit-organization-unit/edit-organization-unit.component';
import { NewOrganizationUnitComponent } from './organization-unit/new-organization-unit/new-organization-unit.component';
import { NewOrganizationStaffingComponent } from './organization-unit/organization-staffing/new-organization-staffing/new-organization-staffing.component';
import { OrganizationUnitComponent } from './organization-unit/organization-unit.component';
import { NewUserComponent } from './user/new-user/new-user.component';
import { UserComponent } from './user/user.component';
import { EditUserComponent } from './user/edit-user/edit-user.component';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { UserActivityLogComponent } from './user-activity-log/user-activity-log.component';
import { AfterLoginSharedModule } from '../after-login-shared/after-login-shared.module';

@NgModule({
    imports: [ManageUsersRoutingModule, ...COMMON_SHARED_MODULE, MiscellaneousModule, InternationalizationModule, AfterLoginSharedModule],
    declarations: [ManageUsersComponent, OrganizationUnitComponent, NewOrganizationUnitComponent, EditOrganizationUnitComponent, UserComponent, NewUserComponent, EditUserComponent, NewOrganizationStaffingComponent, SelectSubscriptionTypeComponent, UserActivityLogComponent],
    exports: [NewUserComponent]
})
export class ManageUsersModule {}
