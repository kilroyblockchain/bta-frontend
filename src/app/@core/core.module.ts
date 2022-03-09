import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
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

    static forRoot(): any {
        return {
            ngModule: CoreModule,
            providers: [...CORE_PROVIDERS]
        };
    }
}
