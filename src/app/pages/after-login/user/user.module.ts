import { NgModule } from '@angular/core';
import { UserComponent } from './user.component';
import { ProfileComponent } from './profile/profile.component';
import { UserRoutingModule } from './user.routing';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants';
import { MiscellaneousModule } from 'src/app/pages/miscellaneous/miscellaneous.module';
import { PersonalDetailsComponent } from './profile/personal-details/personal-details.component';
import { OrganizationDetailsComponent } from './profile/organization-details/organization-details.component';
import { EditOrganizationComponent } from './edit-organization/edit-organization.component';
import { ViewUserComponent } from './view-user/view-user.component';
import { ManageUsersModule } from 'src/app/pages/after-login/manage-users/manage-users.module';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { CustomPipeModule } from 'src/app/@core/pipes/pipe.module';
import { ProfileService } from './profile/profile.service';

const PAGE_COMPONENT = [UserComponent, ProfileComponent, PersonalDetailsComponent, OrganizationDetailsComponent, EditOrganizationComponent, ViewUserComponent];

@NgModule({
    imports: [...COMMON_SHARED_MODULE, UserRoutingModule, MiscellaneousModule, ManageUsersModule, InternationalizationModule, CustomPipeModule],
    declarations: [...PAGE_COMPONENT],
    providers: [ProfileService]
})
export class UserModule {}
