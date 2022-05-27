import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageUsersComponent } from './manage-users.component';
import { OrganizationUnitComponent } from './organization-unit/organization-unit.component';
import { UserActivityLogComponent } from './user-activity-log/user-activity-log.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [
    {
        path: '',
        component: ManageUsersComponent,
        children: [
            {
                path: 'organization-unit',
                component: OrganizationUnitComponent,
                data: { pageTitle: 'PAGE_TITLE.ORGANIZATION_UNIT' }
            },
            {
                path: 'user',
                component: UserComponent,
                data: { pageTitle: 'PAGE_TITLE.MANAGE_USER' }
            },
            {
                path: 'user-activity',
                component: UserActivityLogComponent,
                data: { pageTitle: 'PAGE_TITLE.USER_ACTIVITY_LOG' }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManageUsersRoutingModule {}
