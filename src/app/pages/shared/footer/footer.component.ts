import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LANGUAGE_LIST } from 'src/app/@core/constants';
import { AuthService, LangTranslateService } from 'src/app/@core/services';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    languageList = LANGUAGE_LIST;
    curDate = new Date();
    defaultLanguage: string;
    internationalization: string;
    constructor(public translate: TranslateService, private authService: AuthService, private languageTranslateService: LangTranslateService) {
        this.internationalization = environment.internationalization;
        if (this.internationalization === 'enabled') {
            this.defaultLanguage = this.authService.getUserLang();
        } else {
            this.defaultLanguage = 'en';
        }
        translate.setDefaultLang(this.defaultLanguage);
    }

    languageChanged(countryCode: string): void {
        this.translate.use(countryCode);
        this.authService.setUserLang(countryCode);
        this.languageTranslateService.sendChangeRequest(countryCode);
    }
}
