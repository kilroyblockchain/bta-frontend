import { NgModule } from '@angular/core';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbLayoutModule } from '@nebular/theme';

import { CoreModule } from './@core/core.module';
import { NEBULAR_ROOT_MODULE } from './@core/constants/nebular-root-modules.constant';
import { COMMON_SHARED_MODULE } from './@core/constants/common-shared-modules.constant';
import { SharedModule } from './pages/shared/shared.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './@core/interceptors/auth.interceptor';
import { TitleCasePipe } from '@angular/common';

const COMMON_IMPORT_MODULE = [BrowserModule, AppRoutingModule, BrowserAnimationsModule];
const CUSTOM_MODULE = [SharedModule, CoreModule.forRoot()];
const THEME_MODULE = [...NEBULAR_ROOT_MODULE];

/**
 * The http loader factory : Loads the files from define path.
 */
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http);
}

@NgModule({
    declarations: [AppComponent],
    imports: [
        ...THEME_MODULE,
        ...COMMON_IMPORT_MODULE,
        ...CUSTOM_MODULE,
        ...COMMON_SHARED_MODULE,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        NbLayoutModule,
        NbEvaIconsModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        TranslateService,
        TitleCasePipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
