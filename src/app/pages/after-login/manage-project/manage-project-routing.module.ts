import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AiModelComponent } from './ai-model/ai-model.component';
import { ViewAiModelDetailsComponent } from './ai-model/view-ai-model-details/view-ai-model-details.component';
import { ManageProjectComponent } from './manage-project.component';
import { CompareLogFilesComponent } from './model-review/compare-log-files/compare-log-file.component';
import { ViewLogExperimentDetailsComponent } from './model-review/compare-log-files/log-experiment-details/log-experiment-details.component';
import { ModelReviewComponent } from './model-review/model-review.component';
import { ModelReviewBcHistoryComponent } from './model-review/review-bc-history/review-bc-history.component';
import { MonitoringReportComponent } from './monitoring-report/monitoring-report.component';
import { ProjectVersionBcHistoryComponent } from './project-version/version-bc-history/version-bc-history.component';
import { ProjectBcHistoryComponent } from './project/project-bc-history/project-bc-history.component';
import { ProjectComponent } from './project/project.component';
import { VerifyBcHashComponent } from './verify-bc-hash/verify-bc-hash.component';

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
            },
            {
                path: 'version-bc-history/:id',
                component: ProjectVersionBcHistoryComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.VERSION_BC_HISTORY' }
            },
            {
                path: 'model-review-bc-history/:id',
                component: ModelReviewBcHistoryComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.MODEL_REVIEW_BC_HISTORY' }
            },
            {
                path: 'compare-log-files/:reviewId/:versionId',
                component: CompareLogFilesComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.COMPARE_LOG_FILES' }
            },
            {
                path: 'verify-bc-hash/:id',
                component: VerifyBcHashComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.VERIFY_BC_HASH' }
            },
            {
                path: 'log-file-experiment-details/:id/:lastExperimentId',
                component: ViewLogExperimentDetailsComponent,
                data: { pageTitle: 'MANAGE_PROJECTS.PAGE_TITLE.LOG_FILE_EXPERIMENT_DETAILS' }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManageProjectRoutingModule {}
