import { EditProfileComponent } from './user/profile/edit-profile/edit-profile.component';
import { NgModule } from '@angular/core';
import { AfterLoginComponent } from './after-login.component';
import { AfterLoginRoutingModule } from './after-login-routing.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants/common-shared-modules.constant';
import { SharedModule } from './../shared/shared.module';
import { ChangePasswordComponent } from './user/change-password/password';
import { MiscellaneousModule } from '../miscellaneous/miscellaneous.module';
import { AppDashboardComponent } from './dashboard/dashboard.component';
import { CustomPipeModule } from 'src/app/@core/pipes/pipe.module';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { AfterLoginSharedModule } from './after-login-shared/after-login-shared.module';
const COMMON_IMPORT_MODULE = [SuperAdminModule, InternationalizationModule, AfterLoginSharedModule];
const PAGE_COMPONENT = [AfterLoginComponent, AppDashboardComponent, ChangePasswordComponent, EditProfileComponent];

@NgModule({
    declarations: [...PAGE_COMPONENT],
    imports: [...COMMON_SHARED_MODULE, AfterLoginRoutingModule, ...COMMON_IMPORT_MODULE, SharedModule, MiscellaneousModule, CustomPipeModule]
})
export class AfterLoginModule {}
