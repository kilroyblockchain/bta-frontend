import { NgModule } from '@angular/core';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants/common-shared-modules.constant';
import { AfterLoginSharedModule } from 'src/app/pages/after-login/after-login-shared/after-login-shared.module';
import { MiscellaneousModule } from 'src/app/pages/miscellaneous/miscellaneous.module';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';
import { NewBcNodeComponent } from './bc-node-info/new-bc-node/new-bc-node.component';
import { BlockChianRoutingModule } from './blockchain-routing.module';
import { BlockChainComponent } from './blockchain.component';
import { EditBcNodeInfoComponent } from './bc-node-info/edit-bc-node/edit-bc-node.component';
import { BcNodeComponent } from './bc-node-info/bc-node-info.component';
import { ChannelSetUpComponent } from './manage-channel/manage-channel.component';
import { NewChannelComponent } from './manage-channel/new-channel/new-channel.component';
import { EditChannelComponent } from './manage-channel/edit-channel/edit-channel.component';

const PAGE_COMPONENT = [BlockChainComponent, BcNodeComponent, NewBcNodeComponent, EditBcNodeInfoComponent, ChannelSetUpComponent, NewChannelComponent, EditChannelComponent];

@NgModule({
    imports: [BlockChianRoutingModule, ...COMMON_SHARED_MODULE, MiscellaneousModule, InternationalizationModule, AfterLoginSharedModule],
    declarations: [...PAGE_COMPONENT]
})
export class BlockChainModule {}
