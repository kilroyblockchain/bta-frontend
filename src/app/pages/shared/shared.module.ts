import { SidebarComponent } from './sidebar/sidebar.component';
import { NgModule } from '@angular/core';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { COMMON_SHARED_MODULE } from 'src/app/@core/constants/common-shared-modules.constant';
import { InternationalizationModule } from 'src/app/@core/internationalization/internationalization.module';

const SHARED_COMPONENT = [HeaderComponent, FooterComponent, SidebarComponent];

@NgModule({
    imports: [...COMMON_SHARED_MODULE, InternationalizationModule],
    declarations: [...SHARED_COMPONENT],
    exports: [...SHARED_COMPONENT]
})
export class SharedModule {}
