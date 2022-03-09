import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { LoggedInGaurd } from './@core/gaurd/logged-in.guard';

const routes: Routes = [
    {
        path: 'u',
        loadChildren: async () => (await import('./pages/after-login/after-login.module')).AfterLoginModule,
        canActivate: [LoggedInGaurd]
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
