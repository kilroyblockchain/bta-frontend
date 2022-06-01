import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { LoggedInGuard } from './@core/guard';

const routes: Routes = [
    {
        path: 'u',
        loadChildren: async () => (await import('./pages/after-login/after-login.module')).AfterLoginModule,
        canActivate: [LoggedInGuard]
    },
    {
        path: '',
        loadChildren: async () => (await import('./pages/before-login/before-login.module')).BeforeLoginModule
    }
];

const config: ExtraOptions = {
    useHash: true
};

@NgModule({
    imports: [RouterModule.forRoot(routes, config)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
