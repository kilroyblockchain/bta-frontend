import { NgModule } from '@angular/core';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants/common-shared-modules.constant';
import { AfterLoginSharedModule } from 'src/app/pages/after-login/after-login-shared/after-login-shared.module';
import { MiscellaneousModule } from 'src/app/pages/miscellaneous/miscellaneous.module';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { NewBcNodeComponent } from './bc-node-info/new-bc-node/new-bc-node.component';
import { BlockChianRoutingModule } from './blockchain-routing.module';
import { BlockChainComponent } from './blockchain.component';
import { EditBcNodeInfoComponent } from './bc-node-info/edit-bc-node/edit-bc-node.component';

const PAGE_COMPONENT = [BlockChainComponent, NewBcNodeComponent, EditBcNodeInfoComponent];

@NgModule({
    imports: [BlockChianRoutingModule, ...COMMON_SHARED_MODULE, MiscellaneousModule, InternationalizationModule, AfterLoginSharedModule],
    declarations: [...PAGE_COMPONENT]
})
export class BlockChainModule {}
