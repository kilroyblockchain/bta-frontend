import { NgModule } from '@angular/core';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants/common-shared-modules.constant';
import { ManageProjectRoutingModule } from './manage-project-routing.module';
import { AfterLoginSharedModule } from '../after-login-shared/after-login-shared.module';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { ManageProjectComponent } from './manage-project.component';
import { MiscellaneousModule } from 'src/app/pages/miscellaneous/miscellaneous.module';
import { ChannelSetUpComponent } from './manage-channel/manage-channel.component';
import { NewChannelComponent } from './manage-channel/new-channel/new-channel.component';
import { EditChannelComponent } from './manage-channel/edit-channel/edit-channel.component';
import { ProjectComponent } from './project/project.component';
import { AddProjectComponent } from './project/add-project/add-project.component';

const PAGE_COMPONENT = [ManageProjectComponent, ChannelSetUpComponent, NewChannelComponent, EditChannelComponent, ProjectComponent, AddProjectComponent];

@NgModule({
    imports: [ManageProjectRoutingModule, ...COMMON_SHARED_MODULE, MiscellaneousModule, InternationalizationModule, AfterLoginSharedModule],
    declarations: [...PAGE_COMPONENT]
})
export class ManageProjectModule {}
