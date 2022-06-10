import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectGuard } from 'src/app/@core/guard/project.guard';
import { ChannelSetUpComponent } from './manage-channel/manage-channel.component';
import { ManageProjectComponent } from './manage-project.component';
import { ProjectComponent } from './project/project.component';

const routes: Routes = [
    {
        path: '',
        component: ManageProjectComponent,
        canActivate: [ProjectGuard],
        children: [
            {
                path: 'all',
                component: ProjectComponent
            },
            {
                path: 'channel-setup',
                component: ChannelSetUpComponent,
                data: { pageTitle: 'Channel Details' }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManageProjectRoutingModule {}
