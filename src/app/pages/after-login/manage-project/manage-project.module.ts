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
import { EditProjectComponent } from './project/edit-project/edit-project.component';
import { ProjectVersionComponent } from './project-version/project-version.component';
import { AddVersionComponent } from './project-version/add-version/add-version.component';
import { ViewProjectVersionComponent } from './project-version/view-version/view-project-version.component';
import { ViewProjectComponent } from './project/view-project/view-project.component';
import { MonitoringReportComponent } from './monitoring-report/monitoring-report.component';
import { NewMonitoringReportComponent } from './monitoring-report/new-monitoring-report/new-monitoring-report.component';
import { AiModelComponent } from './ai-model/ai-model.component';
import { ViewAiModelDetailsComponent } from './ai-model/view-ai-model-details/view-ai-model-details.component';
import { ModelReviewComponent } from './model-review/model-review.component';
import { AddModelReviewComponent } from './model-review/add-review/add-review.component';
import { AddProjectPurposeComponent } from './project/add-project-purpose/add-purpose.component';
import { ProjectBcHistoryComponent } from './project/project-bc-history/project-bc-history.component';
import { ProjectVersionBcHistoryComponent } from './project-version/version-bc-history/version-bc-history.component';
import { EditVersionComponent } from './project-version/edit-version/edit-version.component';

const PAGE_COMPONENT = [
    ManageProjectComponent,
    ChannelSetUpComponent,
    NewChannelComponent,
    EditChannelComponent,
    ProjectComponent,
    AddProjectComponent,
    EditProjectComponent,
    ViewProjectComponent,
    ProjectVersionComponent,
    AddVersionComponent,
    ViewProjectVersionComponent,
    MonitoringReportComponent,
    NewMonitoringReportComponent,
    AiModelComponent,
    ViewAiModelDetailsComponent,
    ModelReviewComponent,
    AddModelReviewComponent,
    AddProjectPurposeComponent,
    ProjectBcHistoryComponent,
    ProjectVersionBcHistoryComponent,
    EditVersionComponent
];

@NgModule({
    imports: [ManageProjectRoutingModule, ...COMMON_SHARED_MODULE, MiscellaneousModule, InternationalizationModule, AfterLoginSharedModule],
    declarations: [...PAGE_COMPONENT]
})
export class ManageProjectModule {}
