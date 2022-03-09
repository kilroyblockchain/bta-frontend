import { NgModule } from '@angular/core';
import { BeforeLoginComponent } from './before-login.component';
import { BeforeLoginRoutingModule } from './before-login-routing.module';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { LandingComponent } from './landing/landing.component';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants/common-shared-modules.constant';
import { UserAcceptComponent } from './user-accept/user-accept.component';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { CustomPipeModule } from 'src/app/@core/pipes/pipe.module';
import { MiscellaneousModule } from '../miscellaneous/miscellaneous.module';

@NgModule({
    imports: [BeforeLoginRoutingModule, ...COMMON_SHARED_MODULE, MiscellaneousModule, InternationalizationModule, CustomPipeModule],
    declarations: [BeforeLoginComponent, LandingComponent, TermsAndConditionsComponent, UserAcceptComponent]
})
export class BeforeLoginModule {}
