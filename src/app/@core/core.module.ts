import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, Provider, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { AuthService, LocalStorageService, UtilsService } from './services/';
const CORE_PROVIDERS = [AuthService, LocalStorageService, UtilsService];

@NgModule({
    imports: [CommonModule, HttpClientModule],
    declarations: []
})
export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        throwIfAlreadyLoaded(parentModule, 'CoreModule');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static forRoot(): { ngModule: any; providers: Provider[] } {
        return {
            ngModule: CoreModule,
            providers: [...CORE_PROVIDERS]
        };
    }
}
