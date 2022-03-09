import { COMMON_SHARED_MODULE } from 'src/app/@core/constants/common-shared-modules.constant';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './register.component';
import { UserComponent } from './user/user.component';
import { RECAPTCHA_SETTINGS, RecaptchaSettings, RecaptchaModule } from 'ng-recaptcha';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { MiscellaneousModule } from 'src/app/pages/miscellaneous/miscellaneous.module';

const globalSettings: RecaptchaSettings = { siteKey: '6LcUDd8ZAAAAAIdmWMZYIjD_CWTK6WdMdNINPFht' };
@NgModule({
    imports: [RecaptchaModule, ...COMMON_SHARED_MODULE, InternationalizationModule, MiscellaneousModule],
    declarations: [RegisterComponent, UserComponent],
    providers: [
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: globalSettings
        }
    ]
})
export class RegisterModule {}
