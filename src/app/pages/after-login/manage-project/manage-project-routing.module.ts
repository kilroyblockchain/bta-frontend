import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AiModelComponent } from './ai-model/ai-model.component';
import { ViewAiModelDetailsComponent } from './ai-model/view-ai-model-details/view-ai-model-details.component';
import { ChannelSetUpComponent } from './manage-channel/manage-channel.component';
import { ManageProjectComponent } from './manage-project.component';
import { ModelReviewComponent } from './model-review/model-review.component';
import { MonitoringReportComponent } from './monitoring-report/monitoring-report.component';
import { ProjectBcHistoryComponent } from './project/project-bc-history/project-bc-history.component';
import { ProjectComponent } from './project/project.component';

const routes: Routes = [
    {
        path: '',
        component: ManageProjectComponent,
        children: [
            {
                path: 'all',
                component: ProjectComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.MANAGE_PROJECT' }
            },
            {
                path: 'channel-setup',
                component: ChannelSetUpComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.CHANNEL_DETAIL' }
            },
            {
                path: 'version-reports/:id',
                component: MonitoringReportComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.MONITORING_REPORT' }
            },
            {
                path: 'version-details/:id',
                component: AiModelComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.VERSION_DETAILS' }
            },
            {
                path: 'logs-experiment-detail/:id',
                component: ViewAiModelDetailsComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.EXPERIMENT_DETAILS' }
            },
            {
                path: 'model-reviews/:id',
                component: ModelReviewComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.MODEL_REVIEWS' }
            },
            {
                path: 'project-bc-history/:id',
                component: ProjectBcHistoryComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.PROJECT_BC_HISTORY' }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManageProjectRoutingModule {}
