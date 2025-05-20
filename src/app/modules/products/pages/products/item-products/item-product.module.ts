import { NgModule } from '@angular/core';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ListItemProductPageComponent } from './list-page/list-page.component';


@NgModule({
  declarations: [
  ],
  imports: [
    ListItemProductPageComponent
  ],
  exports: [ListItemProductPageComponent,],
  providers: [ConfirmationService,MessageService],
})
export class ItemProductModule { }
