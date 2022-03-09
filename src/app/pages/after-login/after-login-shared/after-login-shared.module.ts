import { NgModule } from '@angular/core';
import { MiscellaneousModule } from 'src/app/pages/miscellaneous/miscellaneous.module';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants';
import { DetailCardComponent } from './detail-card/detail-card.component';
import { BlockchainHistoryGridComponent } from './blockchain-history-grid/blockchain-history-grid.component';
import { LoginSummaryComponent } from './login-summary/login-summary.component';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { CustomPipeModule } from 'src/app/@core/pipes/pipe.module';
import { ShowHideButtonsComponent } from './show-hide-buttons/show-hide-buttons.component';

const COMPONENTS = [DetailCardComponent, BlockchainHistoryGridComponent, LoginSummaryComponent, FilterBarComponent, ShowHideButtonsComponent];

@NgModule({
    declarations: [...COMPONENTS],
    imports: [...COMMON_SHARED_MODULE, MiscellaneousModule, InternationalizationModule, CustomPipeModule],
    exports: [...COMPONENTS]
})
export class AfterLoginSharedModule {}
