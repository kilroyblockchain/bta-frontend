import { NbMenuModule, NbDatepickerModule, NbTimepickerModule, NbToastrModule, NbDialogModule, NbSidebarModule, NbThemeModule } from '@nebular/theme';

export const NEBULAR_ROOT_MODULE = [NbThemeModule.forRoot({ name: 'corporate' }), NbMenuModule.forRoot(), NbDatepickerModule.forRoot(), NbTimepickerModule.forRoot(), NbToastrModule.forRoot(), NbDialogModule.forRoot(), NbSidebarModule.forRoot()];
