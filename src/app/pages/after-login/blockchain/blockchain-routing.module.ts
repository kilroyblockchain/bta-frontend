import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FEATURE_IDENTIFIER } from 'src/app/@core/constants';
import { BcNodeComponent } from './bc-node-info/bc-node-info.component';
import { BlockChainComponent } from './blockchain.component';

const routes: Routes = [
    {
        path: '',
        component: BlockChainComponent,
        children: [
            {
                path: 'bc-node-info',
                component: BcNodeComponent,
                data: { featureIdentifier: FEATURE_IDENTIFIER.BC_NODE_INFO, pageTitle: 'PAGE_TITLE.BC_NODE_INFO' }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BlockChianRoutingModule {}
