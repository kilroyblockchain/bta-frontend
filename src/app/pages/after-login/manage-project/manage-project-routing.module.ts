import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChannelSetUpComponent } from './manage-channel/manage-channel.component';
import { ManageProjectComponent } from './manage-project.component';
import { MonitoringReportComponent } from './monitoring-report/monitoring-report.component';
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
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManageProjectRoutingModule {}
