import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AfterLoginComponent } from './after-login.component';
import { NotFoundComponent } from '../miscellaneous/not-found/not-found.component';
import { SuperAdminGuard, UserGuard } from 'src/app/@core/guard';
import { AppDashboardComponent } from './dashboard/dashboard.component';

const ROUTES: Routes = [
    {
        path: '',
        component: AfterLoginComponent,
        children: [
            {
                path: '',
                canActivate: [UserGuard]
            },
            {
                path: 'dashboard',
                component: AppDashboardComponent,
                data: { pageTitle: 'PAGE_TITLE.DASHBOARD' }
            },
            {
                path: 'user',
                loadChildren: async () => (await import('./user/user.module')).UserModule
            },
            {
                path: 'manage-users',
                loadChildren: async () => (await import('./manage-users/manage-users.module')).ManageUsersModule
            },
            {
                path: 'manage-project',
                loadChildren: async () => (await import('./manage-project/manage-project.module')).ManageProjectModule
            },
            {
                path: 'admin',
                loadChildren: async () => (await import('./super-admin/super-admin.module')).SuperAdminModule,
                canActivate: [SuperAdminGuard],
                data: { role: ['super-admin'], pageTitle: 'PAGE_TITLE.ADMIN' }
            },
            {
                path: '**',
                component: NotFoundComponent
            }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class AfterLoginRoutingModule {}
