import { NgModule } from '@angular/core';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { MiscellaneousModule } from 'src/app/pages/miscellaneous/miscellaneous.module';
import { AfterLoginSharedModule } from 'src/app/pages/after-login/after-login-shared/after-login-shared.module';
import { ManageProjectsRoutingModule } from './manage-projects-routing.module';
import { MangeProjectsComponent } from './manage-projects.component';
import { ProjectComponent } from './project/project.component';

const PAGE_COMPONENT = [MangeProjectsComponent, ProjectComponent];

@NgModule({
    imports: [ManageProjectsRoutingModule, ...COMMON_SHARED_MODULE, MiscellaneousModule, InternationalizationModule, AfterLoginSharedModule],
    declarations: [...PAGE_COMPONENT]
})
export class ManageProjectsModule {}
