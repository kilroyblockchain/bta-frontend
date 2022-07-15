import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlockChainComponent } from './blockchain.component';

const routes: Routes = [
    {
        path: '',
        component: BlockChainComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BlockChianRoutingModule {}
