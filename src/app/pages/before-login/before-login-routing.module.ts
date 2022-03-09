import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { GuestGaurd } from './../../@core/gaurd/guest.gaurd';
import { BeforeLoginComponent } from './before-login.component';
import { NotFoundComponent } from '../miscellaneous/not-found/not-found.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { UserAcceptComponent } from './user-accept/user-accept.component';

const routes: Routes = [
    {
        path: '',
        component: BeforeLoginComponent,
        children: [
            {
                path: 'auth',
                loadChildren: async () => (await import('./auth/auth.module')).AuthModule,
                canActivate: [GuestGaurd]
            },
            {
                path: 'terms-and-conditions',
                component: TermsAndConditionsComponent,
                data: { pageTitle: 'PAGE_TITLE.TERMS_AND_CONDITIONS' }
            },
            {
                path: 'user-accept/:token',
                component: UserAcceptComponent,
                data: { pageTitle: 'PAGE_TITLE.USER_ACCEPT' }
            },
            {
                path: '',
                redirectTo: 'auth/register'
            },
            {
                path: '**',
                component: NotFoundComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BeforeLoginRoutingModule {}
