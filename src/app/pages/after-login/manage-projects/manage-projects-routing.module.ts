import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MangeProjectsComponent } from './manage-projects.component';
import { ProjectComponent } from './project/project.component';

const routes: Routes = [
    {
        path: '',
        component: MangeProjectsComponent,
        children: [
            {
                path: 'all',
                component: ProjectComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManageProjectsRoutingModule {}
