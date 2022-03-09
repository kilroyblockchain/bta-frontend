import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RequestPasswordComponent } from './request-password/request-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { BillingComponent } from './billing/billing.component';

const routes: Routes = [
    {
        path: '',
        component: AuthComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent,
                data: { pageTitle: 'PAGE_TITLE.LOGIN' }
            },
            {
                path: 'register',
                component: RegisterComponent,
                data: { pageTitle: 'PAGE_TITLE.REGISTER' }
            },
            {
                path: 'request-password',
                component: RequestPasswordComponent,
                data: { pageTitle: 'PAGE_TITLE.REQUEST_PASSWORD' }
            },
            {
                path: 'reset-password/:resetToken',
                component: ResetPasswordComponent,
                data: { pageTitle: 'PAGE_TITLE.RESET_PASSWORD' }
            },
            {
                path: 'billing',
                component: BillingComponent,
                data: { pageTitle: 'PAGE_TITLE.BILLING' }
            },
            {
                path: 'thank-you/:subType',
                component: ThankYouComponent,
                data: { pageTitle: 'PAGE_TITLE.THANK_YOU' }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {}
