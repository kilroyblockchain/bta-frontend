import { NgModule } from '@angular/core';
import { RegisterModule } from './register/register.module';
import { SharedModule } from './../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RequestPasswordComponent } from './request-password/request-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthComponent } from './auth.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { BillingComponent } from './billing/billing.component';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants/common-shared-modules.constant';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { RecaptchaModule, RecaptchaSettings, RECAPTCHA_SETTINGS } from 'ng-recaptcha';

const globalSettings: RecaptchaSettings = { siteKey: '6LcUDd8ZAAAAAIdmWMZYIjD_CWTK6WdMdNINPFht' };
const CUSTOM_MODULE = [AuthRoutingModule, SharedModule, InternationalizationModule];
const PAGE_COMPONENT = [AuthComponent, LoginComponent, RequestPasswordComponent, ResetPasswordComponent, ThankYouComponent, BillingComponent];
const PAGE_MODULE = [RegisterModule];
@NgModule({
    imports: [RecaptchaModule, ...COMMON_SHARED_MODULE, ...CUSTOM_MODULE, ...PAGE_MODULE],
    declarations: [...PAGE_COMPONENT],
    providers: [
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: globalSettings
        }
    ]
})
export class AuthModule {}
