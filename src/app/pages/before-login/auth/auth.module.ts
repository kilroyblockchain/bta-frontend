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
import { environment } from 'src/environments/environment';
import { BcKeyVerifyComponent } from './bc-key-verify/bc-key-verify.component';

const globalSettings: RecaptchaSettings = { siteKey: environment.recaptchaSiteKey };
const CUSTOM_MODULE = [AuthRoutingModule, SharedModule, InternationalizationModule];
const PAGE_COMPONENT = [AuthComponent, LoginComponent, RequestPasswordComponent, ResetPasswordComponent, ThankYouComponent, BillingComponent, BcKeyVerifyComponent];
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
