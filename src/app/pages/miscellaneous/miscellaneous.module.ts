import { AlertComponent } from './alert/alert.component';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants/common-shared-modules.constant';
import { CommonModule } from '@angular/common';
import { BlockchainVerifiedComponent } from './blockchain-verified/blockchain-verified.component';
import { NgModule } from '@angular/core';
import { LoaderComponent } from './loader/loader.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DataNotFoundComponent } from './data-not-found/data-not-found.component';
import { SearchInputComponent } from './search-input/search-input.component';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { ValidationMessageComponent } from './validation-message/validation-message.component';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';

const SHARED_COMPONENTS = [NotFoundComponent, DataNotFoundComponent, LoaderComponent, BlockchainVerifiedComponent, AlertComponent, SearchInputComponent, ValidationMessageComponent, AutocompleteComponent];
@NgModule({
    imports: [CommonModule, ...COMMON_SHARED_MODULE, InternationalizationModule],
    declarations: [...SHARED_COMPONENTS],
    exports: [...SHARED_COMPONENTS]
})
export class MiscellaneousModule {}
